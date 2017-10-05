'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BigDigClient = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * This class is responsible for talking to a Big Dig server, which enables the
 * client to launch a remote process and communication with its stdin, stdout,
 * and stderr.
 */
class BigDigClient {

  constructor(webSocketTransport) {
    this._webSocketTransport = webSocketTransport;
    this._tagToSubject = new Map();

    const observable = webSocketTransport.onMessage();
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
          // eslint-disable-next-line no-console
          console.warn(`No one listening for tag "${tag}".`);
        }
      },
      error(err) {
        // eslint-disable-next-line no-console
        console.error('Error received in ConnectionWrapper', err);
      },
      complete() {
        // eslint-disable-next-line no-console
        console.error('ConnectionWrapper completed()?');
      }
    });
  }

  sendMessage(tag, body) {
    this._webSocketTransport.send(`${tag}\0${body}`);
  }

  onMessage(tag) {
    let subject = this._tagToSubject.get(tag);
    if (subject == null) {
      subject = new _rxjsBundlesRxMinJs.Subject();
      this._tagToSubject.set(tag, subject);
    }
    return subject.asObservable();
  }

  getAddress() {
    return this._webSocketTransport.getAddress();
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