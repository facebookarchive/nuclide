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

function _TunnelConfigUtils() {
  const data = require("./TunnelConfigUtils");

  _TunnelConfigUtils = function () {
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

  async createTunnel(tunnelConfig) {
    if (!!this._isClosed) {
      throw new Error('trying to create a tunnel with a closed tunnel manager');
    }

    this._logger.info(`creating tunnel ${(0, _TunnelConfigUtils().getDescriptor)(tunnelConfig, false)}`);

    return this._createTunnel(tunnelConfig, false);
  }

  async createReverseTunnel(tunnelConfig) {
    if (!!this._isClosed) {
      throw new Error('trying to create a reverse tunnel with a closed tunnel manager');
    }

    this._logger.info(`creating reverse tunnel ${(0, _TunnelConfigUtils().getDescriptor)(tunnelConfig, true)}`);

    return new Promise(async (resolve, reject) => {
      const tunnel = await this._createTunnel(tunnelConfig, true); // now wait until we get the 'proxyCreated' or 'proxyError' message

      this.once(`proxyMessage:${tunnel.getId()}`, msg => {
        if (msg.event === 'proxyCreated') {
          resolve(tunnel);
        } else if (msg.event === 'proxyError') {
          tunnel.close();
          reject(msg.error);
        } else {
          reject(new Error('unexpected response to createProxy'));
        }
      });
    });
  }

  async _createTunnel(tunnelConfig, isReverse) {
    let tunnel = this._checkForExistingTunnel(tunnelConfig, isReverse);

    if (tunnel == null) {
      if (isReverse) {
        tunnel = await _Tunnel().Tunnel.createReverseTunnel(tunnelConfig, this._transport);
      } else {
        tunnel = await _Tunnel().Tunnel.createTunnel(tunnelConfig, this._transport);
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

  _checkForExistingTunnel(tunnelConfig, isReverse) {
    for (const tunnel of this._idToTunnel.values()) {
      if (!(tunnel instanceof _Tunnel().Tunnel)) {
        continue;
      }

      if (tunnel.isTunnelConfigEqual(tunnelConfig)) {
        if (isReverse === tunnel.isReverse()) {
          return tunnel;
        } else {
          throw new Error("there is already a tunnel with those ports, but it's in the wrong direction");
        }
      }

      tunnel.assertNoOverlap(tunnelConfig);
    }
  }

  async _handleMessage(msg
  /* TunnelMessage? */
  ) {
    const tunnelComponent = this._idToTunnel.get(msg.tunnelId);

    if (msg.event === 'proxyCreated') {
      if (tunnelComponent == null) {
        const socketManager = new (_SocketManager().SocketManager)(msg.tunnelId, msg.proxyConfig, this._transport);

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
      try {
        const proxy = await _Proxy().Proxy.createProxy(msg.tunnelId, msg.tunnelConfig, this._transport);

        this._idToTunnel.set(msg.tunnelId, proxy);
      } catch (e) {// We already responded with proxyError, nothing else to do
      }
    } else if (msg.event === 'closeProxy') {
      if (tunnelComponent == null) {
        // TODO T33725076: Shouldn't have message to closed tunnels
        this._logger.error('Receiving a closeProxy message to a closed tunnel', msg);
      } else {
        tunnelComponent.close();
      }
    } else {
      if (tunnelComponent == null) {
        // TODO T33725076: Shouldn't have message to closed tunnels
        this._logger.error('Receiving a message to a closed tunnel', msg);
      } else {
        tunnelComponent.receive(msg);
      }
    }
  }

}

exports.TunnelManager = TunnelManager;