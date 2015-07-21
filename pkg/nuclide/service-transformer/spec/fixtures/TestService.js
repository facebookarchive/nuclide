'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Integer} from './types';

export type Diagnostic = {
  message: Array<{
    path: NuclideUri;
    descr: string;
    code: number;
    line: number;
    endline: number;
    start: number;
    end: number;
  }>
}

class TestService {
  static fake = 'reallyFake';

  foo(): Promise<any> {
    return Promise.reject('not implemented');
  }

  bar(arg0: string): Promise<any> {
    return Promise.reject('not implemented');
  }

  qux(arg0: string, arg1: Integer): Promise<any> {
    return Promise.reject('not implemented');
  }

  onNorf(callback: (payload: any) => void): Disposable {
    return Promise.reject('not implemented');
  }

  onetimeRegistration(arg0: string): void {
    return Promise.reject('not implemented');
  }
}

module.exports = TestService;
