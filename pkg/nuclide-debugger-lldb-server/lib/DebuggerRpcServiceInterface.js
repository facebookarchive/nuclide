'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Observable} from 'rxjs';

export type AttachTargetInfo = {
  pid: number;
  name: string;
  basepath?: string;
};

export type LaunchTargetInfo = {
  executablePath: string;
  arguments: string;
  environmentVariables: ?Array<string>;
  workingDirectory: string;
  basepath?: string
};

export type DebuggerConfig = {
  logLevel: string;
  pythonBinaryPath: string;
  buckConfigRootFile: string;
};

export async function getAttachTargetInfoList(): Promise<Array<AttachTargetInfo>> {
  throw new Error('Not implemented');
}

export class DebuggerConnection {
  getServerMessageObservable(): Observable<string> {
    throw new Error('Not implemented');
  }
  async sendCommand(message: string): Promise<void> {
    throw new Error('Not implemented');
  }
  async dispose(): Promise<void> {
    throw new Error('Not implemented');
  }
}

export class DebuggerRpcService {
  constructor(config: DebuggerConfig) {
    throw new Error('Not implemented');
  }
  getOutputWindowObservable(): Observable<string> {
    throw new Error('Not implemented');
  }
  async attach(attachInfo: AttachTargetInfo): Promise<DebuggerConnection> {
    throw new Error('Not implemented');
  }
  async launch(launchInfo: LaunchTargetInfo): Promise<DebuggerConnection> {
    throw new Error('Not implemented');
  }
  async dispose(): Promise<void> {
    throw new Error('Not implemented');
  }
}
