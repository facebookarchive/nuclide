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

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _ws2;

function _ws() {
  return _ws2 = _interopRequireDefault(require('ws'));
}

var _events2;

function _events() {
  return _events2 = require('events');
}

var _http2;

function _http() {
  return _http2 = _interopRequireDefault(require('http'));
}

var _ChildManager2;

function _ChildManager() {
  return _ChildManager2 = _interopRequireDefault(require('./ChildManager'));
}

var REACT_NATIVE_LAUNCH_DEVTOOLS_URL = '/launch-chrome-devtools';
var REACT_NATIVE_DEBUGGER_PROXY_URL = '/debugger-proxy';

var ExecutorServer = (function () {
  function ExecutorServer(port) {
    _classCallCheck(this, ExecutorServer);

    this._initWebServer(port);
    this._initWebSocketServer();
    this._children = new Set();
    this._emitter = new (_events2 || _events()).EventEmitter();
  }

  _createClass(ExecutorServer, [{
    key: 'onDidEvalApplicationScript',
    value: function onDidEvalApplicationScript(callback) {
      this._emitter.on('eval_application_script', callback);
    }
  }, {
    key: '_initWebServer',
    value: function _initWebServer(port) {
      this._webServer = (_http2 || _http()).default.createServer(function (req, res) {
        if (req.url === REACT_NATIVE_LAUNCH_DEVTOOLS_URL) {
          res.end('OK');
        }
      });
      this._webServer.listen(port);
    }
  }, {
    key: '_initWebSocketServer',
    value: function _initWebSocketServer() {
      var _this = this;

      this._webSocketServer = new (_ws2 || _ws()).default.Server({
        server: this._webServer,
        path: REACT_NATIVE_DEBUGGER_PROXY_URL
      });
      this._webSocketServer.on('connection', function (ws) {
        var onReply = function onReply(replyID, result) {
          ws.send(JSON.stringify({ replyID: replyID, result: result }));
        };
        var childManager = new (_ChildManager2 || _ChildManager()).default(onReply, _this._emitter);
        _this._children.add(childManager);

        var cleanup = function cleanup() {
          if (childManager) {
            childManager.killChild();
            _this._children.delete(childManager);
            childManager = null;
            onReply = null;
          }
        };

        ws.on('message', function (message) {
          var messageObj = JSON.parse(message);
          if (messageObj.$close) {
            return cleanup();
          }

          (0, (_assert2 || _assert()).default)(childManager);
          childManager.handleMessage(messageObj);
        });

        ws.on('close', function () {
          cleanup();
        });
      });
    }
  }, {
    key: 'close',
    value: function close() {
      for (var cm of this._children) {
        cm.killChild();
      }
      this._webSocketServer.close();
      this._webServer.close();
    }
  }]);

  return ExecutorServer;
})();

exports.default = ExecutorServer;
module.exports = exports.default;