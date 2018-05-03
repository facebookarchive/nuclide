/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {
  AutoGenConfig,
  IProcessConfig,
} from 'nuclide-debugger-common/types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import typeof * as JavaDebuggerHelpersService from './JavaDebuggerHelpersService';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {VsAdapterTypes} from 'nuclide-debugger-common/constants';
import * as JavaDebuggerHelpersServiceLocal from './JavaDebuggerHelpersService';

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

export async function resolveConfiguration(
  configuration: IProcessConfig,
): Promise<IProcessConfig> {
  const {adapterExecutable, targetUri} = configuration;
  if (adapterExecutable == null) {
    throw new Error('Cannot resolve configuration for unset adapterExecutable');
  }

  const javaAdapterExecutable = await getJavaDebuggerHelpersServiceByNuclideUri(
    targetUri,
  ).getJavaVSAdapterExecutableInfo(false);
  return {
    ...configuration,
    adapterExecutable: javaAdapterExecutable,
  };
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
  if (_rpcService != null) {
    return _rpcService.getServiceByNuclideUri(
      'JavaDebuggerHelpersService',
      uri,
    );
  } else {
    return JavaDebuggerHelpersServiceLocal;
  }
}
