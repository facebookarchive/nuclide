'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../../remote-uri';

import {DebuggerProcessInfo} from '../../../debugger/atom';
import {NodeDebuggerInstance} from '../../../debugger/node/lib/Service';

type Options = {
  targetUri: NuclideUri;
  pid: ?number;
  onAllSessionsEnded: () => void;
};

export class ReactNativeProcessInfo extends DebuggerProcessInfo {

  _onAllSessionsEnded: () => void;
  _pid: ?number;
  _pidPromise: Promise<number>;
  _sessionCount: number;
  setPid: (pid: number) => void;

  constructor(options: Options) {
    super('react-native', options.targetUri);
    this._sessionCount = 0;
    this._onAllSessionsEnded = options.onAllSessionsEnded;
    this._pidPromise = new Promise(resolve => {
      this.setPid = pid => {
        this._pid = pid;
        resolve(pid);
      };
    });
    if (options.pid != null) {
      this.setPid(options.pid);
    }
  }

  async debug(): Promise<NodeDebuggerInstance> {
    this._sessionCount += 1;
    const pid = await this._pidPromise;

    // Enable debugging in the process.
    // See <https://nodejs.org/api/debugger.html#debugger_advanced_usage>
    process.kill(pid, 'SIGUSR1');

    // This is the port that the V8 debugger usually listens on.
    // TODO(matthewwithanm): Provide a way to override this in the UI.
    const session = new NodeDebuggerInstance(this, 5858);
    session.onSessionEnd(this._handleSessionEnd.bind(this));
    return session;
  }

  compareDetails(other: DebuggerProcessInfo): number {
    return 1;
  }

  displayString(): string {
    return 'React Native';
  }

  getPid(): ?number {
    return this._pid;
  }

  _handleSessionEnd(): void {
    this._sessionCount -= 1;
    if (this._sessionCount === 0) {
      this._onAllSessionsEnded.call(null);
    }
  }

}
