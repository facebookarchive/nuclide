'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var MathService = require('./MathService');

class LocalMathService extends MathService {
  pi(): Promise<number> {
    return Promise.resolve(Math.PI);
  }

  abs(arg0: number): Promise<number> {
    return Promise.resolve(Math.abs(arg0));
  }

  sum(arg0: number, arg1: number): Promise<number> {
    return Promise.resolve(arg0 + arg1);
  }
}

module.exports = LocalMathService;
