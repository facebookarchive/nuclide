'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class CounterService {
  getCwd(): Promise<string> {
    return Promise.reject('not implemented');
  }

  addCounter(value: number): Promise<number> {
    return Promise.reject('not implemented');
  }

  onCounterUpdated(callback: (currentValue: number) => void): Promise<boolean> {
    return Promise.reject('not implemented');
  }
}

module.exports = CounterService;
