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

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var LoopbackTransports = function LoopbackTransports() {
  _classCallCheck(this, LoopbackTransports);

  var serverMessages = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subject();
  var clientMessages = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subject();

  this.serverTransport = {
    send: function send(message) {
      clientMessages.next(message);
    },
    onMessage: function onMessage() {
      return serverMessages;
    },
    close: function close() {}
  };

  this.clientTransport = {
    send: function send(message) {
      serverMessages.next(message);
    },
    onMessage: function onMessage() {
      return clientMessages;
    },
    close: function close() {}
  };
};

exports.LoopbackTransports = LoopbackTransports;