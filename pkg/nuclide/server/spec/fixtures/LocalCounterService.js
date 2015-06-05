'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var CounterService = require('./CounterService');
var {Disposable} = require('event-kit');

class LocalCounterService extends CounterService {
  constructor(serviceOptions: {cwd: string}) {
    super();
    this._cwd = serviceOptions.cwd;
    this._counter = 0;
    this._callbacks = [];
  }

  getCwd(): Promise<string> {
    return Promise.resolve(this._cwd);
  }

  addCounter(value: number): Promise<number> {
    this._counter += value;
    this._callbacks.forEach(callback => callback(this._counter));
    return Promise.resolve(this._counter);
  }

  onCounterUpdated(callback: (currentValue: number) => void): Disposable {
    this._callbacks.push(callback);
    return new Disposable(() => {
      this._callbacks = this.callbacks.filter(cb => cb !== callback);
    });
  }
}

module.exports = LocalCounterService;
