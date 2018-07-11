"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function DebugProtocol() {
  const data = _interopRequireWildcard(require("vscode-debugprotocol"));

  DebugProtocol = function () {
    return data;
  };

  return data;
}

function _VsAdapterSpawner() {
  const data = _interopRequireDefault(require("./VsAdapterSpawner"));

  _VsAdapterSpawner = function () {
    return data;
  };

  return data;
}

function _V8Protocol() {
  const data = _interopRequireDefault(require("./V8Protocol"));

  _V8Protocol = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _analytics() {
  const data = require("../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _uuid() {
  const data = _interopRequireDefault(require("uuid"));

  _uuid = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
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
function raiseAdapterExitedEvent(exitCode) {
  return {
    seq: 0,
    type: 'event',
    event: 'adapter-exited',
    body: {
      exitCode
    }
  };
}

/**
 * Use V8 JSON-RPC protocol to send & receive messages
 * (requests, responses & events) over `stdio` of adapter child processes.
 */
class VsDebugSession extends _V8Protocol().default {
  constructor(id, logger, adapterExecutable, adapterAnalyticsExtras, spawner, sendPreprocessors = [], receivePreprocessors = [], runInTerminalHandler) {
    super(id, logger, sendPreprocessors, receivePreprocessors);
    this._adapterExecutable = adapterExecutable;
    this._logger = logger;
    this._readyForBreakpoints = false;
    this._spawner = spawner == null ? new (_VsAdapterSpawner().default)() : spawner;
    this._adapterAnalyticsExtras = Object.assign({}, adapterAnalyticsExtras, {
      // $FlowFixMe flow doesn't consider uuid callable, but it is
      debuggerSessionId: (0, _uuid().default)()
    });
    this._adapterErrorOutput = '';
    this._onDidInitialize = new _RxMin.Subject();
    this._onDidStop = new _RxMin.Subject();
    this._onDidContinued = new _RxMin.Subject();
    this._onDidTerminateDebugee = new _RxMin.Subject();
    this._onDidExitDebugee = new _RxMin.Subject();
    this._onDidExitAdapter = new _RxMin.Subject();
    this._onDidThread = new _RxMin.Subject();
    this._onDidOutput = new _RxMin.Subject();
    this._onDidBreakpoint = new _RxMin.Subject();
    this._onDidModule = new _RxMin.Subject();
    this._onDidLoadSource = new _RxMin.Subject();
    this._onDidCustom = new _RxMin.Subject();
    this._onDidEvent = new _RxMin.Subject();
    this.capabilities = {};
    this._runInTerminalHandler = runInTerminalHandler || null;
  }

  observeInitializeEvents() {
    return this._onDidInitialize.asObservable();
  }

  observeStopEvents() {
    return this._onDidStop.asObservable();
  }

  observeContinuedEvents() {
    return this._onDidContinued.asObservable();
  }

  observeTerminateDebugeeEvents() {
    return this._onDidTerminateDebugee.asObservable();
  }

  observeExitedDebugeeEvents() {
    return this._onDidExitDebugee.asObservable();
  }

  observeAdapterExitedEvents() {
    return this._onDidExitAdapter.asObservable();
  }

  observeThreadEvents() {
    return this._onDidThread.asObservable();
  }

  observeOutputEvents() {
    return this._onDidOutput.asObservable();
  }

  observeBreakpointEvents() {
    return this._onDidBreakpoint.asObservable();
  }

  observeModuleEvents() {
    return this._onDidModule.asObservable();
  }

  observeSourceLoadedEvents() {
    return this._onDidLoadSource.asObservable();
  }

  observeCustomEvents() {
    return this._onDidCustom.asObservable();
  }

  observeAllEvents() {
    return this._onDidEvent.asObservable();
  }

  _initServer() {
    if (this._adapterProcessSubscription != null) {
      return;
    }

    this._startServer();

    this._startTime = new Date().getTime();
  }

  custom(request, args) {
    return this.send(request, args);
  }

  send(command, args) {
    this._logger.info('Send request:', command, args);

    this._initServer();

    const operation = () => {
      // Babel Bug: `super` isn't working with `async`
      return super.send(command, args).then(response => {
        const sanitizedResponse = this._sanitizeResponse(response);

        this._logger.info('Received response:', sanitizedResponse);

        (0, _analytics().track)('vs-debug-session:transaction', Object.assign({}, this._adapterAnalyticsExtras, {
          request: {
            command,
            arguments: args
          },
          response: sanitizedResponse
        }));
        return response;
      }, errorResponse => {
        var _ref, _ref2;

        let formattedError = ((_ref = errorResponse) != null ? (_ref = _ref.body) != null ? (_ref = _ref.error) != null ? _ref.format : _ref : _ref : _ref) || ((_ref2 = errorResponse) != null ? _ref2.message : _ref2);

        if (formattedError === '{_stack}') {
          formattedError = JSON.stringify(errorResponse.body.error);
        } else if (formattedError == null) {
          formattedError = [`command: ${command}`, `args: ${JSON.stringify(args)}`, `response: ${JSON.stringify(errorResponse)}`, `adapterExecutable: , ${JSON.stringify(this._adapterExecutable)}`].join(', ');
        }

        (0, _analytics().track)('vs-debug-session:transaction', Object.assign({}, this._adapterAnalyticsExtras, {
          request: {
            command,
            arguments: args
          },
          response: errorResponse
        }));
        throw new Error(formattedError);
      });
    };

    return (0, _analytics().trackTiming)(`vs-debug-session:${command}`, operation, this._adapterAnalyticsExtras);
  }

  _sanitizeResponse(response) {
    try {
      if (response.command === 'variables') {
        const varResponse = response;
        const sanResponse = Object.assign({}, varResponse, {
          body: Object.assign({}, varResponse.body, {
            variables: varResponse.body.variables.map(v => Object.assign({}, v, {
              value: '<elided>'
            }))
          })
        }); // $FlowFixMe flow isn't recognizing that ...varResponse is filling in needed members

        return sanResponse;
      }

      if (response.command === 'evaluate') {
        const evalResponse = response;
        const sanResponse = Object.assign({}, evalResponse, {
          body: Object.assign({}, evalResponse.body, {
            result: '<elided>'
          })
        }); // $FlowFixMe flow isn't recognizing that ...evalResponse is filling in needed members

        return sanResponse;
      }

      return response;
    } catch (e) {
      // Don't let a malformed response prevent the response from bubbling up
      // to the debugger
      return {
        type: 'response',
        seq: response.seq,
        request_seq: response.request_seq,
        success: false,
        command: response.command,
        error: 'Error sanitizing response.',
        message: e.message
      };
    }
  }

  onEvent(event) {
    if (event.body != null) {
      // $FlowFixMe `sessionId` isn't in the type def.
      event.body.sessionId = this.getId();
    } else {
      // $FlowFixMe `event.body` type def.
      event.body = {
        sessionId: this.getId()
      };
    }

    (0, _analytics().track)('vs-debug-session:transaction', Object.assign({}, this._adapterAnalyticsExtras, {
      event
    }));

    this._onDidEvent.next(event);

    switch (event.event) {
      case 'initialized':
        this._readyForBreakpoints = true;

        this._onDidInitialize.next(event);

        break;

      case 'stopped':
        this._onDidStop.next(event);

        break;

      case 'continued':
        this._onDidContinued.next(event);

        break;

      case 'thread':
        this._onDidThread.next(event);

        break;

      case 'output':
        this._onDidOutput.next(event);

        break;

      case 'breakpoint':
        this._onDidBreakpoint.next(event);

        break;

      case 'terminated':
        this._onDidTerminateDebugee.next(event);

        break;

      case 'exited':
        this._onDidExitDebugee.next(event);

        break;

      case 'adapter-exited':
        this._onDidExitAdapter.next(event);

        break;

      case 'module':
        this._onDidModule.next(event);

        break;

      case 'loadedSource':
        this._onDidLoadSource.next(event);

        break;

      default:
        this._onDidCustom.next(event);

        this._logger.info('Custom event type:', event);

        break;
    }
  }

  getCapabilities() {
    return this.capabilities;
  }

  async initialize(args) {
    const response = await this.send('initialize', args);
    return this._readCapabilities(response);
  }

  _readCapabilities(response) {
    if (response) {
      this.capabilities = Object.assign({}, this.capabilities, response.body);
    }

    return response;
  }

  async launch(args) {
    const response = await this.send('launch', args);
    return this._readCapabilities(response);
  }

  async attach(args) {
    const response = await this.send('attach', args);
    return this._readCapabilities(response);
  }

  next(args) {
    this._fireFakeContinued(args.threadId);

    return this.send('next', args);
  }

  stepIn(args) {
    this._fireFakeContinued(args.threadId);

    return this.send('stepIn', args);
  }

  stepOut(args) {
    this._fireFakeContinued(args.threadId);

    return this.send('stepOut', args);
  }

  continue(args) {
    this._fireFakeContinued(args.threadId);

    return this.send('continue', args);
  }

  pause(args) {
    return this.send('pause', args);
  }

  setVariable(args) {
    return this.send('setVariable', args);
  }

  restartFrame(args, threadId) {
    this._fireFakeContinued(threadId);

    return this.send('restartFrame', args);
  }

  completions(args) {
    return this.send('completions', args);
  }

  async disconnect(restart = false, force = false) {
    if (this._disconnected && force) {
      this._stopServer();

      return;
    }

    if (this._adapterProcessSubscription != null && !this._disconnected) {
      // point of no return: from now on don't report any errors
      this._disconnected = true;
      await this.send('disconnect', {
        restart
      });

      this._stopServer();
    }
  }

  setBreakpoints(args) {
    return this.send('setBreakpoints', args);
  }

  setFunctionBreakpoints(args) {
    return this.send('setFunctionBreakpoints', args);
  }

  setExceptionBreakpoints(args) {
    return this.send('setExceptionBreakpoints', args);
  }

  configurationDone() {
    return this.send('configurationDone', null);
  }

  stackTrace(args) {
    return this.send('stackTrace', args);
  }

  exceptionInfo(args) {
    return this.send('exceptionInfo', args);
  }

  scopes(args) {
    return this.send('scopes', args);
  }

  variables(args) {
    return this.send('variables', args);
  }

  source(args) {
    return this.send('source', args);
  }

  threads() {
    return this.send('threads', null);
  }

  evaluate(args) {
    return this.send('evaluate', args);
  }

  stepBack(args) {
    this._fireFakeContinued(args.threadId);

    return this.send('stepBack', args);
  }

  reverseContinue(args) {
    this._fireFakeContinued(args.threadId);

    return this.send('reverseContinue', args);
  }

  nuclide_continueToLocation(args) {
    return this.custom('nuclide_continueToLocation', args);
  }

  getLengthInSeconds() {
    return (new Date().getTime() - this._startTime) / 1000;
  }

  async dispatchRequest(request, response) {
    if (request.command === 'runInTerminal') {
      const runInTerminalHandler = this._runInTerminalHandler;

      if (runInTerminalHandler == null) {
        this._logger.error("'runInTerminal' isn't supported for this debug session", request);

        return;
      }

      try {
        await runInTerminalHandler(request.arguments);
      } catch (error) {
        response.success = false;
        response.message = error.message;
      }

      this.sendResponse(response);
    } else if (request.command === 'handshake') {
      this._logger.error('TODO: handshake', request);
    } else {
      response.success = false;
      response.message = `unknown request '${request.command}'`;
      this.sendResponse(response);
    }
  }

  _fireFakeContinued(threadId, allThreadsContinued = false) {
    const event = {
      type: 'event',
      event: 'continued',
      body: {
        threadId,
        // $FlowFixMe
        allThreadsContinued
      },
      seq: 0
    };

    this._onDidContinued.next(event);

    this._onDidEvent.next(event);
  }

  _startServer() {
    this._adapterProcessSubscription = this._spawner.spawnAdapter(this._adapterExecutable).refCount().subscribe(message => {
      if (message.kind === 'stdout') {
        this.handleData(new Buffer(message.data));
      } else if (message.kind === 'stderr') {
        const event = {
          type: 'event',
          event: 'output',
          body: {
            category: 'stderr',
            output: message.data
          },
          seq: 0
        };

        this._onDidOutput.next(event);

        this._onDidEvent.next(event);

        this._logger.error(`adapter stderr: ${message.data}`);

        this._adapterErrorOutput = this._adapterErrorOutput + message.data;
      } else {
        if (!(message.kind === 'exit')) {
          throw new Error("Invariant violation: \"message.kind === 'exit'\"");
        }

        this.onServerExit(message.exitCode || 0);
      }
    }, err => {
      this.onServerError(err);
    });
    this.setOutput(this._spawner.write.bind(this._spawner));
  }

  _stopServer() {
    this.onEvent(raiseAdapterExitedEvent(0));

    if (this._adapterProcessSubscription == null) {
      return;
    }

    this._disconnected = true;

    this._adapterProcessSubscription.unsubscribe();

    this._endHandlers();
  }

  _endHandlers() {
    this._onDidInitialize.complete();

    this._onDidStop.complete();

    this._onDidContinued.complete();

    this._onDidTerminateDebugee.complete();

    this._onDidExitDebugee.complete();

    this._onDidExitAdapter.complete();

    this._onDidThread.complete();

    this._onDidOutput.complete();

    this._onDidBreakpoint.complete();

    this._onDidModule.complete();

    this._onDidLoadSource.complete();

    this._onDidCustom.complete();

    this._onDidEvent.complete();
  }

  onServerError(error) {
    this._logger.error('Adapter error:', error);

    this._stopServer();
  }

  onServerExit(code) {
    if (this._adapterProcessSubscription != null) {
      this._adapterProcessSubscription.unsubscribe();

      this._adapterProcessSubscription = null;
    }

    if (!this._disconnected) {
      this._logger.error(`Debug adapter process has terminated unexpectedly ${code}`);
    }

    this.onEvent(raiseAdapterExitedEvent(code));
  }

  isReadyForBreakpoints() {
    return this._readyForBreakpoints;
  }

  isDisconnected() {
    return this._disconnected;
  }

  dispose() {
    if (this._adapterErrorOutput) {
      (0, _analytics().track)('vs-debug-session:transaction', Object.assign({}, this._adapterAnalyticsExtras, {
        response: this._adapterErrorOutput
      }));
    }

    this.disconnect();
  }

}

exports.default = VsDebugSession;