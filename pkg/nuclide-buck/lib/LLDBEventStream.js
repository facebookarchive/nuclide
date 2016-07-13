'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ProcessMessage} from '../../commons-node/process-types';
import type {BuckProject} from '../../nuclide-buck-base';
import type RemoteControlService from '../../nuclide-debugger-atom/lib/RemoteControlService';
import type {BuckEvent} from './BuckEventStream';

import {Observable} from 'rxjs';
import {compact} from '../../commons-node/stream';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';

const LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;

async function getDebuggerService(): Promise<RemoteControlService> {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  return await consumeFirstProvider('nuclide-debugger.remote');
}

async function debugPidWithLLDB(pid: number, buckProject: BuckProject) {
  const debuggerService = await getDebuggerService();
  const buckProjectPath = await buckProject.getPath();
  debuggerService.debugLLDB(pid, buckProjectPath);
}

export function getLLDBInstallEvents(
  processStream: Observable<ProcessMessage>,
  buckProject: BuckProject,
): Observable<BuckEvent> {
  return compact(
    processStream.map(message => {
      if (message.kind === 'stdout' || message.kind === 'stderr') {
        const pidMatch = message.data.match(LLDB_PROCESS_ID_REGEX);
        if (pidMatch != null) {
          return parseInt(pidMatch[1], 10);
        }
      }
    })
  )
    .take(1)
    .switchMap(lldbPid => {
      return processStream
        .filter(message => message.kind === 'exit' && message.exitCode === 0)
        .map(() => {
          debugPidWithLLDB(lldbPid, buckProject);
          return {
            type: 'log',
            message: `Attaching LLDB debugger to pid ${lldbPid}...`,
            level: 'info',
          };
        });
    });
}
