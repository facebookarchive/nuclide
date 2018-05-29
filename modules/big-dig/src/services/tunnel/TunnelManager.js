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

/**
 * A tunnel consists of two components: a Proxy to listen for connections,
 * and a SocketManager to handle TCP socket connections from the proxy.
 *
 * There are two types of tunnels. A normal tunnel is one where the proxy runs
 * on the client and proxies connections to a remote TCP port on the server.
 * There's also  reverse tunnel where the proxy runs on the server and it
 * proxies connections to the client.
 *
 * On the client, the TunnelManager maintains a Map of Tunnels it has handed
 * back to clients. On the server, the TunnelManager maintains a map to its
 * associated TunnelComponent (either the Proxy or the SocketManager).
 *
 * When the client closes tunnel, it sends a message to the server to close
 * the associated component that is running on the server.
 */

export class TunnelManager {
  _transport: Transport;
  // on the client (where tunnels are created), we always map to a Tunnel.
  // on the server, we map to either a SocketManager or a Proxy, depending
  // on whether we are a reverse tunnel or not
  _idToTunnel: Map<string, Tunnel | SocketManager | Proxy>;
  _logger: log4js$Logger;
  _subscription: Subscription;
  _isClosed: boolean;

  constructor(transport: Transport) {
    this._transport = transport;
    this._idToTunnel = new Map();
    this._logger = getLogger('tunnel-manager');
    this._isClosed = false;

    this._subscription = this._transport
      .onMessage()
      .map(msg => {
        return JSON.parse(msg);
      })
      .subscribe(msg => this._handleMessage(msg));
  }

  async createTunnel(localPort: number, remotePort: number): Promise<Tunnel> {
    invariant(
      !this._isClosed,
      'trying to create a tunnel with a closed tunnel manager',
    );
    this._logger.info(`creating tunnel ${localPort}->${remotePort}`);
    const tunnel = await Tunnel.createTunnel(
      localPort,
      remotePort,
      this._transport,
    );
    this._idToTunnel.set(tunnel.getId(), tunnel);
    return tunnel;
  }

  async createReverseTunnel(
    localPort: number,
    remotePort: number,
  ): Promise<Tunnel> {
    invariant(
      !this._isClosed,
      'trying to create a reverse tunnel with a closed tunnel manager',
    );
    this._logger.info(`creating reverse tunnel ${localPort}<-${remotePort}`);
    const tunnel = await Tunnel.createReverseTunnel(
      localPort,
      remotePort,
      this._transport,
    );
    return tunnel;
  }

  close(): void {
    this._logger.trace('closing tunnel manager');
    this._idToTunnel.forEach(tunnel => {
      tunnel.close();
    });
    this._idToTunnel.clear();
    this._isClosed = true;
  }

  async _handleMessage(msg: Object /* TunnelMessage? */): Promise<void> {
    const tunnelComponent = this._idToTunnel.get(msg.tunnelId);
    if (msg.event === 'proxyCreated') {
      if (tunnelComponent == null) {
        const socketManager = new SocketManager(
          msg.tunnelId,
          msg.remotePort,
          this._transport,
        );

        this._idToTunnel.set(msg.tunnelId, socketManager);
      }
    } else if (msg.event === 'proxyClosed') {
      invariant(tunnelComponent);
      tunnelComponent.close();
      this._idToTunnel.delete(tunnelComponent.getId());
    } else if (msg.event === 'createProxy') {
      const proxy = await Proxy.createProxy(
        msg.tunnelId,
        msg.localPort,
        msg.remotePort,
        this._transport,
      );
      this._idToTunnel.set(msg.tunnelId, proxy);
    } else if (msg.event === 'closeProxy') {
      invariant(tunnelComponent);
      tunnelComponent.close();
    } else {
      invariant(tunnelComponent);
      tunnelComponent.receive(msg);
    }
  }
}

export class Tunnel {
  _localPort: number;
  _remotePort: number;
  _transport: Transport;
  _proxy: ?Proxy;
  _id: string;
  _logger: log4js$Logger;

  constructor(
    id: string,
    proxy: ?Proxy,
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

  static async createReverseTunnel(
    localPort: number,
    remotePort: number,
    transport: Transport,
  ): Promise<Tunnel> {
    const tunnelId = generateId();

    const socketManager = new SocketManager(tunnelId, localPort, transport);

    transport.send(
      JSON.stringify({
        event: 'createProxy',
        tunnelId,
        localPort,
        remotePort,
      }),
    );
    return new ReverseTunnel(
      tunnelId,
      socketManager,
      localPort,
      remotePort,
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
    invariant(this._proxy);
    this._proxy.close();
  }
}

class ReverseTunnel extends Tunnel {
  _socketManager: SocketManager;

  constructor(
    id: string,
    socketManager: SocketManager,
    localPort: number,
    remotePort: number,
    transport: Transport,
  ) {
    super(id, null, localPort, remotePort, transport);
    this._socketManager = socketManager;
  }

  receive(msg: Object): void {
    throw new Error('Tunnel.receive is not implemented for a reverse tunnel');
  }

  close() {
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
