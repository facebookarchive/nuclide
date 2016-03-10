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

var _rx = require('rx');

var _logging = require('../../logging');

var _commons = require('../../commons');

var _FlowHelpersJs = require('./FlowHelpers.js');

var _FlowConstants = require('./FlowConstants');

// Names modeled after https://github.com/facebook/flow/blob/master/src/common/flowExitStatus.ml

var logger = (0, _logging.getLogger)();

var FLOW_RETURN_CODES = {
  ok: 0,
  serverInitializing: 1,
  typeError: 2,
  noServerRunning: 6,
  // This means that the server exists, but it is not responding, typically because it is busy doing
  // other work.
  outOfRetries: 7,
  buildIdMismatch: 9
};

exports.FLOW_RETURN_CODES = FLOW_RETURN_CODES;
var SERVER_READY_TIMEOUT_MS = 10 * 1000;

var EXEC_FLOW_RETRIES = 5;

var FlowProcess = (function () {
  function FlowProcess(root) {
    var _this = this;

    _classCallCheck(this, FlowProcess);

    this._serverStatus = new _rx.BehaviorSubject(_FlowConstants.ServerStatus.UNKNOWN);
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
  }

  _createClass(FlowProcess, [{
    key: 'dispose',
    value: function dispose() {
      this._serverStatus.onCompleted();
      if (this._startedServer && (0, _FlowHelpersJs.getStopFlowOnExit)()) {
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
        this._serverStatus.onNext(_FlowConstants.ServerStatus.UNKNOWN);
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
    value: _asyncToGenerator(function* (args, options, file) {
      var waitForServer = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

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
              if (!couldRetry) {
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

      var pathToFlow = (0, _FlowHelpersJs.getPathToFlow)();
      // `flow server` will start a server in the foreground. asyncExecute
      // will not resolve the promise until the process exits, which in this
      // case is never. We need to use spawn directly to get access to the
      // ChildProcess object.
      var serverProcess = yield (0, _commons.safeSpawn)( // eslint-disable-line babel/no-await-in-loop
      pathToFlow, ['server', '--from', 'nuclide', this._root]);
      var logIt = function logIt(data) {
        logger.debug('flow server: ' + data);
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
          _this2._serverStatus.onNext(_FlowConstants.ServerStatus.FAILED);
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
        this._serverStatus.onNext(status);
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
        yield _rx.Observable.just(null).delay(1000).toPromise();
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
      }).timeout(SERVER_READY_TIMEOUT_MS, _rx.Observable.just(false))
      // If the stream is completed timeout will not return its default value and we will see an
      // EmptyError. So, provide a defaultValue here so the promise resolves.
      .first({ defaultValue: false }).toPromise();
    }

    /**
    * If this returns null, then it is not safe to run flow.
    */
  }, {
    key: '_getFlowExecOptions',
    value: _asyncToGenerator(function* () {
      var installed = yield (0, _FlowHelpersJs.isFlowInstalled)();
      if (installed) {
        return {
          cwd: this._root
        };
      } else {
        return null;
      }
    })

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
      var pathToFlow = (0, _FlowHelpersJs.getPathToFlow)();
      return yield (0, _commons.asyncExecute)(pathToFlow, args, options);
    })
  }]);

  return FlowProcess;
})();

exports.FlowProcess = FlowProcess;

// If we had to start a Flow server, store the process here so we can kill it when we shut down.

// The current state of the Flow server in this directory

// The path to the directory where the .flowconfig is -- i.e. the root of the Flow project.
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxLQUFLO1NBQ2hCLENBQUM7T0FDSCxNQUFNO0FBQ0wsZUFBTyxJQUFJLENBQUM7T0FDYjtLQUNGOzs7Ozs7Ozs7Ozs7Ozs2QkFZMEIsV0FDekIsSUFBZ0IsRUFFbUI7VUFEbkMsT0FBZ0IseURBQUcsRUFBRTs7QUFFckIsVUFBSSxnQ0FDQyxJQUFJLElBQ1AsUUFBUSxFQUFFLFNBQVMsRUFDcEIsQ0FBQztBQUNGLFVBQU0sVUFBVSxHQUFHLG1DQUFlLENBQUM7QUFDbkMsYUFBTyxNQUFNLDJCQUFhLFVBQVUsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDdEQ7OztTQS9QVSxXQUFXIiwiZmlsZSI6IkZsb3dQcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge3Byb2Nlc3MkYXN5bmNFeGVjdXRlUmV0fSBmcm9tICcuLi8uLi9jb21tb25zJztcblxuaW1wb3J0IHR5cGUge1NlcnZlclN0YXR1c1R5cGV9IGZyb20gJy4vRmxvd1NlcnZpY2UnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7QmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5cbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG5pbXBvcnQge1xuICBhc3luY0V4ZWN1dGUsXG4gIHNhZmVTcGF3bixcbn0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5cbmltcG9ydCB7XG4gIGlzRmxvd0luc3RhbGxlZCxcbiAgZ2V0UGF0aFRvRmxvdyxcbiAgZ2V0U3RvcEZsb3dPbkV4aXQsXG59IGZyb20gJy4vRmxvd0hlbHBlcnMuanMnO1xuXG5pbXBvcnQge1NlcnZlclN0YXR1c30gZnJvbSAnLi9GbG93Q29uc3RhbnRzJztcblxuLy8gTmFtZXMgbW9kZWxlZCBhZnRlciBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9ibG9iL21hc3Rlci9zcmMvY29tbW9uL2Zsb3dFeGl0U3RhdHVzLm1sXG5leHBvcnQgY29uc3QgRkxPV19SRVRVUk5fQ09ERVMgPSB7XG4gIG9rOiAwLFxuICBzZXJ2ZXJJbml0aWFsaXppbmc6IDEsXG4gIHR5cGVFcnJvcjogMixcbiAgbm9TZXJ2ZXJSdW5uaW5nOiA2LFxuICAvLyBUaGlzIG1lYW5zIHRoYXQgdGhlIHNlcnZlciBleGlzdHMsIGJ1dCBpdCBpcyBub3QgcmVzcG9uZGluZywgdHlwaWNhbGx5IGJlY2F1c2UgaXQgaXMgYnVzeSBkb2luZ1xuICAvLyBvdGhlciB3b3JrLlxuICBvdXRPZlJldHJpZXM6IDcsXG4gIGJ1aWxkSWRNaXNtYXRjaDogOSxcbn07XG5cbmNvbnN0IFNFUlZFUl9SRUFEWV9USU1FT1VUX01TID0gMTAgKiAxMDAwO1xuXG5jb25zdCBFWEVDX0ZMT1dfUkVUUklFUyA9IDU7XG5cbmV4cG9ydCBjbGFzcyBGbG93UHJvY2VzcyB7XG4gIC8vIElmIHdlIGhhZCB0byBzdGFydCBhIEZsb3cgc2VydmVyLCBzdG9yZSB0aGUgcHJvY2VzcyBoZXJlIHNvIHdlIGNhbiBraWxsIGl0IHdoZW4gd2Ugc2h1dCBkb3duLlxuICBfc3RhcnRlZFNlcnZlcjogP2NoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICAvLyBUaGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgRmxvdyBzZXJ2ZXIgaW4gdGhpcyBkaXJlY3RvcnlcbiAgX3NlcnZlclN0YXR1czogQmVoYXZpb3JTdWJqZWN0PFNlcnZlclN0YXR1c1R5cGU+O1xuICAvLyBUaGUgcGF0aCB0byB0aGUgZGlyZWN0b3J5IHdoZXJlIHRoZSAuZmxvd2NvbmZpZyBpcyAtLSBpLmUuIHRoZSByb290IG9mIHRoZSBGbG93IHByb2plY3QuXG4gIF9yb290OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iocm9vdDogc3RyaW5nKSB7XG4gICAgdGhpcy5fc2VydmVyU3RhdHVzID0gbmV3IEJlaGF2aW9yU3ViamVjdChTZXJ2ZXJTdGF0dXMuVU5LTk9XTik7XG4gICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG5cbiAgICB0aGlzLl9zZXJ2ZXJTdGF0dXMuZmlsdGVyKHggPT4geCA9PT0gU2VydmVyU3RhdHVzLk5PVF9SVU5OSU5HKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5fc3RhcnRGbG93U2VydmVyKCk7XG4gICAgICB0aGlzLl9waW5nU2VydmVyKCk7XG4gICAgfSk7XG4gICAgZnVuY3Rpb24gaXNCdXN5T3JJbml0KHN0YXR1czogU2VydmVyU3RhdHVzVHlwZSk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHN0YXR1cyA9PT0gU2VydmVyU3RhdHVzLkJVU1kgfHwgc3RhdHVzID09PSBTZXJ2ZXJTdGF0dXMuSU5JVDtcbiAgICB9XG4gICAgdGhpcy5fc2VydmVyU3RhdHVzLmZpbHRlcihpc0J1c3lPckluaXQpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl9waW5nU2VydmVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3NlcnZlclN0YXR1cy5vbkNvbXBsZXRlZCgpO1xuICAgIGlmICh0aGlzLl9zdGFydGVkU2VydmVyICYmIGdldFN0b3BGbG93T25FeGl0KCkpIHtcbiAgICAgIC8vIFRoZSBkZWZhdWx0LCBTSUdURVJNLCBkb2VzIG5vdCByZWxpYWJseSBraWxsIHRoZSBmbG93IHNlcnZlcnMuXG4gICAgICB0aGlzLl9zdGFydGVkU2VydmVyLmtpbGwoJ1NJR0tJTEwnKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhlIEZsb3cgc2VydmVyIGZhaWxzIHdlIHdpbGwgbm90IHRyeSB0byByZXN0YXJ0IGl0IGFnYWluIGF1dG9tYXRpY2FsbHkuIENhbGxpbmcgdGhpc1xuICAgKiBtZXRob2QgbGV0cyB1cyBleGl0IHRoYXQgc3RhdGUgYW5kIHJldHJ5LlxuICAgKi9cbiAgYWxsb3dTZXJ2ZXJSZXN0YXJ0KCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zZXJ2ZXJTdGF0dXMuZ2V0VmFsdWUoKSA9PT0gU2VydmVyU3RhdHVzLkZBSUxFRCkge1xuICAgICAgdGhpcy5fc2VydmVyU3RhdHVzLm9uTmV4dChTZXJ2ZXJTdGF0dXMuVU5LTk9XTik7XG4gICAgfVxuICB9XG5cbiAgZ2V0U2VydmVyU3RhdHVzVXBkYXRlcygpOiBPYnNlcnZhYmxlPFNlcnZlclN0YXR1c1R5cGU+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmVyU3RhdHVzLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgbnVsbCBpZiBGbG93IGNhbm5vdCBiZSBmb3VuZC5cbiAgICovXG4gIGFzeW5jIGV4ZWNGbG93KFxuICAgIGFyZ3M6IEFycmF5PGFueT4sXG4gICAgb3B0aW9uczogT2JqZWN0LFxuICAgIGZpbGU6IHN0cmluZyxcbiAgICB3YWl0Rm9yU2VydmVyPzogYm9vbGVhbiA9IGZhbHNlLFxuICApOiBQcm9taXNlPD9wcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAgIGNvbnN0IG1heFJldHJpZXMgPSB3YWl0Rm9yU2VydmVyID8gRVhFQ19GTE9XX1JFVFJJRVMgOiAwO1xuICAgIGlmICh0aGlzLl9zZXJ2ZXJTdGF0dXMuZ2V0VmFsdWUoKSA9PT0gU2VydmVyU3RhdHVzLkZBSUxFRCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyA7IGkrKykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcmF3RXhlY0Zsb3coIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgICAgIGFyZ3MsXG4gICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc3QgY291bGRSZXRyeSA9IFtTZXJ2ZXJTdGF0dXMuTk9UX1JVTk5JTkcsIFNlcnZlclN0YXR1cy5JTklULCBTZXJ2ZXJTdGF0dXMuQlVTWV1cbiAgICAgICAgICAuaW5kZXhPZih0aGlzLl9zZXJ2ZXJTdGF0dXMuZ2V0VmFsdWUoKSkgIT09IC0xO1xuICAgICAgICBpZiAoaSA8IG1heFJldHJpZXMgJiYgY291bGRSZXRyeSkge1xuICAgICAgICAgIGF3YWl0IHRoaXMuX3NlcnZlcklzUmVhZHkoKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wXG4gICAgICAgICAgLy8gVGhlbiB0cnkgYWdhaW4uXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgaXQgY291bGRuJ3QgcmV0cnksIGl0IG1lYW5zIHRoZXJlIHdhcyBhIGxlZ2l0aW1hdGUgZXJyb3IuIElmIGl0IGNvdWxkIHJldHJ5LCB3ZVxuICAgICAgICAgIC8vIGRvbid0IHdhbnQgdG8gbG9nIGJlY2F1c2UgaXQganVzdCBtZWFucyB0aGUgc2VydmVyIGlzIGJ1c3kgYW5kIHdlIGRvbid0IHdhbnQgdG8gd2FpdC5cbiAgICAgICAgICBpZiAoIWNvdWxkUmV0cnkpIHtcbiAgICAgICAgICAgIC8vIG5vdCBzdXJlIHdoYXQgaGFwcGVuZWQsIGJ1dCB3ZSdsbCBsZXQgdGhlIGNhbGxlciBkZWFsIHdpdGggaXRcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgRmxvdyBmYWlsZWQ6IGZsb3cgJHthcmdzLmpvaW4oJyAnKX0uIEVycm9yOiAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRyeSBhZ2FpblxuICAgICAgfVxuICAgIH1cbiAgICAvLyBvdGhlcndpc2UgZmxvdyBjb21wbGFpbnNcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBTdGFydHMgYSBGbG93IHNlcnZlciBpbiB0aGUgY3VycmVudCByb290ICovXG4gIGFzeW5jIF9zdGFydEZsb3dTZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aFRvRmxvdyA9IGdldFBhdGhUb0Zsb3coKTtcbiAgICAvLyBgZmxvdyBzZXJ2ZXJgIHdpbGwgc3RhcnQgYSBzZXJ2ZXIgaW4gdGhlIGZvcmVncm91bmQuIGFzeW5jRXhlY3V0ZVxuICAgIC8vIHdpbGwgbm90IHJlc29sdmUgdGhlIHByb21pc2UgdW50aWwgdGhlIHByb2Nlc3MgZXhpdHMsIHdoaWNoIGluIHRoaXNcbiAgICAvLyBjYXNlIGlzIG5ldmVyLiBXZSBuZWVkIHRvIHVzZSBzcGF3biBkaXJlY3RseSB0byBnZXQgYWNjZXNzIHRvIHRoZVxuICAgIC8vIENoaWxkUHJvY2VzcyBvYmplY3QuXG4gICAgY29uc3Qgc2VydmVyUHJvY2VzcyA9IGF3YWl0IHNhZmVTcGF3biggLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wXG4gICAgICBwYXRoVG9GbG93LFxuICAgICAgWydzZXJ2ZXInLCAnLS1mcm9tJywgJ251Y2xpZGUnLCB0aGlzLl9yb290XSxcbiAgICApO1xuICAgIGNvbnN0IGxvZ0l0ID0gZGF0YSA9PiB7XG4gICAgICBsb2dnZXIuZGVidWcoJ2Zsb3cgc2VydmVyOiAnICsgZGF0YSk7XG4gICAgfTtcbiAgICBzZXJ2ZXJQcm9jZXNzLnN0ZG91dC5vbignZGF0YScsIGxvZ0l0KTtcbiAgICBzZXJ2ZXJQcm9jZXNzLnN0ZGVyci5vbignZGF0YScsIGxvZ0l0KTtcbiAgICBzZXJ2ZXJQcm9jZXNzLm9uKCdleGl0JywgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgLy8gV2Ugb25seSB3YW50IHRvIGJsYWNrbGlzdCB0aGlzIHJvb3QgaWYgdGhlIEZsb3cgcHJvY2Vzc2VzXG4gICAgICAvLyBhY3R1YWxseSBmYWlsZWQsIHJhdGhlciB0aGFuIGJlaW5nIGtpbGxlZCBtYW51YWxseS4gSXQgc2VlbXMgdGhhdFxuICAgICAgLy8gaWYgdGhleSBhcmUga2lsbGVkLCB0aGUgY29kZSBpcyBudWxsIGFuZCB0aGUgc2lnbmFsIGlzICdTSUdURVJNJy5cbiAgICAgIC8vIEluIHRoZSBGbG93IGNyYXNoZXMgSSBoYXZlIG9ic2VydmVkLCB0aGUgY29kZSBpcyAyIGFuZCB0aGUgc2lnbmFsXG4gICAgICAvLyBpcyBudWxsLiBTbywgbGV0J3MgYmxhY2tsaXN0IGNvbnNlcnZhdGl2ZWx5IGZvciBub3cgYW5kIHdlIGNhblxuICAgICAgLy8gYWRkIGNhc2VzIGxhdGVyIGlmIHdlIG9ic2VydmUgRmxvdyBjcmFzaGVzIHRoYXQgZG8gbm90IGZpdCB0aGlzXG4gICAgICAvLyBwYXR0ZXJuLlxuICAgICAgaWYgKGNvZGUgPT09IDIgJiYgc2lnbmFsID09PSBudWxsKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcignRmxvdyBzZXJ2ZXIgdW5leHBlY3RlZGx5IGV4aXRlZCcsIHRoaXMuX3Jvb3QpO1xuICAgICAgICB0aGlzLl9zZXJ2ZXJTdGF0dXMub25OZXh0KFNlcnZlclN0YXR1cy5GQUlMRUQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX3N0YXJ0ZWRTZXJ2ZXIgPSBzZXJ2ZXJQcm9jZXNzO1xuICB9XG5cbiAgLyoqIEV4ZWN1dGUgRmxvdyB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudHMgKi9cbiAgYXN5bmMgX3Jhd0V4ZWNGbG93KGFyZ3M6IEFycmF5PGFueT4sIG9wdGlvbnM/OiBPYmplY3QgPSB7fSk6IFByb21pc2U8P3Byb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gICAgY29uc3QgZmxvd09wdGlvbnMgPSBhd2FpdCB0aGlzLl9nZXRGbG93RXhlY09wdGlvbnMoKTtcbiAgICBpZiAoIWZsb3dPcHRpb25zKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgb3B0aW9ucyA9IHsuLi5mbG93T3B0aW9ucywgLi4ub3B0aW9uc307XG4gICAgYXJncyA9IFtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICAnLS1yZXRyeS1pZi1pbml0JywgJ2ZhbHNlJyxcbiAgICAgICctLXJldHJpZXMnLCAnMCcsXG4gICAgICAnLS1uby1hdXRvLXN0YXJ0JyxcbiAgICBdO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBGbG93UHJvY2Vzcy5leGVjRmxvd0NsaWVudChhcmdzLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVNlcnZlclN0YXR1cyhyZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl91cGRhdGVTZXJ2ZXJTdGF0dXMoZSk7XG4gICAgICBpZiAoZS5leGl0Q29kZSA9PT0gRkxPV19SRVRVUk5fQ09ERVMudHlwZUVycm9yKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdXBkYXRlU2VydmVyU3RhdHVzKHJlc3VsdDogP3Byb2Nlc3MkYXN5bmNFeGVjdXRlUmV0KTogdm9pZCB7XG4gICAgbGV0IHN0YXR1cztcbiAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgIHN0YXR1cyA9IFNlcnZlclN0YXR1cy5OT1RfSU5TVEFMTEVEO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKHJlc3VsdC5leGl0Q29kZSkge1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLm9rOlxuICAgICAgICAgIC8vIGZhbGxzIHRocm91Z2hcbiAgICAgICAgY2FzZSBGTE9XX1JFVFVSTl9DT0RFUy50eXBlRXJyb3I6XG4gICAgICAgICAgc3RhdHVzID0gU2VydmVyU3RhdHVzLlJFQURZO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLnNlcnZlckluaXRpYWxpemluZzpcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuSU5JVDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGTE9XX1JFVFVSTl9DT0RFUy5ub1NlcnZlclJ1bm5pbmc6XG4gICAgICAgICAgc3RhdHVzID0gU2VydmVyU3RhdHVzLk5PVF9SVU5OSU5HO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLm91dE9mUmV0cmllczpcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuQlVTWTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGTE9XX1JFVFVSTl9DT0RFUy5idWlsZElkTWlzbWF0Y2g6XG4gICAgICAgICAgLy8gSWYgdGhlIHZlcnNpb24gZG9lc24ndCBtYXRjaCwgdGhlIHNlcnZlciBpcyBhdXRvbWF0aWNhbGx5IGtpbGxlZCBhbmQgdGhlIGNsaWVudFxuICAgICAgICAgIC8vIHJldHVybnMgOS5cbiAgICAgICAgICBsb2dnZXIuaW5mbygnS2lsbGVkIGZsb3cgc2VydmVyIHdpdGggaW5jb3JyZWN0IHZlcnNpb24gaW4nLCB0aGlzLl9yb290KTtcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuTk9UX1JVTk5JTkc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdVbmtub3duIHJldHVybiBjb2RlIGZyb20gRmxvdzogJyArIHJlc3VsdC5leGl0Q29kZSk7XG4gICAgICAgICAgc3RhdHVzID0gU2VydmVyU3RhdHVzLlVOS05PV047XG4gICAgICB9XG4gICAgfVxuICAgIGludmFyaWFudChzdGF0dXMgIT0gbnVsbCk7XG4gICAgY29uc3QgY3VycmVudFN0YXR1cyA9IHRoaXMuX3NlcnZlclN0YXR1cy5nZXRWYWx1ZSgpO1xuICAgIC8vIEF2b2lkIGR1cGxpY2F0ZSB1cGRhdGVzIGFuZCBhdm9pZCBtb3ZpbmcgdGhlIHN0YXR1cyBhd2F5IGZyb20gRkFJTEVELCB0byBsZXQgYW55IGV4aXN0aW5nXG4gICAgLy8gd29yayBkaWUgb3V0IHdoZW4gdGhlIHNlcnZlciBmYWlscy5cbiAgICBpZiAoc3RhdHVzICE9PSBjdXJyZW50U3RhdHVzICYmIGN1cnJlbnRTdGF0dXMgIT09IFNlcnZlclN0YXR1cy5GQUlMRUQpIHtcbiAgICAgIHRoaXMuX3NlcnZlclN0YXR1cy5vbk5leHQoc3RhdHVzKTtcbiAgICB9XG4gIH1cblxuICAvKiogUGluZyB0aGUgc2VydmVyIHVudGlsIGl0IGxlYXZlcyB0aGUgY3VycmVudCBzdGF0ZSAqL1xuICBhc3luYyBfcGluZ1NlcnZlcih0cmllcz86IG51bWJlciA9IDUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmcm9tU3RhdGUgPSB0aGlzLl9zZXJ2ZXJTdGF0dXMuZ2V0VmFsdWUoKTtcbiAgICBsZXQgc3RhdGVDaGFuZ2VkID0gZmFsc2U7XG4gICAgdGhpcy5fc2VydmVyU3RhdHVzLmZpbHRlcihuZXdTdGF0ZSA9PiBuZXdTdGF0ZSAhPT0gZnJvbVN0YXRlKS5maXJzdCgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBzdGF0ZUNoYW5nZWQgPSB0cnVlO1xuICAgIH0pO1xuICAgIGZvciAobGV0IGkgPSAwOyAhc3RhdGVDaGFuZ2VkICYmIGkgPCB0cmllczsgaSsrKSB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgICBhd2FpdCB0aGlzLl9yYXdFeGVjRmxvdyhbJ3N0YXR1cyddKS5jYXRjaCgoKSA9PiBudWxsKTtcbiAgICAgIC8vIFdhaXQgMSBzZWNvbmRcbiAgICAgIGF3YWl0IE9ic2VydmFibGUuanVzdChudWxsKS5kZWxheSgxMDAwKS50b1Byb21pc2UoKTtcbiAgICAgIC8qIGVzbGludC1lbmFibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyB3aGVuIHRoZSBzZXJ2ZXIgaXMgcmVhZHkgb3IgdGhlIHJlcXVlc3QgdGltZXMgb3V0LCBhcyBpbmRpY2F0ZWQgYnkgdGhlIHJlc3VsdCBvZiB0aGVcbiAgICogcmV0dXJuZWQgUHJvbWlzZS5cbiAgICovXG4gIF9zZXJ2ZXJJc1JlYWR5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2ZXJTdGF0dXNcbiAgICAgIC5maWx0ZXIoeCA9PiB4ID09PSBTZXJ2ZXJTdGF0dXMuUkVBRFkpXG4gICAgICAubWFwKCgpID0+IHRydWUpXG4gICAgICAudGltZW91dChcbiAgICAgICAgU0VSVkVSX1JFQURZX1RJTUVPVVRfTVMsXG4gICAgICAgIE9ic2VydmFibGUuanVzdChmYWxzZSksXG4gICAgICApXG4gICAgICAvLyBJZiB0aGUgc3RyZWFtIGlzIGNvbXBsZXRlZCB0aW1lb3V0IHdpbGwgbm90IHJldHVybiBpdHMgZGVmYXVsdCB2YWx1ZSBhbmQgd2Ugd2lsbCBzZWUgYW5cbiAgICAgIC8vIEVtcHR5RXJyb3IuIFNvLCBwcm92aWRlIGEgZGVmYXVsdFZhbHVlIGhlcmUgc28gdGhlIHByb21pc2UgcmVzb2x2ZXMuXG4gICAgICAuZmlyc3Qoe2RlZmF1bHRWYWx1ZTogZmFsc2V9KVxuICAgICAgLnRvUHJvbWlzZSgpO1xuICB9XG5cbiAgLyoqXG4gICogSWYgdGhpcyByZXR1cm5zIG51bGwsIHRoZW4gaXQgaXMgbm90IHNhZmUgdG8gcnVuIGZsb3cuXG4gICovXG4gIGFzeW5jIF9nZXRGbG93RXhlY09wdGlvbnMoKTogUHJvbWlzZTw/e2N3ZDogc3RyaW5nfT4ge1xuICAgIGNvbnN0IGluc3RhbGxlZCA9IGF3YWl0IGlzRmxvd0luc3RhbGxlZCgpO1xuICAgIGlmIChpbnN0YWxsZWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGN3ZDogdGhpcy5fcm9vdCxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIHNob3VsZCBiZSB1c2VkIHRvIGV4ZWN1dGUgRmxvdyBjb21tYW5kcyB0aGF0IGRvIG5vdCByZWx5IG9uIGEgRmxvdyBzZXJ2ZXIuIFNvLCB0aGV5IGRvIG5vdFxuICAgKiBuZWVkIHRvIGJlIGFzc29jaWF0ZWQgd2l0aCBhIEZsb3dQcm9jZXNzIGluc3RhbmNlIGFuZCB0aGV5IG1heSBiZSBleGVjdXRlZCBmcm9tIGFueSB3b3JraW5nXG4gICAqIGRpcmVjdG9yeS5cbiAgICpcbiAgICogTm90ZSB0aGF0IHVzaW5nIHRoaXMgbWV0aG9kIG1lYW5zIHRoYXQgeW91IGdldCBubyBndWFyYW50ZWUgdGhhdCB0aGUgRmxvdyB2ZXJzaW9uIHNwZWNpZmllZCBpblxuICAgKiBhbnkgZ2l2ZW4gLmZsb3djb25maWcgaXMgdGhlIG9uZSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgaGVyZSwgYmVjYXVzZSBpdCBoYXMgbm8gYXNzb2NpYXRpb24gd2l0aFxuICAgKiBhbnkgZ2l2ZW4gcm9vdC4gSWYgeW91IG5lZWQgdGhpcyBwcm9wZXJ0eSwgY3JlYXRlIGFuIGluc3RhbmNlIHdpdGggdGhlIGFwcHJvcHJpYXRlIHJvb3QgYW5kIHVzZVxuICAgKiBleGVjRmxvdy5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBleGVjRmxvd0NsaWVudChcbiAgICBhcmdzOiBBcnJheTxhbnk+LFxuICAgIG9wdGlvbnM/OiBPYmplY3QgPSB7fVxuICApOiBQcm9taXNlPD9wcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAgIGFyZ3MgPSBbXG4gICAgICAuLi5hcmdzLFxuICAgICAgJy0tZnJvbScsICdudWNsaWRlJyxcbiAgICBdO1xuICAgIGNvbnN0IHBhdGhUb0Zsb3cgPSBnZXRQYXRoVG9GbG93KCk7XG4gICAgcmV0dXJuIGF3YWl0IGFzeW5jRXhlY3V0ZShwYXRoVG9GbG93LCBhcmdzLCBvcHRpb25zKTtcbiAgfVxufVxuIl19