'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

var _child_process = _interopRequireDefault(require('child_process'));

var _V8Protocol;

function _load_V8Protocol() {
  return _V8Protocol = _interopRequireDefault(require('./V8Protocol'));
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function raiseAdapterExitedEvent(exitCode) {
  return {
    seq: 0,
    type: 'event',
    event: 'adapter-exited',
    body: { exitCode: 0 }
  };
}

/**
 * Use V8 JSON-RPC protocol to send & receive messages
 * (requests, responses & events) over `stdio` of adapter child processes.
 */
class VsDebugSession extends (_V8Protocol || _load_V8Protocol()).default {

  constructor(id, logger, adapterExecutable) {
    super(id, logger);
    this._adapterExecutable = adapterExecutable;
    this._logger = logger;
    this._readyForBreakpoints = false;

    this._onDidInitialize = new _rxjsBundlesRxMinJs.Subject();
    this._onDidStop = new _rxjsBundlesRxMinJs.Subject();
    this._onDidContinued = new _rxjsBundlesRxMinJs.Subject();
    this._onDidTerminateDebugee = new _rxjsBundlesRxMinJs.Subject();
    this._onDidExitDebugee = new _rxjsBundlesRxMinJs.Subject();
    this._onDidExitAdapter = new _rxjsBundlesRxMinJs.Subject();
    this._onDidThread = new _rxjsBundlesRxMinJs.Subject();
    this._onDidOutput = new _rxjsBundlesRxMinJs.Subject();
    this._onDidBreakpoint = new _rxjsBundlesRxMinJs.Subject();
    this._onDidModule = new _rxjsBundlesRxMinJs.Subject();
    this._onDidEvent = new _rxjsBundlesRxMinJs.Subject();
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

  observeAllEvents() {
    return this._onDidEvent.asObservable();
  }

  _initServer() {
    if (this._cachedInitServer) {
      return this._cachedInitServer;
    }

    const serverPromise = this._startServer();
    this._cachedInitServer = serverPromise.then(() => {
      this._startTime = new Date().getTime();
    }, err => {
      this._cachedInitServer = null;
      return Promise.reject(err);
    });

    return this._cachedInitServer;
  }

  custom(request, args) {
    return this.send(request, args);
  }

  send(command, args) {
    this._logger.info('Send request:', command, args);
    return this._initServer().then(() =>
    // Babel Bug: `super` isn't working with `async`.
    super.send(command, args).then(response => {
      this._logger.info('Received response:', response);
      return response;
    }, errorResponse => {
      var _ref, _ref2, _ref3;

      const errorMessage = ((_ref = errorResponse) != null ? (_ref2 = _ref.body) != null ? (_ref3 = _ref2.error) != null ? _ref3.format : _ref3 : _ref2 : _ref) || JSON.stringify(errorResponse);
      throw new Error(errorMessage);
    }));
  }

  onEvent(event) {
    if (event.body != null) {
      // $FlowFixMe `sessionId` isn't in the type def.
      event.body.sessionId = this.getId();
    } else {
      // $FlowFixMe `event.body` type def.
      event.body = { sessionId: this.getId() };
    }

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
      default:
        this._logger.error('Unknonwn event type:', event);
        break;
    }
  }

  getCapabilities() {
    return this._capabilities || {};
  }

  initialize(args) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this.send('initialize', args);
      return _this._readCapabilities(response);
    })();
  }

  _readCapabilities(response) {
    if (response) {
      this._capabilities = Object.assign({}, this._capabilities, response.body);
    }
    return response;
  }

  launch(args) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this2.send('launch', args);
      return _this2._readCapabilities(response);
    })();
  }

  attach(args) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const response = yield _this3.send('attach', args);
      return _this3._readCapabilities(response);
    })();
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

  disconnect(restart = false, force = false) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this4._disconnected && force) {
        _this4._stopServer();
        return;
      }

      if (_this4._serverProcess && !_this4._disconnected) {
        // point of no return: from now on don't report any errors
        _this4._disconnected = true;
        yield _this4.send('disconnect', { restart });
        _this4._stopServer();
      }
    })();
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

  dispatchRequest(request, response) {
    if (request.command === 'runInTerminal') {
      this._logger.error('TODO: runInTerminal', request);
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
      // $FlowFixMe
      body: {
        threadId,
        allThreadsContinued
      },
      seq: 0
    };
    this._onDidContinued.next(event);
    this._onDidEvent.next(event);
  }

  _startServer() {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const { command, args } = _this5._adapterExecutable;
      const options = {
        stdio: ['pipe', // stdin
        'pipe', // stdout
        'pipe'],
        env: Object.assign({}, process.env, {
          // RN debugger can't be used in `production` environment.
          NODE_ENV: 'development'
        })
      };
      const serverProcess = _this5._serverProcess = _child_process.default.spawn(command, args, options);
      // Process and stream errors shouldn't crash the server.
      (0, (_process || _load_process()).preventStreamsFromThrowing)(serverProcess);
      (0, (_process || _load_process()).logStreamErrors)(serverProcess, command, args, options);

      serverProcess.on('error', function (err) {
        return _this5.onServerError(err);
      });
      serverProcess.on('exit', function (code, signal) {
        return _this5.onServerExit(code);
      });

      serverProcess.stderr.on('data', function (data) {
        const event = {
          type: 'event',
          event: 'output',
          body: {
            category: 'stderr',
            output: data.toString()
          },
          seq: 0
        };
        _this5._onDidOutput.next(event);
        _this5._onDidEvent.next(event);
        _this5._logger.error(`adapter stderr: ${data.toString()}`);
      });

      _this5.connect(serverProcess.stdout, serverProcess.stdin);
    })();
  }

  _stopServer() {
    this.onEvent(raiseAdapterExitedEvent(0));
    if (this._serverProcess == null) {
      return;
    }

    this._disconnected = true;
    (0, (_process || _load_process()).killProcess)(this._serverProcess, /* killTree */true);
  }

  onServerError(error) {
    this._logger.error('Adapter error:', error);
    this._stopServer();
  }

  onServerExit(code) {
    this._serverProcess = null;
    this._cachedInitServer = null;
    if (!this._disconnected) {
      this._logger.error(`Debug adapter process has terminated unexpectedly ${code}`);
    }
    this.onEvent(raiseAdapterExitedEvent(code));
  }

  isReadyForBreakpoints() {
    return this._readyForBreakpoints;
  }

  dispose() {
    this.disconnect();
  }
}
exports.default = VsDebugSession;