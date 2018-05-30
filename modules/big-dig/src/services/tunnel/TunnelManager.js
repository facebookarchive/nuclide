'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Tunnel = exports.TunnelManager = undefined;

var _SocketManager;

function _load_SocketManager() {
  return _SocketManager = require('./SocketManager');
}

var _Proxy;

function _load_Proxy() {
  return _Proxy = require('./Proxy');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

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

class TunnelManager {
  // on the client (where tunnels are created), we always map to a Tunnel.
  // on the server, we map to either a SocketManager or a Proxy, depending
  // on whether we are a reverse tunnel or not
  constructor(transport) {
    this._transport = transport;
    this._idToTunnel = new Map();
    this._logger = (0, (_log4js || _load_log4js()).getLogger)('tunnel-manager');
    this._isClosed = false;

    this._subscription = this._transport.onMessage().map(msg => {
      return JSON.parse(msg);
    }).subscribe(msg => this._handleMessage(msg));
  }

  async createTunnel(localPort, remotePort) {
    if (!!this._isClosed) {
      throw new Error('trying to create a tunnel with a closed tunnel manager');
    }

    this._logger.info(`creating tunnel ${localPort}->${remotePort}`);
    const tunnel = await Tunnel.createTunnel(localPort, remotePort, this._transport);
    this._idToTunnel.set(tunnel.getId(), tunnel);
    return tunnel;
  }

  async createReverseTunnel(localPort, remotePort) {
    if (!!this._isClosed) {
      throw new Error('trying to create a reverse tunnel with a closed tunnel manager');
    }

    this._logger.info(`creating reverse tunnel ${localPort}<-${remotePort}`);
    const tunnel = await Tunnel.createReverseTunnel(localPort, remotePort, this._transport);
    return tunnel;
  }

  close() {
    this._logger.trace('closing tunnel manager');
    this._idToTunnel.forEach(tunnel => {
      tunnel.close();
    });
    this._idToTunnel.clear();
    this._isClosed = true;
  }

  async _handleMessage(msg /* TunnelMessage? */) {
    const tunnelComponent = this._idToTunnel.get(msg.tunnelId);
    if (msg.event === 'proxyCreated') {
      if (tunnelComponent == null) {
        const socketManager = new (_SocketManager || _load_SocketManager()).SocketManager(msg.tunnelId, msg.remotePort, this._transport);

        this._idToTunnel.set(msg.tunnelId, socketManager);
      }
    } else if (msg.event === 'proxyClosed') {
      if (!tunnelComponent) {
        throw new Error('Invariant violation: "tunnelComponent"');
      }

      tunnelComponent.close();
      this._idToTunnel.delete(tunnelComponent.getId());
    } else if (msg.event === 'createProxy') {
      const proxy = await (_Proxy || _load_Proxy()).Proxy.createProxy(msg.tunnelId, msg.localPort, msg.remotePort, this._transport);
      this._idToTunnel.set(msg.tunnelId, proxy);
    } else if (msg.event === 'closeProxy') {
      if (!tunnelComponent) {
        throw new Error('Invariant violation: "tunnelComponent"');
      }

      tunnelComponent.close();
    } else {
      if (!tunnelComponent) {
        throw new Error('Invariant violation: "tunnelComponent"');
      }

      tunnelComponent.receive(msg);
    }
  }
}

exports.TunnelManager = TunnelManager; /**
                                        * Copyright (c) 2017-present, Facebook, Inc.
                                        * All rights reserved.
                                        *
                                        * This source code is licensed under the BSD-style license found in the
                                        * LICENSE file in the root directory of this source tree. An additional grant
                                        * of patent rights can be found in the PATENTS file in the same directory.
                                        *
                                        * 
                                        * @format
                                        */

class Tunnel {

  constructor(id, proxy, localPort, remotePort, transport) {
    this._id = id;
    this._proxy = proxy;
    this._localPort = localPort;
    this._remotePort = remotePort;
    this._transport = transport;
    this._logger = (0, (_log4js || _load_log4js()).getLogger)('tunnel');
  }

  static async createTunnel(localPort, remotePort, transport) {
    const tunnelId = generateId();
    const proxy = await (_Proxy || _load_Proxy()).Proxy.createProxy(tunnelId, localPort, remotePort, transport);
    return new Tunnel(tunnelId, proxy, localPort, remotePort, transport);
  }

  static async createReverseTunnel(localPort, remotePort, transport) {
    const tunnelId = generateId();

    const socketManager = new (_SocketManager || _load_SocketManager()).SocketManager(tunnelId, localPort, transport);

    transport.send(JSON.stringify({
      event: 'createProxy',
      tunnelId,
      localPort,
      remotePort
    }));
    return new ReverseTunnel(tunnelId, socketManager, localPort, remotePort, transport);
  }

  receive(msg) {
    if (this._proxy != null) {
      this._proxy.receive(msg);
    }
  }

  getId() {
    return this._id;
  }

  close() {
    if (!this._proxy) {
      throw new Error('Invariant violation: "this._proxy"');
    }

    this._proxy.close();
  }
}

exports.Tunnel = Tunnel;
class ReverseTunnel extends Tunnel {

  constructor(id, socketManager, localPort, remotePort, transport) {
    super(id, null, localPort, remotePort, transport);
    this._socketManager = socketManager;
  }

  receive(msg) {
    throw new Error('Tunnel.receive is not implemented for a reverse tunnel');
  }

  close() {
    if (!this._socketManager) {
      throw new Error('Invariant violation: "this._socketManager"');
    }

    this._socketManager.close();
    this._transport.send(JSON.stringify({
      event: 'closeProxy',
      tunnelId: this._id
    }));
  }
}

// TODO: this should really be a UUID
let nextId = 1;
function generateId() {
  return 'tunnel' + nextId++;
}