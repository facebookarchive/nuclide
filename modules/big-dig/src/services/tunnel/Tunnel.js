"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReverseTunnel = exports.Tunnel = void 0;

function _ProxyConfigUtils() {
  const data = require("./ProxyConfigUtils");

  _ProxyConfigUtils = function () {
    return data;
  };

  return data;
}

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
class Tunnel extends _events.default {
  constructor(id, proxy, tunnelConfig, transport) {
    super();
    this._id = id;
    this._proxy = proxy;
    this._tunnelConfig = tunnelConfig;
    this._transport = transport;
    this._isClosed = false;
    this._logger = (0, _log4js().getLogger)('tunnel');
    this._refCount = 1;

    if (this._proxy != null) {
      this._proxy.once('error', error => {
        this.emit('error', error);
      });
    }
  }

  static async createTunnel(tunnelConfig, transport) {
    const tunnelId = generateId();
    const proxy = await _Proxy().Proxy.createProxy(tunnelId, tunnelConfig, transport);
    return new Tunnel(tunnelId, proxy, tunnelConfig, transport);
  }

  static async createReverseTunnel(tunnelConfig, transport) {
    const tunnelId = generateId();
    const socketManager = new (_SocketManager().SocketManager)(tunnelId, tunnelConfig.local, transport);
    transport.send(JSON.stringify({
      event: 'createProxy',
      tunnelId,
      tunnelConfig: reverseTunnelConfig(tunnelConfig)
    }));
    return new ReverseTunnel(tunnelId, socketManager, tunnelConfig, transport);
  }

  incrementRefCount() {
    this._refCount++;
  }

  isTunnelConfigEqual(tunnelConfig) {
    return (0, _ProxyConfigUtils().isProxyConfigEqual)(tunnelConfig.local, this.getConfig().local) && (0, _ProxyConfigUtils().isProxyConfigEqual)(tunnelConfig.remote, this.getConfig().remote);
  }

  assertNoOverlap(tunnelConfig) {
    if ((0, _ProxyConfigUtils().isProxyConfigOverlapping)(tunnelConfig.local, this.getConfig().local)) {
      throw new Error(`there already exists a tunnel connecting to ${(0, _ProxyConfigUtils().getProxyConfigDescriptor)(tunnelConfig.local)}`);
    }

    if ((0, _ProxyConfigUtils().isProxyConfigOverlapping)(tunnelConfig.remote, this.getConfig().remote)) {
      throw new Error(`there already exists a tunnel connecting to ${(0, _ProxyConfigUtils().getProxyConfigDescriptor)(tunnelConfig.remote)}`);
    }
  }

  hasReferences() {
    return this._refCount > 0;
  }

  receive(msg) {
    if (this._proxy != null) {
      this._proxy.receive(msg);
    }
  }

  getId() {
    return this._id;
  }

  getConfig() {
    return this._tunnelConfig;
  }

  getRefCount() {
    return this._refCount;
  }

  forceClose() {
    this._refCount = 0;
    this.close();
  }

  close() {
    this._refCount--;

    if (!this.hasReferences()) {
      this._isClosed = true;
      this.emit('close');

      if (!this._proxy) {
        throw new Error("Invariant violation: \"this._proxy\"");
      }

      this._proxy.close();
    }
  }

  isReverse() {
    return false;
  }

}

exports.Tunnel = Tunnel;

class ReverseTunnel extends Tunnel {
  constructor(id, socketManager, tunnelConfig, transport) {
    super(id, null, tunnelConfig, transport);
    this._socketManager = socketManager;

    this._socketManager.on('error', error => {
      this.emit('error', error);
    });
  }

  receive(msg) {
    if (this._socketManager != null) {
      this._socketManager.receive(msg);
    }
  }

  close() {
    this._refCount--;

    if (!this.hasReferences()) {
      this._isClosed = true;
      this.emit('close');

      if (!this._socketManager) {
        throw new Error("Invariant violation: \"this._socketManager\"");
      }

      this._socketManager.close();

      this._transport.send(JSON.stringify({
        event: 'closeProxy',
        tunnelId: this._id
      }));
    }
  }

  isReverse() {
    return true;
  }

} // TODO: this should really be a UUID


exports.ReverseTunnel = ReverseTunnel;
let nextId = 1;

function generateId() {
  return 'tunnel' + nextId++;
}

function reverseTunnelConfig(tunnelConfig) {
  return {
    // NB: on the server, the remote port and local ports are reversed.
    // We want to start the proxy on the remote port (relative to the
    // client) and start the socket manager on the local port
    local: tunnelConfig.remote,
    remote: tunnelConfig.local
  };
}