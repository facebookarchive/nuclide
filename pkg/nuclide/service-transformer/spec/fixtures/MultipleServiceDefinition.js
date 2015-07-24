'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class TestServiceA {
  foo(): Promise<any> {
    return Promise.reject('not implemented');
  }
}

class TestServiceB {
  bar(arg0: string): Promise<any> {
    return Promise.reject('not implemented');
  }
}

module.exports = {
  TestServiceA,
  TestServiceB
};
