/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {Observable} from 'rxjs';

export type RpcMethod = (id: string, params: Object) => mixed;

export type RawMessageSender = (response: Object) => void;

export interface RpcRegistrar {
  register(methodName: string, method: RpcMethod): void;
  registerFun<P, R>(methodName: string, f: (P) => Promise<R>): void;
  registerObservable<P, R>(
    methodName: string,
    f: (params: P) => Observable<R>,
  ): void;
}
