'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeDebugadapter;

function _load_vscodeDebugadapter() {
  return _vscodeDebugadapter = require('vscode-debugadapter');
}

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _DebuggerHandler;

function _load_DebuggerHandler() {
  return _DebuggerHandler = require('../DebuggerHandler');
}

var _config;

function _load_config() {
  return _config = require('../config');
}

var _ConnectionUtils;

function _load_ConnectionUtils() {
  return _ConnectionUtils = require('../ConnectionUtils');
}

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('../utils'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This interface should always match the schema found in nuclide's vscode extension manifest.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class HhvmDebugSession extends (_vscodeDebugadapter || _load_vscodeDebugadapter()).LoggingDebugSession {

  /**
   * Creates a new debug adapter that is used for one debug session.
   * We configure the default implementation of a debug adapter here.
   */
  constructor() {
    super('hhvm-debug');

    // this debugger uses zero-based lines and columns
    this.setDebuggerLinesStartAt1(true);
    this.setDebuggerColumnsStartAt1(true);

    this._debuggerHandler = new (_DebuggerHandler || _load_DebuggerHandler()).DebuggerHandler(this.sendEvent.bind(this));
  }

  /**
   * The 'initialize' request is the first request called by the frontend
   * to interrogate the features the debug adapter provides.
   */
  initializeRequest(response, args) {
    // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
    // we request them early by sending an 'initializeRequest' to the frontend.
    // The frontend will end the configuration sequence by calling 'configurationDone' request.
    this.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).InitializedEvent());

    response.body = response.body || {};
    response.body.supportsConfigurationDoneRequest = true;
    response.body.supportsEvaluateForHovers = true;
    response.body.exceptionBreakpointFilters = [{
      label: 'All Exceptions',
      filter: 'all'
    }];
    response.body.supportsConditionalBreakpoints = true;

    this.sendResponse(response);
  }

  launchRequest(response, args) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      // make sure to 'Stop' the buffered logging if 'trace' is not set
      (_vscodeDebugadapter || _load_vscodeDebugadapter()).logger.setup(args.trace ? (_vscodeDebugadapter || _load_vscodeDebugadapter()).Logger.LogLevel.Verbose : (_vscodeDebugadapter || _load_vscodeDebugadapter()).Logger.LogLevel.Stop, false);

      // Yuckky: Setting a global config to be used by the debugger.
      (0, (_config || _load_config()).setConfig)(args.config);
      yield (0, (_ConnectionUtils || _load_ConnectionUtils()).setRootDirectoryUri)(args.config.targetUri);
      (_utils || _load_utils()).default.setLevel(args.config.logLevel);

      // TODO Get rid of legacy: Resume to start the debug session.
      _this._debuggerHandler.resume();

      _this.sendResponse(response);
    })();
  }

  setBreakPointsRequest(response, args) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const breakpoints = yield _this2._debuggerHandler.setBreakpoints((0, (_nullthrows || _load_nullthrows()).default)(args.source.path), (0, (_nullthrows || _load_nullthrows()).default)(args.breakpoints));
      // Send back the actual breakpoint positions.
      response.body = {
        breakpoints
      };
      _this2.sendResponse(response);
    })();
  }

  setExceptionBreakPointsRequest(response, args) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let state;
      if (args.filters.indexOf('uncaught') !== -1) {
        state = 'uncaught';
      } else if (args.filters.indexOf('all') !== -1) {
        state = 'all';
      } else {
        state = 'none';
      }
      yield _this3._debuggerHandler.setPauseOnExceptions(_this3._breakpointId++, state);
      _this3.sendResponse(response);
    })();
  }

  // TODO(most): proper thread updates support.
  threadsRequest(response) {
    response.body = {
      threads: [new (_vscodeDebugadapter || _load_vscodeDebugadapter()).Thread(1, 'thread 1')]
    };
    this.sendResponse(response);
  }

  /**
   * Returns a fake 'stacktrace' where every 'stackframe' is a word from the current line.
   */
  stackTraceRequest(response, args) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const frames = yield _this4._debuggerHandler.getStackFrames(args.threadId);
      response.body = {
        stackFrames: frames
      };
      _this4.sendResponse(response);
    })();
  }

  scopesRequest(response, args) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const scopes = yield _this5._debuggerHandler.getScopesForFrame(args.frameId);
      response.body = {
        scopes
      };
      _this5.sendResponse(response);
    })();
  }

  variablesRequest(response, args) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const variables = yield _this6._debuggerHandler.getProperties(args.variablesReference);
      response.body = {
        variables
      };
      _this6.sendResponse(response);
    })();
  }

  continueRequest(response, args) {
    this.sendResponse(response);
    this._debuggerHandler.resume();
  }

  pauseRequest(response, args) {
    this.sendResponse(response);
    this._debuggerHandler.pause();
  }

  nextRequest(response, args) {
    this.sendResponse(response);
    this._debuggerHandler.stepOver();
  }

  stepInRequest(response, args) {
    this.sendResponse(response);
    this._debuggerHandler.stepInto();
  }

  stepOutRequest(response, args) {
    this.sendResponse(response);
    this._debuggerHandler.stepOut();
  }

  evaluateRequest(response, args) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this7._debuggerHandler.evaluate(args.expression, args.frameId, response);
      _this7.sendResponse(response);
    })();
  }

  nuclide_continueToLocation(response, args) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this8._debuggerHandler.continueToLocation(args);
      _this8.sendResponse(response);
    })();
  }

  customRequest(command, response, args) {
    switch (command) {
      case 'nuclide_continueToLocation':
        this.nuclide_continueToLocation(response, args);
        return;
      default:
        return super.customRequest(command, response, args);
    }
  }
}

(_vscodeDebugadapter || _load_vscodeDebugadapter()).DebugSession.run(HhvmDebugSession);