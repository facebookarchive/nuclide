'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MessageTranslator = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Translates Chrome dev tools JSON messages to/from dbgp.
 * TODO: Should we proactively push files to the debugger?
 * Currently we reactively push files to the debuger when they appear in a stack trace.
 */
class MessageTranslator {

  constructor(clientCallback) {
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

  _addHandler(handler) {
    this._handlers.set(handler.getDomain(), handler);
  }

  onSessionEnd(callback) {
    (_utils || _load_utils()).default.log('onSessionEnd');
    this._debuggerHandler.onSessionEnd(callback);
  }

  handleCommand(command) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      (_utils || _load_utils()).default.log('handleCommand: ' + command);
      const { id, method, params } = JSON.parse(command);

      if (!method || typeof method !== 'string') {
        _this._replyWithError(id, 'Missing method: ' + command);
        return;
      }
      const methodParts = method.split('.');
      if (methodParts.length !== 2) {
        _this._replyWithError(id, 'Badly formatted method: ' + command);
        return;
      }
      const [domain, methodName] = methodParts;

      if (!_this._handlers.has(domain)) {
        _this._replyWithError(id, 'Unknown domain: ' + command);
        return;
      }

      try {
        const handler = _this._handlers.get(domain);

        if (!(handler != null)) {
          throw new Error('Invariant violation: "handler != null"');
        }

        yield handler.handleMethod(id, methodName, params);
      } catch (e) {
        (_utils || _load_utils()).default.logError(`Exception handling command ${id}: ${e} ${e.stack}`);
        _this._replyWithError(id, `Error handling command: ${e}\n ${e.stack}`);
      }
    })();
  }

  _replyWithError(id, error) {
    (_utils || _load_utils()).default.log(error);
    this._clientCallback.replyWithError(id, error);
  }

  dispose() {
    if (!this._isDisposed) {
      this._isDisposed = true;
      this._connectionMultiplexer.dispose();
    }
  }
}
exports.MessageTranslator = MessageTranslator; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                */