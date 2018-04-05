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

  constructor(reliableSocketTransport) {
    this._logger = (0, (_log4js || _load_log4js()).getLogger)();
    this._transport = reliableSocketTransport;
    this._tagToSubject = new Map();

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
    return this._transport.getHeartbeat();
  }

  getAddress() {
    return this._transport.getAddress();
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