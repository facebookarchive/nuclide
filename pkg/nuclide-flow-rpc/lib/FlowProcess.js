'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowProcess = exports.FLOW_RETURN_CODES = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _os = _interopRequireDefault(require('os'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _nice;

function _load_nice() {
  return _nice = require('../../commons-node/nice');
}

var _FlowHelpers;

function _load_FlowHelpers() {
  return _FlowHelpers = require('./FlowHelpers');
}

var _FlowConstants;

function _load_FlowConstants() {
  return _FlowConstants = require('./FlowConstants');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

// Names modeled after https://github.com/facebook/flow/blob/master/src/common/flowExitStatus.ml
const FLOW_RETURN_CODES = exports.FLOW_RETURN_CODES = {
  ok: 0,
  serverInitializing: 1,
  typeError: 2,
  noServerRunning: 6,
  // This means that the server exists, but it is not responding, typically because it is busy doing
  // other work.
  outOfRetries: 7,
  buildIdMismatch: 9,
  unexpectedArgument: 64
};

const SERVER_READY_TIMEOUT_MS = 10 * 1000;

const EXEC_FLOW_RETRIES = 5;

let FlowProcess = exports.FlowProcess = class FlowProcess {
  // The path to the directory where the .flowconfig is -- i.e. the root of the Flow project.

  // If we had to start a Flow server, store the process here so we can kill it when we shut down.
  constructor(root, execInfoContainer) {
    this._execInfoContainer = execInfoContainer;
    this._serverStatus = new _rxjsBundlesRxMinJs.BehaviorSubject((_FlowConstants || _load_FlowConstants()).ServerStatus.UNKNOWN);
    this._root = root;

    this._serverStatus.subscribe(status => {
      logger.info(`[${ status }]: Flow server in ${ this._root }`);
    });

    this._serverStatus.filter(x => x === (_FlowConstants || _load_FlowConstants()).ServerStatus.NOT_RUNNING).subscribe(() => {
      this._startFlowServer();
      this._pingServer();
    });
    function isBusyOrInit(status) {
      return status === (_FlowConstants || _load_FlowConstants()).ServerStatus.BUSY || status === (_FlowConstants || _load_FlowConstants()).ServerStatus.INIT;
    }
    this._serverStatus.filter(isBusyOrInit).subscribe(() => {
      this._pingServer();
    });

    this._serverStatus.filter(status => status === (_FlowConstants || _load_FlowConstants()).ServerStatus.FAILED).subscribe(() => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('flow-server-failed');
    });
  }
  // The current state of the Flow server in this directory


  dispose() {
    this._serverStatus.complete();
    if (this._startedServer && (0, (_FlowHelpers || _load_FlowHelpers()).getStopFlowOnExit)()) {
      // The default, SIGTERM, does not reliably kill the flow servers.
      this._startedServer.kill('SIGKILL');
    }
  }

  /**
   * If the Flow server fails we will not try to restart it again automatically. Calling this
   * method lets us exit that state and retry.
   */
  allowServerRestart() {
    if (this._serverStatus.getValue() === (_FlowConstants || _load_FlowConstants()).ServerStatus.FAILED) {
      // We intentionally do not use _setServerStatus because leaving the FAILED state is a
      // special-case that _setServerStatus does not allow.
      this._serverStatus.next((_FlowConstants || _load_FlowConstants()).ServerStatus.UNKNOWN);
    }
  }

  getServerStatusUpdates() {
    return this._serverStatus.asObservable();
  }

  /**
   * Returns null if Flow cannot be found.
   */
  execFlow(args, options) {
    var _arguments = arguments,
        _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      let waitForServer = _arguments.length > 2 && _arguments[2] !== undefined ? _arguments[2] : false;
      let suppressErrors = _arguments.length > 3 && _arguments[3] !== undefined ? _arguments[3] : false;

      const maxRetries = waitForServer ? EXEC_FLOW_RETRIES : 0;
      if (_this._serverStatus.getValue() === (_FlowConstants || _load_FlowConstants()).ServerStatus.FAILED) {
        return null;
      }
      for (let i = 0;; i++) {
        try {
          // eslint-disable-next-line babel/no-await-in-loop
          const result = yield _this._rawExecFlow(args, options);
          return result;
        } catch (e) {
          const couldRetry = [(_FlowConstants || _load_FlowConstants()).ServerStatus.NOT_RUNNING, (_FlowConstants || _load_FlowConstants()).ServerStatus.INIT, (_FlowConstants || _load_FlowConstants()).ServerStatus.BUSY].indexOf(_this._serverStatus.getValue()) !== -1;
          if (i < maxRetries && couldRetry) {
            // eslint-disable-next-line babel/no-await-in-loop
            yield _this._serverIsReady();
            // Then try again.
          } else {
            // If it couldn't retry, it means there was a legitimate error. If it could retry, we
            // don't want to log because it just means the server is busy and we don't want to wait.
            if (!couldRetry && !suppressErrors) {
              // not sure what happened, but we'll let the caller deal with it
              logger.error(`Flow failed: flow ${ args.join(' ') }. Error: ${ JSON.stringify(e) }`);
            }
            throw e;
          }
          // try again
        }
      }
    })();
  }

  /** Starts a Flow server in the current root */
  _startFlowServer() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const flowExecInfo = yield _this2._execInfoContainer.getFlowExecInfo(_this2._root);
      if (flowExecInfo == null) {
        // This should not happen in normal use. If Flow is not installed we should have caught it by
        // now.
        logger.error(`Could not find Flow to start server in ${ _this2._root }`);
        _this2._setServerStatus((_FlowConstants || _load_FlowConstants()).ServerStatus.NOT_INSTALLED);
        return;
      }
      // `flow server` will start a server in the foreground. asyncExecute
      // will not resolve the promise until the process exits, which in this
      // case is never. We need to use spawn directly to get access to the
      // ChildProcess object.
      // eslint-disable-next-line babel/no-await-in-loop
      const serverProcess = yield (0, (_nice || _load_nice()).niceSafeSpawn)(flowExecInfo.pathToFlow, ['server', '--from', 'nuclide', '--max-workers', _this2._getMaxWorkers().toString(), _this2._root], flowExecInfo.execOptions);
      const logIt = function (data) {
        const pid = serverProcess.pid;
        logger.debug(`flow server (${ pid }): ${ data }`);
      };
      serverProcess.stdout.on('data', logIt);
      serverProcess.stderr.on('data', logIt);
      serverProcess.on('exit', function (code, signal) {
        // We only want to blacklist this root if the Flow processes
        // actually failed, rather than being killed manually. It seems that
        // if they are killed, the code is null and the signal is 'SIGTERM'.
        // In the Flow crashes I have observed, the code is 2 and the signal
        // is null. So, let's blacklist conservatively for now and we can
        // add cases later if we observe Flow crashes that do not fit this
        // pattern.
        if (code === 2 && signal === null) {
          logger.error('Flow server unexpectedly exited', _this2._root);
          _this2._setServerStatus((_FlowConstants || _load_FlowConstants()).ServerStatus.FAILED);
        }
      });
      _this2._startedServer = serverProcess;
    })();
  }

  /** Execute Flow with the given arguments */
  _rawExecFlow(args_) {
    var _arguments2 = arguments,
        _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let options = _arguments2.length > 1 && _arguments2[1] !== undefined ? _arguments2[1] : {};

      let args = args_;
      args = [...args, '--retry-if-init', 'false', '--retries', '0', '--no-auto-start'];
      try {
        const result = yield FlowProcess.execFlowClient(args, _this3._root, _this3._execInfoContainer, options);
        _this3._updateServerStatus(result);
        return result;
      } catch (e) {
        _this3._updateServerStatus(e);
        if (e.exitCode === FLOW_RETURN_CODES.typeError) {
          return e;
        } else {
          throw e;
        }
      }
    })();
  }

  _updateServerStatus(result) {
    let status;
    if (result == null) {
      status = (_FlowConstants || _load_FlowConstants()).ServerStatus.NOT_INSTALLED;
    } else {
      switch (result.exitCode) {
        case FLOW_RETURN_CODES.ok:
        // falls through
        case FLOW_RETURN_CODES.typeError:
          status = (_FlowConstants || _load_FlowConstants()).ServerStatus.READY;
          break;
        case FLOW_RETURN_CODES.serverInitializing:
          status = (_FlowConstants || _load_FlowConstants()).ServerStatus.INIT;
          break;
        case FLOW_RETURN_CODES.noServerRunning:
          status = (_FlowConstants || _load_FlowConstants()).ServerStatus.NOT_RUNNING;
          break;
        case FLOW_RETURN_CODES.outOfRetries:
          status = (_FlowConstants || _load_FlowConstants()).ServerStatus.BUSY;
          break;
        case FLOW_RETURN_CODES.buildIdMismatch:
          // If the version doesn't match, the server is automatically killed and the client
          // returns 9.
          logger.info('Killed flow server with incorrect version in', this._root);
          status = (_FlowConstants || _load_FlowConstants()).ServerStatus.NOT_RUNNING;
          break;
        case FLOW_RETURN_CODES.unexpectedArgument:
          // If we issued an unexpected argument we have learned nothing about the state of the Flow
          // server. So, don't update.
          return;
        default:
          logger.error(`Unknown return code from Flow: ${ String(result.exitCode) }`);
          status = (_FlowConstants || _load_FlowConstants()).ServerStatus.UNKNOWN;
      }
    }
    this._setServerStatus(status);
  }

  _setServerStatus(status) {
    const currentStatus = this._serverStatus.getValue();
    if (
    // Avoid duplicate updates
    status !== currentStatus &&
    // Avoid moving the status away from FAILED, to let any existing  work die out when the
    // server fails.
    currentStatus !== (_FlowConstants || _load_FlowConstants()).ServerStatus.FAILED) {
      this._serverStatus.next(status);
    }
  }

  /** Ping the server until it leaves the current state */
  _pingServer() {
    var _arguments3 = arguments,
        _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let tries = _arguments3.length > 0 && _arguments3[0] !== undefined ? _arguments3[0] : 5;

      const fromState = _this4._serverStatus.getValue();
      let stateChanged = false;
      _this4._serverStatus.filter(function (newState) {
        return newState !== fromState;
      }).take(1).subscribe(function () {
        stateChanged = true;
      });
      for (let i = 0; !stateChanged && i < tries; i++) {
        // eslint-disable-next-line babel/no-await-in-loop
        yield _this4._rawExecFlow(['status']).catch(function () {
          return null;
        });
        // Wait 1 second
        // eslint-disable-next-line babel/no-await-in-loop
        yield _rxjsBundlesRxMinJs.Observable.of(null).delay(1000).toPromise();
      }
    })();
  }

  /**
   * Resolves when the server is ready or the request times out, as indicated by the result of the
   * returned Promise.
   */
  _serverIsReady() {
    return this._serverStatus.filter(x => x === (_FlowConstants || _load_FlowConstants()).ServerStatus.READY).map(() => true).race(_rxjsBundlesRxMinJs.Observable.of(false).delay(SERVER_READY_TIMEOUT_MS))
    // If the stream is completed timeout will not return its default value and we will see an
    // EmptyError. So, provide a defaultValue here so the promise resolves.
    .first(null, null, false).toPromise();
  }

  _getMaxWorkers() {
    return Math.max(_os.default.cpus().length - 2, 1);
  }

  /**
   * This should be used to execute Flow commands that do not rely on a Flow server. So, they do not
   * need to be associated with a FlowProcess instance and they may be executed from any working
   * directory.
   *
   * Note that using this method means that you get no guarantee that the Flow version specified in
   * any given .flowconfig is the one that will be executed here, because it has no association with
   * any given root. If you need this property, create an instance with the appropriate root and use
   * execFlow.
   */
  static execFlowClient(args_, root, execInfoContainer) {
    var _arguments4 = arguments;
    return (0, _asyncToGenerator.default)(function* () {
      let options_ = _arguments4.length > 3 && _arguments4[3] !== undefined ? _arguments4[3] : {};

      let args = args_;
      let options = options_;
      args = [...args, '--from', 'nuclide'];
      const execInfo = yield execInfoContainer.getFlowExecInfo(root);
      if (execInfo == null) {
        return null;
      }
      options = Object.assign({}, execInfo.execOptions, options);
      const ret = yield (0, (_process || _load_process()).asyncExecute)(execInfo.pathToFlow, args, options);
      if (ret.exitCode !== 0) {
        // TODO: bubble up the exit code via return value instead
        throw ret;
      }
      return ret;
    })();
  }
};