"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoopbackTransports = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
class LoopbackTransports {
  constructor() {
    const serverMessages = new _RxMin.Subject();
    const clientMessages = new _RxMin.Subject();
    this.serverTransport = {
      _isClosed: false,

      send(message) {
        clientMessages.next(message);
      },

      onMessage() {
        return serverMessages;
      },

      close() {
        this._isClosed = true;
      },

      isClosed() {
        return this._isClosed;
      }

    };
    this.clientTransport = {
      _isClosed: false,

      send(message) {
        serverMessages.next(message);
      },

      onMessage() {
        return clientMessages;
      },

      close() {
        this._isClosed = true;
      },

      isClosed() {
        return this._isClosed;
      }

    };
  }

}

exports.LoopbackTransports = LoopbackTransports;