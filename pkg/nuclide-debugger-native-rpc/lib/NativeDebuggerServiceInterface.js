'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LogLevel} from '../../nuclide-logging/lib/rpc-types';
import type {ConnectableObservable} from 'rxjs';

export type AttachTargetInfo = {
  pid: number,
  name: string,
  commandName: string,
  basepath?: string,
};

export type LaunchTargetInfo = {
  executablePath: string,
  arguments: Array<string>,
  environmentVariables: Array<string>,
  workingDirectory: string,
  stdinFilePath?: string,
  basepath?: string,
  lldbPythonPath: ?string,
};

export type DebuggerConfig = {
  logLevel: LogLevel,
  pythonBinaryPath: string,
  buckConfigRootFile: string,
};

export async function getAttachTargetInfoList(
  targetPid: ?number,
): Promise<Array<AttachTargetInfo>> {
  throw new Error('Not implemented');
}

export class NativeDebuggerService {
  constructor(config: DebuggerConfig) {
  }

  getOutputWindowObservable(): ConnectableObservable<string> {
    throw new Error('Not implemented');
  }

  getServerMessageObservable(): ConnectableObservable<string> {
    throw new Error('Not implemented');
  }

  attach(attachInfo: AttachTargetInfo): ConnectableObservable<void> {
    throw new Error('Not implemented');
  }

  launch(launchInfo: LaunchTargetInfo): ConnectableObservable<void> {
    throw new Error('Not implemented');
  }

  sendCommand(message: string): Promise<void> {
    throw new Error('Not implemented');
  }

  dispose(): Promise<void> {
    throw new Error('Not implemented');
  }
}
