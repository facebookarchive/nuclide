'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

let ClientCallback = class ClientCallback {
  // For user visible output messages.

  constructor() {
    this._serverMessageObservable = new _rxjsBundlesRxMinJs.Subject();
    this._userOutputObservable = new _rxjsBundlesRxMinJs.Subject();
  } // For server messages.


  getServerMessageObservable() {
    return this._serverMessageObservable;
  }

  getOutputWindowObservable() {
    return this._userOutputObservable;
  }

  sendChromeMessage(message) {
    this._serverMessageObservable.next(message);
  }

  sendUserOutputMessage(message) {
    this._userOutputObservable.next(message);
  }

  dispose() {
    this._serverMessageObservable.complete();
    this._userOutputObservable.complete();
  }
};
exports.default = ClientCallback;
module.exports = exports['default'];