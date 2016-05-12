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

var LoopbackTransports = function LoopbackTransports() {
  _classCallCheck(this, LoopbackTransports);

  var onServerMessage = undefined;
  var onClientMessage = undefined;

  this.serverTransport = {
    send: function send(data) {
      onClientMessage(data);
    },
    onMessage: function onMessage(callback) {
      onServerMessage = callback;
      return { dispose: function dispose() {} };
    },
    close: function close() {}
  };

  this.clientTransport = {
    send: function send(data) {
      onServerMessage(data);
    },
    onMessage: function onMessage(callback) {
      onClientMessage = callback;
      return { dispose: function dispose() {} };
    },
    close: function close() {}
  };
};

exports.LoopbackTransports = LoopbackTransports;