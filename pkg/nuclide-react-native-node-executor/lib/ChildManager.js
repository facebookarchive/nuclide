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
    logger = require('../../nuclide-logging').getLogger();
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
    key: '_createChild',
    value: function _createChild() {
      if (this._child == null) {
        this._child = new _Child2['default'](this._onReply, this._emitter);
      }
    }
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
      this._createChild();
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
      this._child.executeApplicationScript(script, message.inject, message.id);
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
//# sourceMappingURL=data:application/json;base64,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TyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUMzQzs7O1NBcEVrQixZQUFZOzs7cUJBQVosWUFBWTs7QUF1RWpDLFNBQVMsaUJBQWlCLENBQUMsR0FBRyxFQUFtQjtBQUMvQyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUN0QyxzQkFBSyxHQUFHLENBQUMsR0FBRyxFQUFFLFVBQUEsR0FBRyxFQUFJO0FBQ25CLFNBQUcsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDeEIsVUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2QsU0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQSxLQUFLO2VBQUksSUFBSSxJQUFJLEtBQUs7T0FBQSxDQUFDLENBQUM7QUFDdkMsU0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsWUFBTTtBQUNsQixlQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDZixDQUFDLENBQUM7S0FDSixDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFBLEdBQUcsRUFBSTtBQUNwQixlQUFTLEVBQUUsQ0FBQyxLQUFLLENBQUMscUNBQXFDLENBQUMsQ0FBQztBQUN6RCxZQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDYixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJDaGlsZE1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgaHR0cCBmcm9tICdodHRwJztcbmltcG9ydCB1cmwgZnJvbSAndXJsJztcblxuaW1wb3J0IENoaWxkIGZyb20gJy4vQ2hpbGQnO1xuaW1wb3J0IHR5cGUge1NlcnZlclJlcGx5Q2FsbGJhY2t9IGZyb20gJy4vdHlwZXMnO1xuaW1wb3J0IHR5cGUge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcblxubGV0IGxvZ2dlcjtcbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgaWYgKCFsb2dnZXIpIHtcbiAgICBsb2dnZXIgPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnKS5nZXRMb2dnZXIoKTtcbiAgfVxuICByZXR1cm4gbG9nZ2VyO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDaGlsZE1hbmFnZXIge1xuXG4gIF9jaGlsZDogP0NoaWxkO1xuICBfb25SZXBseTogU2VydmVyUmVwbHlDYWxsYmFjaztcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcblxuICBjb25zdHJ1Y3RvcihvblJlcGx5OiBTZXJ2ZXJSZXBseUNhbGxiYWNrLCBlbWl0dGVyOiBFdmVudEVtaXR0ZXIpIHtcbiAgICB0aGlzLl9vblJlcGx5ID0gb25SZXBseTtcbiAgICB0aGlzLl9lbWl0dGVyID0gZW1pdHRlcjtcbiAgfVxuXG4gIF9jcmVhdGVDaGlsZCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fY2hpbGQgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fY2hpbGQgPSBuZXcgQ2hpbGQodGhpcy5fb25SZXBseSwgdGhpcy5fZW1pdHRlcik7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMga2lsbENoaWxkKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5fY2hpbGQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy5fY2hpbGQua2lsbCgpO1xuICAgIHRoaXMuX2NoaWxkID0gbnVsbDtcbiAgfVxuXG4gIGhhbmRsZU1lc3NhZ2UobWVzc2FnZTogT2JqZWN0KSB7XG4gICAgaWYgKG1lc3NhZ2UucmVwbHlJRCkge1xuICAgICAgLy8gZ2V0dGluZyBjcm9zcy10YWxrIGZyb20gYW5vdGhlciBleGVjdXRvciAocHJvYmFibHkgQ2hyb21lKVxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN3aXRjaCAobWVzc2FnZS5tZXRob2QpIHtcbiAgICAgIGNhc2UgJ3ByZXBhcmVKU1J1bnRpbWUnOlxuICAgICAgICByZXR1cm4gdGhpcy5wcmVwYXJlSlNSdW50aW1lKG1lc3NhZ2UpO1xuICAgICAgY2FzZSAnZXhlY3V0ZUFwcGxpY2F0aW9uU2NyaXB0JzpcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZUFwcGxpY2F0aW9uU2NyaXB0KG1lc3NhZ2UpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHRoaXMuZXhlY3V0ZUpTQ2FsbChtZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBwcmVwYXJlSlNSdW50aW1lKG1lc3NhZ2U6IE9iamVjdCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuX2NyZWF0ZUNoaWxkKCk7XG4gICAgdGhpcy5fb25SZXBseShtZXNzYWdlLmlkKTtcbiAgfVxuXG4gIGFzeW5jIGV4ZWN1dGVBcHBsaWNhdGlvblNjcmlwdChtZXNzYWdlOiBPYmplY3QpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuX2NoaWxkKSB7XG4gICAgICAvLyBXYXJuIENoaWxkIG5vdCBpbml0aWFsaXplZDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGFyc2VkVXJsID0gdXJsLnBhcnNlKG1lc3NhZ2UudXJsLCAvKiBwYXJzZVF1ZXJ5U3RyaW5nICovIHRydWUpO1xuICAgIGludmFyaWFudChwYXJzZWRVcmwucXVlcnkpO1xuICAgIHBhcnNlZFVybC5xdWVyeS5pbmxpbmVTb3VyY2VNYXAgPSB0cnVlO1xuICAgIGRlbGV0ZSBwYXJzZWRVcmwuc2VhcmNoO1xuICAgIC8vICRGbG93SXNzdWUgdXJsLmZvcm1hdCgpIGRvZXMgbm90IGFjY2VwdCB3aGF0IHVybC5wYXJzZSgpIHJldHVybnMuXG4gICAgY29uc3Qgc2NyaXB0VXJsID0gdXJsLmZvcm1hdChwYXJzZWRVcmwpO1xuICAgIGNvbnN0IHNjcmlwdCA9IGF3YWl0IGdldFNjcmlwdENvbnRlbnRzKHNjcmlwdFVybCk7XG4gICAgaW52YXJpYW50KHRoaXMuX2NoaWxkKTtcbiAgICB0aGlzLl9jaGlsZC5leGVjdXRlQXBwbGljYXRpb25TY3JpcHQoc2NyaXB0LCBtZXNzYWdlLmluamVjdCwgbWVzc2FnZS5pZCk7XG4gIH1cblxuICBleGVjdXRlSlNDYWxsKG1lc3NhZ2U6IE9iamVjdCkge1xuICAgIGlmICghdGhpcy5fY2hpbGQpIHtcbiAgICAgIC8vIFdhcm4gQ2hpbGQgbm90IGluaXRpYWxpemVkO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9jaGlsZC5leGVjQ2FsbChtZXNzYWdlLCBtZXNzYWdlLmlkKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBnZXRTY3JpcHRDb250ZW50cyhzcmMpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGh0dHAuZ2V0KHNyYywgcmVzID0+IHtcbiAgICAgIHJlcy5zZXRFbmNvZGluZygndXRmOCcpO1xuICAgICAgbGV0IGJ1ZmYgPSAnJztcbiAgICAgIHJlcy5vbignZGF0YScsIGNodW5rID0+IGJ1ZmYgKz0gY2h1bmspO1xuICAgICAgcmVzLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgIHJlc29sdmUoYnVmZik7XG4gICAgICB9KTtcbiAgICB9KS5vbignZXJyb3InLCBlcnIgPT4ge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoJ0ZhaWxlZCB0byBnZXQgc2NyaXB0IGZyb20gcGFja2FnZXIuJyk7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9KTtcbiAgfSk7XG59XG4iXX0=