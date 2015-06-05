'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class MathService {
  pi(): Promise<number> {
    return Promise.reject('not implemented');
  }

  abs(arg0: number): Promise<number> {
    return Promise.reject('not implemented');
  }

  sum(arg0: number, arg1: number): Promise<number> {
    return Promise.reject('not implemented');
  }
}

module.exports = MathService;
