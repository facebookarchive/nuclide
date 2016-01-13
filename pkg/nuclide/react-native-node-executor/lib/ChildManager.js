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
        case 'executeJSCall':
          return this.executeJSCall(message);
        default:
          getLogger().error('Unknown method: ' + message.method + '.\nPayload: ' + message);
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
//# sourceMappingURL=data:application/json;base64,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SSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7O0FBRWhCLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDM0M7OztTQXJFa0IsWUFBWTs7O3FCQUFaLFlBQVk7O0FBd0VqQyxTQUFTLGlCQUFpQixDQUFDLEdBQUcsRUFBbUI7QUFDL0MsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdEMsc0JBQUssR0FBRyxDQUFDLEdBQUcsRUFBRSxVQUFBLEdBQUcsRUFBSTtBQUNuQixTQUFHLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3hCLFVBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNkLFNBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUEsS0FBSztlQUFJLElBQUksSUFBSSxLQUFLO09BQUEsQ0FBQyxDQUFDO0FBQ3ZDLFNBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFlBQU07QUFDbEIsZUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQ2YsQ0FBQyxDQUFDO0tBQ0osQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQSxHQUFHLEVBQUk7QUFDcEIsZUFBUyxFQUFFLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxDQUFDLENBQUM7QUFDekQsWUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2IsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoiQ2hpbGRNYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IGh0dHAgZnJvbSAnaHR0cCc7XG5pbXBvcnQgdXJsIGZyb20gJ3VybCc7XG5cbmltcG9ydCBDaGlsZCBmcm9tICcuL0NoaWxkJztcbmltcG9ydCB0eXBlIHtTZXJ2ZXJSZXBseUNhbGxiYWNrfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB0eXBlIHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5cbmxldCBsb2dnZXI7XG5mdW5jdGlvbiBnZXRMb2dnZXIoKSB7XG4gIGlmICghbG9nZ2VyKSB7XG4gICAgbG9nZ2VyID0gcmVxdWlyZSgnLi4vLi4vbG9nZ2luZycpLmdldExvZ2dlcigpO1xuICB9XG4gIHJldHVybiBsb2dnZXI7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENoaWxkTWFuYWdlciB7XG5cbiAgX2NoaWxkOiA/Q2hpbGQ7XG4gIF9vblJlcGx5OiBTZXJ2ZXJSZXBseUNhbGxiYWNrO1xuICBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuXG4gIGNvbnN0cnVjdG9yKG9uUmVwbHk6IFNlcnZlclJlcGx5Q2FsbGJhY2ssIGVtaXR0ZXI6IEV2ZW50RW1pdHRlcikge1xuICAgIHRoaXMuX29uUmVwbHkgPSBvblJlcGx5O1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBlbWl0dGVyO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlQ2hpbGQoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5raWxsQ2hpbGQoKTtcbiAgICB0aGlzLl9jaGlsZCA9IG5ldyBDaGlsZCh0aGlzLl9vblJlcGx5LCB0aGlzLl9lbWl0dGVyKTtcbiAgfVxuXG4gIGFzeW5jIGtpbGxDaGlsZCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuX2NoaWxkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGF3YWl0IHRoaXMuX2NoaWxkLmtpbGwoKTtcbiAgICB0aGlzLl9jaGlsZCA9IG51bGw7XG4gIH1cblxuICBoYW5kbGVNZXNzYWdlKG1lc3NhZ2U6IE9iamVjdCkge1xuICAgIGlmIChtZXNzYWdlLnJlcGx5SUQpIHtcbiAgICAgIC8vIGdldHRpbmcgY3Jvc3MtdGFsayBmcm9tIGFub3RoZXIgZXhlY3V0b3IgKHByb2JhYmx5IENocm9tZSlcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKG1lc3NhZ2UubWV0aG9kKSB7XG4gICAgICBjYXNlICdwcmVwYXJlSlNSdW50aW1lJzpcbiAgICAgICAgcmV0dXJuIHRoaXMucHJlcGFyZUpTUnVudGltZShtZXNzYWdlKTtcbiAgICAgIGNhc2UgJ2V4ZWN1dGVBcHBsaWNhdGlvblNjcmlwdCc6XG4gICAgICAgIHJldHVybiB0aGlzLmV4ZWN1dGVBcHBsaWNhdGlvblNjcmlwdChtZXNzYWdlKTtcbiAgICAgIGNhc2UgJ2V4ZWN1dGVKU0NhbGwnOlxuICAgICAgICByZXR1cm4gdGhpcy5leGVjdXRlSlNDYWxsKG1lc3NhZ2UpO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoYFVua25vd24gbWV0aG9kOiAke21lc3NhZ2UubWV0aG9kfS5cXG5QYXlsb2FkOiAke21lc3NhZ2V9YCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcHJlcGFyZUpTUnVudGltZShtZXNzYWdlOiBPYmplY3QpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLmNyZWF0ZUNoaWxkKCk7XG4gICAgdGhpcy5fb25SZXBseShtZXNzYWdlLmlkKTtcbiAgfVxuXG4gIGFzeW5jIGV4ZWN1dGVBcHBsaWNhdGlvblNjcmlwdChtZXNzYWdlOiBPYmplY3QpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuX2NoaWxkKSB7XG4gICAgICAvLyBXYXJuIENoaWxkIG5vdCBpbml0aWFsaXplZDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGFyc2VkVXJsID0gdXJsLnBhcnNlKG1lc3NhZ2UudXJsLCAvKiBwYXJzZVF1ZXJ5U3RyaW5nICovIHRydWUpO1xuICAgIGludmFyaWFudChwYXJzZWRVcmwucXVlcnkpO1xuICAgIHBhcnNlZFVybC5xdWVyeS5pbmxpbmVTb3VyY2VNYXAgPSB0cnVlO1xuICAgIGRlbGV0ZSBwYXJzZWRVcmwuc2VhcmNoO1xuICAgIC8vICRGbG93SXNzdWUgdXJsLmZvcm1hdCgpIGRvZXMgbm90IGFjY2VwdCB3aGF0IHVybC5wYXJzZSgpIHJldHVybnMuXG4gICAgY29uc3Qgc2NyaXB0VXJsID0gdXJsLmZvcm1hdChwYXJzZWRVcmwpO1xuICAgIGNvbnN0IHNjcmlwdCA9IGF3YWl0IGdldFNjcmlwdENvbnRlbnRzKHNjcmlwdFVybCk7XG4gICAgaW52YXJpYW50KHRoaXMuX2NoaWxkKTtcbiAgICB0aGlzLl9jaGlsZC5leGVjU2NyaXB0KHNjcmlwdCwgbWVzc2FnZS5pbmplY3QsIG1lc3NhZ2UuaWQpO1xuICB9XG5cbiAgZXhlY3V0ZUpTQ2FsbChtZXNzYWdlOiBPYmplY3QpIHtcbiAgICBpZiAoIXRoaXMuX2NoaWxkKSB7XG4gICAgICAvLyBXYXJuIENoaWxkIG5vdCBpbml0aWFsaXplZDtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fY2hpbGQuZXhlY0NhbGwobWVzc2FnZSwgbWVzc2FnZS5pZCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0U2NyaXB0Q29udGVudHMoc3JjKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBodHRwLmdldChzcmMsIHJlcyA9PiB7XG4gICAgICByZXMuc2V0RW5jb2RpbmcoJ3V0ZjgnKTtcbiAgICAgIGxldCBidWZmID0gJyc7XG4gICAgICByZXMub24oJ2RhdGEnLCBjaHVuayA9PiBidWZmICs9IGNodW5rKTtcbiAgICAgIHJlcy5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICByZXNvbHZlKGJ1ZmYpO1xuICAgICAgfSk7XG4gICAgfSkub24oJ2Vycm9yJywgZXJyID0+IHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKCdGYWlsZWQgdG8gZ2V0IHNjcmlwdCBmcm9tIHBhY2thZ2VyLicpO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfSk7XG4gIH0pO1xufVxuIl19