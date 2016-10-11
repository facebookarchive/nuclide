Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/**
 * Translates Chrome dev tools JSON messages to/from dbgp.
 * TODO: Should we proactively push files to the debugger?
 * Currently we reactively push files to the debuger when they appear in a stack trace.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _DebuggerHandler;

function _load_DebuggerHandler() {
  return _DebuggerHandler = require('./DebuggerHandler');
}

var _PageHandler;

function _load_PageHandler() {
  return _PageHandler = _interopRequireDefault(require('./PageHandler'));
}

var _ConsoleHandler;

function _load_ConsoleHandler() {
  return _ConsoleHandler = _interopRequireDefault(require('./ConsoleHandler'));
}

var _RuntimeHandler;

function _load_RuntimeHandler() {
  return _RuntimeHandler = require('./RuntimeHandler');
}

var _ConnectionMultiplexer;

function _load_ConnectionMultiplexer() {
  return _ConnectionMultiplexer = require('./ConnectionMultiplexer');
}

var _ClientCallback;

function _load_ClientCallback() {
  return _ClientCallback = require('./ClientCallback');
}

var MessageTranslator = (function () {
  function MessageTranslator(clientCallback) {
    _classCallCheck(this, MessageTranslator);

    this._isDisposed = false;
    this._connectionMultiplexer = new (_ConnectionMultiplexer || _load_ConnectionMultiplexer()).ConnectionMultiplexer(clientCallback);
    this._handlers = new Map();
    this._clientCallback = clientCallback;
    this._debuggerHandler = new (_DebuggerHandler || _load_DebuggerHandler()).DebuggerHandler(clientCallback, this._connectionMultiplexer);
    this._addHandler(this._debuggerHandler);
    this._addHandler(new (_PageHandler || _load_PageHandler()).default(clientCallback));
    this._addHandler(new (_ConsoleHandler || _load_ConsoleHandler()).default(clientCallback));
    this._addHandler(new (_RuntimeHandler || _load_RuntimeHandler()).RuntimeHandler(clientCallback, this._connectionMultiplexer));
  }

  _createClass(MessageTranslator, [{
    key: '_addHandler',
    value: function _addHandler(handler) {
      this._handlers.set(handler.getDomain(), handler);
    }
  }, {
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      (_utils || _load_utils()).default.log('onSessionEnd');
      this._debuggerHandler.onSessionEnd(callback);
    }
  }, {
    key: 'handleCommand',
    value: _asyncToGenerator(function* (command) {
      (_utils || _load_utils()).default.log('handleCommand: ' + command);

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
        (0, (_assert || _load_assert()).default)(handler != null);
        yield handler.handleMethod(id, methodName, params);
      } catch (e) {
        (_utils || _load_utils()).default.logError('Exception handling command ' + id + ': ' + e + ' ' + e.stack);
        this._replyWithError(id, 'Error handling command: ' + e + '\n ' + e.stack);
      }
    })
  }, {
    key: '_replyWithError',
    value: function _replyWithError(id, error) {
      (_utils || _load_utils()).default.log(error);
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