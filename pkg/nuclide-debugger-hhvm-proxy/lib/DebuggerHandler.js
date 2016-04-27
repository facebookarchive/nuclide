Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _helpers = require('./helpers');

var _Handler2 = require('./Handler');

var _Handler3 = _interopRequireDefault(_Handler2);

var _DbgpSocket = require('./DbgpSocket');

var _FileCache = require('./FileCache');

var _FileCache2 = _interopRequireDefault(_FileCache);

var _events = require('events');

var SESSION_END_EVENT = 'session-end-event';

// Handles all 'Debug.*' Chrome dev tools messages

var DebuggerHandler = (function (_Handler) {
  _inherits(DebuggerHandler, _Handler);

  function DebuggerHandler(clientCallback, connectionMultiplexer) {
    _classCallCheck(this, DebuggerHandler);

    _get(Object.getPrototypeOf(DebuggerHandler.prototype), 'constructor', this).call(this, 'Debugger', clientCallback);

    this._hadFirstContinuationCommand = false;
    this._connectionMultiplexer = connectionMultiplexer;
    this._files = new _FileCache2['default'](clientCallback);
    this._emitter = new _events.EventEmitter();
    this._statusSubscription = this._connectionMultiplexer.onStatus(this._onStatusChanged.bind(this));
  }

  _createClass(DebuggerHandler, [{
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      _utils2['default'].log('onSessionEnd');
      this._emitter.on(SESSION_END_EVENT, callback);
    }
  }, {
    key: 'handleMethod',
    value: _asyncToGenerator(function* (id, method, params) {

      switch (method) {

        // TODO: Add Console (aka logging) support
        case 'enable':
          this._debuggerEnable(id);
          break;

        case 'pause':
          yield this._sendBreakCommand(id);
          break;

        case 'stepInto':
          this._sendContinuationCommand(_DbgpSocket.COMMAND_STEP_INTO);
          break;

        case 'stepOut':
          this._sendContinuationCommand(_DbgpSocket.COMMAND_STEP_OUT);
          break;

        case 'stepOver':
          this._sendContinuationCommand(_DbgpSocket.COMMAND_STEP_OVER);
          break;

        case 'resume':
          this._sendContinuationCommand(_DbgpSocket.COMMAND_RUN);
          break;

        case 'setPauseOnExceptions':
          yield this._setPauseOnExceptions(id, params);
          break;

        case 'setAsyncCallStackDepth':
        case 'skipStackFrames':
          this.replyWithError(id, 'Not implemented');
          break;

        case 'getScriptSource':
          // TODO: Handle file read errors.
          // TODO: Handle non-file scriptIds
          this.replyToCommand(id, { scriptSource: yield this._files.getFileSource(params.scriptId) });
          break;

        case 'setBreakpointByUrl':
          this._setBreakpointByUrl(id, params);
          break;

        case 'removeBreakpoint':
          yield this._removeBreakpoint(id, params);
          break;

        case 'evaluateOnCallFrame':
          var compatParams = (0, _utils.makeExpressionHphpdCompatible)(params);
          var result = yield this._connectionMultiplexer.evaluateOnCallFrame(Number(compatParams.callFrameId), compatParams.expression);
          this.replyToCommand(id, result);
          break;

        default:
          this.unknownMethod(id, method, params);
          break;
      }
    })
  }, {
    key: '_setPauseOnExceptions',
    value: _asyncToGenerator(function* (id, params) {
      var state = params.state;

      yield this._connectionMultiplexer.setPauseOnExceptions(state);
      this.replyToCommand(id, {});
    })
  }, {
    key: '_setBreakpointByUrl',
    value: function _setBreakpointByUrl(id, params) {
      var lineNumber = params.lineNumber;
      var url = params.url;
      var columnNumber = params.columnNumber;
      var condition = params.condition;

      if (!url || condition !== '' || columnNumber !== 0) {
        this.replyWithError(id, 'Invalid arguments to Debugger.setBreakpointByUrl: ' + JSON.stringify(params));
        return;
      }
      this._files.registerFile(url);

      var path = (0, _helpers.uriToPath)(url);
      var breakpointId = this._connectionMultiplexer.setBreakpoint(path, lineNumber + 1);
      this.replyToCommand(id, {
        breakpointId: breakpointId,
        locations: [{
          lineNumber: lineNumber,
          scriptId: path
        }] });
    }
  }, {
    key: '_removeBreakpoint',
    value: _asyncToGenerator(function* (id, params) {
      var breakpointId = params.breakpointId;

      yield this._connectionMultiplexer.removeBreakpoint(breakpointId);
      this.replyToCommand(id, { id: breakpointId });
    })
  }, {
    key: '_debuggerEnable',
    value: function _debuggerEnable(id) {
      this.replyToCommand(id, {});
      this._sendFakeLoaderBreakpoint();
    }
  }, {
    key: '_getStackFrames',
    value: _asyncToGenerator(function* () {
      var _this = this;

      var frames = yield this._connectionMultiplexer.getStackFrames();
      return yield Promise.all(frames.stack.map(function (frame, frameIndex) {
        return _this._convertFrame(frame, frameIndex);
      }));
    })
  }, {
    key: '_convertFrame',
    value: _asyncToGenerator(function* (frame, frameIndex) {
      _utils2['default'].log('Converting frame: ' + JSON.stringify(frame));

      var _require = require('./frame');

      var idOfFrame = _require.idOfFrame;
      var functionOfFrame = _require.functionOfFrame;
      var fileUrlOfFrame = _require.fileUrlOfFrame;
      var locationOfFrame = _require.locationOfFrame;

      this._files.registerFile(fileUrlOfFrame(frame));
      return {
        callFrameId: idOfFrame(frame),
        functionName: functionOfFrame(frame),
        location: locationOfFrame(frame),
        scopeChain: yield this._connectionMultiplexer.getScopesForFrame(frameIndex)
      };
    })
  }, {
    key: '_sendContinuationCommand',
    value: function _sendContinuationCommand(command) {
      if (!this._hadFirstContinuationCommand) {
        this._hadFirstContinuationCommand = true;
        this.sendMethod('Debugger.resumed');
        this._connectionMultiplexer.listen();
        return;
      }
      _utils2['default'].log('Sending continuation command: ' + command);
      this._connectionMultiplexer.sendContinuationCommand(command);
    }
  }, {
    key: '_sendBreakCommand',
    value: _asyncToGenerator(function* (id) {
      var response = yield this._connectionMultiplexer.sendBreakCommand();
      if (!response) {
        this.replyWithError(id, 'Unable to break');
      }
    })
  }, {
    key: '_onStatusChanged',
    value: _asyncToGenerator(function* (status) {
      _utils2['default'].log('Sending status: ' + status);
      switch (status) {
        case _DbgpSocket.STATUS_BREAK:
          yield this._sendPausedMessage();
          break;
        case _DbgpSocket.STATUS_RUNNING:
          this.sendMethod('Debugger.resumed');
          break;
        case _DbgpSocket.STATUS_STOPPED:
        case _DbgpSocket.STATUS_ERROR:
        case _DbgpSocket.STATUS_END:
          this._endSession();
          break;
        case _DbgpSocket.STATUS_STARTING:
        case _DbgpSocket.STATUS_STOPPING:
          // These two should be hidden by the ConnectionMultiplexer
          break;
        default:
          _utils2['default'].logErrorAndThrow('Unexpected status: ' + status);
      }
    })

    // May only call when in paused state.
  }, {
    key: '_sendPausedMessage',
    value: _asyncToGenerator(function* () {
      this.sendMethod('Debugger.paused', {
        callFrames: yield this._getStackFrames(),
        reason: 'breakpoint', // TODO: better reason?
        data: {}
      });
    })
  }, {
    key: '_sendFakeLoaderBreakpoint',
    value: function _sendFakeLoaderBreakpoint() {
      this.sendMethod('Debugger.paused', {
        callFrames: [],
        reason: 'breakpoint', // TODO: better reason?
        data: {}
      });
    }
  }, {
    key: '_endSession',
    value: function _endSession() {
      _utils2['default'].log('DebuggerHandler: Ending session');
      if (this._statusSubscription) {
        this._statusSubscription.dispose();
        this._statusSubscription = null;
      }
      this._emitter.emit(SESSION_END_EVENT);
    }
  }]);

  return DebuggerHandler;
})(_Handler3['default']);

exports.DebuggerHandler = DebuggerHandler;