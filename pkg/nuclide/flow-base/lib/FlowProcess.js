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
      if (this._startedServer) {
        // The default, SIGTERM, does not reliably kill the flow servers.
        this._startedServer.kill('SIGKILL');
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
      if (this._serverStatus.getValue() === _FlowConstants.ServerStatus.failed) {
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
          _this2._serverStatus.onCompleted();
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
      args = [].concat(_toConsumableArray(args), ['--retry-if-init', 'false', '--retries', '0', '--no-auto-start', '--from', 'nuclide']);
      var pathToFlow = (0, _FlowHelpersJs.getPathToFlow)();
      try {
        var result = yield (0, _commons.asyncExecute)(pathToFlow, args, options);
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
      if (status !== this._serverStatus.getValue()) {
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
      }).timeout(SERVER_READY_TIMEOUT_MS, _rx.Observable.just(false)).first().toPromise();
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
  }]);

  return FlowProcess;
})();

exports.FlowProcess = FlowProcess;

// If we had to start a Flow server, store the process here so we can kill it when we shut down.

// The current state of the Flow server in this directory

// The path to the directory where the .flowconfig is -- i.e. the root of the Flow project.
//# sourceMappingURL=data:application/json;base64,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LFFBQVE7ZUFBSSxRQUFRLEtBQUssU0FBUztPQUFBLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxTQUFTLENBQUMsWUFBTTtBQUNwRixvQkFBWSxHQUFHLElBQUksQ0FBQztPQUNyQixDQUFDLENBQUM7QUFDSCxXQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLFlBQVksSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFOztBQUUvQyxjQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFNLENBQUM7aUJBQU0sSUFBSTtTQUFBLENBQUMsQ0FBQzs7QUFFdEQsY0FBTSxlQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7O09BRXJEO0tBQ0Y7Ozs7Ozs7O1dBTWEsMEJBQXFCO0FBQ2pDLGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FDdEIsTUFBTSxDQUFDLFVBQUEsQ0FBQztlQUFJLENBQUMsS0FBSyw0QkFBYSxLQUFLO09BQUEsQ0FBQyxDQUNyQyxHQUFHLENBQUM7ZUFBTSxJQUFJO09BQUEsQ0FBQyxDQUNmLE9BQU8sQ0FDTix1QkFBdUIsRUFDdkIsZUFBVyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQ3ZCLENBQ0EsS0FBSyxFQUFFLENBQ1AsU0FBUyxFQUFFLENBQUM7S0FDaEI7Ozs7Ozs7NkJBS3dCLGFBQTRCO0FBQ25ELFVBQU0sU0FBUyxHQUFHLE1BQU0scUNBQWlCLENBQUM7QUFDMUMsVUFBSSxTQUFTLEVBQUU7QUFDYixlQUFPO0FBQ0wsYUFBRyxFQUFFLElBQUksQ0FBQyxLQUFLO1NBQ2hCLENBQUM7T0FDSCxNQUFNO0FBQ0wsZUFBTyxJQUFJLENBQUM7T0FDYjtLQUNGOzs7U0E3TlUsV0FBVyIsImZpbGUiOiJGbG93UHJvY2Vzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldH0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5cbmltcG9ydCB0eXBlIHtTZXJ2ZXJTdGF0dXNUeXBlfSBmcm9tICcuL0Zsb3dTZXJ2aWNlJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge0JlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuXG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuaW1wb3J0IHtcbiAgYXN5bmNFeGVjdXRlLFxuICBzYWZlU3Bhd24sXG59IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuXG5pbXBvcnQge1xuICBpc0Zsb3dJbnN0YWxsZWQsXG4gIGdldFBhdGhUb0Zsb3csXG59IGZyb20gJy4vRmxvd0hlbHBlcnMuanMnO1xuXG5pbXBvcnQge1NlcnZlclN0YXR1c30gZnJvbSAnLi9GbG93Q29uc3RhbnRzJztcblxuLy8gTmFtZXMgbW9kZWxlZCBhZnRlciBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9ibG9iL21hc3Rlci9zcmMvY29tbW9uL2Zsb3dFeGl0U3RhdHVzLm1sXG5leHBvcnQgY29uc3QgRkxPV19SRVRVUk5fQ09ERVMgPSB7XG4gIG9rOiAwLFxuICBzZXJ2ZXJJbml0aWFsaXppbmc6IDEsXG4gIHR5cGVFcnJvcjogMixcbiAgbm9TZXJ2ZXJSdW5uaW5nOiA2LFxuICAvLyBUaGlzIG1lYW5zIHRoYXQgdGhlIHNlcnZlciBleGlzdHMsIGJ1dCBpdCBpcyBub3QgcmVzcG9uZGluZywgdHlwaWNhbGx5IGJlY2F1c2UgaXQgaXMgYnVzeSBkb2luZ1xuICAvLyBvdGhlciB3b3JrLlxuICBvdXRPZlJldHJpZXM6IDcsXG4gIGJ1aWxkSWRNaXNtYXRjaDogOSxcbn07XG5cbmNvbnN0IFNFUlZFUl9SRUFEWV9USU1FT1VUX01TID0gMTAgKiAxMDAwO1xuXG5jb25zdCBFWEVDX0ZMT1dfUkVUUklFUyA9IDU7XG5cbmV4cG9ydCBjbGFzcyBGbG93UHJvY2VzcyB7XG4gIC8vIElmIHdlIGhhZCB0byBzdGFydCBhIEZsb3cgc2VydmVyLCBzdG9yZSB0aGUgcHJvY2VzcyBoZXJlIHNvIHdlIGNhbiBraWxsIGl0IHdoZW4gd2Ugc2h1dCBkb3duLlxuICBfc3RhcnRlZFNlcnZlcjogP2NoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICAvLyBUaGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgRmxvdyBzZXJ2ZXIgaW4gdGhpcyBkaXJlY3RvcnlcbiAgX3NlcnZlclN0YXR1czogQmVoYXZpb3JTdWJqZWN0PFNlcnZlclN0YXR1c1R5cGU+O1xuICAvLyBUaGUgcGF0aCB0byB0aGUgZGlyZWN0b3J5IHdoZXJlIHRoZSAuZmxvd2NvbmZpZyBpcyAtLSBpLmUuIHRoZSByb290IG9mIHRoZSBGbG93IHByb2plY3QuXG4gIF9yb290OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iocm9vdDogc3RyaW5nKSB7XG4gICAgdGhpcy5fc2VydmVyU3RhdHVzID0gbmV3IEJlaGF2aW9yU3ViamVjdChTZXJ2ZXJTdGF0dXMuVU5LTk9XTik7XG4gICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG5cbiAgICB0aGlzLl9zZXJ2ZXJTdGF0dXMuZmlsdGVyKHggPT4geCA9PT0gU2VydmVyU3RhdHVzLk5PVF9SVU5OSU5HKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5fc3RhcnRGbG93U2VydmVyKCk7XG4gICAgICB0aGlzLl9waW5nU2VydmVyKCk7XG4gICAgfSk7XG4gICAgZnVuY3Rpb24gaXNCdXN5T3JJbml0KHN0YXR1czogU2VydmVyU3RhdHVzVHlwZSk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHN0YXR1cyA9PT0gU2VydmVyU3RhdHVzLkJVU1kgfHwgc3RhdHVzID09PSBTZXJ2ZXJTdGF0dXMuSU5JVDtcbiAgICB9XG4gICAgdGhpcy5fc2VydmVyU3RhdHVzLmZpbHRlcihpc0J1c3lPckluaXQpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl9waW5nU2VydmVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3NlcnZlclN0YXR1cy5vbkNvbXBsZXRlZCgpO1xuICAgIGlmICh0aGlzLl9zdGFydGVkU2VydmVyKSB7XG4gICAgICAvLyBUaGUgZGVmYXVsdCwgU0lHVEVSTSwgZG9lcyBub3QgcmVsaWFibHkga2lsbCB0aGUgZmxvdyBzZXJ2ZXJzLlxuICAgICAgdGhpcy5fc3RhcnRlZFNlcnZlci5raWxsKCdTSUdLSUxMJyk7XG4gICAgfVxuICB9XG5cbiAgZ2V0U2VydmVyU3RhdHVzVXBkYXRlcygpOiBPYnNlcnZhYmxlPFNlcnZlclN0YXR1c1R5cGU+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmVyU3RhdHVzLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgbnVsbCBpZiBGbG93IGNhbm5vdCBiZSBmb3VuZC5cbiAgICovXG4gIGFzeW5jIGV4ZWNGbG93KFxuICAgIGFyZ3M6IEFycmF5PGFueT4sXG4gICAgb3B0aW9uczogT2JqZWN0LFxuICAgIGZpbGU6IHN0cmluZyxcbiAgICB3YWl0Rm9yU2VydmVyPzogYm9vbGVhbiA9IGZhbHNlLFxuICApOiBQcm9taXNlPD9wcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAgIGNvbnN0IG1heFJldHJpZXMgPSB3YWl0Rm9yU2VydmVyID8gRVhFQ19GTE9XX1JFVFJJRVMgOiAwO1xuICAgIGlmICh0aGlzLl9zZXJ2ZXJTdGF0dXMuZ2V0VmFsdWUoKSA9PT0gU2VydmVyU3RhdHVzLmZhaWxlZCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyA7IGkrKykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcmF3RXhlY0Zsb3coIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgICAgIGFyZ3MsXG4gICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc3QgY291bGRSZXRyeSA9IFtTZXJ2ZXJTdGF0dXMuTk9UX1JVTk5JTkcsIFNlcnZlclN0YXR1cy5JTklULCBTZXJ2ZXJTdGF0dXMuQlVTWV1cbiAgICAgICAgICAuaW5kZXhPZih0aGlzLl9zZXJ2ZXJTdGF0dXMuZ2V0VmFsdWUoKSkgIT09IC0xO1xuICAgICAgICBpZiAoaSA8IG1heFJldHJpZXMgJiYgY291bGRSZXRyeSkge1xuICAgICAgICAgIGF3YWl0IHRoaXMuX3NlcnZlcklzUmVhZHkoKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wXG4gICAgICAgICAgLy8gVGhlbiB0cnkgYWdhaW4uXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgaXQgY291bGRuJ3QgcmV0cnksIGl0IG1lYW5zIHRoZXJlIHdhcyBhIGxlZ2l0aW1hdGUgZXJyb3IuIElmIGl0IGNvdWxkIHJldHJ5LCB3ZVxuICAgICAgICAgIC8vIGRvbid0IHdhbnQgdG8gbG9nIGJlY2F1c2UgaXQganVzdCBtZWFucyB0aGUgc2VydmVyIGlzIGJ1c3kgYW5kIHdlIGRvbid0IHdhbnQgdG8gd2FpdC5cbiAgICAgICAgICBpZiAoIWNvdWxkUmV0cnkpIHtcbiAgICAgICAgICAgIC8vIG5vdCBzdXJlIHdoYXQgaGFwcGVuZWQsIGJ1dCB3ZSdsbCBsZXQgdGhlIGNhbGxlciBkZWFsIHdpdGggaXRcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgRmxvdyBmYWlsZWQ6IGZsb3cgJHthcmdzLmpvaW4oJyAnKX0uIEVycm9yOiAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRyeSBhZ2FpblxuICAgICAgfVxuICAgIH1cbiAgICAvLyBvdGhlcndpc2UgZmxvdyBjb21wbGFpbnNcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBTdGFydHMgYSBGbG93IHNlcnZlciBpbiB0aGUgY3VycmVudCByb290ICovXG4gIGFzeW5jIF9zdGFydEZsb3dTZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aFRvRmxvdyA9IGdldFBhdGhUb0Zsb3coKTtcbiAgICAvLyBgZmxvdyBzZXJ2ZXJgIHdpbGwgc3RhcnQgYSBzZXJ2ZXIgaW4gdGhlIGZvcmVncm91bmQuIGFzeW5jRXhlY3V0ZVxuICAgIC8vIHdpbGwgbm90IHJlc29sdmUgdGhlIHByb21pc2UgdW50aWwgdGhlIHByb2Nlc3MgZXhpdHMsIHdoaWNoIGluIHRoaXNcbiAgICAvLyBjYXNlIGlzIG5ldmVyLiBXZSBuZWVkIHRvIHVzZSBzcGF3biBkaXJlY3RseSB0byBnZXQgYWNjZXNzIHRvIHRoZVxuICAgIC8vIENoaWxkUHJvY2VzcyBvYmplY3QuXG4gICAgY29uc3Qgc2VydmVyUHJvY2VzcyA9IGF3YWl0IHNhZmVTcGF3biggLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wXG4gICAgICBwYXRoVG9GbG93LFxuICAgICAgWydzZXJ2ZXInLCAnLS1mcm9tJywgJ251Y2xpZGUnLCB0aGlzLl9yb290XSxcbiAgICApO1xuICAgIGNvbnN0IGxvZ0l0ID0gZGF0YSA9PiB7XG4gICAgICBsb2dnZXIuZGVidWcoJ2Zsb3cgc2VydmVyOiAnICsgZGF0YSk7XG4gICAgfTtcbiAgICBzZXJ2ZXJQcm9jZXNzLnN0ZG91dC5vbignZGF0YScsIGxvZ0l0KTtcbiAgICBzZXJ2ZXJQcm9jZXNzLnN0ZGVyci5vbignZGF0YScsIGxvZ0l0KTtcbiAgICBzZXJ2ZXJQcm9jZXNzLm9uKCdleGl0JywgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgLy8gV2Ugb25seSB3YW50IHRvIGJsYWNrbGlzdCB0aGlzIHJvb3QgaWYgdGhlIEZsb3cgcHJvY2Vzc2VzXG4gICAgICAvLyBhY3R1YWxseSBmYWlsZWQsIHJhdGhlciB0aGFuIGJlaW5nIGtpbGxlZCBtYW51YWxseS4gSXQgc2VlbXMgdGhhdFxuICAgICAgLy8gaWYgdGhleSBhcmUga2lsbGVkLCB0aGUgY29kZSBpcyBudWxsIGFuZCB0aGUgc2lnbmFsIGlzICdTSUdURVJNJy5cbiAgICAgIC8vIEluIHRoZSBGbG93IGNyYXNoZXMgSSBoYXZlIG9ic2VydmVkLCB0aGUgY29kZSBpcyAyIGFuZCB0aGUgc2lnbmFsXG4gICAgICAvLyBpcyBudWxsLiBTbywgbGV0J3MgYmxhY2tsaXN0IGNvbnNlcnZhdGl2ZWx5IGZvciBub3cgYW5kIHdlIGNhblxuICAgICAgLy8gYWRkIGNhc2VzIGxhdGVyIGlmIHdlIG9ic2VydmUgRmxvdyBjcmFzaGVzIHRoYXQgZG8gbm90IGZpdCB0aGlzXG4gICAgICAvLyBwYXR0ZXJuLlxuICAgICAgaWYgKGNvZGUgPT09IDIgJiYgc2lnbmFsID09PSBudWxsKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcignRmxvdyBzZXJ2ZXIgdW5leHBlY3RlZGx5IGV4aXRlZCcsIHRoaXMuX3Jvb3QpO1xuICAgICAgICB0aGlzLl9zZXJ2ZXJTdGF0dXMub25OZXh0KFNlcnZlclN0YXR1cy5GQUlMRUQpO1xuICAgICAgICB0aGlzLl9zZXJ2ZXJTdGF0dXMub25Db21wbGV0ZWQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLl9zdGFydGVkU2VydmVyID0gc2VydmVyUHJvY2VzcztcbiAgfVxuXG4gIC8qKiBFeGVjdXRlIEZsb3cgd2l0aCB0aGUgZ2l2ZW4gYXJndW1lbnRzICovXG4gIGFzeW5jIF9yYXdFeGVjRmxvdyhhcmdzOiBBcnJheTxhbnk+LCBvcHRpb25zPzogT2JqZWN0ID0ge30pOiBQcm9taXNlPD9wcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAgIGNvbnN0IGZsb3dPcHRpb25zID0gYXdhaXQgdGhpcy5fZ2V0Rmxvd0V4ZWNPcHRpb25zKCk7XG4gICAgaWYgKCFmbG93T3B0aW9ucykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIG9wdGlvbnMgPSB7Li4uZmxvd09wdGlvbnMsIC4uLm9wdGlvbnN9O1xuICAgIGFyZ3MgPSBbXG4gICAgICAuLi5hcmdzLFxuICAgICAgJy0tcmV0cnktaWYtaW5pdCcsICdmYWxzZScsXG4gICAgICAnLS1yZXRyaWVzJywgJzAnLFxuICAgICAgJy0tbm8tYXV0by1zdGFydCcsXG4gICAgICAnLS1mcm9tJywgJ251Y2xpZGUnLFxuICAgIF07XG4gICAgY29uc3QgcGF0aFRvRmxvdyA9IGdldFBhdGhUb0Zsb3coKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgYXN5bmNFeGVjdXRlKHBhdGhUb0Zsb3csIGFyZ3MsIG9wdGlvbnMpO1xuICAgICAgdGhpcy5fdXBkYXRlU2VydmVyU3RhdHVzKHJlc3VsdCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZVNlcnZlclN0YXR1cyhlKTtcbiAgICAgIGlmIChlLmV4aXRDb2RlID09PSBGTE9XX1JFVFVSTl9DT0RFUy50eXBlRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVTZXJ2ZXJTdGF0dXMocmVzdWx0OiA/cHJvY2VzcyRhc3luY0V4ZWN1dGVSZXQpOiB2b2lkIHtcbiAgICBsZXQgc3RhdHVzO1xuICAgIGlmIChyZXN1bHQgPT0gbnVsbCkge1xuICAgICAgc3RhdHVzID0gU2VydmVyU3RhdHVzLk5PVF9JTlNUQUxMRUQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXRjaCAocmVzdWx0LmV4aXRDb2RlKSB7XG4gICAgICAgIGNhc2UgRkxPV19SRVRVUk5fQ09ERVMub2s6XG4gICAgICAgICAgLy8gZmFsbHMgdGhyb3VnaFxuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLnR5cGVFcnJvcjpcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuUkVBRFk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRkxPV19SRVRVUk5fQ09ERVMuc2VydmVySW5pdGlhbGl6aW5nOlxuICAgICAgICAgIHN0YXR1cyA9IFNlcnZlclN0YXR1cy5JTklUO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLm5vU2VydmVyUnVubmluZzpcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuTk9UX1JVTk5JTkc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgRkxPV19SRVRVUk5fQ09ERVMub3V0T2ZSZXRyaWVzOlxuICAgICAgICAgIHN0YXR1cyA9IFNlcnZlclN0YXR1cy5CVVNZO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLmJ1aWxkSWRNaXNtYXRjaDpcbiAgICAgICAgICAvLyBJZiB0aGUgdmVyc2lvbiBkb2Vzbid0IG1hdGNoLCB0aGUgc2VydmVyIGlzIGF1dG9tYXRpY2FsbHkga2lsbGVkIGFuZCB0aGUgY2xpZW50XG4gICAgICAgICAgLy8gcmV0dXJucyA5LlxuICAgICAgICAgIGxvZ2dlci5pbmZvKCdLaWxsZWQgZmxvdyBzZXJ2ZXIgd2l0aCBpbmNvcnJlY3QgdmVyc2lvbiBpbicsIHRoaXMuX3Jvb3QpO1xuICAgICAgICAgIHN0YXR1cyA9IFNlcnZlclN0YXR1cy5OT1RfUlVOTklORztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBsb2dnZXIuZXJyb3IoJ1Vua25vd24gcmV0dXJuIGNvZGUgZnJvbSBGbG93OiAnICsgcmVzdWx0LmV4aXRDb2RlKTtcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuVU5LTk9XTjtcbiAgICAgIH1cbiAgICB9XG4gICAgaW52YXJpYW50KHN0YXR1cyAhPSBudWxsKTtcbiAgICBpZiAoc3RhdHVzICE9PSB0aGlzLl9zZXJ2ZXJTdGF0dXMuZ2V0VmFsdWUoKSkge1xuICAgICAgdGhpcy5fc2VydmVyU3RhdHVzLm9uTmV4dChzdGF0dXMpO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBQaW5nIHRoZSBzZXJ2ZXIgdW50aWwgaXQgbGVhdmVzIHRoZSBjdXJyZW50IHN0YXRlICovXG4gIGFzeW5jIF9waW5nU2VydmVyKHRyaWVzPzogbnVtYmVyID0gNSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZyb21TdGF0ZSA9IHRoaXMuX3NlcnZlclN0YXR1cy5nZXRWYWx1ZSgpO1xuICAgIGxldCBzdGF0ZUNoYW5nZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zZXJ2ZXJTdGF0dXMuZmlsdGVyKG5ld1N0YXRlID0+IG5ld1N0YXRlICE9PSBmcm9tU3RhdGUpLmZpcnN0KCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHN0YXRlQ2hhbmdlZCA9IHRydWU7XG4gICAgfSk7XG4gICAgZm9yIChsZXQgaSA9IDA7ICFzdGF0ZUNoYW5nZWQgJiYgaSA8IHRyaWVzOyBpKyspIHtcbiAgICAgIC8qIGVzbGludC1kaXNhYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgICAgIGF3YWl0IHRoaXMuX3Jhd0V4ZWNGbG93KFsnc3RhdHVzJ10pLmNhdGNoKCgpID0+IG51bGwpO1xuICAgICAgLy8gV2FpdCAxIHNlY29uZFxuICAgICAgYXdhaXQgT2JzZXJ2YWJsZS5qdXN0KG51bGwpLmRlbGF5KDEwMDApLnRvUHJvbWlzZSgpO1xuICAgICAgLyogZXNsaW50LWVuYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIHdoZW4gdGhlIHNlcnZlciBpcyByZWFkeSBvciB0aGUgcmVxdWVzdCB0aW1lcyBvdXQsIGFzIGluZGljYXRlZCBieSB0aGUgcmVzdWx0IG9mIHRoZVxuICAgKiByZXR1cm5lZCBQcm9taXNlLlxuICAgKi9cbiAgX3NlcnZlcklzUmVhZHkoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZlclN0YXR1c1xuICAgICAgLmZpbHRlcih4ID0+IHggPT09IFNlcnZlclN0YXR1cy5SRUFEWSlcbiAgICAgIC5tYXAoKCkgPT4gdHJ1ZSlcbiAgICAgIC50aW1lb3V0KFxuICAgICAgICBTRVJWRVJfUkVBRFlfVElNRU9VVF9NUyxcbiAgICAgICAgT2JzZXJ2YWJsZS5qdXN0KGZhbHNlKSxcbiAgICAgIClcbiAgICAgIC5maXJzdCgpXG4gICAgICAudG9Qcm9taXNlKCk7XG4gIH1cblxuICAvKipcbiAgKiBJZiB0aGlzIHJldHVybnMgbnVsbCwgdGhlbiBpdCBpcyBub3Qgc2FmZSB0byBydW4gZmxvdy5cbiAgKi9cbiAgYXN5bmMgX2dldEZsb3dFeGVjT3B0aW9ucygpOiBQcm9taXNlPD97Y3dkOiBzdHJpbmd9PiB7XG4gICAgY29uc3QgaW5zdGFsbGVkID0gYXdhaXQgaXNGbG93SW5zdGFsbGVkKCk7XG4gICAgaWYgKGluc3RhbGxlZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY3dkOiB0aGlzLl9yb290LFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG59XG4iXX0=