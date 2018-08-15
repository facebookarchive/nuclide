"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BigDigClient = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _BigDigServer() {
  const data = require("../server/BigDigServer");

  _BigDigServer = function () {
    return data;
  };

  return data;
}

function _types() {
  const data = require("../services/thrift/types");

  _types = function () {
    return data;
  };

  return data;
}

function _TunnelManager() {
  const data = require("../services/tunnel/TunnelManager");

  _TunnelManager = function () {
    return data;
  };

  return data;
}

function _ThriftClientManager() {
  const data = require("../services/thrift/ThriftClientManager");

  _ThriftClientManager = function () {
    return data;
  };

  return data;
}

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
 * This class is responsible for talking to a Big Dig server, which enables the
 * client to launch a remote process and communication with its stdin, stdout,
 * and stderr.
 */
class BigDigClient {
  constructor(reliableSocketTransport) {
    this._logger = (0, _log4js().getLogger)();
    this._transport = reliableSocketTransport;
    this._tagToSubject = new Map();
    this._tunnelManager = new (_TunnelManager().TunnelManager)({
      onMessage: () => {
        return this.onMessage('tunnel');
      },
      send: message => {
        this.sendMessage('tunnel', message);
      }
    });
    this._thriftClientManager = new (_ThriftClientManager().ThriftClientManager)({
      onMessage: () => {
        return this.onMessage(_types().THRIFT_SERVICE_TAG);
      },
      send: message => {
        this.sendMessage(_types().THRIFT_SERVICE_TAG, message);
      }
    }, this._tunnelManager);
    const observable = reliableSocketTransport.onMessage();
    observable.subscribe({
      // Must use arrow function so that `this` is bound correctly.
      next: message => {
        const index = message.indexOf('\0');
        const tag = message.substring(0, index);

        const subject = this._tagToSubject.get(tag);

        if (subject != null) {
          const body = message.substring(index + 1);
          subject.next(body);
        } else {
          this._logger.warn(`No one listening for tag "${tag}".`);
        }
      },

      error(err) {
        this._logger.error('Error received in ConnectionWrapper', err);
      },

      complete() {
        this._logger.error('ConnectionWrapper completed()?');
      }

    });
  }

  isClosed() {
    return this._transport.isClosed();
  }

  onClose(callback) {
    return this._transport.onClose(callback);
  }

  async createTunnel(localPort, remotePort, isReverse = false, useIPv4 = false) {
    if (!isReverse) {
      return this._tunnelManager.createTunnel(localPort, remotePort, useIPv4);
    } else {
      return this._tunnelManager.createReverseTunnel(localPort, remotePort, useIPv4);
    }
  }

  getOrCreateThriftClient(serviceConfig) {
    return this._thriftClientManager.createThriftClient(serviceConfig);
  }

  close() {
    this._logger.info('close called');

    this._tunnelManager.close();

    this._thriftClientManager.close();

    if (!this.isClosed()) {
      this.sendMessage(_BigDigServer().CLOSE_TAG, '');
    }

    this._transport.close();
  }

  sendMessage(tag, body) {
    const message = `${tag}\0${body}`;

    if (this.isClosed()) {
      this._logger.warn(`Attempting to send message to ${this.getAddress()} on closed BigDigClient: ${message}`);

      return;
    }

    this._transport.send(message);
  }

  onMessage(tag) {
    let subject = this._tagToSubject.get(tag);

    if (subject == null) {
      subject = new _RxMin.Subject();

      this._tagToSubject.set(tag, subject);
    }

    return subject.asObservable();
  }

  getHeartbeat() {
    return this._transport.getHeartbeat();
  }

  getAddress() {
    return this._transport.getAddress();
  }

}

exports.BigDigClient = BigDigClient;