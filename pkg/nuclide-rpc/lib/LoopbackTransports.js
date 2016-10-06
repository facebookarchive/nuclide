Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = require('rxjs/bundles/Rx.min.js');
}

var LoopbackTransports = function LoopbackTransports() {
  _classCallCheck(this, LoopbackTransports);

  var serverMessages = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Subject();
  var clientMessages = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).Subject();

  this.serverTransport = {
    _isClosed: false,
    send: function send(message) {
      clientMessages.next(message);
    },
    onMessage: function onMessage() {
      return serverMessages;
    },
    close: function close() {
      this._isClosed = true;
    },
    isClosed: function isClosed() {
      return this._isClosed;
    }
  };

  this.clientTransport = {
    _isClosed: false,
    send: function send(message) {
      serverMessages.next(message);
    },
    onMessage: function onMessage() {
      return clientMessages;
    },
    close: function close() {
      this._isClosed = true;
    },
    isClosed: function isClosed() {
      return this._isClosed;
    }
  };
};

exports.LoopbackTransports = LoopbackTransports;