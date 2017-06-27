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

import type {LegacyProcessMessage} from 'nuclide-commons/process';
import typeof * as BuckService from '../../nuclide-buck-rpc';
import type RemoteControlService
  from '../../nuclide-debugger/lib/RemoteControlService';
import type {BuckEvent} from './BuckEventStream';

import invariant from 'assert';
import {Observable} from 'rxjs';

import {compact} from 'nuclide-commons/observable';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {
  AttachProcessInfo,
} from '../../nuclide-debugger-native/lib/AttachProcessInfo';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {
  LaunchProcessInfo,
} from '../../nuclide-debugger-native/lib/LaunchProcessInfo';
import {getLogger} from 'log4js';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';

const LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;
const LLDB_TARGET_TYPE = 'LLDB';

async function getDebuggerService(): Promise<RemoteControlService> {
  atom.commands.dispatch(
    atom.views.getView(atom.workspace),
    'nuclide-debugger:show',
  );
  return consumeFirstProvider('nuclide-debugger.remote');
}

async function debugBuckTarget(
  buckService: BuckService,
  buckRoot: string,
  buildTarget: string,
  runArguments: Array<string>,
): Promise<string> {
  const output = await buckService.showOutput(buckRoot, buildTarget);
  if (output.length === 0) {
    throw new Error(
      `Could not find build output path for target ${buildTarget}`,
    );
  }
  if (output.length > 1) {
    throw new Error(
      `Target ${buildTarget} is ambiguous. Please specify a single test.`,
    );
  }

  const targetOutput = output[0];
  const relativeOutputPath = targetOutput['buck.outputPath'];
  if (relativeOutputPath == null) {
    throw new Error(
      `Target ${buildTarget} does not have executable build output.`,
    );
  }

  // LaunchProcessInfo's arguments should be local to the remote directory.
  const remoteBuckRoot = nuclideUri.getPath(buckRoot);
  const remoteOutputPath = nuclideUri.getPath(
    nuclideUri.join(buckRoot, relativeOutputPath),
  );

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
    workingDirectory: remoteBuckRoot,
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
  const rpcService = getServiceByNuclideUri(
    'NativeDebuggerService',
    buckProjectPath,
  );
  invariant(rpcService);
  const attachTargetList = await rpcService.getAttachTargetInfoList(pid);
  if (attachTargetList.length === 0) {
    return null;
  }
  const attachTargetInfo = attachTargetList[0];
  attachTargetInfo.basepath = nuclideUri.getPath(buckProjectPath);
  return new AttachProcessInfo(buckProjectPath, attachTargetInfo);
}

export function getDeployBuildEvents(
  processStream: Observable<LegacyProcessMessage>, // TODO(T17463635)
  buckService: BuckService,
  buckRoot: string,
  buildTarget: string,
  runArguments: Array<string>,
): Observable<BuckEvent> {
  const argString = runArguments.length === 0
    ? ''
    : ` with arguments "${runArguments.join(' ')}"`;
  return processStream
    .filter(message => message.kind === 'exit' && message.exitCode === 0)
    .switchMap(() => {
      return Observable.fromPromise(
        debugBuckTarget(buckService, buckRoot, buildTarget, runArguments),
      )
        .map(path => ({
          type: 'log',
          message: `Launched debugger with ${path}`,
          level: 'info',
        }))
        .catch(err => {
          getLogger('nuclide-buck').error(
            `Failed to launch debugger for ${buildTarget}`,
            err,
          );
          return Observable.of({
            type: 'log',
            message: `Failed to launch debugger: ${err.message}`,
            level: 'error',
          });
        })
        .startWith(
          {
            type: 'log',
            message: `Launching debugger for ${buildTarget}${argString}...`,
            level: 'log',
          },
          {
            type: 'progress',
            progress: null,
          },
        );
    });
}

export function getDeployInstallEvents(
  processStream: Observable<LegacyProcessMessage>, // TODO(T17463635)
  buckRoot: string,
): Observable<BuckEvent> {
  return compact(
    processStream.map(message => {
      if (message.kind === 'stdout' || message.kind === 'stderr') {
        const pidMatch = message.data.match(LLDB_PROCESS_ID_REGEX);
        if (pidMatch != null) {
          return {LLDB_TARGET_TYPE, targetApp: pidMatch[1]};
        }
      }
    }),
  )
    .take(1)
    .switchMap(targetInfo => {
      return processStream
        .filter(message => message.kind === 'exit' && message.exitCode === 0)
        .switchMap(() => {
          if (targetInfo.targetType === LLDB_TARGET_TYPE) {
            return Observable.fromPromise(
              debugPidWithLLDB(parseInt(targetInfo.targetApp, 10), buckRoot),
            )
              .ignoreElements()
              .startWith({
                type: 'log',
                message: `Attaching LLDB debugger to pid ${targetInfo.targetApp}...`,
                level: 'info',
              });
          }

          return Observable.throw(new Error('Unexpected target type'));
        });
    });
}

export function getDeployTestEvents(
  processStream: Observable<LegacyProcessMessage>, // TODO(T17463635)
  buckService: BuckService,
  buckRoot: string,
  buildTarget: string,
): Observable<BuckEvent> {
  return processStream
    .flatMap(message => {
      if (message.kind !== 'stderr') {
        return Observable.empty();
      }

      const regMatch = message.data.match(LLDB_PROCESS_ID_REGEX);
      if (regMatch != null) {
        return Observable.of([LLDB_PROCESS_ID_REGEX, regMatch[1]]);
      }

      return Observable.empty();
    })
    .switchMap(([regex, attachArg]) => {
      let debugMsg;
      let debugObservable;
      switch (regex) {
        default:
          debugMsg = `Attaching LLDB debugger to pid ${attachArg}...`;
          debugObservable = Observable.fromPromise(
            debugPidWithLLDB(parseInt(attachArg, 10), buckRoot),
          );
          break;
      }

      return debugObservable.ignoreElements().startWith({
        type: 'log',
        message: debugMsg,
        level: 'info',
      });
    });
}
