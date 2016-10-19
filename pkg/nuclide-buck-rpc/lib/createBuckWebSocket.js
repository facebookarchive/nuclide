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

exports.default = createBuckWebSocket;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

function createBuckWebSocket(httpPort) {
  return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.create(function (observer) {
    var uri = 'ws://localhost:' + httpPort + '/ws/build';
    var socket = new (_ws || _load_ws()).default(uri);
    var buildId = null;

    socket.on('open', function () {
      // Emit a message so the client knows the socket is ready for Buck events.
      observer.next({ type: 'SocketConnected' });
    });

    socket.on('message', function (data) {
      var message = undefined;
      try {
        message = JSON.parse(data);
      } catch (err) {
        (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Error parsing Buck websocket message', err);
        return;
      }

      var type = message.type;
      if (buildId === null) {
        if (type === 'BuildStarted') {
          buildId = message.buildId;
        } else {
          return;
        }
      }

      if (buildId !== message.buildId) {
        return;
      }

      observer.next(message);
    });

    socket.on('error', function (e) {
      observer.error(e);
    });

    socket.on('close', function () {
      observer.complete();
    });

    return function () {
      socket.removeAllListeners();
      socket.close();
    };
  });
}

module.exports = exports.default;