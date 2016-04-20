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

var _reactivexRxjs = require('@reactivex/rxjs');

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
  buildIdMismatch: 9
};

exports.FLOW_RETURN_CODES = FLOW_RETURN_CODES;
var SERVER_READY_TIMEOUT_MS = 10 * 1000;

var EXEC_FLOW_RETRIES = 5;

var FlowProcess = (function () {
  function FlowProcess(root) {
    var _this = this;

    _classCallCheck(this, FlowProcess);

    this._serverStatus = new _reactivexRxjs.BehaviorSubject(_FlowConstants.ServerStatus.UNKNOWN);
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

      var pathToFlow = (0, _FlowHelpers.getPathToFlow)();
      // `flow server` will start a server in the foreground. asyncExecute
      // will not resolve the promise until the process exits, which in this
      // case is never. We need to use spawn directly to get access to the
      // ChildProcess object.
      var serverProcess = yield (0, _nuclideCommons.safeSpawn)( // eslint-disable-line babel/no-await-in-loop
      pathToFlow, ['server', '--from', 'nuclide', this._root]);
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
        yield _reactivexRxjs.Observable.of(null).delay(1000).toPromise();
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
      }).race(_reactivexRxjs.Observable.of(false).delay(SERVER_READY_TIMEOUT_MS))
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
//# sourceMappingURL=data:application/json;base64,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LEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDOzs7T0FHekQsS0FBSyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQ3hCLFNBQVMsRUFBRSxDQUFDO0tBQ2hCOzs7Ozs7OzZCQUt3QixhQUE0QjtBQUNuRCxVQUFNLFNBQVMsR0FBRyxNQUFNLG1DQUFpQixDQUFDO0FBQzFDLFVBQUksU0FBUyxFQUFFO0FBQ2IsZUFBTztBQUNMLGFBQUcsRUFBRSxJQUFJLENBQUMsS0FBSztTQUNoQixDQUFDO09BQ0gsTUFBTTtBQUNMLGVBQU8sSUFBSSxDQUFDO09BQ2I7S0FDRjs7Ozs7Ozs7Ozs7Ozs7NkJBWTBCLFdBQ3pCLElBQWdCLEVBRW1CO1VBRG5DLE9BQWdCLHlEQUFHLEVBQUU7O0FBRXJCLFVBQUksZ0NBQ0MsSUFBSSxJQUNQLFFBQVEsRUFBRSxTQUFTLEVBQ3BCLENBQUM7QUFDRixVQUFNLFVBQVUsR0FBRyxpQ0FBZSxDQUFDO0FBQ25DLGFBQU8sTUFBTSxrQ0FBYSxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3REOzs7U0FqUVUsV0FBVyIsImZpbGUiOiJGbG93UHJvY2Vzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcblxuaW1wb3J0IHR5cGUge1NlcnZlclN0YXR1c1R5cGV9IGZyb20gJy4uJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge0JlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZX0gZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcblxuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuXG5pbXBvcnQge1xuICBhc3luY0V4ZWN1dGUsXG4gIHNhZmVTcGF3bixcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcblxuaW1wb3J0IHtcbiAgaXNGbG93SW5zdGFsbGVkLFxuICBnZXRQYXRoVG9GbG93LFxuICBnZXRTdG9wRmxvd09uRXhpdCxcbn0gZnJvbSAnLi9GbG93SGVscGVycyc7XG5cbmltcG9ydCB7U2VydmVyU3RhdHVzfSBmcm9tICcuL0Zsb3dDb25zdGFudHMnO1xuXG4vLyBOYW1lcyBtb2RlbGVkIGFmdGVyIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2Jsb2IvbWFzdGVyL3NyYy9jb21tb24vZmxvd0V4aXRTdGF0dXMubWxcbmV4cG9ydCBjb25zdCBGTE9XX1JFVFVSTl9DT0RFUyA9IHtcbiAgb2s6IDAsXG4gIHNlcnZlckluaXRpYWxpemluZzogMSxcbiAgdHlwZUVycm9yOiAyLFxuICBub1NlcnZlclJ1bm5pbmc6IDYsXG4gIC8vIFRoaXMgbWVhbnMgdGhhdCB0aGUgc2VydmVyIGV4aXN0cywgYnV0IGl0IGlzIG5vdCByZXNwb25kaW5nLCB0eXBpY2FsbHkgYmVjYXVzZSBpdCBpcyBidXN5IGRvaW5nXG4gIC8vIG90aGVyIHdvcmsuXG4gIG91dE9mUmV0cmllczogNyxcbiAgYnVpbGRJZE1pc21hdGNoOiA5LFxufTtcblxuY29uc3QgU0VSVkVSX1JFQURZX1RJTUVPVVRfTVMgPSAxMCAqIDEwMDA7XG5cbmNvbnN0IEVYRUNfRkxPV19SRVRSSUVTID0gNTtcblxuZXhwb3J0IGNsYXNzIEZsb3dQcm9jZXNzIHtcbiAgLy8gSWYgd2UgaGFkIHRvIHN0YXJ0IGEgRmxvdyBzZXJ2ZXIsIHN0b3JlIHRoZSBwcm9jZXNzIGhlcmUgc28gd2UgY2FuIGtpbGwgaXQgd2hlbiB3ZSBzaHV0IGRvd24uXG4gIF9zdGFydGVkU2VydmVyOiA/Y2hpbGRfcHJvY2VzcyRDaGlsZFByb2Nlc3M7XG4gIC8vIFRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBGbG93IHNlcnZlciBpbiB0aGlzIGRpcmVjdG9yeVxuICBfc2VydmVyU3RhdHVzOiBCZWhhdmlvclN1YmplY3Q8U2VydmVyU3RhdHVzVHlwZT47XG4gIC8vIFRoZSBwYXRoIHRvIHRoZSBkaXJlY3Rvcnkgd2hlcmUgdGhlIC5mbG93Y29uZmlnIGlzIC0tIGkuZS4gdGhlIHJvb3Qgb2YgdGhlIEZsb3cgcHJvamVjdC5cbiAgX3Jvb3Q6IHN0cmluZztcblxuICBjb25zdHJ1Y3Rvcihyb290OiBzdHJpbmcpIHtcbiAgICB0aGlzLl9zZXJ2ZXJTdGF0dXMgPSBuZXcgQmVoYXZpb3JTdWJqZWN0KFNlcnZlclN0YXR1cy5VTktOT1dOKTtcbiAgICB0aGlzLl9yb290ID0gcm9vdDtcblxuICAgIHRoaXMuX3NlcnZlclN0YXR1cy5maWx0ZXIoeCA9PiB4ID09PSBTZXJ2ZXJTdGF0dXMuTk9UX1JVTk5JTkcpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl9zdGFydEZsb3dTZXJ2ZXIoKTtcbiAgICAgIHRoaXMuX3BpbmdTZXJ2ZXIoKTtcbiAgICB9KTtcbiAgICBmdW5jdGlvbiBpc0J1c3lPckluaXQoc3RhdHVzOiBTZXJ2ZXJTdGF0dXNUeXBlKTogYm9vbGVhbiB7XG4gICAgICByZXR1cm4gc3RhdHVzID09PSBTZXJ2ZXJTdGF0dXMuQlVTWSB8fCBzdGF0dXMgPT09IFNlcnZlclN0YXR1cy5JTklUO1xuICAgIH1cbiAgICB0aGlzLl9zZXJ2ZXJTdGF0dXMuZmlsdGVyKGlzQnVzeU9ySW5pdCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuX3BpbmdTZXJ2ZXIoKTtcbiAgICB9KTtcblxuICAgIHRoaXMuX3NlcnZlclN0YXR1cy5maWx0ZXIoc3RhdHVzID0+IHN0YXR1cyA9PT0gU2VydmVyU3RhdHVzLkZBSUxFRCkuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRyYWNrKCdmbG93LXNlcnZlci1mYWlsZWQnKTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fc2VydmVyU3RhdHVzLmNvbXBsZXRlKCk7XG4gICAgaWYgKHRoaXMuX3N0YXJ0ZWRTZXJ2ZXIgJiYgZ2V0U3RvcEZsb3dPbkV4aXQoKSkge1xuICAgICAgLy8gVGhlIGRlZmF1bHQsIFNJR1RFUk0sIGRvZXMgbm90IHJlbGlhYmx5IGtpbGwgdGhlIGZsb3cgc2VydmVycy5cbiAgICAgIHRoaXMuX3N0YXJ0ZWRTZXJ2ZXIua2lsbCgnU0lHS0lMTCcpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgRmxvdyBzZXJ2ZXIgZmFpbHMgd2Ugd2lsbCBub3QgdHJ5IHRvIHJlc3RhcnQgaXQgYWdhaW4gYXV0b21hdGljYWxseS4gQ2FsbGluZyB0aGlzXG4gICAqIG1ldGhvZCBsZXRzIHVzIGV4aXQgdGhhdCBzdGF0ZSBhbmQgcmV0cnkuXG4gICAqL1xuICBhbGxvd1NlcnZlclJlc3RhcnQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3NlcnZlclN0YXR1cy5nZXRWYWx1ZSgpID09PSBTZXJ2ZXJTdGF0dXMuRkFJTEVEKSB7XG4gICAgICB0aGlzLl9zZXJ2ZXJTdGF0dXMubmV4dChTZXJ2ZXJTdGF0dXMuVU5LTk9XTik7XG4gICAgfVxuICB9XG5cbiAgZ2V0U2VydmVyU3RhdHVzVXBkYXRlcygpOiBPYnNlcnZhYmxlPFNlcnZlclN0YXR1c1R5cGU+IHtcbiAgICByZXR1cm4gdGhpcy5fc2VydmVyU3RhdHVzLmFzT2JzZXJ2YWJsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgbnVsbCBpZiBGbG93IGNhbm5vdCBiZSBmb3VuZC5cbiAgICovXG4gIGFzeW5jIGV4ZWNGbG93KFxuICAgIGFyZ3M6IEFycmF5PGFueT4sXG4gICAgb3B0aW9uczogT2JqZWN0LFxuICAgIGZpbGU6IHN0cmluZyxcbiAgICB3YWl0Rm9yU2VydmVyPzogYm9vbGVhbiA9IGZhbHNlLFxuICApOiBQcm9taXNlPD9wcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAgIGNvbnN0IG1heFJldHJpZXMgPSB3YWl0Rm9yU2VydmVyID8gRVhFQ19GTE9XX1JFVFJJRVMgOiAwO1xuICAgIGlmICh0aGlzLl9zZXJ2ZXJTdGF0dXMuZ2V0VmFsdWUoKSA9PT0gU2VydmVyU3RhdHVzLkZBSUxFRCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyA7IGkrKykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcmF3RXhlY0Zsb3coIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgICAgIGFyZ3MsXG4gICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY29uc3QgY291bGRSZXRyeSA9IFtTZXJ2ZXJTdGF0dXMuTk9UX1JVTk5JTkcsIFNlcnZlclN0YXR1cy5JTklULCBTZXJ2ZXJTdGF0dXMuQlVTWV1cbiAgICAgICAgICAuaW5kZXhPZih0aGlzLl9zZXJ2ZXJTdGF0dXMuZ2V0VmFsdWUoKSkgIT09IC0xO1xuICAgICAgICBpZiAoaSA8IG1heFJldHJpZXMgJiYgY291bGRSZXRyeSkge1xuICAgICAgICAgIGF3YWl0IHRoaXMuX3NlcnZlcklzUmVhZHkoKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wXG4gICAgICAgICAgLy8gVGhlbiB0cnkgYWdhaW4uXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gSWYgaXQgY291bGRuJ3QgcmV0cnksIGl0IG1lYW5zIHRoZXJlIHdhcyBhIGxlZ2l0aW1hdGUgZXJyb3IuIElmIGl0IGNvdWxkIHJldHJ5LCB3ZVxuICAgICAgICAgIC8vIGRvbid0IHdhbnQgdG8gbG9nIGJlY2F1c2UgaXQganVzdCBtZWFucyB0aGUgc2VydmVyIGlzIGJ1c3kgYW5kIHdlIGRvbid0IHdhbnQgdG8gd2FpdC5cbiAgICAgICAgICBpZiAoIWNvdWxkUmV0cnkpIHtcbiAgICAgICAgICAgIC8vIG5vdCBzdXJlIHdoYXQgaGFwcGVuZWQsIGJ1dCB3ZSdsbCBsZXQgdGhlIGNhbGxlciBkZWFsIHdpdGggaXRcbiAgICAgICAgICAgIGxvZ2dlci5lcnJvcihgRmxvdyBmYWlsZWQ6IGZsb3cgJHthcmdzLmpvaW4oJyAnKX0uIEVycm9yOiAke0pTT04uc3RyaW5naWZ5KGUpfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aHJvdyBlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRyeSBhZ2FpblxuICAgICAgfVxuICAgIH1cbiAgICAvLyBvdGhlcndpc2UgZmxvdyBjb21wbGFpbnNcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKiBTdGFydHMgYSBGbG93IHNlcnZlciBpbiB0aGUgY3VycmVudCByb290ICovXG4gIGFzeW5jIF9zdGFydEZsb3dTZXJ2ZXIoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcGF0aFRvRmxvdyA9IGdldFBhdGhUb0Zsb3coKTtcbiAgICAvLyBgZmxvdyBzZXJ2ZXJgIHdpbGwgc3RhcnQgYSBzZXJ2ZXIgaW4gdGhlIGZvcmVncm91bmQuIGFzeW5jRXhlY3V0ZVxuICAgIC8vIHdpbGwgbm90IHJlc29sdmUgdGhlIHByb21pc2UgdW50aWwgdGhlIHByb2Nlc3MgZXhpdHMsIHdoaWNoIGluIHRoaXNcbiAgICAvLyBjYXNlIGlzIG5ldmVyLiBXZSBuZWVkIHRvIHVzZSBzcGF3biBkaXJlY3RseSB0byBnZXQgYWNjZXNzIHRvIHRoZVxuICAgIC8vIENoaWxkUHJvY2VzcyBvYmplY3QuXG4gICAgY29uc3Qgc2VydmVyUHJvY2VzcyA9IGF3YWl0IHNhZmVTcGF3biggLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wXG4gICAgICBwYXRoVG9GbG93LFxuICAgICAgWydzZXJ2ZXInLCAnLS1mcm9tJywgJ251Y2xpZGUnLCB0aGlzLl9yb290XSxcbiAgICApO1xuICAgIGNvbnN0IGxvZ0l0ID0gZGF0YSA9PiB7XG4gICAgICBjb25zdCBwaWQgPSBzZXJ2ZXJQcm9jZXNzLnBpZDtcbiAgICAgIGxvZ2dlci5kZWJ1ZyhgZmxvdyBzZXJ2ZXIgKCR7cGlkfSk6ICR7ZGF0YX1gKTtcbiAgICB9O1xuICAgIHNlcnZlclByb2Nlc3Muc3Rkb3V0Lm9uKCdkYXRhJywgbG9nSXQpO1xuICAgIHNlcnZlclByb2Nlc3Muc3RkZXJyLm9uKCdkYXRhJywgbG9nSXQpO1xuICAgIHNlcnZlclByb2Nlc3Mub24oJ2V4aXQnLCAoY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICAvLyBXZSBvbmx5IHdhbnQgdG8gYmxhY2tsaXN0IHRoaXMgcm9vdCBpZiB0aGUgRmxvdyBwcm9jZXNzZXNcbiAgICAgIC8vIGFjdHVhbGx5IGZhaWxlZCwgcmF0aGVyIHRoYW4gYmVpbmcga2lsbGVkIG1hbnVhbGx5LiBJdCBzZWVtcyB0aGF0XG4gICAgICAvLyBpZiB0aGV5IGFyZSBraWxsZWQsIHRoZSBjb2RlIGlzIG51bGwgYW5kIHRoZSBzaWduYWwgaXMgJ1NJR1RFUk0nLlxuICAgICAgLy8gSW4gdGhlIEZsb3cgY3Jhc2hlcyBJIGhhdmUgb2JzZXJ2ZWQsIHRoZSBjb2RlIGlzIDIgYW5kIHRoZSBzaWduYWxcbiAgICAgIC8vIGlzIG51bGwuIFNvLCBsZXQncyBibGFja2xpc3QgY29uc2VydmF0aXZlbHkgZm9yIG5vdyBhbmQgd2UgY2FuXG4gICAgICAvLyBhZGQgY2FzZXMgbGF0ZXIgaWYgd2Ugb2JzZXJ2ZSBGbG93IGNyYXNoZXMgdGhhdCBkbyBub3QgZml0IHRoaXNcbiAgICAgIC8vIHBhdHRlcm4uXG4gICAgICBpZiAoY29kZSA9PT0gMiAmJiBzaWduYWwgPT09IG51bGwpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdGbG93IHNlcnZlciB1bmV4cGVjdGVkbHkgZXhpdGVkJywgdGhpcy5fcm9vdCk7XG4gICAgICAgIHRoaXMuX3NlcnZlclN0YXR1cy5uZXh0KFNlcnZlclN0YXR1cy5GQUlMRUQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX3N0YXJ0ZWRTZXJ2ZXIgPSBzZXJ2ZXJQcm9jZXNzO1xuICB9XG5cbiAgLyoqIEV4ZWN1dGUgRmxvdyB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudHMgKi9cbiAgYXN5bmMgX3Jhd0V4ZWNGbG93KGFyZ3M6IEFycmF5PGFueT4sIG9wdGlvbnM/OiBPYmplY3QgPSB7fSk6IFByb21pc2U8P3Byb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gICAgY29uc3QgZmxvd09wdGlvbnMgPSBhd2FpdCB0aGlzLl9nZXRGbG93RXhlY09wdGlvbnMoKTtcbiAgICBpZiAoIWZsb3dPcHRpb25zKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgb3B0aW9ucyA9IHsuLi5mbG93T3B0aW9ucywgLi4ub3B0aW9uc307XG4gICAgYXJncyA9IFtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICAnLS1yZXRyeS1pZi1pbml0JywgJ2ZhbHNlJyxcbiAgICAgICctLXJldHJpZXMnLCAnMCcsXG4gICAgICAnLS1uby1hdXRvLXN0YXJ0JyxcbiAgICBdO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBGbG93UHJvY2Vzcy5leGVjRmxvd0NsaWVudChhcmdzLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVNlcnZlclN0YXR1cyhyZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl91cGRhdGVTZXJ2ZXJTdGF0dXMoZSk7XG4gICAgICBpZiAoZS5leGl0Q29kZSA9PT0gRkxPV19SRVRVUk5fQ09ERVMudHlwZUVycm9yKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdXBkYXRlU2VydmVyU3RhdHVzKHJlc3VsdDogP3Byb2Nlc3MkYXN5bmNFeGVjdXRlUmV0KTogdm9pZCB7XG4gICAgbGV0IHN0YXR1cztcbiAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgIHN0YXR1cyA9IFNlcnZlclN0YXR1cy5OT1RfSU5TVEFMTEVEO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKHJlc3VsdC5leGl0Q29kZSkge1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLm9rOlxuICAgICAgICAgIC8vIGZhbGxzIHRocm91Z2hcbiAgICAgICAgY2FzZSBGTE9XX1JFVFVSTl9DT0RFUy50eXBlRXJyb3I6XG4gICAgICAgICAgc3RhdHVzID0gU2VydmVyU3RhdHVzLlJFQURZO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLnNlcnZlckluaXRpYWxpemluZzpcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuSU5JVDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGTE9XX1JFVFVSTl9DT0RFUy5ub1NlcnZlclJ1bm5pbmc6XG4gICAgICAgICAgc3RhdHVzID0gU2VydmVyU3RhdHVzLk5PVF9SVU5OSU5HO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLm91dE9mUmV0cmllczpcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuQlVTWTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGTE9XX1JFVFVSTl9DT0RFUy5idWlsZElkTWlzbWF0Y2g6XG4gICAgICAgICAgLy8gSWYgdGhlIHZlcnNpb24gZG9lc24ndCBtYXRjaCwgdGhlIHNlcnZlciBpcyBhdXRvbWF0aWNhbGx5IGtpbGxlZCBhbmQgdGhlIGNsaWVudFxuICAgICAgICAgIC8vIHJldHVybnMgOS5cbiAgICAgICAgICBsb2dnZXIuaW5mbygnS2lsbGVkIGZsb3cgc2VydmVyIHdpdGggaW5jb3JyZWN0IHZlcnNpb24gaW4nLCB0aGlzLl9yb290KTtcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuTk9UX1JVTk5JTkc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdVbmtub3duIHJldHVybiBjb2RlIGZyb20gRmxvdzogJyArIHJlc3VsdC5leGl0Q29kZSk7XG4gICAgICAgICAgc3RhdHVzID0gU2VydmVyU3RhdHVzLlVOS05PV047XG4gICAgICB9XG4gICAgfVxuICAgIGludmFyaWFudChzdGF0dXMgIT0gbnVsbCk7XG4gICAgY29uc3QgY3VycmVudFN0YXR1cyA9IHRoaXMuX3NlcnZlclN0YXR1cy5nZXRWYWx1ZSgpO1xuICAgIC8vIEF2b2lkIGR1cGxpY2F0ZSB1cGRhdGVzIGFuZCBhdm9pZCBtb3ZpbmcgdGhlIHN0YXR1cyBhd2F5IGZyb20gRkFJTEVELCB0byBsZXQgYW55IGV4aXN0aW5nXG4gICAgLy8gd29yayBkaWUgb3V0IHdoZW4gdGhlIHNlcnZlciBmYWlscy5cbiAgICBpZiAoc3RhdHVzICE9PSBjdXJyZW50U3RhdHVzICYmIGN1cnJlbnRTdGF0dXMgIT09IFNlcnZlclN0YXR1cy5GQUlMRUQpIHtcbiAgICAgIHRoaXMuX3NlcnZlclN0YXR1cy5uZXh0KHN0YXR1cyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIFBpbmcgdGhlIHNlcnZlciB1bnRpbCBpdCBsZWF2ZXMgdGhlIGN1cnJlbnQgc3RhdGUgKi9cbiAgYXN5bmMgX3BpbmdTZXJ2ZXIodHJpZXM/OiBudW1iZXIgPSA1KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZnJvbVN0YXRlID0gdGhpcy5fc2VydmVyU3RhdHVzLmdldFZhbHVlKCk7XG4gICAgbGV0IHN0YXRlQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3NlcnZlclN0YXR1cy5maWx0ZXIobmV3U3RhdGUgPT4gbmV3U3RhdGUgIT09IGZyb21TdGF0ZSkuZmlyc3QoKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgc3RhdGVDaGFuZ2VkID0gdHJ1ZTtcbiAgICB9KTtcbiAgICBmb3IgKGxldCBpID0gMDsgIXN0YXRlQ2hhbmdlZCAmJiBpIDwgdHJpZXM7IGkrKykge1xuICAgICAgLyogZXNsaW50LWRpc2FibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgICAgYXdhaXQgdGhpcy5fcmF3RXhlY0Zsb3coWydzdGF0dXMnXSkuY2F0Y2goKCkgPT4gbnVsbCk7XG4gICAgICAvLyBXYWl0IDEgc2Vjb25kXG4gICAgICBhd2FpdCBPYnNlcnZhYmxlLm9mKG51bGwpLmRlbGF5KDEwMDApLnRvUHJvbWlzZSgpO1xuICAgICAgLyogZXNsaW50LWVuYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlc29sdmVzIHdoZW4gdGhlIHNlcnZlciBpcyByZWFkeSBvciB0aGUgcmVxdWVzdCB0aW1lcyBvdXQsIGFzIGluZGljYXRlZCBieSB0aGUgcmVzdWx0IG9mIHRoZVxuICAgKiByZXR1cm5lZCBQcm9taXNlLlxuICAgKi9cbiAgX3NlcnZlcklzUmVhZHkoKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZlclN0YXR1c1xuICAgICAgLmZpbHRlcih4ID0+IHggPT09IFNlcnZlclN0YXR1cy5SRUFEWSlcbiAgICAgIC5tYXAoKCkgPT4gdHJ1ZSlcbiAgICAgIC5yYWNlKE9ic2VydmFibGUub2YoZmFsc2UpLmRlbGF5KFNFUlZFUl9SRUFEWV9USU1FT1VUX01TKSlcbiAgICAgIC8vIElmIHRoZSBzdHJlYW0gaXMgY29tcGxldGVkIHRpbWVvdXQgd2lsbCBub3QgcmV0dXJuIGl0cyBkZWZhdWx0IHZhbHVlIGFuZCB3ZSB3aWxsIHNlZSBhblxuICAgICAgLy8gRW1wdHlFcnJvci4gU28sIHByb3ZpZGUgYSBkZWZhdWx0VmFsdWUgaGVyZSBzbyB0aGUgcHJvbWlzZSByZXNvbHZlcy5cbiAgICAgIC5maXJzdChudWxsLCBudWxsLCBmYWxzZSlcbiAgICAgIC50b1Byb21pc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAqIElmIHRoaXMgcmV0dXJucyBudWxsLCB0aGVuIGl0IGlzIG5vdCBzYWZlIHRvIHJ1biBmbG93LlxuICAqL1xuICBhc3luYyBfZ2V0Rmxvd0V4ZWNPcHRpb25zKCk6IFByb21pc2U8P3tjd2Q6IHN0cmluZ30+IHtcbiAgICBjb25zdCBpbnN0YWxsZWQgPSBhd2FpdCBpc0Zsb3dJbnN0YWxsZWQoKTtcbiAgICBpZiAoaW5zdGFsbGVkKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjd2Q6IHRoaXMuX3Jvb3QsXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBzaG91bGQgYmUgdXNlZCB0byBleGVjdXRlIEZsb3cgY29tbWFuZHMgdGhhdCBkbyBub3QgcmVseSBvbiBhIEZsb3cgc2VydmVyLiBTbywgdGhleSBkbyBub3RcbiAgICogbmVlZCB0byBiZSBhc3NvY2lhdGVkIHdpdGggYSBGbG93UHJvY2VzcyBpbnN0YW5jZSBhbmQgdGhleSBtYXkgYmUgZXhlY3V0ZWQgZnJvbSBhbnkgd29ya2luZ1xuICAgKiBkaXJlY3RvcnkuXG4gICAqXG4gICAqIE5vdGUgdGhhdCB1c2luZyB0aGlzIG1ldGhvZCBtZWFucyB0aGF0IHlvdSBnZXQgbm8gZ3VhcmFudGVlIHRoYXQgdGhlIEZsb3cgdmVyc2lvbiBzcGVjaWZpZWQgaW5cbiAgICogYW55IGdpdmVuIC5mbG93Y29uZmlnIGlzIHRoZSBvbmUgdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGhlcmUsIGJlY2F1c2UgaXQgaGFzIG5vIGFzc29jaWF0aW9uIHdpdGhcbiAgICogYW55IGdpdmVuIHJvb3QuIElmIHlvdSBuZWVkIHRoaXMgcHJvcGVydHksIGNyZWF0ZSBhbiBpbnN0YW5jZSB3aXRoIHRoZSBhcHByb3ByaWF0ZSByb290IGFuZCB1c2VcbiAgICogZXhlY0Zsb3cuXG4gICAqL1xuICBzdGF0aWMgYXN5bmMgZXhlY0Zsb3dDbGllbnQoXG4gICAgYXJnczogQXJyYXk8YW55PixcbiAgICBvcHRpb25zPzogT2JqZWN0ID0ge31cbiAgKTogUHJvbWlzZTw/cHJvY2VzcyRhc3luY0V4ZWN1dGVSZXQ+IHtcbiAgICBhcmdzID0gW1xuICAgICAgLi4uYXJncyxcbiAgICAgICctLWZyb20nLCAnbnVjbGlkZScsXG4gICAgXTtcbiAgICBjb25zdCBwYXRoVG9GbG93ID0gZ2V0UGF0aFRvRmxvdygpO1xuICAgIHJldHVybiBhd2FpdCBhc3luY0V4ZWN1dGUocGF0aFRvRmxvdywgYXJncywgb3B0aW9ucyk7XG4gIH1cbn1cbiJdfQ==