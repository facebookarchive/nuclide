'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {Disposable} = require('event-kit');
const {TestServiceA, TestServiceB} = require('./MultipleServices');

class LocalTestServiceA extends TestServiceA {
  method(): Promise<string> {
    return Promise.resolve('A');
  }

  onEvent(callback: () => void): Disposable {
    const timeoutId = setTimeout(() => {
      callback();
    }, 400);

    return new Disposable(() => {
      clearTimeout(timeoutId);
    });
  }
}

class LocalTestServiceB extends TestServiceB {
  method(): Promise<string> {
    return Promise.resolve('B');
  }
}

module.exports = {
  TestServiceA: LocalTestServiceA,
  TestServiceB: LocalTestServiceB,
};
