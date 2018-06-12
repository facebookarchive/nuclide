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

import type {Transport} from './Proxy';
import {SocketManager} from './SocketManager';

import {Proxy} from './Proxy';

import invariant from 'assert';
import EventEmitter from 'events';
import {getLogger} from 'log4js';

export class Tunnel extends EventEmitter {
  _localPort: number;
  _remotePort: number;
  _useIPv4: boolean;
  _transport: Transport;
  _proxy: ?Proxy;
  _id: string;
  _isClosed: boolean;
  _logger: log4js$Logger;

  constructor(
    id: string,
    proxy: ?Proxy,
    localPort: number,
    remotePort: number,
    useIPv4: boolean,
    transport: Transport,
  ) {
    super();
    this._id = id;
    this._proxy = proxy;
    this._localPort = localPort;
    this._remotePort = remotePort;
    this._useIPv4 = useIPv4;
    this._transport = transport;
    this._isClosed = false;
    this._logger = getLogger('tunnel');

    if (this._proxy != null) {
      this._proxy.once('error', error => {
        this.emit('error', error);
      });
    }
  }

  static async createTunnel(
    localPort: number,
    remotePort: number,
    useIPv4: boolean,
    transport: Transport,
  ): Promise<Tunnel> {
    const tunnelId = generateId();
    const proxy = await Proxy.createProxy(
      tunnelId,
      localPort,
      remotePort,
      useIPv4,
      transport,
    );
    return new Tunnel(
      tunnelId,
      proxy,
      localPort,
      remotePort,
      useIPv4,
      transport,
    );
  }

  static async createReverseTunnel(
    localPort: number,
    remotePort: number,
    useIPv4: boolean,
    transport: Transport,
  ): Promise<Tunnel> {
    const tunnelId = generateId();

    const socketManager = new SocketManager(
      tunnelId,
      localPort,
      useIPv4,
      transport,
    );

    transport.send(
      JSON.stringify({
        event: 'createProxy',
        tunnelId,
        useIPv4,
        // NB: on the server, the remote port and local ports are reversed.
        // We want to start the proxy on the remote port (relative to the
        // client) and start the socket manager on the local port
        localPort: remotePort,
        remotePort: localPort,
      }),
    );
    return new ReverseTunnel(
      tunnelId,
      socketManager,
      localPort,
      remotePort,
      useIPv4,
      transport,
    );
  }

  receive(msg: Object): void {
    if (this._proxy != null) {
      this._proxy.receive(msg);
    }
  }

  getId(): string {
    return this._id;
  }

  close() {
    this._isClosed = true;
    this.emit('close');
    invariant(this._proxy);
    this._proxy.close();
  }
}

export class ReverseTunnel extends Tunnel {
  _socketManager: SocketManager;

  constructor(
    id: string,
    socketManager: SocketManager,
    localPort: number,
    remotePort: number,
    useIPv4: boolean,
    transport: Transport,
  ) {
    super(id, null, localPort, remotePort, useIPv4, transport);
    this._socketManager = socketManager;

    this._socketManager.on('error', error => {
      this.emit('error', error);
    });
  }

  receive(msg: Object): void {
    if (this._socketManager != null) {
      this._socketManager.receive(msg);
    }
  }

  close() {
    this._isClosed = true;
    this.emit('close');
    invariant(this._socketManager);
    this._socketManager.close();
    this._transport.send(
      JSON.stringify({
        event: 'closeProxy',
        tunnelId: this._id,
      }),
    );
  }
}

// TODO: this should really be a UUID
let nextId = 1;
function generateId() {
  return 'tunnel' + nextId++;
}
