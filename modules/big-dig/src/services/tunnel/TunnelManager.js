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

import type {Subscription} from 'rxjs';
import type {Transport} from './Proxy';
import {SocketManager} from './SocketManager';
import {Proxy} from './Proxy';

import invariant from 'assert';

import {getLogger} from 'log4js';

export class TunnelManager {
  _transport: Transport;
  _idToTunnel: Map<string, Tunnel | SocketManager>;
  _logger: log4js$Logger;
  _subscription: Subscription;

  constructor(transport: Transport) {
    this._transport = transport;
    this._idToTunnel = new Map();
    this._logger = getLogger('tunnel-manager');

    this._subscription = this._transport
      .onMessage()
      .map(msg => {
        return JSON.parse(msg);
      })
      .subscribe(msg => this._handleMessage(msg));
  }

  async createSocketManager(
    tunnelId: string,
    remotePort: number,
  ): Promise<SocketManager> {
    const socketManager = new SocketManager(
      tunnelId,
      remotePort,
      this._transport,
    );

    this._idToTunnel.set(tunnelId, socketManager);
    return socketManager;
  }

  async createTunnel(localPort: number, remotePort: number): Promise<Tunnel> {
    const tunnel = await Tunnel.createTunnel(
      localPort,
      remotePort,
      this._transport,
    );
    this._idToTunnel.set(tunnel.id, tunnel);
    return tunnel;
  }

  close(): void {
    this._logger.trace('closing tunnel manager');
    this._idToTunnel.forEach(tunnel => {
      tunnel.close();
    });
  }

  async _handleMessage(msg: Object /* TunnelMessage? */): Promise<void> {
    const tunnel = this._idToTunnel.get(msg.tunnelId);
    if (msg.event === 'proxyCreated') {
      await this.createSocketManager(msg.tunnelId, msg.remotePort);
    } else if (msg.event === 'proxyClosed') {
      invariant(tunnel);
      tunnel.close();
    } else {
      invariant(tunnel);
      tunnel.receive(msg);
    }
  }
}

export class Tunnel {
  _localPort: number;
  _remotePort: number;
  _transport: Transport;
  _proxy: Proxy;
  _id: string;
  _logger: log4js$Logger;

  constructor(
    id: string,
    proxy: Proxy,
    localPort: number,
    remotePort: number,
    transport: Transport,
  ) {
    this._id = id;
    this._proxy = proxy;
    this._localPort = localPort;
    this._remotePort = remotePort;
    this._transport = transport;
    this._logger = getLogger('tunnel');
  }

  static async createTunnel(
    localPort: number,
    remotePort: number,
    transport: Transport,
  ): Promise<Tunnel> {
    const tunnelId = generateId();
    const proxy = await Proxy.createProxy(
      tunnelId,
      localPort,
      remotePort,
      transport,
    );
    return new Tunnel(tunnelId, proxy, localPort, remotePort, transport);
  }

  receive(msg: Object): void {
    this._proxy.receive(msg);
  }

  get id(): string {
    return this._id;
  }

  close() {
    this._logger.trace('closing');
    this._proxy.close();
  }
}

// TODO: this should really be a UUID
let nextId = 1;
function generateId() {
  return 'tunnel' + nextId++;
}
