'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Transport} from '../lib/index';

export class LoopbackTransports {
  serverTransport: Transport;
  clientTransport: Transport;

  constructor() {
    let onServerMessage: (message: Object) => mixed;
    let onClientMessage: (message: Object) => mixed;

    this.serverTransport = {
      send(data: Object): void {
        onClientMessage(data);
      },
      onMessage(callback: (message: Object) => mixed): IDisposable {
        onServerMessage = callback;
        return {dispose() {}};
      },
      close() {},
    };

    this.clientTransport = {
      send(data: Object): void {
        onServerMessage(data);
      },
      onMessage(callback: (message: Object) => mixed): IDisposable {
        onClientMessage = callback;
        return {dispose() {}};
      },
      close() {},
    };
  }
}
