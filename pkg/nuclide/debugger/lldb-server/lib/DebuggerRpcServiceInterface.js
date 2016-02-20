'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Observable} from 'rx';

export type AttachTargetInfo = {
  pid: number;
  name: string
};

export type LaunchTargetInfo = {
  executablePath: string;
  arguments: Array<string>;
  environmentVariables: ?Array<string>;
  workingDirectory: string;
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
  // $FlowFixMe
  async dispose(): Promise<void> {
    throw new Error('Not implemented');
  }
}

export class DebuggerRpcService {
  async attach(pid: number): Promise<DebuggerConnection> {
    throw new Error('Not implemented');
  }
  async launch(launchInfo: LaunchTargetInfo): Promise<DebuggerConnection> {
    throw new Error('Not implemented');
  }
  async dispose(): Promise<void> {
    throw new Error('Not implemented');
  }
}
