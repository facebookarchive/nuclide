/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
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
import {track} from '../../nuclide-analytics';

const LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;
const ANDROID_ACTIVITY_REGEX = /Starting activity (.*)\/(.*)\.\.\./;
const ANDROID_TARGET_REGEX = /OK +(.+\.apk)/;
const LLDB_TARGET_TYPE = 'LLDB';
const ANDROID_TARGET_TYPE = 'android';

async function getDebuggerService(): Promise<RemoteControlService> {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
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

async function debugAndroidActivity(buckProjectPath: string, androidActivity: string) {
  const service = getServiceByNuclideUri('JavaDebuggerService', buckProjectPath);
  if (service == null) {
    throw new Error('Java debugger service is not available.');
  }

  const debuggerService = await getDebuggerService();
  try {
    track('fb-java-debugger-start', {
      startType: 'buck-toolbar',
      target: buckProjectPath,
      targetType: 'android',
      targetClass: androidActivity,
    });

    /* eslint-disable nuclide-internal/no-cross-atom-imports */
    // $FlowFB
    const procInfo = require('../../fb-debugger-java/lib/AdbProcessInfo');
    debuggerService.startDebugging(new procInfo.AdbProcessInfo(buckProjectPath, null, null,
      androidActivity));
    /* eslint-enable nuclide-internal/no-cross-atom-imports */
  } catch (e) {
    track('fb-java-debugger-unavailable', {
      error: e.toString(),
    });
    throw new Error('Java debugger service is not available.');
  }
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

export function getDeployBuildEvents(
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
          message: `Launched debugger with ${path}`,
          level: 'info',
        }))
        .catch(err => {
          getLogger().error(`Failed to launch debugger for ${buildTarget}`, err);
          return Observable.of({
            type: 'log',
            message: `Failed to launch debugger: ${err.message}`,
            level: 'error',
          });
        })
        .startWith({
          type: 'log',
          message: `Launching debugger for ${buildTarget}...`,
          level: 'log',
        }, {
          type: 'progress',
          progress: null,
        });
    });
}

export function getDeployInstallEvents(
  processStream: Observable<ProcessMessage>,
  buckRoot: string,
): Observable<BuckEvent> {
  let targetType = LLDB_TARGET_TYPE;
  return compact(
    processStream.map(message => {
      if (message.kind === 'stdout' || message.kind === 'stderr') {
        const androidTypeMatch = message.data.match(ANDROID_TARGET_REGEX);
        if (androidTypeMatch != null) {
          targetType = ANDROID_TARGET_TYPE;
        }

        if (targetType === ANDROID_TARGET_TYPE) {
          const activity = message.data.match(ANDROID_ACTIVITY_REGEX);
          if (activity != null) {
            return {targetType, targetApp: activity[1]};
          }
        }

        const pidMatch = message.data.match(LLDB_PROCESS_ID_REGEX);
        if (pidMatch != null) {
          return {targetType, targetApp: pidMatch[1]};
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
              debugPidWithLLDB(parseInt(targetInfo.targetApp, 10), buckRoot))
              .ignoreElements()
              .startWith({
                type: 'log',
                message: `Attaching LLDB debugger to pid ${targetInfo.targetApp}...`,
                level: 'info',
              });
          } else if (targetInfo.targetType === ANDROID_TARGET_TYPE) {
            return Observable.fromPromise(
              debugAndroidActivity(buckRoot, targetInfo.targetApp))
              .ignoreElements()
              .startWith({
                type: 'log',
                message: `Attaching Java debugger to pid ${targetInfo.targetApp}...`,
                level: 'info',
              });
          }

          return Observable.throw(new Error('Unexpected target type'));
        });
    });
}

export function getDeployTestEvents(
  processStream: Observable<ProcessMessage>,
  buckRoot: string,
): Observable<BuckEvent> {
  return processStream.flatMap(message => {
    if (message.kind !== 'stderr') {
      return Observable.empty();
    }
    const pidMatch = message.data.match(LLDB_PROCESS_ID_REGEX);
    if (pidMatch == null) {
      return Observable.empty();
    }
    return Observable.of(pidMatch[1]);
  })
    .switchMap(pid => {
      return Observable.fromPromise(
        debugPidWithLLDB(parseInt(pid, 10), buckRoot))
          .ignoreElements()
          .startWith({
            type: 'log',
            message: `Attaching LLDB debugger to pid ${pid}...`,
            level: 'info',
          });
    });
}
