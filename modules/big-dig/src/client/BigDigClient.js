'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BigDigClient = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _BigDigServer;

function _load_BigDigServer() {
  return _BigDigServer = require('../server/BigDigServer');
}

var _TunnelManager;

function _load_TunnelManager() {
  return _TunnelManager = require('../services/tunnel/TunnelManager');
}

/**
 * This class is responsible for talking to a Big Dig server, which enables the
 * client to launch a remote process and communication with its stdin, stdout,
 * and stderr.
 */
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

class BigDigClient {

  constructor(reliableSocketTransport) {
    this._logger = (0, (_log4js || _load_log4js()).getLogger)();
    this._transport = reliableSocketTransport;
    this._tagToSubject = new Map();
    this._tunnelManager = new (_TunnelManager || _load_TunnelManager()).TunnelManager({
      onMessage: () => {
        return this.onMessage('tunnel');
      },
      send: message => {
        this.sendMessage('tunnel', message);
      }
    });

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

  close() {
    this._logger.info('close called');
    this._tunnelManager.close();
    if (!this.isClosed()) {
      this.sendMessage((_BigDigServer || _load_BigDigServer()).CLOSE_TAG, '');
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
      subject = new _rxjsBundlesRxMinJs.Subject();
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