'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DebuggerProcessInfo from './DebuggerProcessInfo';
import type {NuclideUri} from '../../nuclide-remote-uri';

class DebuggerInstance {
  _processInfo: DebuggerProcessInfo;
  onSessionEnd: ?(callback: () => void) => IDisposable;

  constructor(processInfo: DebuggerProcessInfo) {
    this._processInfo = processInfo;
  }

  getDebuggerProcessInfo(): DebuggerProcessInfo {
    return this._processInfo;
  }

  getTargetUri(): NuclideUri {
    return this._processInfo.getTargetUri();
  }

  dispose(): void {
    throw new Error('abstract method');
  }

  getWebsocketAddress(): Promise<string> {
    throw new Error('abstract method');
  }

}

module.exports = DebuggerInstance;
