/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {ISession} from 'atom-ide-ui/pkg/atom-ide-debugger/lib/types';
import type {
  AutoGenConfig,
  IProcessConfig,
  ControlButtonSpecification,
  IVspInstance,
} from 'nuclide-debugger-common/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {DebuggerSourcePathsService} from './types';

import typeof * as JavaDebuggerHelpersService from './JavaDebuggerHelpersService';

import featureConfig from 'nuclide-commons-atom/feature-config';
import showModal from 'nuclide-commons-ui/showModal';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Subject, Observable} from 'rxjs';
import * as React from 'react';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {VsAdapterTypes} from 'nuclide-debugger-common/constants';
import * as JavaDebuggerHelpersServiceLocal from './JavaDebuggerHelpersService';
import nullthrows from 'nullthrows';
import {SourceFilePathsModal} from './SourceFilePathsModal';
import {track} from 'nuclide-commons/analytics';

let _sourcePathsService: ?DebuggerSourcePathsService;
let _rpcService: ?nuclide$RpcService = null;

export const NUCLIDE_DEBUGGER_DEV_GK = 'nuclide_debugger_dev';

export function getJavaConfig(): AutoGenConfig {
  const entryPointClass = {
    name: 'entryPointClass',
    type: 'string',
    description: 'Input the Java entry point name you want to launch',
    required: true,
    visible: true,
  };
  const classPath = {
    name: 'classPath',
    type: 'string',
    description: 'Java class path',
    required: true,
    visible: true,
  };
  const javaJdwpPort = {
    name: 'javaJdwpPort',
    type: 'number',
    description: 'Java debugger port',
    required: true,
    visible: true,
  };
  return {
    launch: {
      launch: true,
      vsAdapterType: VsAdapterTypes.JAVA,
      threads: true,
      properties: [entryPointClass, classPath],
      cwdPropertyName: 'cwd',
      header: null,
    },
    attach: {
      launch: false,
      vsAdapterType: VsAdapterTypes.JAVA,
      threads: true,
      properties: [javaJdwpPort],
      header: null,
    },
  };
}

export function getCustomControlButtonsForJavaSourcePaths(
  clickEvents: rxjs$Subject<void>,
): ControlButtonSpecification[] {
  return [
    {
      icon: 'file-code',
      title: 'Set Source Path',
      onClick: () => clickEvents.next(),
    },
  ];
}

export function getDefaultSourceSearchPaths(
  targetUri: NuclideUri,
): Array<string> {
  const searchPaths: Array<string> = [];
  const remote = nuclideUri.isRemote(targetUri);

  // Add all the project root paths as potential source locations the Java debugger server should
  // check for resolving source.
  // NOTE: the Java debug server will just ignore any directory path that doesn't exist.
  atom.project.getPaths().forEach(path => {
    if (
      (remote && nuclideUri.isRemote(path)) ||
      (!remote && nuclideUri.isLocal(path))
    ) {
      const translatedPath = remote ? nuclideUri.getPath(path) : path;
      searchPaths.push(translatedPath);

      if (_sourcePathsService != null) {
        _sourcePathsService.addKnownSubdirectoryPaths(
          remote,
          translatedPath,
          searchPaths,
        );
      }
    }
  });

  return searchPaths;
}

export function getSavedPathsFromConfig(): Array<string> {
  const paths = featureConfig.get('nuclide-debugger-java.sourceFilePaths');
  // flowlint-next-line sketchy-null-mixed:off
  if (paths && typeof paths === 'string') {
    return (paths: string).split(';');
  } else {
    featureConfig.set('nuclide-debugger-java.sourceFilePaths', '');
  }
  return [];
}

export function persistSourcePathsToConfig(
  newSourcePaths: Array<string>,
): void {
  featureConfig.set(
    'nuclide-debugger-java.sourceFilePaths',
    newSourcePaths.join(';'),
  );
}

