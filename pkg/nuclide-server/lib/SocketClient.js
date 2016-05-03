'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type WS from 'ws';

import {SERVICE_FRAMEWORK3_CHANNEL} from './config';
import ServiceFramework from './serviceframework/index';
import invariant from 'assert';

import {ObjectRegistry} from './serviceframework/ObjectRegistry';
import {SocketTransport} from './SocketTransport';

// Per-Client state on the Server for the RPC framework
export class SocketClient extends SocketTransport {
  _serverComponent: ServiceFramework.ServerComponent;
  _objectRegistry: ObjectRegistry;

  constructor(
      clientId: string,
      serverComponent: ServiceFramework.ServerComponent,
      socket: WS) {
    super(clientId, socket);
    this._objectRegistry = new ObjectRegistry('server');
    this._serverComponent = serverComponent;
    this.onMessage(message => {
      invariant(message.protocol && message.protocol === SERVICE_FRAMEWORK3_CHANNEL);
      this._serverComponent.handleMessage(this, message);
    });
  }

  sendSocketMessage(data: any): void {
    this.send(data);
  }

  getMarshallingContext(): ObjectRegistry {
    return this._objectRegistry;
  }

  dispose(): void {
    this.close();
    this._objectRegistry.dispose();
  }
}
