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
    value: _asyncToGenerator(function* () {
      if (!this._isDisposed) {
        this._isDisposed = true;
        yield this._connectionMultiplexer.dispose();
      }
    })
  }]);

  return MessageTranslator;
})();

exports.MessageTranslator = MessageTranslator;
//# sourceMappingURL=data:application/json;base64,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Qy9CLFlBQUksQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLGtCQUFrQixHQUFHLE9BQU8sQ0FBQyxDQUFDO0FBQ3ZELGVBQU87T0FDUjs7QUFFRCxVQUFJO0FBQ0YsWUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDM0MsaUNBQVUsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQzNCLGNBQU0sT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDO09BQ3BELENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDViwyQkFBTyxRQUFRLGlDQUErQixFQUFFLFVBQUssQ0FBQyxTQUFJLENBQUMsQ0FBQyxLQUFLLENBQUcsQ0FBQztBQUNyRSxZQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsK0JBQTZCLENBQUMsV0FBTSxDQUFDLENBQUMsS0FBSyxDQUFHLENBQUM7T0FDdkU7S0FDRjs7O1dBRWMseUJBQUMsRUFBVSxFQUFFLEtBQWEsRUFBUTtBQUMvQyx5QkFBTyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbEIsVUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO0tBQ2hEOzs7NkJBRVksYUFBa0I7QUFDN0IsVUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDckIsWUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7QUFDeEIsY0FBTSxJQUFJLENBQUMsc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDN0M7S0FDRjs7O1NBMUVVLGlCQUFpQiIsImZpbGUiOiJNZXNzYWdlVHJhbnNsYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcbmNvbnN0IHtEZWJ1Z2dlckhhbmRsZXJ9ID0gcmVxdWlyZSgnLi9EZWJ1Z2dlckhhbmRsZXInKTtcbmNvbnN0IFBhZ2VIYW5kbGVyID0gcmVxdWlyZSgnLi9QYWdlSGFuZGxlcicpO1xuY29uc3QgQ29uc29sZUhhbmRsZXIgPSByZXF1aXJlKCcuL0NvbnNvbGVIYW5kbGVyJyk7XG5jb25zdCB7UnVudGltZUhhbmRsZXJ9ID0gcmVxdWlyZSgnLi9SdW50aW1lSGFuZGxlcicpO1xuY29uc3Qge0Nvbm5lY3Rpb25NdWx0aXBsZXhlcn0gPSByZXF1aXJlKCcuL0Nvbm5lY3Rpb25NdWx0aXBsZXhlcicpO1xuaW1wb3J0IHtDbGllbnRDYWxsYmFja30gZnJvbSAnLi9DbGllbnRDYWxsYmFjayc7XG5cbmltcG9ydCB0eXBlIEhhbmRsZXIgZnJvbSAnLi9IYW5kbGVyJztcblxuLyoqXG4gKiBUcmFuc2xhdGVzIENocm9tZSBkZXYgdG9vbHMgSlNPTiBtZXNzYWdlcyB0by9mcm9tIGRiZ3AuXG4gKiBUT0RPOiBTaG91bGQgd2UgcHJvYWN0aXZlbHkgcHVzaCBmaWxlcyB0byB0aGUgZGVidWdnZXI/XG4gKiBDdXJyZW50bHkgd2UgcmVhY3RpdmVseSBwdXNoIGZpbGVzIHRvIHRoZSBkZWJ1Z2VyIHdoZW4gdGhleSBhcHBlYXIgaW4gYSBzdGFjayB0cmFjZS5cbiAqL1xuZXhwb3J0IGNsYXNzIE1lc3NhZ2VUcmFuc2xhdG9yIHtcbiAgX2lzRGlzcG9zZWQ6IGJvb2xlYW47XG4gIF9jb25uZWN0aW9uTXVsdGlwbGV4ZXI6IENvbm5lY3Rpb25NdWx0aXBsZXhlcjtcbiAgX2NsaWVudENhbGxiYWNrOiBDbGllbnRDYWxsYmFjaztcbiAgX2RlYnVnZ2VySGFuZGxlcjogRGVidWdnZXJIYW5kbGVyO1xuICBfaGFuZGxlcnM6IE1hcDxzdHJpbmcsIEhhbmRsZXI+O1xuXG4gIGNvbnN0cnVjdG9yKGNsaWVudENhbGxiYWNrOiBDbGllbnRDYWxsYmFjaykge1xuICAgIHRoaXMuX2lzRGlzcG9zZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIgPSBuZXcgQ29ubmVjdGlvbk11bHRpcGxleGVyKGNsaWVudENhbGxiYWNrKTtcbiAgICB0aGlzLl9oYW5kbGVycyA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9jbGllbnRDYWxsYmFjayA9IGNsaWVudENhbGxiYWNrO1xuICAgIHRoaXMuX2RlYnVnZ2VySGFuZGxlciA9IG5ldyBEZWJ1Z2dlckhhbmRsZXIoXG4gICAgICBjbGllbnRDYWxsYmFjayxcbiAgICAgIHRoaXMuX2Nvbm5lY3Rpb25NdWx0aXBsZXhlclxuICAgICk7XG4gICAgdGhpcy5fYWRkSGFuZGxlcih0aGlzLl9kZWJ1Z2dlckhhbmRsZXIpO1xuICAgIHRoaXMuX2FkZEhhbmRsZXIobmV3IFBhZ2VIYW5kbGVyKGNsaWVudENhbGxiYWNrKSk7XG4gICAgdGhpcy5fYWRkSGFuZGxlcihuZXcgQ29uc29sZUhhbmRsZXIoY2xpZW50Q2FsbGJhY2spKTtcbiAgICB0aGlzLl9hZGRIYW5kbGVyKG5ldyBSdW50aW1lSGFuZGxlcihcbiAgICAgIGNsaWVudENhbGxiYWNrLFxuICAgICAgdGhpcy5fY29ubmVjdGlvbk11bHRpcGxleGVyXG4gICAgKSk7XG4gIH1cblxuICBfYWRkSGFuZGxlcihoYW5kbGVyOiBIYW5kbGVyKTogdm9pZCB7XG4gICAgdGhpcy5faGFuZGxlcnMuc2V0KGhhbmRsZXIuZ2V0RG9tYWluKCksIGhhbmRsZXIpO1xuICB9XG5cbiAgb25TZXNzaW9uRW5kKGNhbGxiYWNrOiAoKSA9PiB2b2lkKTogdm9pZCB7XG4gICAgbG9nZ2VyLmxvZygnb25TZXNzaW9uRW5kJyk7XG4gICAgdGhpcy5fZGVidWdnZXJIYW5kbGVyLm9uU2Vzc2lvbkVuZChjYWxsYmFjayk7XG4gIH1cblxuICBhc3luYyBoYW5kbGVDb21tYW5kKGNvbW1hbmQ6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGxvZ2dlci5sb2coJ2hhbmRsZUNvbW1hbmQ6ICcgKyBjb21tYW5kKTtcbiAgICBjb25zdCB7aWQsIG1ldGhvZCwgcGFyYW1zfSA9IEpTT04ucGFyc2UoY29tbWFuZCk7XG5cbiAgICBpZiAoIW1ldGhvZCB8fCB0eXBlb2YgbWV0aG9kICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5fcmVwbHlXaXRoRXJyb3IoaWQsICdNaXNzaW5nIG1ldGhvZDogJyArIGNvbW1hbmQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBtZXRob2RQYXJ0cyA9IG1ldGhvZC5zcGxpdCgnLicpO1xuICAgIGlmIChtZXRob2RQYXJ0cy5sZW5ndGggIT09IDIpIHtcbiAgICAgIHRoaXMuX3JlcGx5V2l0aEVycm9yKGlkLCAnQmFkbHkgZm9ybWF0dGVkIG1ldGhvZDogJyArIGNvbW1hbmQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBbZG9tYWluLCBtZXRob2ROYW1lXSA9IG1ldGhvZFBhcnRzO1xuXG4gICAgaWYgKCF0aGlzLl9oYW5kbGVycy5oYXMoZG9tYWluKSkge1xuICAgICAgdGhpcy5fcmVwbHlXaXRoRXJyb3IoaWQsICdVbmtub3duIGRvbWFpbjogJyArIGNvbW1hbmQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBoYW5kbGVyID0gdGhpcy5faGFuZGxlcnMuZ2V0KGRvbWFpbik7XG4gICAgICBpbnZhcmlhbnQoaGFuZGxlciAhPSBudWxsKTtcbiAgICAgIGF3YWl0IGhhbmRsZXIuaGFuZGxlTWV0aG9kKGlkLCBtZXRob2ROYW1lLCBwYXJhbXMpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGxvZ2dlci5sb2dFcnJvcihgRXhjZXB0aW9uIGhhbmRsaW5nIGNvbW1hbmQgJHtpZH06ICR7ZX0gJHtlLnN0YWNrfWApO1xuICAgICAgdGhpcy5fcmVwbHlXaXRoRXJyb3IoaWQsIGBFcnJvciBoYW5kbGluZyBjb21tYW5kOiAke2V9XFxuICR7ZS5zdGFja31gKTtcbiAgICB9XG4gIH1cblxuICBfcmVwbHlXaXRoRXJyb3IoaWQ6IG51bWJlciwgZXJyb3I6IHN0cmluZyk6IHZvaWQge1xuICAgIGxvZ2dlci5sb2coZXJyb3IpO1xuICAgIHRoaXMuX2NsaWVudENhbGxiYWNrLnJlcGx5V2l0aEVycm9yKGlkLCBlcnJvcik7XG4gIH1cblxuICBhc3luYyBkaXNwb3NlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5faXNEaXNwb3NlZCkge1xuICAgICAgdGhpcy5faXNEaXNwb3NlZCA9IHRydWU7XG4gICAgICBhd2FpdCB0aGlzLl9jb25uZWN0aW9uTXVsdGlwbGV4ZXIuZGlzcG9zZSgpO1xuICAgIH1cbiAgfVxufVxuIl19