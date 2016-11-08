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
import typeof * as BuckService from '../../nuclide-buck-rpc';
import type RemoteControlService from '../../nuclide-debugger/lib/RemoteControlService';
import type {BuckEvent} from './BuckEventStream';

import invariant from 'assert';
import {Observable} from 'rxjs';

import {compact} from '../../commons-node/observable';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {AttachProcessInfo} from '../../nuclide-debugger-native/lib/AttachProcessInfo';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {LaunchProcessInfo} from '../../nuclide-debugger-native/lib/LaunchProcessInfo';
import {getLogger} from '../../nuclide-logging';
import nuclideUri from '../../commons-node/nuclideUri';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';

const LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;

async function getDebuggerService(): Promise<RemoteControlService> {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  return await consumeFirstProvider('nuclide-debugger.remote');
}

async function debugBuckTarget(
  buckService: BuckService,
  buckRoot: string,
  buildTarget: string,
  runArguments: Array<string>,
): Promise<string> {
  const output = await buckService.showOutput(buckRoot, buildTarget);
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

  // LaunchProcessInfo's arguments should be local to the remote directory.
  const remoteBuckRoot = nuclideUri.getPath(buckRoot);
  const remoteOutputPath = nuclideUri.getPath(nuclideUri.join(buckRoot, relativeOutputPath));

  const env = [];
  if (targetOutput.env) {
    for (const key of Object.keys(targetOutput.env)) {
      // NOTE: no escaping is necessary here; LLDB passes these directly to the process.
      env.push(key + '=' + targetOutput.env[key]);
    }
  }

  const info = new LaunchProcessInfo(buckRoot, {
    executablePath: remoteOutputPath,
    // Allow overriding of a test's default arguments if provided.
    arguments: (runArguments.length ? runArguments : targetOutput.args) || [],
    environmentVariables: env,
    workingDirectory: '', // use the default
    basepath: remoteBuckRoot,
    lldbPythonPath: null,
  });

  const debuggerService = await getDebuggerService();
  await debuggerService.startDebugging(info);
  return remoteOutputPath;
}

async function debugPidWithLLDB(pid: number, buckRoot: string) {
  const attachInfo = await _getAttachProcessInfoFromPid(pid, buckRoot);
  invariant(attachInfo);
  const debuggerService = await getDebuggerService();
  debuggerService.startDebugging(attachInfo);
}

async function _getAttachProcessInfoFromPid(
  pid: number,
  buckProjectPath: string,
): Promise<?AttachProcessInfo> {
  const rpcService = getServiceByNuclideUri('NativeDebuggerService', buckProjectPath);
  invariant(rpcService);
  const attachTargetList = await rpcService.getAttachTargetInfoList(pid);
  if (attachTargetList.length === 0) {
    return null;
  }
  const attachTargetInfo = attachTargetList[0];
  attachTargetInfo.basepath = nuclideUri.getPath(buckProjectPath);
  return new AttachProcessInfo(
    buckProjectPath,
    attachTargetInfo,
  );
}

export function getLLDBBuildEvents(
  processStream: Observable<ProcessMessage>,
  buckService: BuckService,
  buckRoot: string,
  buildTarget: string,
  runArguments: Array<string>,
): Observable<BuckEvent> {
  return processStream
    .filter(message => message.kind === 'exit' && message.exitCode === 0)
    .switchMap(() => {
      return Observable.fromPromise(
        debugBuckTarget(buckService, buckRoot, buildTarget, runArguments),
      )
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
  buckRoot: string,
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
        .switchMap(() => {
          return Observable.fromPromise(debugPidWithLLDB(lldbPid, buckRoot))
            .ignoreElements()
            .startWith({
              type: 'log',
              message: `Attaching LLDB debugger to pid ${lldbPid}...`,
              level: 'info',
            });
        });
    });
}
