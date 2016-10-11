Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _events;

function _load_events() {
  return _events = _interopRequireDefault(require('events'));
}

var WebSocketServer = (function () {
  function WebSocketServer() {
    _classCallCheck(this, WebSocketServer);

    this._webSocketServer = null;
    this._eventEmitter = new (_events || _load_events()).default();
  }

  // Promise only resolves when one WebSocket client connect to it.

  _createClass(WebSocketServer, [{
    key: 'start',
    value: function start(port) {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var server = new (_ws || _load_ws()).default.Server({ port: port });
        _this._webSocketServer = server;
        server.on('error', function (error) {
          reject(error);
        });
        server.once('connection', function (webSocket) {
          resolve(webSocket);
        });
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._webSocketServer != null) {
        this._webSocketServer.close();
      }
    }
  }]);

  return WebSocketServer;
})();

exports.WebSocketServer = WebSocketServer;