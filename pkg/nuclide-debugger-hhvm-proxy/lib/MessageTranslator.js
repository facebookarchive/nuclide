Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

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

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _ClientCallback = require('./ClientCallback');

/**
 * Translates Chrome dev tools JSON messages to/from dbgp.
 * TODO: Should we proactively push files to the debugger?
 * Currently we reactively push files to the debuger when they appear in a stack trace.
 */

var _require = require('./DebuggerHandler');

var DebuggerHandler = _require.DebuggerHandler;

var PageHandler = require('./PageHandler');
var ConsoleHandler = require('./ConsoleHandler');

var _require2 = require('./RuntimeHandler');

var RuntimeHandler = _require2.RuntimeHandler;

var _require3 = require('./ConnectionMultiplexer');

var ConnectionMultiplexer = _require3.ConnectionMultiplexer;

var MessageTranslator = (function () {
  function MessageTranslator(clientCallback) {
    _classCallCheck(this, MessageTranslator);

    this._isDisposed = false;
    this._connectionMultiplexer = new ConnectionMultiplexer(clientCallback);
    this._handlers = new Map();
    this._clientCallback = clientCallback;
    this._debuggerHandler = new DebuggerHandler(clientCallback, this._connectionMultiplexer);
    this._addHandler(this._debuggerHandler);
    this._addHandler(new PageHandler(clientCallback));
    this._addHandler(new ConsoleHandler(clientCallback));
    this._addHandler(new RuntimeHandler(clientCallback, this._connectionMultiplexer));
  }

  _createClass(MessageTranslator, [{
    key: '_addHandler',
    value: function _addHandler(handler) {
      this._handlers.set(handler.getDomain(), handler);
    }
  }, {
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      _utils2['default'].log('onSessionEnd');
      this._debuggerHandler.onSessionEnd(callback);
    }
  }, {
    key: 'handleCommand',
    value: _asyncToGenerator(function* (command) {
      _utils2['default'].log('handleCommand: ' + command);

      var _JSON$parse = JSON.parse(command);

      var id = _JSON$parse.id;
      var method = _JSON$parse.method;
      var params = _JSON$parse.params;

      if (!method || typeof method !== 'string') {
        this._replyWithError(id, 'Missing method: ' + command);
        return;
      }
      var methodParts = method.split('.');
      if (methodParts.length !== 2) {
        this._replyWithError(id, 'Badly formatted method: ' + command);
        return;
      }

      var _methodParts = _slicedToArray(methodParts, 2);

      var domain = _methodParts[0];
      var methodName = _methodParts[1];

      if (!this._handlers.has(domain)) {
        this._replyWithError(id, 'Unknown domain: ' + command);
        return;
      }

      try {
        var handler = this._handlers.get(domain);
        (0, _assert2['default'])(handler != null);
        yield handler.handleMethod(id, methodName, params);
      } catch (e) {
        _utils2['default'].logError('Exception handling command ' + id + ': ' + e + ' ' + e.stack);
        this._replyWithError(id, 'Error handling command: ' + e + '\n ' + e.stack);
      }
    })
  }, {
    key: '_replyWithError',
    value: function _replyWithError(id, error) {
      _utils2['default'].log(error);
      this._clientCallback.replyWithError(id, error);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (!this._isDisposed) {
        this._isDisposed = true;
        this._connectionMultiplexer.dispose();
      }
    }
  }]);

  return MessageTranslator;
})();

