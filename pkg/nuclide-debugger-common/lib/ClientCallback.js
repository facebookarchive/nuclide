'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class ClientCallback {
  // For server messages.
  constructor() {
    this._serverMessageObservable = new _rxjsBundlesRxMinJs.Subject();
    this._userOutputObservable = new _rxjsBundlesRxMinJs.Subject();
    this._atomNotificationObservable = new _rxjsBundlesRxMinJs.Subject();
  } // For user visible output messages.


  getServerMessageObservable() {
    return this._serverMessageObservable.asObservable();
  }

  getOutputWindowObservable() {
    return this._userOutputObservable.asObservable();
  }

  getAtomNotificationObservable() {
    return this._atomNotificationObservable.asObservable();
  }

  sendChromeMessage(message) {
    this._serverMessageObservable.next(message);
  }

  sendUserOutputMessage(message) {
    this._userOutputObservable.next(message);
  }

  sendAtomNotification(type, message) {
    this._atomNotificationObservable.next({ type, message });
  }

  dispose() {
    this._serverMessageObservable.complete();
    this._userOutputObservable.complete();
    this._atomNotificationObservable.complete();
  }
}
exports.default = ClientCallback;