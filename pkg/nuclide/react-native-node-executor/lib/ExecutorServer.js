Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _ws = require('ws');

var _events = require('events');

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _ChildManager = require('./ChildManager');

var _ChildManager2 = _interopRequireDefault(_ChildManager);

var REACT_NATIVE_LAUNCH_DEVTOOLS_URL = '/launch-chrome-devtools';
var REACT_NATIVE_DEBUGGER_PROXY_URL = '/debugger-proxy';

var ExecutorServer = (function () {
  function ExecutorServer(port) {
    _classCallCheck(this, ExecutorServer);

    this._initWebServer(port);
    this._initWebSocketServer();
    this._children = new Set();
    this._emitter = new _events.EventEmitter();
  }

  _createClass(ExecutorServer, [{
    key: 'onDidEvalApplicationScript',
    value: function onDidEvalApplicationScript(callback) {
      this._emitter.on('eval_application_script', callback);
    }
  }, {
    key: '_initWebServer',
    value: function _initWebServer(port) {
      this._webServer = _http2['default'].createServer(function (req, res) {
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

      this._webSocketServer = new _ws.Server({
        server: this._webServer,
        path: REACT_NATIVE_DEBUGGER_PROXY_URL
      });
      this._webSocketServer.on('connection', function (ws) {
        var onReply = function onReply(replyID, result) {
          ws.send(JSON.stringify({ replyID: replyID, result: result }));
        };
        var childManager = new _ChildManager2['default'](onReply, _this._emitter);
        _this._children.add(childManager);

        var cleanup = function cleanup() {
          if (childManager) {
            childManager.killChild();
            _this._children['delete'](childManager);
            childManager = null;
            onReply = null;
          }
        };

        ws.on('message', function (message) {
          var messageObj = JSON.parse(message);
          if (messageObj.$close) {
            return cleanup();
          }

          (0, _assert2['default'])(childManager);
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

exports['default'] = ExecutorServer;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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O0tBQ0o7OztXQUVJLGlCQUFHO0FBQ04sV0FBSyxJQUFNLEVBQUUsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO0FBQy9CLFVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztPQUNoQjtBQUNELFVBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUM5QixVQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ3pCOzs7U0F0RWtCLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6IkV4ZWN1dG9yU2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtTZXJ2ZXIgYXMgV2ViU29ja2V0U2VydmVyfSBmcm9tICd3cyc7XG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCBodHRwIGZyb20gJ2h0dHAnO1xuaW1wb3J0IENoaWxkTWFuYWdlciBmcm9tICcuL0NoaWxkTWFuYWdlcic7XG5cbmNvbnN0IFJFQUNUX05BVElWRV9MQVVOQ0hfREVWVE9PTFNfVVJMID0gJy9sYXVuY2gtY2hyb21lLWRldnRvb2xzJztcbmNvbnN0IFJFQUNUX05BVElWRV9ERUJVR0dFUl9QUk9YWV9VUkwgPSAnL2RlYnVnZ2VyLXByb3h5JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXhlY3V0b3JTZXJ2ZXIge1xuXG4gIF9jaGlsZHJlbjogU2V0PENoaWxkTWFuYWdlcj47XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF93ZWJTZXJ2ZXI6IGh0dHAuU2VydmVyO1xuICBfd2ViU29ja2V0U2VydmVyOiBXZWJTb2NrZXRTZXJ2ZXI7XG5cbiAgY29uc3RydWN0b3IocG9ydDogbnVtYmVyKSB7XG4gICAgdGhpcy5faW5pdFdlYlNlcnZlcihwb3J0KTtcbiAgICB0aGlzLl9pbml0V2ViU29ja2V0U2VydmVyKCk7XG4gICAgdGhpcy5fY2hpbGRyZW4gPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgfVxuXG4gIG9uRGlkRXZhbEFwcGxpY2F0aW9uU2NyaXB0KGNhbGxiYWNrOiAocGlkOiBudW1iZXIpID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+KSB7XG4gICAgdGhpcy5fZW1pdHRlci5vbignZXZhbF9hcHBsaWNhdGlvbl9zY3JpcHQnLCBjYWxsYmFjayk7XG4gIH1cblxuICBfaW5pdFdlYlNlcnZlcihwb3J0OiBudW1iZXIpIHtcbiAgICB0aGlzLl93ZWJTZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcigocmVxLCByZXMpID0+IHtcbiAgICAgIGlmIChyZXEudXJsID09PSBSRUFDVF9OQVRJVkVfTEFVTkNIX0RFVlRPT0xTX1VSTCkge1xuICAgICAgICByZXMuZW5kKCdPSycpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX3dlYlNlcnZlci5saXN0ZW4ocG9ydCk7XG4gIH1cblxuICBfaW5pdFdlYlNvY2tldFNlcnZlcigpIHtcbiAgICB0aGlzLl93ZWJTb2NrZXRTZXJ2ZXIgPSBuZXcgV2ViU29ja2V0U2VydmVyKHtcbiAgICAgIHNlcnZlcjogdGhpcy5fd2ViU2VydmVyLFxuICAgICAgcGF0aDogUkVBQ1RfTkFUSVZFX0RFQlVHR0VSX1BST1hZX1VSTCxcbiAgICB9KTtcbiAgICB0aGlzLl93ZWJTb2NrZXRTZXJ2ZXIub24oJ2Nvbm5lY3Rpb24nLCB3cyA9PiB7XG4gICAgICBsZXQgb25SZXBseSA9IChyZXBseUlELCByZXN1bHQpID0+IHtcbiAgICAgICAgd3Muc2VuZChKU09OLnN0cmluZ2lmeSh7cmVwbHlJRCwgcmVzdWx0fSkpO1xuICAgICAgfTtcbiAgICAgIGxldCBjaGlsZE1hbmFnZXIgPSBuZXcgQ2hpbGRNYW5hZ2VyKG9uUmVwbHksIHRoaXMuX2VtaXR0ZXIpO1xuICAgICAgdGhpcy5fY2hpbGRyZW4uYWRkKGNoaWxkTWFuYWdlcik7XG5cbiAgICAgIGNvbnN0IGNsZWFudXAgPSAoKSA9PiB7XG4gICAgICAgIGlmIChjaGlsZE1hbmFnZXIpIHtcbiAgICAgICAgICBjaGlsZE1hbmFnZXIua2lsbENoaWxkKCk7XG4gICAgICAgICAgdGhpcy5fY2hpbGRyZW4uZGVsZXRlKGNoaWxkTWFuYWdlcik7XG4gICAgICAgICAgY2hpbGRNYW5hZ2VyID0gbnVsbDtcbiAgICAgICAgICBvblJlcGx5ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgd3Mub24oJ21lc3NhZ2UnLCBtZXNzYWdlID0+IHtcbiAgICAgICAgY29uc3QgbWVzc2FnZU9iaiA9IEpTT04ucGFyc2UobWVzc2FnZSk7XG4gICAgICAgIGlmIChtZXNzYWdlT2JqLiRjbG9zZSkge1xuICAgICAgICAgIHJldHVybiBjbGVhbnVwKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpbnZhcmlhbnQoY2hpbGRNYW5hZ2VyKTtcbiAgICAgICAgY2hpbGRNYW5hZ2VyLmhhbmRsZU1lc3NhZ2UobWVzc2FnZU9iaik7XG4gICAgICB9KTtcblxuICAgICAgd3Mub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgICBjbGVhbnVwKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIGZvciAoY29uc3QgY20gb2YgdGhpcy5fY2hpbGRyZW4pIHtcbiAgICAgIGNtLmtpbGxDaGlsZCgpO1xuICAgIH1cbiAgICB0aGlzLl93ZWJTb2NrZXRTZXJ2ZXIuY2xvc2UoKTtcbiAgICB0aGlzLl93ZWJTZXJ2ZXIuY2xvc2UoKTtcbiAgfVxufVxuIl19