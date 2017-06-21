'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LoopbackTransports = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

class LoopbackTransports {

  constructor() {
    const serverMessages = new _rxjsBundlesRxMinJs.Subject();
    const clientMessages = new _rxjsBundlesRxMinJs.Subject();

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
exports.LoopbackTransports = LoopbackTransports; /**
                                                  * Copyright (c) 2015-present, Facebook, Inc.
                                                  * All rights reserved.
                                                  *
                                                  * This source code is licensed under the license found in the LICENSE file in
                                                  * the root directory of this source tree.
                                                  *
                                                  * 
                                                  * @format
                                                  */