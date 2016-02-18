Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

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

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _Child = require('./Child');

var _Child2 = _interopRequireDefault(_Child);

var logger = undefined;
function getLogger() {
  if (!logger) {
    logger = require('../../logging').getLogger();
  }
  return logger;
}

var ChildManager = (function () {
  function ChildManager(onReply, emitter) {
    _classCallCheck(this, ChildManager);

    this._onReply = onReply;
    this._emitter = emitter;
  }

  _createClass(ChildManager, [{
    key: 'createChild',
    value: _asyncToGenerator(function* () {
      yield this.killChild();
      this._child = new _Child2['default'](this._onReply, this._emitter);
    })
  }, {
    key: 'killChild',
    value: _asyncToGenerator(function* () {
      if (!this._child) {
        return;
      }
      yield this._child.kill();
      this._child = null;
    })
  }, {
    key: 'handleMessage',
    value: function handleMessage(message) {
      if (message.replyID) {
        // getting cross-talk from another executor (probably Chrome)
        return;
      }

      switch (message.method) {
        case 'prepareJSRuntime':
          return this.prepareJSRuntime(message);
        case 'executeApplicationScript':
          return this.executeApplicationScript(message);
        default:
          return this.executeJSCall(message);
      }
    }
  }, {
    key: 'prepareJSRuntime',
    value: _asyncToGenerator(function* (message) {
      yield this.createChild();
      this._onReply(message.id);
    })
  }, {
    key: 'executeApplicationScript',
    value: _asyncToGenerator(function* (message) {
      if (!this._child) {
        // Warn Child not initialized;
        return;
      }
      var parsedUrl = _url2['default'].parse(message.url, /* parseQueryString */true);
      (0, _assert2['default'])(parsedUrl.query);
      parsedUrl.query.inlineSourceMap = true;
      delete parsedUrl.search;
      // $FlowIssue url.format() does not accept what url.parse() returns.
      var scriptUrl = _url2['default'].format(parsedUrl);
      var script = yield getScriptContents(scriptUrl);
      (0, _assert2['default'])(this._child);
      this._child.execScript(script, message.inject, message.id);
    })
  }, {
    key: 'executeJSCall',
    value: function executeJSCall(message) {
      if (!this._child) {
        // Warn Child not initialized;
        return;
      }
      this._child.execCall(message, message.id);
    }
  }]);

  return ChildManager;
})();

exports['default'] = ChildManager;

