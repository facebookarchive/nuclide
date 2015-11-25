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
const {serializeArgs} = require('./utils');
const {EventEmitter} = require('events');
const NuclideSocket = require('./NuclideSocket');
const {
  SERVICE_FRAMEWORK_RPC_TIMEOUT_MS,
  SERVICE_FRAMEWORK3_CHANNEL} = require('./config');
const logger = require('nuclide-logging').getLogger();
import invariant from 'assert';

import {object} from 'nuclide-commons';
import ServiceFramework from './serviceframework';

export type NuclideRemoteEventbusOptions = {
  certificateAuthorityCertificate?: Buffer;
  clientCertificate?: Buffer;
  clientKey?: Buffer;
};

class NuclideRemoteEventbus {
  socket: ?NuclideSocket;

  _rpcRequestId: number;
  _serviceFramework3Emitter: EventEmitter;

  _clientComponent: ServiceFramework.ClientComponent;

  constructor(serverUri: string, options: ?NuclideRemoteEventbusOptions = {}) {
    this.socket = new NuclideSocket(serverUri, options);
    this.socket.on('message', (message) => this._handleSocketMessage(message));
    this.serviceFrameworkEventEmitter = new EventEmitter();
    this._rpcRequestId = 1;
    this._serviceFramework3Emitter = new EventEmitter();

    this._clientComponent = new ServiceFramework.ClientComponent(this._serviceFramework3Emitter,
      this.socket, () => this._rpcRequestId++);
  }

  // Resolves if the connection looks healthy.
  // Will reject quickly if the connection looks unhealthy.
  testConnection(): Promise<void> {
    // Don't call this after socket is closed.
    invariant(this.socket != null);
    return this.socket.testConnection();
  }

  _handleSocketMessage(message: any) {
    const {channel} = message;
    invariant(channel === SERVICE_FRAMEWORK3_CHANNEL);
    const {requestId, hadError, error, result} = message;
    this._serviceFramework3Emitter.emit(requestId.toString(), hadError, error, result);
  }

  // Delegate RPC functions to ServiceFramework.ClientComponent
  callRemoteFunction(...args: Array<any>): any {
    return this._clientComponent.callRemoteFunction.apply(this._clientComponent, args);
  }
  createRemoteObject(...args: Array<any>): Promise<number> {
    return this._clientComponent.createRemoteObject.apply(this._clientComponent, args);
  }
  callRemoteMethod(...args: Array<any>): any {
    return this._clientComponent.callRemoteMethod.apply(this._clientComponent, args);
  }
  disposeRemoteObject(...args: Array<any>): Promise<void> {
    return this._clientComponent.disposeRemoteObject.apply(this._clientComponent, args);
  }

  // Delegate marshalling to the ServiceFramework.ClientComponent class.
  marshal(...args): any {
    return this._clientComponent.marshal(...args);
  }
  unmarshal(...args): any {
    return this._clientComponent.unmarshal(...args);
  }
  registerType(...args): void {
    return this._clientComponent.registerType(...args);
  }

  close(): void {
    this.socket.close();
    this.socket = null;
  }
}

module.exports = NuclideRemoteEventbus;