exports.MessageTranslator = MessageTranslator;
//# sourceMappingURL=data:application/json;base64,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Qy9CLFlBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZELGVBQU87T0FDUjs7QUFFRCxVQUFJO0FBQ0YsWUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0MsaUNBQVUsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQzNCLGNBQU0sT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO09BQ3BELENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDViwyQkFBTyxRQUFRLGlDQUErQixFQUFFLFVBQUssQ0FBQyxTQUFJLENBQUMsQ0FBQyxLQUFLLENBQUcsQ0FBQztBQUNyRSxZQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsK0JBQTZCLENBQUMsV0FBTSxDQUFDLENBQUMsS0FBSyxDQUFHLENBQUM7T0FDdkU7S0FDRjs7O1dBRWMseUJBQUMsRUFBVSxFQUFFLEtBQWEsRUFBUTtBQUMvQyx5QkFBTyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ2hEOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFlBQUksQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN2QztLQUNGOzs7U0ExRVUsaUJBQWlCIiwiZmlsZSI6Ik1lc3NhZ2VUcmFuc2xhdG9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuY29uc3Qge0RlYnVnZ2VySGFuZGxlcn0gPSByZXF1aXJlKCcuL0RlYnVnZ2VySGFuZGxlcicpO1xuY29uc3QgUGFnZUhhbmRsZXIgPSByZXF1aXJlKCcuL1BhZ2VIYW5kbGVyJyk7XG5jb25zdCBDb25zb2xlSGFuZGxlciA9IHJlcXVpcmUoJy4vQ29uc29sZUhhbmRsZXInKTtcbmNvbnN0IHtSdW50aW1lSGFuZGxlcn0gPSByZXF1aXJlKCcuL1J1bnRpbWVIYW5kbGVyJyk7XG5jb25zdCB7Q29ubmVjdGlvbk11bHRpcGxleGVyfSA9IHJlcXVpcmUoJy4vQ29ubmVjdGlvbk11bHRpcGxleGVyJyk7XG5pbXBvcnQge0NsaWVudENhbGxiYWNrfSBmcm9tICcuL0NsaWVudENhbGxiYWNrJztcblxuaW1wb3J0IHR5cGUgSGFuZGxlciBmcm9tICcuL0hhbmRsZXInO1xuXG4vKipcbiAqIFRyYW5zbGF0ZXMgQ2hyb21lIGRldiB0b29scyBKU09OIG1lc3NhZ2VzIHRvL2Zyb20gZGJncC5cbiAqIFRPRE86IFNob3VsZCB3ZSBwcm9hY3RpdmVseSBwdXNoIGZpbGVzIHRvIHRoZSBkZWJ1Z2dlcj9cbiAqIEN1cnJlbnRseSB3ZSByZWFjdGl2ZWx5IHB1c2ggZmlsZXMgdG8gdGhlIGRlYnVnZXIgd2hlbiB0aGV5IGFwcGVhciBpbiBhIHN0YWNrIHRyYWNlLlxuICovXG5leHBvcnQgY2xhc3MgTWVzc2FnZVRyYW5zbGF0b3Ige1xuICBfaXNEaXNwb3NlZDogYm9vbGVhbjtcbiAgX2Nvbm5lY3Rpb25NdWx0aXBsZXhlcjogQ29ubmVjdGlvbk11bHRpcGxleGVyO1xuICBfY2xpZW50Q2FsbGJhY2s6IENsaWVudENhbGxiYWNrO1xuICBfZGVidWdnZXJIYW5kbGVyOiBEZWJ1Z2dlckhhbmRsZXI7XG4gIF9oYW5kbGVyczogTWFwPHN0cmluZywgSGFuZGxlcj47XG5cbiAgY29uc3RydWN0b3IoY2xpZW50Q2FsbGJhY2s6IENsaWVudENhbGxiYWNrKSB7XG4gICAgdGhpcy5faXNEaXNwb3NlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlciA9IG5ldyBDb25uZWN0aW9uTXVsdGlwbGV4ZXIoY2xpZW50Q2FsbGJhY2spO1xuICAgIHRoaXMuX2hhbmRsZXJzID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrID0gY2xpZW50Q2FsbGJhY2s7XG4gICAgdGhpcy5fZGVidWdnZXJIYW5kbGVyID0gbmV3IERlYnVnZ2VySGFuZGxlcihcbiAgICAgIGNsaWVudENhbGxiYWNrLFxuICAgICAgdGhpcy5fY29ubmVjdGlvbk11bHRpcGxleGVyXG4gICAgKTtcbiAgICB0aGlzLl9hZGRIYW5kbGVyKHRoaXMuX2RlYnVnZ2VySGFuZGxlcik7XG4gICAgdGhpcy5fYWRkSGFuZGxlcihuZXcgUGFnZUhhbmRsZXIoY2xpZW50Q2FsbGJhY2spKTtcbiAgICB0aGlzLl9hZGRIYW5kbGVyKG5ldyBDb25zb2xlSGFuZGxlcihjbGllbnRDYWxsYmFjaykpO1xuICAgIHRoaXMuX2FkZEhhbmRsZXIobmV3IFJ1bnRpbWVIYW5kbGVyKFxuICAgICAgY2xpZW50Q2FsbGJhY2ssXG4gICAgICB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXJcbiAgICApKTtcbiAgfVxuXG4gIF9hZGRIYW5kbGVyKGhhbmRsZXI6IEhhbmRsZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9oYW5kbGVycy5zZXQoaGFuZGxlci5nZXREb21haW4oKSwgaGFuZGxlcik7XG4gIH1cblxuICBvblNlc3Npb25FbmQoY2FsbGJhY2s6ICgpID0+IHZvaWQpOiB2b2lkIHtcbiAgICBsb2dnZXIubG9nKCdvblNlc3Npb25FbmQnKTtcbiAgICB0aGlzLl9kZWJ1Z2dlckhhbmRsZXIub25TZXNzaW9uRW5kKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZUNvbW1hbmQoY29tbWFuZDogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgbG9nZ2VyLmxvZygnaGFuZGxlQ29tbWFuZDogJyArIGNvbW1hbmQpO1xuICAgIGNvbnN0IHtpZCwgbWV0aG9kLCBwYXJhbXN9ID0gSlNPTi5wYXJzZShjb21tYW5kKTtcblxuICAgIGlmICghbWV0aG9kIHx8IHR5cGVvZiBtZXRob2QgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLl9yZXBseVdpdGhFcnJvcihpZCwgJ01pc3NpbmcgbWV0aG9kOiAnICsgY29tbWFuZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IG1ldGhvZFBhcnRzID0gbWV0aG9kLnNwbGl0KCcuJyk7XG4gICAgaWYgKG1ldGhvZFBhcnRzLmxlbmd0aCAhPT0gMikge1xuICAgICAgdGhpcy5fcmVwbHlXaXRoRXJyb3IoaWQsICdCYWRseSBmb3JtYXR0ZWQgbWV0aG9kOiAnICsgY29tbWFuZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IFtkb21haW4sIG1ldGhvZE5hbWVdID0gbWV0aG9kUGFydHM7XG5cbiAgICBpZiAoIXRoaXMuX2hhbmRsZXJzLmhhcyhkb21haW4pKSB7XG4gICAgICB0aGlzLl9yZXBseVdpdGhFcnJvcihpZCwgJ1Vua25vd24gZG9tYWluOiAnICsgY29tbWFuZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGhhbmRsZXIgPSB0aGlzLl9oYW5kbGVycy5nZXQoZG9tYWluKTtcbiAgICAgIGludmFyaWFudChoYW5kbGVyICE9IG51bGwpO1xuICAgICAgYXdhaXQgaGFuZGxlci5oYW5kbGVNZXRob2QoaWQsIG1ldGhvZE5hbWUsIHBhcmFtcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgbG9nZ2VyLmxvZ0Vycm9yKGBFeGNlcHRpb24gaGFuZGxpbmcgY29tbWFuZCAke2lkfTogJHtlfSAke2Uuc3RhY2t9YCk7XG4gICAgICB0aGlzLl9yZXBseVdpdGhFcnJvcihpZCwgYEVycm9yIGhhbmRsaW5nIGNvbW1hbmQ6ICR7ZX1cXG4gJHtlLnN0YWNrfWApO1xuICAgIH1cbiAgfVxuXG4gIF9yZXBseVdpdGhFcnJvcihpZDogbnVtYmVyLCBlcnJvcjogc3RyaW5nKTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZyhlcnJvcik7XG4gICAgdGhpcy5fY2xpZW50Q2FsbGJhY2sucmVwbHlXaXRoRXJyb3IoaWQsIGVycm9yKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9pc0Rpc3Bvc2VkKSB7XG4gICAgICB0aGlzLl9pc0Rpc3Bvc2VkID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlci5kaXNwb3NlKCk7XG4gICAgfVxuICB9XG59XG4iXX0=