export function getDialogValues(
  clickEvents: rxjs$Subject<void>,
): rxjs$Observable<Array<string>> {
  let userSourcePaths = getSavedPathsFromConfig();
  return clickEvents.switchMap(() => {
    return Observable.create(observer => {
      const modalDisposable = showModal(
        ({dismiss}) => (
          <SourceFilePathsModal
            initialSourcePaths={userSourcePaths}
            sourcePathsChanged={(newPaths: Array<string>) => {
              userSourcePaths = newPaths;
              persistSourcePathsToConfig(newPaths);
              observer.next(newPaths);
            }}
            onClosed={dismiss}
          />
        ),
        {className: 'sourcepath-modal-container'},
      );

      track('fb-java-debugger-source-dialog-shown');
      return () => {
        modalDisposable.dispose();
      };
    });
  });
}

export function getSourcePathString(searchPaths: Array<string>): string {
  return searchPaths.join(';');
}

export function getSourcePathClickSubscriptionsOnVspInstance(
  targetUri: NuclideUri,
  vspInstance: IVspInstance,
  clickEvents: rxjs$Subject<void>,
): ((() => mixed) | rxjs$ISubscription | IDisposable)[] {
  const defaultValues = getDefaultSourceSearchPaths(targetUri);
  return [
    getDialogValues(clickEvents)
      .startWith(getSavedPathsFromConfig())
      .subscribe(userValues => {
        vspInstance.customRequest('setSourcePath', {
          sourcePath: getSourcePathString(defaultValues.concat(userValues)),
        });
      }),
    clickEvents,
  ];
}

export function getSourcePathClickSubscriptions(
  targetUri: NuclideUri,
  debugSession: ISession,
  clickEvents: rxjs$Subject<void>,
  additionalSourcePaths?: Array<NuclideUri> = [],
): ((() => mixed) | rxjs$ISubscription | IDisposable)[] {
  const defaultValues = getDefaultSourceSearchPaths(targetUri).concat(
    additionalSourcePaths,
  );
  return [
    getDialogValues(clickEvents)
      .startWith(getSavedPathsFromConfig())
      .subscribe(userValues => {
        debugSession.custom('setSourcePath', {
          sourcePath: getSourcePathString(defaultValues.concat(userValues)),
        });
      }),
    clickEvents,
  ];
}

export async function resolveConfiguration(
  configuration: IProcessConfig,
): Promise<IProcessConfig> {
  const {adapterExecutable, targetUri} = configuration;
  if (adapterExecutable == null) {
    throw new Error('Cannot resolve configuration for unset adapterExecutable');
  }

  const subscriptions = new UniversalDisposable();
  const clickEvents = new Subject();
  const customDisposable =
    configuration.customDisposable || new UniversalDisposable();
  customDisposable.add(subscriptions);

  const javaAdapterExecutable = await getJavaDebuggerHelpersServiceByNuclideUri(
    targetUri,
  ).getJavaVSAdapterExecutableInfo(false);
  return {
    ...configuration,
    properties: {
      ...configuration.properties,
      customControlButtons: getCustomControlButtonsForJavaSourcePaths(
        clickEvents,
      ),
    },
    adapterExecutable: javaAdapterExecutable,
    customDisposable,
    onInitializeCallback: async session => {
      customDisposable.add(
        ...getSourcePathClickSubscriptions(targetUri, session, clickEvents),
      );
    },
  };
}

export function setSourcePathsService(
  sourcePathsService: DebuggerSourcePathsService,
) {
  _sourcePathsService = sourcePathsService;
}

export function setRpcService(rpcService: nuclide$RpcService): IDisposable {
  _rpcService = rpcService;
  return new UniversalDisposable(() => {
    _rpcService = null;
  });
}

export function getJavaDebuggerHelpersServiceByNuclideUri(
  uri: NuclideUri,
): JavaDebuggerHelpersService {
  if (_rpcService == null && !nuclideUri.isRemote(uri)) {
    return JavaDebuggerHelpersServiceLocal;
  }

  return nullthrows(_rpcService).getServiceByNuclideUri(
    'JavaDebuggerHelpersService',
    uri,
  );
}
