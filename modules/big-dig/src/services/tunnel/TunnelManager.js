'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TunnelManager = undefined;

var _SocketManager;

function _load_SocketManager() {
  return _SocketManager = require('./SocketManager');
}

var _Proxy;

function _load_Proxy() {
  return _Proxy = require('./Proxy');
}

var _Tunnel;

function _load_Tunnel() {
  return _Tunnel = require('./Tunnel');
}

var _Encoder;

function _load_Encoder() {
  return _Encoder = _interopRequireDefault(require('./Encoder'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
      return (_Encoder || _load_Encoder()).default.decode(msg);
    }).subscribe(msg => this._handleMessage(msg));
  }

  async createTunnel(localPort, remotePort, useIPv4) {
    if (!!this._isClosed) {
      throw new Error('trying to create a tunnel with a closed tunnel manager');
    }

    this._logger.info(`creating tunnel ${localPort}->${remotePort}`);
    const tunnel = await (_Tunnel || _load_Tunnel()).Tunnel.createTunnel(localPort, remotePort, useIPv4 != null ? useIPv4 : false, this._transport);
    this._idToTunnel.set(tunnel.getId(), tunnel);
    tunnel.once('close', () => {
      this._idToTunnel.delete(tunnel.getId());
    });
    return tunnel;
  }

  async createReverseTunnel(localPort, remotePort, useIPv4) {
    if (!!this._isClosed) {
      throw new Error('trying to create a reverse tunnel with a closed tunnel manager');
    }

    this._logger.info(`creating reverse tunnel ${localPort}<-${remotePort}`);
    const tunnel = await (_Tunnel || _load_Tunnel()).Tunnel.createReverseTunnel(localPort, remotePort, useIPv4 != null ? useIPv4 : false, this._transport);
    this._idToTunnel.set(tunnel.getId(), tunnel);
    tunnel.once('close', () => {
      this._idToTunnel.delete(tunnel.getId());
    });
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

  get tunnels() {
    return Array.from(this._idToTunnel.values());
  }

  async _handleMessage(msg /* TunnelMessage? */) {
    const tunnelComponent = this._idToTunnel.get(msg.tunnelId);
    if (msg.event === 'proxyCreated') {
      if (tunnelComponent == null) {
        const socketManager = new (_SocketManager || _load_SocketManager()).SocketManager(msg.tunnelId, msg.remotePort, msg.useIPv4, this._transport);

        this._idToTunnel.set(msg.tunnelId, socketManager);
      }
    } else if (msg.event === 'proxyClosed') {
      // in the case of a reverse tunnel, we get the proxyClosed event
      // after we actually close the tunnel, so we ignore it.
      if (tunnelComponent != null) {
        if (!tunnelComponent) {
          throw new Error('Invariant violation: "tunnelComponent"');
        }

        tunnelComponent.close();
        this._idToTunnel.delete(tunnelComponent.getId());
      }
    } else if (msg.event === 'createProxy') {
      const proxy = await (_Proxy || _load_Proxy()).Proxy.createProxy(msg.tunnelId, msg.localPort, msg.remotePort, msg.useIPv4, this._transport);
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