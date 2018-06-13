'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReverseTunnel = exports.Tunnel = undefined;

var _SocketManager;

function _load_SocketManager() {
  return _SocketManager = require('./SocketManager');
}

var _Proxy;

function _load_Proxy() {
  return _Proxy = require('./Proxy');
}

var _events = _interopRequireDefault(require('events'));

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Tunnel extends _events.default {

  constructor(id, proxy, localPort, remotePort, useIPv4, transport) {
    super();
    this._id = id;
    this._proxy = proxy;
    this._localPort = localPort;
    this._remotePort = remotePort;
    this._useIPv4 = useIPv4;
    this._transport = transport;
    this._isClosed = false;
    this._logger = (0, (_log4js || _load_log4js()).getLogger)('tunnel');
  }

  static async createTunnel(localPort, remotePort, useIPv4, transport) {
    const tunnelId = generateId();
    const proxy = await (_Proxy || _load_Proxy()).Proxy.createProxy(tunnelId, localPort, remotePort, useIPv4, transport);
    return new Tunnel(tunnelId, proxy, localPort, remotePort, useIPv4, transport);
  }

  static async createReverseTunnel(localPort, remotePort, useIPv4, transport) {
    const tunnelId = generateId();

    const socketManager = new (_SocketManager || _load_SocketManager()).SocketManager(tunnelId, localPort, useIPv4, transport);

    transport.send(JSON.stringify({
      event: 'createProxy',
      tunnelId,
      useIPv4,
      // NB: on the server, the remote port and local ports are reversed.
      // We want to start the proxy on the remote port (relative to the
      // client) and start the socket manager on the local port
      localPort: remotePort,
      remotePort: localPort
    }));
    return new ReverseTunnel(tunnelId, socketManager, localPort, remotePort, useIPv4, transport);
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
    this._isClosed = true;
    this.emit('close');

    if (!this._proxy) {
      throw new Error('Invariant violation: "this._proxy"');
    }

    this._proxy.close();
  }
}

exports.Tunnel = Tunnel; /**
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

class ReverseTunnel extends Tunnel {

  constructor(id, socketManager, localPort, remotePort, useIPv4, transport) {
    super(id, null, localPort, remotePort, useIPv4, transport);
    this._socketManager = socketManager;
  }

  receive(msg) {
    if (this._socketManager != null) {
      this._socketManager.receive(msg);
    }
  }

  close() {
    this._isClosed = true;
    this.emit('close');

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

exports.ReverseTunnel = ReverseTunnel; // TODO: this should really be a UUID

let nextId = 1;
function generateId() {
  return 'tunnel' + nextId++;
}