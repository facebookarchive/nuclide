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

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _ws2;

function _ws() {
  return _ws2 = _interopRequireDefault(require('ws'));
}

function createBuckWebSocket(buckProject, httpPort) {
  return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.create(function (observer) {
    var uri = 'ws://localhost:' + httpPort + '/ws/build';
    var socket = new (_ws2 || _ws()).default(uri);
    var buildId = null;

    socket.on('message', function (data) {
      var message = undefined;
      try {
        message = JSON.parse(data);
      } catch (err) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('Error parsing Buck websocket message', err);
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