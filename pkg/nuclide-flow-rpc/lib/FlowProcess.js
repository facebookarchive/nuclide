'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowProcess = exports.FLOW_RETURN_CODES = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getAllExecInfo = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (args, root, execInfoContainer, options = {}) {
    const execInfo = yield execInfoContainer.getFlowExecInfo(root);
    if (execInfo == null) {
      return null;
    }
    return {
      args: [...args, '--from', 'nuclide'],
      options: Object.assign({}, execInfo.execOptions, options),
      pathToFlow: execInfo.pathToFlow
    };
  });

  return function getAllExecInfo(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

var _os = _interopRequireDefault(require('os'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _nice;

function _load_nice() {
  return _nice = require('nuclide-commons/nice');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _FlowHelpers;

function _load_FlowHelpers() {
  return _FlowHelpers = require('./FlowHelpers');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _FlowConstants;

function _load_FlowConstants() {
  return _FlowConstants = require('./FlowConstants');
}

var _FlowIDEConnection;

function _load_FlowIDEConnection() {
  return _FlowIDEConnection = require('./FlowIDEConnection');
}

var _FlowIDEConnectionWatcher;

function _load_FlowIDEConnectionWatcher() {
  return _FlowIDEConnectionWatcher = require('./FlowIDEConnectionWatcher');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow-rpc'); /**
                                                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                                                * All rights reserved.
                                                                                *
                                                                                * This source code is licensed under the license found in the LICENSE file in
                                                                                * the root directory of this source tree.
                                                                                *
                                                                                * 
                                                                                * @format
                                                                                */

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

const SERVER_READY_TIMEOUT_MS = 60 * 1000;

const EXEC_FLOW_RETRIES = 5;

const NO_RETRY_ARGS = ['--retry-if-init', 'false', '--retries', '0', '--no-auto-start'];

const TEMP_SERVER_STATES = [(_FlowConstants || _load_FlowConstants()).ServerStatus.NOT_RUNNING, (_FlowConstants || _load_FlowConstants()).ServerStatus.BUSY, (_FlowConstants || _load_FlowConstants()).ServerStatus.INIT];

class FlowProcess {

  // If someone subscribes to _ideConnections, we will also publish them here. But subscribing to
  // this does not actually cause a connection to be created or maintained.

  // The current state of the Flow server in this directory
  constructor(root, execInfoContainer, fileCache) {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._execInfoContainer = execInfoContainer;
    this._serverStatus = new _rxjsBundlesRxMinJs.BehaviorSubject((_FlowConstants || _load_FlowConstants()).ServerStatus.UNKNOWN);
    this._root = root;
    this._isDisposed = new _rxjsBundlesRxMinJs.BehaviorSubject(false);
    this._fileCache = fileCache;

    this._optionalIDEConnections = new _rxjsBundlesRxMinJs.BehaviorSubject(null);
    this._ideConnections = this._createIDEConnectionStream();

    this._serverStatus.subscribe(status => {
      logger.info(`[${status}]: Flow server in ${this._root}`);
    });

    this._serverStatus.filter(x => x === (_FlowConstants || _load_FlowConstants()).ServerStatus.NOT_RUNNING).subscribe(() => {
      this._startFlowServer();
    });

    this._serverStatus.scan(({ previousState }, nextState) => {
      // We should start pinging if we move into a temp state
      const shouldStartPinging = !TEMP_SERVER_STATES.includes(previousState) && TEMP_SERVER_STATES.includes(nextState);
      return {
        shouldStartPinging,
        previousState: nextState
      };
    }, { shouldStartPinging: false, previousState: (_FlowConstants || _load_FlowConstants()).ServerStatus.UNKNOWN }).filter(({ shouldStartPinging }) => shouldStartPinging).subscribe(() => {
      this._pingServer();
    });

    this._serverStatus.filter(status => status === (_FlowConstants || _load_FlowConstants()).ServerStatus.FAILED).subscribe(() => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('flow-server-failed');
    });
  }
  // The path to the directory where the .flowconfig is -- i.e. the root of the Flow project.

  // If we had to start a Flow server, store the process here so we can kill it when we shut down.


  dispose() {
    this._serverStatus.complete();
    this._isDisposed.next(true);
    if (this._startedServer && (0, (_FlowHelpers || _load_FlowHelpers()).getStopFlowOnExit)()) {
      // The default, SIGTERM, does not reliably kill the flow servers.
      this._startedServer.kill('SIGKILL');
    }
    this._subscriptions.dispose();
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

  // It is possible for an IDE connection to die. If there are subscribers to this Observable, it
  // will be automatically restarted and the new one will be sent.
  //
  // If the connection dies, `null` will be sent while the next one is being established.
  getIDEConnections() {
    return this._ideConnections;
  }

  // This will not cause an IDE connection to be established or maintained, and the return value is
  // not safe to store. If there happens to be an IDE connection it will be returned.
  getCurrentIDEConnection() {
    return this._optionalIDEConnections.getValue();
  }

  _createIDEConnectionStream() {
    this._subscriptions.add(this._optionalIDEConnections.filter(conn => conn != null).switchMap(conn => {
      if (!(conn != null)) {
        throw new Error('Invariant violation: "conn != null"');
      }

      return conn.observeRecheckBookends();
    }).subscribe(bookend => {
      if (bookend.kind === 'start-recheck') {
        this._setServerStatus((_FlowConstants || _load_FlowConstants()).ServerStatus.BUSY);
      } else {
        this._setServerStatus((_FlowConstants || _load_FlowConstants()).ServerStatus.READY);
      }
    }));

    const isFailed = this._serverStatus.map(x => x === (_FlowConstants || _load_FlowConstants()).ServerStatus.FAILED).distinctUntilChanged();
    // When we move from failed to non-failed that means we have been explicitly asked to retry
    // after a Flow server crash. Odds are good that the IDE connection has timed out or is
    // otherwise unhealthy. So, when we transition from failed to non-failed we should also start
    // all IDE connection logic anew.
    const shouldStart = isFailed.filter(failed => !failed).mapTo(undefined);
    return shouldStart.switchMap(() => this._createSingleIDEConnectionStream()).takeUntil(this._isDisposed.filter(x => x)).concat(_rxjsBundlesRxMinJs.Observable.of(null))
    // This is so we can passively observe IDE connections if somebody happens to be using one. We
    // want to use it to more quickly update the Flow server status, but it's not crucial to
    // correctness so we only want to do this if somebody is using the IDE connections anyway.
    // Don't pass the Subject as an Observer since then it will complete if a client unsubscribes.
    .do(conn => this._optionalIDEConnections.next(conn), () => {
      // If we get an error, set the current ide connection to null
      this._optionalIDEConnections.next(null);
    }, () => {
      // If we get a completion (happens when the downstream client unsubscribes), set the current ide connection to null.
      this._optionalIDEConnections.next(null);
    })
    // multicast and store the current connection and immediately deliver it to new subscribers
    .publishReplay(1).refCount();
  }

  _createSingleIDEConnectionStream() {
    logger.info('Creating Flow IDE connection stream');
    let connectionWatcher = null;
    return _rxjsBundlesRxMinJs.Observable.fromEventPattern(
    // Called when the observable is subscribed to
    handler => {
      logger.info('Got a subscriber for the Flow IDE connection stream');

      if (!(connectionWatcher == null)) {
        throw new Error('Invariant violation: "connectionWatcher == null"');
      }

      connectionWatcher = new (_FlowIDEConnectionWatcher || _load_FlowIDEConnectionWatcher()).FlowIDEConnectionWatcher(this._tryCreateIDEProcess(), this._fileCache, handler);
      connectionWatcher.start();
    },
    // Called when the observable is unsubscribed from
    () => {
      logger.info('No more IDE connection stream subscribers -- shutting down connection watcher');

      if (!(connectionWatcher != null)) {
        throw new Error('Invariant violation: "connectionWatcher != null"');
      }

      connectionWatcher.dispose();
      connectionWatcher = null;
    });
  }

  _tryCreateIDEProcess() {
    return _rxjsBundlesRxMinJs.Observable.defer(() => this._serverIsReady()).switchMap(serverIsReady => {
      if (!serverIsReady) {
        return _rxjsBundlesRxMinJs.Observable.of(null);
      }
      return getAllExecInfo(['ide', '--protocol', 'very-unstable', ...NO_RETRY_ARGS], this._root, this._execInfoContainer);
    }).switchMap(allExecInfo => {
      if (allExecInfo == null) {
        return _rxjsBundlesRxMinJs.Observable.of(null);
      }

      return (0, (_process || _load_process()).spawn)(allExecInfo.pathToFlow, allExecInfo.args, allExecInfo.options).do(proc => {
        proc.once('exit', (code, signal) => {
          // If it crashes we will get `null` or `undefined`, but that doesn't actually mean
          // that Flow is not installed.
          if (code != null) {
            this._updateServerStatus(code);
          }
        });
      });
    });
  }

  /**
   * Returns null if Flow cannot be found.
   */
  execFlow(args, options, waitForServer = false, suppressErrors = false) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const maxRetries = waitForServer ? EXEC_FLOW_RETRIES : 0;
      if (_this._serverStatus.getValue() === (_FlowConstants || _load_FlowConstants()).ServerStatus.FAILED) {
        return null;
      }
      for (let i = 0;; i++) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const result = yield _this._rawExecFlow(args, options);
          return result;
        } catch (e) {
          const couldRetry = [(_FlowConstants || _load_FlowConstants()).ServerStatus.NOT_RUNNING, (_FlowConstants || _load_FlowConstants()).ServerStatus.INIT, (_FlowConstants || _load_FlowConstants()).ServerStatus.BUSY].indexOf(_this._serverStatus.getValue()) !== -1;
          if (i < maxRetries && couldRetry) {
            // eslint-disable-next-line no-await-in-loop
            yield _this._serverIsReady();
            // Then try again.
          } else {
            // If it couldn't retry, it means there was a legitimate error. If it could retry, we
            // don't want to log because it just means the server is busy and we don't want to wait.
            if (!couldRetry && !suppressErrors) {
              // not sure what happened, but we'll let the caller deal with it
              logger.error(`Flow failed: flow ${args.join(' ')}. Error: ${JSON.stringify(e)}`);
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
      // If the server is restarting because of a change in the version specified in the .flowconfig,
      // then it's important not to use a stale path to start it, since we could have cached the path
      // to a different version. In that case, starting the server will fail.
      const flowExecInfo = yield _this2._execInfoContainer.reallyGetFlowExecInfo(_this2._root);
      if (flowExecInfo == null) {
        // This should not happen in normal use. If Flow is not installed we should have caught it by
        // now.
        logger.error(`Could not find Flow to start server in ${_this2._root}`);
        _this2._setServerStatus((_FlowConstants || _load_FlowConstants()).ServerStatus.NOT_INSTALLED);
        return;
      }
      const lazy = [];
      if ((0, (_config || _load_config()).getConfig)('lazyServer')) {
        lazy.push('--lazy');
      }
      // `flow server` will start a server in the foreground. runCommand/runCommandDetailed
      // will not resolve the promise until the process exits, which in this
      // case is never. We need to use spawn directly to get access to the
      // ChildProcess object.
      // eslint-disable-next-line no-await-in-loop
      const serverProcess = yield (0, (_nice || _load_nice()).niceSafeSpawn)(flowExecInfo.pathToFlow, ['server', ...lazy, '--from', 'nuclide', '--max-workers', _this2._getMaxWorkers().toString(), _this2._root], flowExecInfo.execOptions);
      const logIt = function (data) {
        const pid = serverProcess.pid;
        logger.debug(`flow server (${pid}): ${data}`);
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
  _rawExecFlow(args_, options = {}) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let args = args_;
      args = [...args, ...NO_RETRY_ARGS];
      try {
        const result = yield FlowProcess.execFlowClient(args, _this3._root, _this3._execInfoContainer, options);
        _this3._updateServerStatus(result != null ? result.exitCode : null);
        return result;
      } catch (e) {
        _this3._updateServerStatus(e != null ? e.exitCode : null);
        if (e.exitCode === FLOW_RETURN_CODES.typeError) {
          return e;
        } else {
          throw e;
        }
      }
    })();
  }

  _updateServerStatus(exitCode) {
    let status;
    if (exitCode == null) {
      status = (_FlowConstants || _load_FlowConstants()).ServerStatus.NOT_INSTALLED;
    } else {
      switch (exitCode) {
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
          logger.error(`Unknown return code from Flow: ${String(exitCode)}`);
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
    if (this._isDisposed.getValue()) {
      logger.error('Attempted to update server status after disposal');
    }
  }

  /** Ping the server until it reaches a steady state */
  _pingServer() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let hasReachedSteadyState = false;
      _this4._serverStatus.filter(function (state) {
        return !TEMP_SERVER_STATES.includes(state);
      }).take(1).subscribe(function () {
        hasReachedSteadyState = true;
      });
      while (!hasReachedSteadyState && !_this4._isDisposed.getValue()) {
        // eslint-disable-next-line no-await-in-loop
        yield _this4._pingServerOnce();
        // Wait 1 second
        // eslint-disable-next-line no-await-in-loop
        yield (0, (_promise || _load_promise()).sleep)(1000);
      }
    })();
  }

  _pingServerOnce() {
    return this._rawExecFlow(['status']).catch(() => {}).then(() => {});
  }

  /**
   * Resolves when the server is ready or the request times out, as indicated by the result of the
   * returned Promise.
   */
  _serverIsReady() {
    // If the server state is unknown, nobody has tried to do anything flow-related yet. However,
    // the call to _serverIsReady() implies that somebody wants to. So, kick off a Flow server ping
    // which will learn the state of the Flow server and start it up if needed.
    if (this._serverStatus.getValue() === (_FlowConstants || _load_FlowConstants()).ServerStatus.UNKNOWN) {
      this._pingServerOnce();
    }
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
  static execFlowClient(args, root, execInfoContainer, options = {}) {
    return (0, _asyncToGenerator.default)(function* () {
      const allExecInfo = yield getAllExecInfo(args, root, execInfoContainer, options);
      if (allExecInfo == null) {
        return null;
      }

      // TODO: bubble up the exit code via return value instead of the error
      return (0, (_process || _load_process()).runCommandDetailed)(allExecInfo.pathToFlow, allExecInfo.args, allExecInfo.options).toPromise();
    })();
  }
}

exports.FlowProcess = FlowProcess;