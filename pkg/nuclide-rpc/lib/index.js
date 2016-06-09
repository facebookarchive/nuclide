'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

export {ServiceRegistry} from './ServiceRegistry';
export {RpcConnection} from './RpcConnection';
export {LoopbackTransports} from './LoopbackTransports';

export type ConfigEntry = {
  name: string;
  definition:string;
  implementation: string;
};

export type Transport = {
  send(message: string): void;
  onMessage(callback: (message: Object) => mixed): IDisposable;
  close(): void;
};
