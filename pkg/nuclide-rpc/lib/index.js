'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Observable} from 'rxjs';

export {ServiceRegistry} from './ServiceRegistry';
export {RpcConnection} from './RpcConnection';
export {LoopbackTransports} from './LoopbackTransports';
export {StreamTransport} from './StreamTransport';

export type ConfigEntry = {
  name: string;
  definition:string;
  implementation: string;
  // When true, doesn't mangle in the service name into the method names for functions.
  preserveFunctionNames?: boolean;
};

export type Transport = {
  send(message: string): void;
  onMessage(): Observable<string>;
  close(): void;
};
