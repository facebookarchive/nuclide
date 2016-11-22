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
exports.LoopbackTransports = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

let LoopbackTransports = exports.LoopbackTransports = class LoopbackTransports {

  constructor() {
    const serverMessages = new _rxjsBundlesRxMinJs.Subject();
    const clientMessages = new _rxjsBundlesRxMinJs.Subject();

    this.serverTransport = {
      _isClosed: false,
      send: function (message) {
        clientMessages.next(message);
      },
      onMessage: function () {
        return serverMessages;
      },
      close: function () {
        this._isClosed = true;
      },
      isClosed: function () {
        return this._isClosed;
      }
    };

    this.clientTransport = {
      _isClosed: false,
      send: function (message) {
        serverMessages.next(message);
      },
      onMessage: function () {
        return clientMessages;
      },
      close: function () {
        this._isClosed = true;
      },
      isClosed: function () {
        return this._isClosed;
      }
    };
  }
};