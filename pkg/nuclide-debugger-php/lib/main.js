/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {HomeFragments} from '../../nuclide-home/lib/types';
import type {NuclideDebuggerProvider} from 'nuclide-debugger-common';
import type {DebuggerLaunchAttachProvider} from 'nuclide-debugger-common';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {
  AdditionalLogFilesProvider,
  AdditionalLogFile,
} from '../../nuclide-logging/lib/rpc-types';
import type {DeadlineRequest} from 'nuclide-commons/promise';

import {HhvmLaunchAttachProvider} from './HhvmLaunchAttachProvider';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {getHhvmDebuggerServiceByNuclideUri} from '../../nuclide-remote-connection';
import {arrayUnique} from 'nuclide-commons/collection';

export function createDebuggerProvider(): NuclideDebuggerProvider {
  return {
    name: 'hhvm',
    getLaunchAttachProvider(
      connection: NuclideUri,
    ): ?DebuggerLaunchAttachProvider {
      if (nuclideUri.isRemote(connection)) {
        return new HhvmLaunchAttachProvider('Hack / PHP', connection);
      }
      return null;
    },
  };
}

export function getHomeFragments(): HomeFragments {
  return {
    feature: {
      title: 'PHP Debugger',
      icon: 'nuclicon-debugger',
      description:
        'Connect to a PHP server process and debug Hack code from within Nuclide.',
      command: 'nuclide-debugger:show-attach-dialog',
    },
    priority: 6,
  };
}

async function getAdditionalLogFiles(
  deadline: DeadlineRequest,
): Promise<Array<AdditionalLogFile>> {
  const hostnames = arrayUnique(
    atom.project
      .getPaths()
      .filter(nuclideUri.isRemote)
      .map(nuclideUri.getHostname),
  );

  return Promise.all(
    hostnames
      .map(async hostname => {
        const service = getHhvmDebuggerServiceByNuclideUri(
          nuclideUri.createRemoteUri(hostname, '/'),
        );
        if (service != null) {
          const debuggerSvc = new service.HhvmDebuggerService();
          return {
            title: `HHVM Debugger log for ${hostname}`,
            data: await debuggerSvc.createLogFilePaste(),
          };
        }

        return {
          title: `HHVM Debugger log for ${hostname}`,
          data: '<service unavailable>',
        };
      })
      .filter(file => file != null),
  );
}

export function createAdditionalLogFilesProvider(): AdditionalLogFilesProvider {
  return {
    id: 'hhvm-debugger',
    getAdditionalLogFiles,
  };
}
