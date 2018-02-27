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

/**
 * This class is responsible for talking to a Big Dig server, which enables the
 * client to launch a remote process and communication with its stdin, stdout,
 * and stderr.
 */
class BigDigClient {

  constructor(nuclideSocketTransport, heartbeat) {
    this._logger = (0, (_log4js || _load_log4js()).getLogger)();
    this._transport = nuclideSocketTransport;
    this._tagToSubject = new Map();

    const observable = nuclideSocketTransport.onMessage();
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

    this._heartbeat = heartbeat;
    this._heartbeat.onConnectionRestored(() => {
      this._logger.warn('TODO(T25533063): Implement reconnect logic');
    });
  }

  isClosed() {
    return this._transport.isClosed();
  }

  // XXX: do we even need this now that we're using
  // NuclideSocket and QueuedAckTransport?
  onClose(callback) {
    return {
      dispose: () => {}
    };
  }

  close() {
    this._transport.close();
  }

  sendMessage(tag, body) {
    this._transport.send(`${tag}\0${body}`);
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
    return this._heartbeat;
  }

  getAddress() {
    return this._transport.getAddress();
  }

  dispose() {
    // TODO(mbolin)
  }
}
exports.BigDigClient = BigDigClient; /**
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