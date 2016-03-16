'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Emitter} from 'atom';

export default class ReactNativeServerStatus {

  _emitter: Emitter;
  _isRunning: boolean;

  constructor() {
    this._emitter = new Emitter();
    this._isRunning = false;
  }

  subscribe(callback: () => void): IDisposable {
    return this._emitter.on('change', callback);
  }

  isServerRunning(): boolean {
    return this._isRunning;
  }

  setServerRunning(isRunning: boolean): void {
    if (this._isRunning !== isRunning) {
      this._isRunning = isRunning;
      this._emitter.emit('change');
    }
  }
}