function getScriptContents(src) {
  return new Promise(function (resolve, reject) {
    _http2['default'].get(src, function (res) {
      res.setEncoding('utf8');
      var buff = '';
      res.on('data', function (chunk) {
        return buff += chunk;
      });
      res.on('end', function () {
        resolve(buff);
      });
    }).on('error', function (err) {
      getLogger().error('Failed to get script from packager.');
      reject(err);
    });
  });
}
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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QU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUMzQzs7O1NBbkVrQixZQUFZOzs7cUJBQVosWUFBWTs7QUFzRWpDLFNBQVMsaUJBQWlCLENBQUMsR0FBRyxFQUFtQjtBQUMvQyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxzQkFBSyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQUEsR0FBRyxFQUFJO0FBQ25CLFNBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEIsVUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2QsU0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQSxLQUFLO2VBQUksSUFBSSxJQUFJLEtBQUs7T0FBQSxDQUFDLENBQUM7QUFDdkMsU0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsWUFBTTtBQUNsQixlQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDZixDQUFDLENBQUM7S0FDSixDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFBLEdBQUcsRUFBSTtBQUNwQixlQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztBQUN6RCxZQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDYixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJDaGlsZE1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCB1cmwgZnJvbSAndXJsJztcblxuaW1wb3J0IENoaWxkIGZyb20gJy4vQ2hpbGQnO1xuaW1wb3J0IHR5cGUge1NlcnZlclJlcGx5Q2FsbGJhY2t9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcblxubGV0IGxvZ2dlcjtcbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgaWYgKCFsb2dnZXIpIHtcbiAgICBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9sb2dnaW5nJykuZ2V0TG9nZ2VyKCk7XG4gIH1cbiAgcmV0dXJuIGxvZ2dlcjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hpbGRNYW5hZ2VyIHtcblxuICBfY2hpbGQ6ID9DaGlsZDtcbiAgX29uUmVwbHk6IFNlcnZlclJlcGx5Q2FsbGJhY2s7XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG5cbiAgY29uc3RydWN0b3Iob25SZXBseTogU2VydmVyUmVwbHlDYWxsYmFjaywgZW1pdHRlcjogRXZlbnRFbWl0dGVyKSB7XG4gICAgdGhpcy5fb25SZXBseSA9IG9uUmVwbHk7XG4gICAgdGhpcy5fZW1pdHRlciA9IGVtaXR0ZXI7XG4gIH1cblxuICBhc3luYyBjcmVhdGVDaGlsZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmtpbGxDaGlsZCgpO1xuICAgIHRoaXMuX2NoaWxkID0gbmV3IENoaWxkKHRoaXMuX29uUmVwbHksIHRoaXMuX2VtaXR0ZXIpO1xuICB9XG5cbiAgYXN5bmMga2lsbENoaWxkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5fY2hpbGQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5fY2hpbGQua2lsbCgpO1xuICAgIHRoaXMuX2NoaWxkID0gbnVsbDtcbiAgfVxuXG4gIGhhbmRsZU1lc3NhZ2UobWVzc2FnZTogT2JqZWN0KSB7XG4gICAgaWYgKG1lc3NhZ2UucmVwbHlJRCkge1xuICAgICAgLy8gZ2V0dGluZyBjcm9zcy10YWxrIGZyb20gYW5vdGhlciBleGVjdXRvciAocHJvYmFibHkgQ2hyb21lKVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN3aXRjaCAobWVzc2FnZS5tZXRob2QpIHtcbiAgICAgIGNhc2UgJ3ByZXBhcmVKU1J1bnRpbWUnOlxuICAgICAgICByZXR1cm4gdGhpcy5wcmVwYXJlSlNSdW50aW1lKG1lc3NhZ2UpO1xuICAgICAgY2FzZSAnZXhlY3V0ZUFwcGxpY2F0aW9uU2NyaXB0JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZUFwcGxpY2F0aW9uU2NyaXB0KG1lc3NhZ2UpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZUpTQ2FsbChtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBwcmVwYXJlSlNSdW50aW1lKG1lc3NhZ2U6IE9iamVjdCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuY3JlYXRlQ2hpbGQoKTtcbiAgICB0aGlzLl9vblJlcGx5KG1lc3NhZ2UuaWQpO1xuICB9XG5cbiAgYXN5bmMgZXhlY3V0ZUFwcGxpY2F0aW9uU2NyaXB0KG1lc3NhZ2U6IE9iamVjdCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5fY2hpbGQpIHtcbiAgICAgIC8vIFdhcm4gQ2hpbGQgbm90IGluaXRpYWxpemVkO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXJzZWRVcmwgPSB1cmwucGFyc2UobWVzc2FnZS51cmwsIC8qIHBhcnNlUXVlcnlTdHJpbmcgKi8gdHJ1ZSk7XG4gICAgaW52YXJpYW50KHBhcnNlZFVybC5xdWVyeSk7XG4gICAgcGFyc2VkVXJsLnF1ZXJ5LmlubGluZVNvdXJjZU1hcCA9IHRydWU7XG4gICAgZGVsZXRlIHBhcnNlZFVybC5zZWFyY2g7XG4gICAgLy8gJEZsb3dJc3N1ZSB1cmwuZm9ybWF0KCkgZG9lcyBub3QgYWNjZXB0IHdoYXQgdXJsLnBhcnNlKCkgcmV0dXJucy5cbiAgICBjb25zdCBzY3JpcHRVcmwgPSB1cmwuZm9ybWF0KHBhcnNlZFVybCk7XG4gICAgY29uc3Qgc2NyaXB0ID0gYXdhaXQgZ2V0U2NyaXB0Q29udGVudHMoc2NyaXB0VXJsKTtcbiAgICBpbnZhcmlhbnQodGhpcy5fY2hpbGQpO1xuICAgIHRoaXMuX2NoaWxkLmV4ZWNTY3JpcHQoc2NyaXB0LCBtZXNzYWdlLmluamVjdCwgbWVzc2FnZS5pZCk7XG4gIH1cblxuICBleGVjdXRlSlNDYWxsKG1lc3NhZ2U6IE9iamVjdCkge1xuICAgIGlmICghdGhpcy5fY2hpbGQpIHtcbiAgICAgIC8vIFdhcm4gQ2hpbGQgbm90IGluaXRpYWxpemVkO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9jaGlsZC5leGVjQ2FsbChtZXNzYWdlLCBtZXNzYWdlLmlkKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRTY3JpcHRDb250ZW50cyhzcmMpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGh0dHAuZ2V0KHNyYywgcmVzID0+IHtcbiAgICAgIHJlcy5zZXRFbmNvZGluZygndXRmOCcpO1xuICAgICAgbGV0IGJ1ZmYgPSAnJztcbiAgICAgIHJlcy5vbignZGF0YScsIGNodW5rID0+IGJ1ZmYgKz0gY2h1bmspO1xuICAgICAgcmVzLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgIHJlc29sdmUoYnVmZik7XG4gICAgICB9KTtcbiAgICB9KS5vbignZXJyb3InLCBlcnIgPT4ge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoJ0ZhaWxlZCB0byBnZXQgc2NyaXB0IGZyb20gcGFja2FnZXIuJyk7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9KTtcbiAgfSk7XG59XG4iXX0=