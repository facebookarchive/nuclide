Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _rxjs = require('rxjs');

var _nuclideLogging = require('../../nuclide-logging');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideCommons = require('../../nuclide-commons');

var _FlowHelpers = require('./FlowHelpers');

var _FlowConstants = require('./FlowConstants');

// Names modeled after https://github.com/facebook/flow/blob/master/src/common/flowExitStatus.ml

var logger = (0, _nuclideLogging.getLogger)();

var FLOW_RETURN_CODES = {
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
var SERVER_READY_TIMEOUT_MS = 10 * 1000;

var EXEC_FLOW_RETRIES = 5;

var FlowProcess = (function () {
  function FlowProcess(root) {
    var _this = this;

    _classCallCheck(this, FlowProcess);

    this._serverStatus = new _rxjs.BehaviorSubject(_FlowConstants.ServerStatus.UNKNOWN);
    this._root = root;

    this._serverStatus.filter(function (x) {
      return x === _FlowConstants.ServerStatus.NOT_RUNNING;
    }).subscribe(function () {
      _this._startFlowServer();
      _this._pingServer();
    });
    function isBusyOrInit(status) {
      return status === _FlowConstants.ServerStatus.BUSY || status === _FlowConstants.ServerStatus.INIT;
    }
    this._serverStatus.filter(isBusyOrInit).subscribe(function () {
      _this._pingServer();
    });

    this._serverStatus.filter(function (status) {
      return status === _FlowConstants.ServerStatus.FAILED;
    }).subscribe(function () {
      (0, _nuclideAnalytics.track)('flow-server-failed');
    });
  }

  _createClass(FlowProcess, [{
    key: 'dispose',
    value: function dispose() {
      this._serverStatus.complete();
      if (this._startedServer && (0, _FlowHelpers.getStopFlowOnExit)()) {
        // The default, SIGTERM, does not reliably kill the flow servers.
        this._startedServer.kill('SIGKILL');
      }
    }

    /**
     * If the Flow server fails we will not try to restart it again automatically. Calling this
     * method lets us exit that state and retry.
     */
  }, {
    key: 'allowServerRestart',
    value: function allowServerRestart() {
      if (this._serverStatus.getValue() === _FlowConstants.ServerStatus.FAILED) {
        this._serverStatus.next(_FlowConstants.ServerStatus.UNKNOWN);
      }
    }
  }, {
    key: 'getServerStatusUpdates',
    value: function getServerStatusUpdates() {
      return this._serverStatus.asObservable();
    }

    /**
     * Returns null if Flow cannot be found.
     */
  }, {
    key: 'execFlow',
    value: _asyncToGenerator(function* (args, options) {
      var waitForServer = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
      var suppressErrors = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

      var maxRetries = waitForServer ? EXEC_FLOW_RETRIES : 0;
      if (this._serverStatus.getValue() === _FlowConstants.ServerStatus.FAILED) {
        return null;
      }
      for (var i = 0;; i++) {
        try {
          var result = yield this._rawExecFlow( // eslint-disable-line babel/no-await-in-loop
          args, options);
          return result;
        } catch (e) {
          var couldRetry = [_FlowConstants.ServerStatus.NOT_RUNNING, _FlowConstants.ServerStatus.INIT, _FlowConstants.ServerStatus.BUSY].indexOf(this._serverStatus.getValue()) !== -1;
          if (i < maxRetries && couldRetry) {
            yield this._serverIsReady(); // eslint-disable-line babel/no-await-in-loop
            // Then try again.
          } else {
              // If it couldn't retry, it means there was a legitimate error. If it could retry, we
              // don't want to log because it just means the server is busy and we don't want to wait.
              if (!couldRetry && !suppressErrors) {
                // not sure what happened, but we'll let the caller deal with it
                logger.error('Flow failed: flow ' + args.join(' ') + '. Error: ' + JSON.stringify(e));
              }
              throw e;
            }
          // try again
        }
      }
      // otherwise flow complains
      return null;
    })

    /** Starts a Flow server in the current root */
  }, {
    key: '_startFlowServer',
    value: _asyncToGenerator(function* () {
      var _this2 = this;

      var pathToFlow = (0, _FlowHelpers.getPathToFlow)();
      // `flow server` will start a server in the foreground. asyncExecute
      // will not resolve the promise until the process exits, which in this
      // case is never. We need to use spawn directly to get access to the
      // ChildProcess object.
      var serverProcess = yield (0, _nuclideCommons.safeSpawn)( // eslint-disable-line babel/no-await-in-loop
      pathToFlow, ['server', '--from', 'nuclide', '--max-workers', this._getMaxWorkers().toString(), this._root]);
      var logIt = function logIt(data) {
        var pid = serverProcess.pid;
        logger.debug('flow server (' + pid + '): ' + data);
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
          _this2._serverStatus.next(_FlowConstants.ServerStatus.FAILED);
        }
      });
      this._startedServer = serverProcess;
    })

    /** Execute Flow with the given arguments */
  }, {
    key: '_rawExecFlow',
    value: _asyncToGenerator(function* (args) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var flowOptions = yield this._getFlowExecOptions();
      if (!flowOptions) {
        return null;
      }
      options = _extends({}, flowOptions, options);
      args = [].concat(_toConsumableArray(args), ['--retry-if-init', 'false', '--retries', '0', '--no-auto-start']);
      try {
        var result = yield FlowProcess.execFlowClient(args, options);
        this._updateServerStatus(result);
        return result;
      } catch (e) {
        this._updateServerStatus(e);
        if (e.exitCode === FLOW_RETURN_CODES.typeError) {
          return e;
        } else {
          throw e;
        }
      }
    })
  }, {
    key: '_updateServerStatus',
    value: function _updateServerStatus(result) {
      var status = undefined;
      if (result == null) {
        status = _FlowConstants.ServerStatus.NOT_INSTALLED;
      } else {
        switch (result.exitCode) {
          case FLOW_RETURN_CODES.ok:
          // falls through
          case FLOW_RETURN_CODES.typeError:
            status = _FlowConstants.ServerStatus.READY;
            break;
          case FLOW_RETURN_CODES.serverInitializing:
            status = _FlowConstants.ServerStatus.INIT;
            break;
          case FLOW_RETURN_CODES.noServerRunning:
            status = _FlowConstants.ServerStatus.NOT_RUNNING;
            break;
          case FLOW_RETURN_CODES.outOfRetries:
            status = _FlowConstants.ServerStatus.BUSY;
            break;
          case FLOW_RETURN_CODES.buildIdMismatch:
            // If the version doesn't match, the server is automatically killed and the client
            // returns 9.
            logger.info('Killed flow server with incorrect version in', this._root);
            status = _FlowConstants.ServerStatus.NOT_RUNNING;
            break;
          case FLOW_RETURN_CODES.unexpectedArgument:
            // If we issued an unexpected argument we have learned nothing about the state of the Flow
            // server. So, don't update.
            return;
          default:
            logger.error('Unknown return code from Flow: ' + result.exitCode);
            status = _FlowConstants.ServerStatus.UNKNOWN;
        }
      }
      (0, _assert2['default'])(status != null);
      var currentStatus = this._serverStatus.getValue();
      // Avoid duplicate updates and avoid moving the status away from FAILED, to let any existing
      // work die out when the server fails.
      if (status !== currentStatus && currentStatus !== _FlowConstants.ServerStatus.FAILED) {
        this._serverStatus.next(status);
      }
    }

    /** Ping the server until it leaves the current state */
  }, {
    key: '_pingServer',
    value: _asyncToGenerator(function* () {
      var tries = arguments.length <= 0 || arguments[0] === undefined ? 5 : arguments[0];

      var fromState = this._serverStatus.getValue();
      var stateChanged = false;
      this._serverStatus.filter(function (newState) {
        return newState !== fromState;
      }).first().subscribe(function () {
        stateChanged = true;
      });
      for (var i = 0; !stateChanged && i < tries; i++) {
        /* eslint-disable babel/no-await-in-loop */
        yield this._rawExecFlow(['status'])['catch'](function () {
          return null;
        });
        // Wait 1 second
        yield _rxjs.Observable.of(null).delay(1000).toPromise();
        /* eslint-enable babel/no-await-in-loop */
      }
    })

    /**
     * Resolves when the server is ready or the request times out, as indicated by the result of the
     * returned Promise.
     */
  }, {
    key: '_serverIsReady',
    value: function _serverIsReady() {
      return this._serverStatus.filter(function (x) {
        return x === _FlowConstants.ServerStatus.READY;
      }).map(function () {
        return true;
      }).race(_rxjs.Observable.of(false).delay(SERVER_READY_TIMEOUT_MS))
      // If the stream is completed timeout will not return its default value and we will see an
      // EmptyError. So, provide a defaultValue here so the promise resolves.
      .first(null, null, false).toPromise();
    }

    /**
    * If this returns null, then it is not safe to run flow.
    */
  }, {
    key: '_getFlowExecOptions',
    value: _asyncToGenerator(function* () {
      var installed = yield (0, _FlowHelpers.isFlowInstalled)();
      if (installed) {
        return {
          cwd: this._root
        };
      } else {
        return null;
      }
    })
  }, {
    key: '_getMaxWorkers',
    value: function _getMaxWorkers() {
      return Math.max(_os2['default'].cpus().length - 1, 1);
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
  }], [{
    key: 'execFlowClient',
    value: _asyncToGenerator(function* (args) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      args = [].concat(_toConsumableArray(args), ['--from', 'nuclide']);
      var pathToFlow = (0, _FlowHelpers.getPathToFlow)();
      return yield (0, _nuclideCommons.asyncExecute)(pathToFlow, args, options);
    })
  }]);

  return FlowProcess;
})();

exports.FlowProcess = FlowProcess;

// If we had to start a Flow server, store the process here so we can kill it when we shut down.

// The current state of the Flow server in this directory

// The path to the directory where the .flowconfig is -- i.e. the root of the Flow project.