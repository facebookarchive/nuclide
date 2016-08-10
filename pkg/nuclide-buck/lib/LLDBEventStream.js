'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ProcessMessage} from '../../commons-node/process-rpc-types';
import type {BuckProject} from '../../nuclide-buck-rpc';
import type RemoteControlService from '../../nuclide-debugger/lib/RemoteControlService';
import type {BuckEvent} from './BuckEventStream';

import {Observable} from 'rxjs';
import {compact} from '../../commons-node/stream';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {LaunchProcessInfo} from '../../nuclide-debugger-native/lib/LaunchProcessInfo';
import {getLogger} from '../../nuclide-logging';
import nuclideUri from '../../commons-node/nuclideUri';

const LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;

async function getDebuggerService(): Promise<RemoteControlService> {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  return await consumeFirstProvider('nuclide-debugger.remote');
}

async function debugBuckTarget(
  buckProject: BuckProject,
  buildTarget: string,
): Promise<string> {
  const output = await buckProject.showOutput(buildTarget);
  if (output.length === 0) {
    throw new Error(`Could not find build output path for target ${buildTarget}`);
  }
  if (output.length > 1) {
    throw new Error(`Target ${buildTarget} is ambiguous. Please specify a single test.`);
  }

  const targetOutput = output[0];
  const relativeOutputPath = targetOutput['buck.outputPath'];
  if (relativeOutputPath == null) {
    throw new Error(`Target ${buildTarget} does not have executable build output.`);
  }
  const args = targetOutput.args;

  const buckRoot = await buckProject.getPath();
  // LaunchProcessInfo's arguments should be local to the remote directory.
  const remoteBuckRoot = nuclideUri.getPath(buckRoot);
  const remoteOutputPath = nuclideUri.getPath(nuclideUri.join(buckRoot, relativeOutputPath));

  const info = new LaunchProcessInfo(buckRoot, {
    executablePath: remoteOutputPath,
    // TODO(hansonw): Fix this when nuclide-debugger-native-rpc supports proper array args.
    // This will break for quoted arguments and the like.
    arguments: args == null ? '' : args.join(' '),
    // TODO(hansonw): Add this when nuclide-debugger-native supports environment vars.
    environmentVariables: [],
    workingDirectory: '', // use the default
    basepath: remoteBuckRoot,
  });

  const debuggerService = await getDebuggerService();
  await debuggerService.startDebugging(info);
  return remoteOutputPath;
}

async function debugPidWithLLDB(pid: number, buckProject: BuckProject) {
  const debuggerService = await getDebuggerService();
  const buckProjectPath = await buckProject.getPath();
  debuggerService.debugLLDB(pid, buckProjectPath);
}

export function getLLDBBuildEvents(
  processStream: Observable<ProcessMessage>,
  buckProject: BuckProject,
  buildTarget: string,
): Observable<BuckEvent> {
  return processStream
    .filter(message => message.kind === 'exit' && message.exitCode === 0)
    .switchMap(() => {
      return Observable.fromPromise(debugBuckTarget(buckProject, buildTarget))
        .map(path => ({
          type: 'log',
          message: `Launched LLDB debugger with ${path}`,
          level: 'info',
        }))
        .catch(err => {
          getLogger().error(`Failed to launch LLDB debugger for ${buildTarget}`, err);
          return Observable.of({
            type: 'log',
            message: `Failed to launch LLDB debugger: ${err.message}`,
            level: 'error',
          });
        })
        .startWith({
          type: 'log',
          message: `Launching LLDB debugger for ${buildTarget}...`,
          level: 'log',
        }, {
          type: 'progress',
          progress: null,
        });
    });
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
    }),
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
