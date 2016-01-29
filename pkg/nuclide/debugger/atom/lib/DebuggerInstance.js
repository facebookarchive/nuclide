'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class DebuggerInstance {
  dispose(): void {
    throw new Error('abstract method');
  }

  getWebsocketAddress(): Promise<string> {
    throw new Error('abstract method');
  }

  onSessionEnd(callback: () => void): {
    dispose(): void;
  } {
    throw new Error('abstract method');
  }
}

module.exports = DebuggerInstance;
