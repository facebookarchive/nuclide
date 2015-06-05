'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class NestedNuclideTypedTestService {
  foo(a: ?NuclideUri, b: ?Array<NuclideUri>, c: {a: ?NuclideUri}, d: ?{a: ?NuclideUri}): Promise<?NuclideUri> {
    return Promise.reject('not implemented');
  }
  baz(a: {a:NuclideUri}, b: Array<NuclideUri>, c: number): Promise<Array<NuclideUri>> {
    return Promise.reject('not implemented');
  }
  onNorf(callback: (payload: {file: NuclideUri}) => void): Promise<Disposable> {
    return Promise.reject('not implemented');
  }
  onOops(callback: (payload: {file: NuclideUri}, wat: number) => void): Promise<Disposable> {
    return Promise.reject('not implemented');
  }
  onWoot(callback: (payload: {file: NuclideUri}, woot: NuclideUri) => void): Promise<Disposable> {
    return Promise.reject('not implemented');
  }
}

module.exports = NestedNuclideTypedTestService;
