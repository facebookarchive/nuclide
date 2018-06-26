'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.THREAD_ID = undefined;

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
    response.body = {
      supportsConfigurationDoneRequest: true,
      supportsEvaluateForHovers: true
      // TODO: requires Nuclide UI support.
      // supportsStepBack: true,
    };
    this.sendResponse(response);
  }

  launchRequest(response, args) {
    this._catchAsyncRequestError(response, async () => {
      const config = Object.assign({}, args);

      // make sure to 'Stop' the buffered logging if 'trace' is not set
      (_vscodeDebugadapter || _load_vscodeDebugadapter()).logger.setup(config.logLevel, false);

      this._session = await (_Session || _load_Session()).Session.start(config, breakPointId => this._handleBreakpointHitEvent(breakPointId), error => this._handleProgramExitedEvent(error));
      this._breakAfterStart = config.breakAfterStart;

      // Now send the initialized event as we're ready to process breakpoint requests
      this.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).InitializedEvent());

      this.sendResponse(response);
      this.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).StoppedEvent('Program entry', THREAD_ID));
    });
  }

  setBreakPointsRequest(response, args) {
    this._catchAsyncRequestError(response, async () => {
      const breakpoints = await this._session.setBreakpointsByUri(args.breakpoints || [], args.source.path, args.source.name);

      response.body = {
        breakpoints
      };
      this.sendResponse(response);
    });
  }

  setExceptionBreakPointsRequest(response, args) {
    this.sendResponse(response);
  }

  configurationDoneRequest(response, args) {
    this._catchAsyncRequestError(response, async () => {
      if (this._breakAfterStart) {
        this.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).StoppedEvent('Program start', THREAD_ID));
      } else {
        await this._session.resume();
      }

      this.sendResponse(response);
    });
  }

  threadsRequest(response) {
    response.body = {
      threads: [new (_vscodeDebugadapter || _load_vscodeDebugadapter()).Thread(THREAD_ID, 'Please, this is OCaml')]
    };
    this.sendResponse(response);
  }

  stackTraceRequest(response, args) {
    this._catchAsyncRequestError(response, async () => {
      response.body = {
        stackFrames: await this._session.getStack()
      };
      this.sendResponse(response);
    });
  }

  scopesRequest(response, args) {
    this._catchAsyncRequestError(response, async () => {
      this.sendResponse(response);
    });
  }

  variablesRequest(response, args) {
    this._catchAsyncRequestError(response, async () => {
      this.sendResponse(response);
    });
  }

  evaluateRequest(response, args) {
    this._catchAsyncRequestError(response, async () => {
      const result = await this._session.evaluate(args.frameId, args.expression);

      response.body = {
        result,
        variablesReference: 0
      };
      this.sendResponse(response);
    });
  }

  continueRequest(response, args) {
    this._catchAsyncRequestError(response, async () => {
      await this._session.resume();
      this.sendResponse(response);
    });
  }

  pauseRequest(response, args) {
    this._catchAsyncRequestError(null, async () => {
      await this._session.pause();
      this.sendResponse(response);
    });
  }

  nextRequest(response, args) {
    this._catchAsyncRequestError(null, async () => {
      await this._session.stepOver();
      this.sendResponse(response);
      this.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).StoppedEvent('Stepped', THREAD_ID));
    });
  }

  stepInRequest(response, args) {
    this._catchAsyncRequestError(null, async () => {
      await this._session.stepInto();
      this.sendResponse(response);
      this.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).StoppedEvent('Stepped', THREAD_ID));
    });
  }

  stepOutRequest(response, args) {
    this._catchAsyncRequestError(null, async () => {
      await this._session.stepOut();
      this.sendResponse(response);
      this.sendEvent(new (_vscodeDebugadapter || _load_vscodeDebugadapter()).StoppedEvent('Stepped', THREAD_ID));
    });
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