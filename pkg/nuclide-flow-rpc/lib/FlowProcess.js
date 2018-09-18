"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowProcess = exports.FLOW_RETURN_CODES = void 0;

var _os = _interopRequireDefault(require("os"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _nice() {
  const data = require("../../../modules/nuclide-commons/nice");

  _nice = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _FlowHelpers() {
  const data = require("./FlowHelpers");

  _FlowHelpers = function () {
    return data;
  };

  return data;
}

function _config() {
  const data = require("./config");

  _config = function () {
    return data;
  };

  return data;
}

function _FlowConstants() {
  const data = require("./FlowConstants");

  _FlowConstants = function () {
    return data;
  };

  return data;
}

function _FlowIDEConnection() {
  const data = require("./FlowIDEConnection");

  _FlowIDEConnection = function () {
    return data;
  };

  return data;
}

function _FlowIDEConnectionWatcher() {
  const data = require("./FlowIDEConnectionWatcher");

  _FlowIDEConnectionWatcher = function () {
    return data;
  };

  return data;
}

function _FlowVersion() {
  const data = require("./FlowVersion");

  _FlowVersion = function () {
    return data;
  };

  return data;
}

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
const logger = (0, _log4js().getLogger)('nuclide-flow-rpc');
// Names modeled after https://github.com/facebook/flow/blob/master/src/common/flowExitStatus.ml
const FLOW_RETURN_CODES = {
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
exports.FLOW_RETURN_CODES = FLOW_RETURN_CODES;
const SERVER_READY_TIMEOUT_MS = 60 * 1000;
const EXEC_FLOW_RETRIES = 5;
const NO_RETRY_ARGS = ['--retry-if-init', 'false', '--retries', '0', '--no-auto-start'];
const TEMP_SERVER_STATES = [_FlowConstants().ServerStatus.NOT_RUNNING, _FlowConstants().ServerStatus.BUSY, _FlowConstants().ServerStatus.INIT];

class FlowProcess {
  // If we had to start a Flow server, store the process here so we can kill it when we shut down.
  // The current state of the Flow server in this directory
  // The path to the directory where the .flowconfig is -- i.e. the root of the Flow project.
  // If someone subscribes to _ideConnections, we will also publish them here. But subscribing to
  // this does not actually cause a connection to be created or maintained.
  constructor(root, execInfoContainer, fileCache) {
    this._subscriptions = new (_UniversalDisposable().default)();
    this._execInfoContainer = execInfoContainer;
    this._serverStatus = new _RxMin.BehaviorSubject(_FlowConstants().ServerStatus.UNKNOWN);
    this._root = root;
    this._isDisposed = new _RxMin.BehaviorSubject(false);
    this._fileCache = fileCache;
    this._optionalIDEConnections = new _RxMin.BehaviorSubject(null);
    this._ideConnections = this._createIDEConnectionStream();

    this._serverStatus.subscribe(status => {
      logger.info(`[${status}]: Flow server in ${this._root}`);
    });

    this._serverStatus.filter(x => x === _FlowConstants().ServerStatus.NOT_RUNNING).subscribe(() => {
      this._startFlowServer();
    });

    this._serverStatus.scan(({
      previousState
    }, nextState) => {
      // We should start pinging if we move into a temp state
      const shouldStartPinging = !TEMP_SERVER_STATES.includes(previousState) && TEMP_SERVER_STATES.includes(nextState);
      return {
        shouldStartPinging,
        previousState: nextState
      };
    }, {
      shouldStartPinging: false,
      previousState: _FlowConstants().ServerStatus.UNKNOWN
    }).filter(({
      shouldStartPinging
    }) => shouldStartPinging).subscribe(() => {
      this._pingServer();
    });

    this._serverStatus.filter(status => status === _FlowConstants().ServerStatus.FAILED).subscribe(() => {
      (0, _nuclideAnalytics().track)('flow-server-failed');
    });

    this._version = new (_FlowVersion().FlowVersion)(async () => {
      const execInfo = await execInfoContainer.getFlowExecInfo(root);

      if (!execInfo) {
        return null;
      }

      return execInfo.flowVersion;
    });

    this._serverStatus.filter(state => state === 'not running').subscribe(() => this._version.invalidateVersion());
  }

  dispose() {
    this._serverStatus.complete();

    this._isDisposed.next(true);

    if (this._startedServer && (0, _FlowHelpers().getStopFlowOnExit)()) {
      // The default, SIGTERM, does not reliably kill the flow servers.
      this._startedServer.kill('SIGKILL');
    }

    this._subscriptions.dispose();
  }

  getVersion() {
    return this._version;
  }
  /**
   * If the Flow server fails we will not try to restart it again automatically. Calling this
   * method lets us exit that state and retry.
   */


  allowServerRestart() {
    if (this._serverStatus.getValue() === _FlowConstants().ServerStatus.FAILED) {
      // We intentionally do not use _setServerStatus because leaving the FAILED state is a
      // special-case that _setServerStatus does not allow.
      this._serverStatus.next(_FlowConstants().ServerStatus.UNKNOWN);
    }
  }

  getServerStatusUpdates() {
    return this._serverStatus.asObservable();
  } // It is possible for an IDE connection to die. If there are subscribers to this Observable, it
  // will be automatically restarted and the new one will be sent.
  //
  // If the connection dies, `null` will be sent while the next one is being established.


  getIDEConnections() {
    return this._ideConnections;
  } // This will not cause an IDE connection to be established or maintained, and the return value is
  // not safe to store. If there happens to be an IDE connection it will be returned.


  getCurrentIDEConnection() {
    return this._optionalIDEConnections.getValue();
  }

  _createIDEConnectionStream() {
    this._subscriptions.add(this._optionalIDEConnections.filter(conn => conn != null).switchMap(conn => {
      if (!(conn != null)) {
        throw new Error("Invariant violation: \"conn != null\"");
      }

      return conn.observeRecheckBookends();
    }).subscribe(bookend => {
      if (bookend.kind === 'start-recheck') {
        this._setServerStatus(_FlowConstants().ServerStatus.BUSY);
      } else {
        this._setServerStatus(_FlowConstants().ServerStatus.READY);
      }
    }));

    const isFailed = this._serverStatus.map(x => x === _FlowConstants().ServerStatus.FAILED).distinctUntilChanged(); // When we move from failed to non-failed that means we have been explicitly asked to retry
    // after a Flow server crash. Odds are good that the IDE connection has timed out or is
    // otherwise unhealthy. So, when we transition from failed to non-failed we should also start
    // all IDE connection logic anew.


    const shouldStart = isFailed.filter(failed => !failed).mapTo(undefined);
    return shouldStart.switchMap(() => this._createSingleIDEConnectionStream()).takeUntil(this._isDisposed.filter(x => x)).concat(_RxMin.Observable.of(null)) // This is so we can passively observe IDE connections if somebody happens to be using one. We
    // want to use it to more quickly update the Flow server status, but it's not crucial to
    // correctness so we only want to do this if somebody is using the IDE connections anyway.
    // Don't pass the Subject as an Observer since then it will complete if a client unsubscribes.
    .do(conn => this._optionalIDEConnections.next(conn), () => {
      // If we get an error, set the current ide connection to null
      this._optionalIDEConnections.next(null);
    }, () => {
      // If we get a completion (happens when the downstream client unsubscribes), set the current ide connection to null.
      this._optionalIDEConnections.next(null);
    }) // multicast and store the current connection and immediately deliver it to new subscribers
    .publishReplay(1).refCount();
  }

  _createSingleIDEConnectionStream() {
    logger.info('Creating Flow IDE connection stream');
    let connectionWatcher = null;
    return _RxMin.Observable.fromEventPattern( // Called when the observable is subscribed to
    handler => {
      logger.info('Got a subscriber for the Flow IDE connection stream');

      if (!(connectionWatcher == null)) {
        throw new Error("Invariant violation: \"connectionWatcher == null\"");
      }

      connectionWatcher = new (_FlowIDEConnectionWatcher().FlowIDEConnectionWatcher)(this._tryCreateIDEProcess(), this._fileCache, handler);
      connectionWatcher.start();
    }, // Called when the observable is unsubscribed from
    () => {
      logger.info('No more IDE connection stream subscribers -- shutting down connection watcher');

      if (!(connectionWatcher != null)) {
        throw new Error("Invariant violation: \"connectionWatcher != null\"");
      }

      connectionWatcher.dispose();
      connectionWatcher = null;
    });
  }

  _tryCreateIDEProcess() {
    return _RxMin.Observable.defer(() => this._serverIsReady()).switchMap(serverIsReady => {
      if (!serverIsReady) {
        return _RxMin.Observable.of(null);
      }

      return this.getVersion().satisfies('>=0.66.0').then(supportsFriendlyStatusError => {
        const jsonFlag = supportsFriendlyStatusError ? ['--json-version', '2'] : [];
        return getAllExecInfo(['ide', '--protocol', 'very-unstable', ...jsonFlag, ...NO_RETRY_ARGS], this._root, this._execInfoContainer);
      });
    }).switchMap(allExecInfo => {
      if (allExecInfo == null) {
        return _RxMin.Observable.of(null);
      }

      return (0, _process().spawn)(allExecInfo.pathToFlow, allExecInfo.args, allExecInfo.options).do(proc => {
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


  async execFlow(args, options, waitForServer = false, suppressErrors = false) {
    const maxRetries = waitForServer ? EXEC_FLOW_RETRIES : 0;

    if (this._serverStatus.getValue() === _FlowConstants().ServerStatus.FAILED) {
      return null;
    }

    for (let i = 0;; i++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await this._rawExecFlow(args, options);
        return result;
      } catch (e) {
        const couldRetry = [_FlowConstants().ServerStatus.NOT_RUNNING, _FlowConstants().ServerStatus.INIT, _FlowConstants().ServerStatus.BUSY].indexOf(this._serverStatus.getValue()) !== -1;

        if (i < maxRetries && couldRetry) {
          // eslint-disable-next-line no-await-in-loop
          await this._serverIsReady(); // Then try again.
        } else {
          // If it couldn't retry, it means there was a legitimate error. If it could retry, we
          // don't want to log because it just means the server is busy and we don't want to wait.
          if (!couldRetry && !suppressErrors) {
            // not sure what happened, but we'll let the caller deal with it
            logger.error(`Flow failed: flow ${args.join(' ')}. Error: ${JSON.stringify(e)}`);
          }

          throw e;
        } // try again

      }
    }
  }
  /** Starts a Flow server in the current root */


  async _startFlowServer() {
    // If the server is restarting because of a change in the version specified in the .flowconfig,
    // then it's important not to use a stale path to start it, since we could have cached the path
    // to a different version. In that case, starting the server will fail.
    const flowExecInfo = await this._execInfoContainer.reallyGetFlowExecInfo(this._root);

    if (flowExecInfo == null) {
      // This should not happen in normal use. If Flow is not installed we should have caught it by
      // now.
      logger.error(`Could not find Flow to start server in ${this._root}`);

      this._setServerStatus(_FlowConstants().ServerStatus.NOT_INSTALLED);

      return;
    }

    const lazy = (0, _config().getConfig)('lazyMode') === true ? ['--lazy-mode', 'ide'] : []; // `flow server` will start a server in the foreground. runCommand/runCommandDetailed
    // will not resolve the promise until the process exits, which in this
    // case is never. We need to use spawn directly to get access to the
    // ChildProcess object.
    // eslint-disable-next-line no-await-in-loop

    const serverProcess = await (0, _nice().niceSafeSpawn)(flowExecInfo.pathToFlow, ['server', ...lazy, '--from', 'nuclide', '--max-workers', this._getMaxWorkers().toString(), this._root], flowExecInfo.execOptions);

    const logIt = data => {
      const pid = serverProcess.pid;
      logger.debug(`flow server (${pid}): ${data}`);
    };

    serverProcess.stdout.on('data', logIt);
    serverProcess.stderr.on('data', logIt);
    serverProcess.on('exit', (code, signal) => {
      // We only want to blacklist this root if the Flow processes
      // actually failed, rather than being killed manually. It seems that
      // if they are killed, the code is null and the signal is 'SIGTERM'.
      // In the Flow crashes I have observed, the code is 2 and the signal
      // is null. So, let's blacklist conservatively for now and we can
      // add cases later if we observe Flow crashes that do not fit this
      // pattern.
      // eslint-disable-next-line eqeqeq
      if (code === 2 && signal === null) {
        logger.error('Flow server unexpectedly exited', this._root);

        this._setServerStatus(_FlowConstants().ServerStatus.FAILED);
      }
    });
    this._startedServer = serverProcess;
  }
  /** Execute Flow with the given arguments */


  async _rawExecFlow(args_, options = {}) {
    let args = args_;
    args = [...args, ...NO_RETRY_ARGS];

    try {
      const result = await FlowProcess.execFlowClient(args, this._root, this._execInfoContainer, options);

      this._updateServerStatus(result != null ? result.exitCode : null);

      return result;
    } catch (e) {
      this._updateServerStatus(e != null ? e.exitCode : null);

      if (e.exitCode === FLOW_RETURN_CODES.typeError) {
        return e;
      } else {
        throw e;
      }
    }
  }

  _updateServerStatus(exitCode) {
    let status;

    if (exitCode == null) {
      status = _FlowConstants().ServerStatus.NOT_INSTALLED;
    } else {
      switch (exitCode) {
        case FLOW_RETURN_CODES.ok: // falls through

        case FLOW_RETURN_CODES.typeError:
          status = _FlowConstants().ServerStatus.READY;
          break;

        case FLOW_RETURN_CODES.serverInitializing:
          status = _FlowConstants().ServerStatus.INIT;
          break;

        case FLOW_RETURN_CODES.noServerRunning:
          status = _FlowConstants().ServerStatus.NOT_RUNNING;
          break;

        case FLOW_RETURN_CODES.outOfRetries:
          status = _FlowConstants().ServerStatus.BUSY;
          break;

        case FLOW_RETURN_CODES.buildIdMismatch:
          // If the version doesn't match, the server is automatically killed and the client
          // returns 9.
          logger.info('Killed flow server with incorrect version in', this._root);
          status = _FlowConstants().ServerStatus.NOT_RUNNING;
          break;

        case FLOW_RETURN_CODES.unexpectedArgument:
          // If we issued an unexpected argument we have learned nothing about the state of the Flow
          // server. So, don't update.
          return;

        default:
          logger.error(`Unknown return code from Flow: ${String(exitCode)}`);
          status = _FlowConstants().ServerStatus.UNKNOWN;
      }
    }

    this._setServerStatus(status);
  }

  _setServerStatus(status) {
    const currentStatus = this._serverStatus.getValue();

    if ( // Avoid duplicate updates
    status !== currentStatus && // Avoid moving the status away from FAILED, to let any existing  work die out when the
    // server fails.
    currentStatus !== _FlowConstants().ServerStatus.FAILED) {
      this._serverStatus.next(status);
    }

    if (this._isDisposed.getValue()) {
      logger.error('Attempted to update server status after disposal');
    }
  }
  /** Ping the server until it reaches a steady state */


  async _pingServer() {
    let hasReachedSteadyState = false;

    this._serverStatus.filter(state => !TEMP_SERVER_STATES.includes(state)).take(1).subscribe(() => {
      hasReachedSteadyState = true;
    });

    while (!hasReachedSteadyState && !this._isDisposed.getValue()) {
      // eslint-disable-next-line no-await-in-loop
      await this._pingServerOnce(); // Wait 1 second
      // eslint-disable-next-line no-await-in-loop

      await (0, _promise().sleep)(1000);
    }
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
    if (this._serverStatus.getValue() === _FlowConstants().ServerStatus.UNKNOWN) {
      this._pingServerOnce();
    }

    return this._serverStatus.filter(x => x === _FlowConstants().ServerStatus.READY).map(() => true).race(_RxMin.Observable.of(false).delay(SERVER_READY_TIMEOUT_MS)) // If the stream is completed timeout will not return its default value and we will see an
    // EmptyError. So, provide a defaultValue here so the promise resolves.
    .first(null, null, false).toPromise();
  }

  _getMaxWorkers() {
    const cpus = _os.default.cpus();

    return cpus ? Math.max(cpus.length - 2, 1) : 1;
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


  static async execFlowClient(args, root, execInfoContainer, options = {}) {
    const allExecInfo = await getAllExecInfo(args, root, execInfoContainer, options);

    if (allExecInfo == null) {
      return null;
    } // TODO: bubble up the exit code via return value instead of the error


    return (0, _process().runCommandDetailed)(allExecInfo.pathToFlow, allExecInfo.args, allExecInfo.options).toPromise();
  }

}

exports.FlowProcess = FlowProcess;

async function getAllExecInfo(args, root, execInfoContainer, options = {}) {
  const execInfo = await execInfoContainer.getFlowExecInfo(root);

  if (execInfo == null) {
    return null;
  }

  return {
    args: [...args, '--from', 'nuclide'],
    options: Object.assign({}, execInfo.execOptions, options),
    pathToFlow: execInfo.pathToFlow
  };
}