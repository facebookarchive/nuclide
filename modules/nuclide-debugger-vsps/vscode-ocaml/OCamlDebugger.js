'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.THREAD_ID = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeDebugadapter;

function _load_vscodeDebugadapter() {
  return _vscodeDebugadapter = require('vscode-debugadapter');
}

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _Session;

function _load_Session() {
  return _Session = require('./Session');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const THREAD_ID = exports.THREAD_ID = 1; /**
                                          * Copyright (c) 2017-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the BSD-style license found in the
                                          * LICENSE file in the root directory of this source tree. An additional grant
                                          * of patent rights can be found in the PATENTS file in the same directory.
                                          *
                                          * 
                                          * @format
                                          */

class OCamlDebugSession extends (_vscodeDebugadapter || _load_vscodeDebugadapter()).LoggingDebugSession {

  /**
   * Creates a new debug adapter that is used for one debug session.
   * We configure the default implementation of a debug adapter here.
   */
  constructor() {
    super('ocaml-debug');

    // this debugger uses zero-based lines and columns
    this._started = false;
    this.setDebuggerLinesStartAt1(true);
    this.setDebuggerColumnsStartAt1(true);
  }

  _catchAsyncRequestError(response, fn) {
    fn().catch(error => {
      const errorMessage = error.stack || error.message || String(error);
      if (response != null) {
        response.success = false;
        // $FlowIgnore: returning an ErrorResponse.
        response.body = {
          error: {
            id: -1,
            format: errorMessage
          }
        };
        this.sendResponse(response);
      }
      this.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).OutputEvent(`OCaml Debugger ran into an error:\n\`${errorMessage}\``, 'nuclide_notification', { type: 'error' }));
      this.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).TerminatedEvent());
    });
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

    response.body = {
      supportsConfigurationDoneRequest: true,
      supportsEvaluateForHovers: true
      // TODO: requires Nuclide UI support.
      // supportsStepBack: true,
    };
    this.sendResponse(response);
  }

  launchRequest(response, args) {
    var _this = this;

    this._catchAsyncRequestError(response, (0, _asyncToGenerator.default)(function* () {
      // make sure to 'Stop' the buffered logging if 'trace' is not set
      (_vscodeDebugadapter || _load_vscodeDebugadapter()).logger.setup(args.config.logLevel, false);

      _this._session = yield (_Session || _load_Session()).Session.start(args.config, function (breakPointId) {
        return _this._handleBreakpointHitEvent(breakPointId);
      }, function (error) {
        return _this._handleProgramExitedEvent(error);
      });
      _this._breakAfterStart = args.config.breakAfterStart;
      _this.sendResponse(response);
      _this.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).StoppedEvent('Program entry', THREAD_ID));
    }));
  }

  setBreakPointsRequest(response, args) {
    var _this2 = this;

    this._catchAsyncRequestError(response, (0, _asyncToGenerator.default)(function* () {
      const breakpoints = yield _this2._session.setBreakpointsByUri(args.breakpoints || [], args.source.path, args.source.name);

      response.body = {
        breakpoints
      };
      _this2.sendResponse(response);
    }));
  }

  setExceptionBreakPointsRequest(response, args) {
    this.sendResponse(response);
  }

  configurationDoneRequest(response, args) {
    var _this3 = this;

    this._catchAsyncRequestError(response, (0, _asyncToGenerator.default)(function* () {
      if (_this3._breakAfterStart) {
        _this3.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).StoppedEvent('Program start', THREAD_ID));
      } else {
        yield _this3._session.resume();
      }

      _this3.sendResponse(response);
    }));
  }

  threadsRequest(response) {
    response.body = {
      threads: [new (_vscodeDebugadapter || _load_vscodeDebugadapter()).Thread(THREAD_ID, 'Please, this is OCaml')]
    };
    this.sendResponse(response);
  }

  stackTraceRequest(response, args) {
    var _this4 = this;

    this._catchAsyncRequestError(response, (0, _asyncToGenerator.default)(function* () {
      response.body = {
        stackFrames: yield _this4._session.getStack()
      };
      _this4.sendResponse(response);
    }));
  }

  scopesRequest(response, args) {
    var _this5 = this;

    this._catchAsyncRequestError(response, (0, _asyncToGenerator.default)(function* () {
      _this5.sendResponse(response);
    }));
  }

  variablesRequest(response, args) {
    var _this6 = this;

    this._catchAsyncRequestError(response, (0, _asyncToGenerator.default)(function* () {
      _this6.sendResponse(response);
    }));
  }

  evaluateRequest(response, args) {
    var _this7 = this;

    this._catchAsyncRequestError(response, (0, _asyncToGenerator.default)(function* () {
      const result = yield _this7._session.evaluate(args.frameId, args.expression);

      response.body = {
        result,
        variablesReference: 0
      };
      _this7.sendResponse(response);
    }));
  }

  continueRequest(response, args) {
    var _this8 = this;

    this._catchAsyncRequestError(response, (0, _asyncToGenerator.default)(function* () {
      yield _this8._session.resume();
      _this8.sendResponse(response);
    }));
  }

  pauseRequest(response, args) {
    var _this9 = this;

    this._catchAsyncRequestError(null, (0, _asyncToGenerator.default)(function* () {
      yield _this9._session.pause();
      _this9.sendResponse(response);
    }));
  }

  nextRequest(response, args) {
    var _this10 = this;

    this._catchAsyncRequestError(null, (0, _asyncToGenerator.default)(function* () {
      yield _this10._session.stepOver();
      _this10.sendResponse(response);
      _this10.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).StoppedEvent('Stepped', THREAD_ID));
    }));
  }

  stepInRequest(response, args) {
    var _this11 = this;

    this._catchAsyncRequestError(null, (0, _asyncToGenerator.default)(function* () {
      yield _this11._session.stepInto();
      _this11.sendResponse(response);
      _this11.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).StoppedEvent('Stepped', THREAD_ID));
    }));
  }

  stepOutRequest(response, args) {
    var _this12 = this;

    this._catchAsyncRequestError(null, (0, _asyncToGenerator.default)(function* () {
      yield _this12._session.stepOut();
      _this12.sendResponse(response);
      _this12.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).StoppedEvent('Stepped', THREAD_ID));
    }));
  }

  _handleBreakpointHitEvent(breakpointId) {
    this.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).StoppedEvent('Breakpoint hit', THREAD_ID));
    return Promise.resolve();
  }

  _handleProgramExitedEvent(error) {
    this.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).TerminatedEvent());
    return Promise.resolve();
  }
}

(_vscodeDebugadapter || _load_vscodeDebugadapter()).DebugSession.run(OCamlDebugSession);