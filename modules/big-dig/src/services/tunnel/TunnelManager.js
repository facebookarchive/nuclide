"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TunnelManager = void 0;

function _SocketManager() {
  const data = require("./SocketManager");

  _SocketManager = function () {
    return data;
  };

  return data;
}

function _Proxy() {
  const data = require("./Proxy");

  _Proxy = function () {
    return data;
  };

  return data;
}

function _Tunnel() {
  const data = require("./Tunnel");

  _Tunnel = function () {
    return data;
  };

  return data;
}

function _Encoder() {
  const data = _interopRequireDefault(require("./Encoder"));

  _Encoder = function () {
    return data;
  };

  return data;
}

var _events = _interopRequireDefault(require("events"));

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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
class TunnelManager extends _events.default {
  // on the client (where tunnels are created), we always map to a Tunnel.
  // on the server, we map to either a SocketManager or a Proxy, depending
  // on whether we are a reverse tunnel or not
  constructor(transport) {
    super();
    this._transport = transport;
    this._idToTunnel = new Map();
    this._logger = (0, _log4js().getLogger)('tunnel-manager');
    this._isClosed = false;
    this._subscription = this._transport.onMessage().map(msg => {
      return _Encoder().default.decode(msg);
    }).subscribe(msg => this._handleMessage(msg));
  }

  async createTunnel(localPort, remotePort, useIPv4) {
    if (!!this._isClosed) {
      throw new Error('trying to create a tunnel with a closed tunnel manager');
    }

    this._logger.info(`creating tunnel ${localPort}->${remotePort}`);

    return this._createTunnel(localPort, remotePort, useIPv4 != null ? useIPv4 : false, false);
  }

  async createReverseTunnel(localPort, remotePort, useIPv4) {
    if (!!this._isClosed) {
      throw new Error('trying to create a reverse tunnel with a closed tunnel manager');
    }

    this._logger.info(`creating reverse tunnel ${localPort}<-${remotePort}`);

    return new Promise(async (resolve, reject) => {
      const tunnel = await this._createTunnel(localPort, remotePort, useIPv4 != null ? useIPv4 : false, true); // now wait until we get the 'proxyCreated' or 'proxyError' message

      this.once(`proxyMessage:${tunnel.getId()}`, msg => {
        if (msg.event === 'proxyCreated') {
          resolve(tunnel);
        } else {
          reject(JSON.parse(msg.error));
        }
      });
    });
  }

  async _createTunnel(localPort, remotePort, useIPv4, isReverse) {
    let tunnel = this._checkForExistingTunnel(localPort, remotePort, useIPv4, isReverse);

    if (tunnel == null) {
      if (isReverse) {
        tunnel = await _Tunnel().Tunnel.createReverseTunnel(localPort, remotePort, useIPv4, this._transport);
      } else {
        tunnel = await _Tunnel().Tunnel.createTunnel(localPort, remotePort, useIPv4, this._transport);
      }

      this._idToTunnel.set(tunnel.getId(), tunnel);

      tunnel.once('close', () => {
        if (!(tunnel != null)) {
          throw new Error("Invariant violation: \"tunnel != null\"");
        }

        this._idToTunnel.delete(tunnel.getId());
      });
    } else {
      tunnel.incrementRefCount();
    }

    return tunnel;
  }

  close() {
    this._logger.trace('closing tunnel manager');

    this._idToTunnel.forEach(tunnel => {
      if (tunnel instanceof _SocketManager().SocketManager || tunnel instanceof _Proxy().Proxy) {
        tunnel.close();
      } else {
        tunnel.forceClose();
      }
    });

    this._idToTunnel.clear();

    this._isClosed = true;
  }

  get tunnels() {
    return Array.from(this._idToTunnel.values());
  }

  _checkForExistingTunnel(localPort, remotePort, useIPv4, isReverse) {
    for (const tunnel of this._idToTunnel.values()) {
      if (tunnel instanceof _Tunnel().Tunnel) {
        if (localPort === tunnel.getLocalPort() && remotePort === tunnel.getRemotePort() && useIPv4 === tunnel.getUseIPv4()) {
          if (isReverse && tunnel instanceof _Tunnel().ReverseTunnel || !isReverse && !(tunnel instanceof _Tunnel().ReverseTunnel)) {
            return tunnel;
          } else {
            throw new Error("there is already a tunnel with those ports, but it's in the wrong direction");
          }
        } else if (localPort === tunnel.getLocalPort()) {
          throw new Error(`there already exists a tunnel connecting to localPort ${localPort}`);
        } else if (remotePort === tunnel.getRemotePort()) {
          throw new Error(`there already exists a tunnel connecting to remotePort ${remotePort}`);
        }
      }
    }
  }

  async _handleMessage(msg
  /* TunnelMessage? */
  ) {
    const tunnelComponent = this._idToTunnel.get(msg.tunnelId);

    if (msg.event === 'proxyCreated') {
      if (tunnelComponent == null) {
        const socketManager = new (_SocketManager().SocketManager)(msg.tunnelId, msg.remotePort, msg.useIPv4, this._transport);

        this._idToTunnel.set(msg.tunnelId, socketManager);
      }

      this.emit(`proxyMessage:${msg.tunnelId}`, msg);
    } else if (msg.event === 'proxyError') {
      this._logger.error('error creating proxy: ', msg);

      this.emit(`proxyMessage:${msg.tunnelId}`, msg);
    } else if (msg.event === 'proxyClosed') {
      // in the case of a reverse tunnel, we get the proxyClosed event
      // after we actually close the tunnel, so we ignore it.
      if (tunnelComponent != null) {
        if (!tunnelComponent) {
          throw new Error("Invariant violation: \"tunnelComponent\"");
        }

        tunnelComponent.close();

        this._idToTunnel.delete(tunnelComponent.getId());
      }
    } else if (msg.event === 'createProxy') {
      const proxy = await _Proxy().Proxy.createProxy(msg.tunnelId, msg.localPort, msg.remotePort, msg.useIPv4, this._transport);

      this._idToTunnel.set(msg.tunnelId, proxy);
    } else if (msg.event === 'closeProxy') {
      if (!tunnelComponent) {
        throw new Error("Invariant violation: \"tunnelComponent\"");
      }

      tunnelComponent.close();
    } else {
      if (!tunnelComponent) {
        throw new Error("Invariant violation: \"tunnelComponent\"");
      }

      tunnelComponent.receive(msg);
    }
  }

}

exports.TunnelManager = TunnelManager;