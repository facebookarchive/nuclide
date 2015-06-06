'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class NuclideTypedTestService {
  foo(arg0: NuclideUri, arg1: string): Promise<any> {
    return Promise.reject('not implemented');
  }

  bar(arg0: string): Promise<NuclideUri> {
    return Promise.reject('not implemented');
  }

  baz(arg0: NuclideUri, arg1: number): Promise<NuclideUri> {
    return Promise.reject('not implemented');
  }

  onNorf(callback: (payload: NuclideUri) => void): Promise<Disposable> {
    return Promise.reject('not implemented');
  }
}

module.exports = NuclideTypedTestService;
