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

    this._serverStatus.filter(function (status) {
      return status === _FlowConstants.ServerStatus.FAILED;
    }).subscribe(function () {
      (0, _nuclideAnalytics.track)('flow-server-failed');
    });
  }

  _createClass(FlowProcess, [{
    key: 'dispose',
    value: function dispose() {
      this._serverStatus.onCompleted();
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
//# sourceMappingURL=data:application/json;base64,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SUFBSSxDQUFDLEtBQUssQ0FBQyxDQUN2Qjs7O09BR0EsS0FBSyxDQUFDLEVBQUMsWUFBWSxFQUFFLEtBQUssRUFBQyxDQUFDLENBQzVCLFNBQVMsRUFBRSxDQUFDO0tBQ2hCOzs7Ozs7OzZCQUt3QixhQUE0QjtBQUNuRCxVQUFNLFNBQVMsR0FBRyxNQUFNLG1DQUFpQixDQUFDO0FBQzFDLFVBQUksU0FBUyxFQUFFO0FBQ2IsZUFBTztBQUNMLGFBQUcsRUFBRSxJQUFJLENBQUMsS0FBSztTQUNoQixDQUFDO09BQ0gsTUFBTTtBQUNMLGVBQU8sSUFBSSxDQUFDO09BQ2I7S0FDRjs7Ozs7Ozs7Ozs7Ozs7NkJBWTBCLFdBQ3pCLElBQWdCLEVBRW1CO1VBRG5DLE9BQWdCLHlEQUFHLEVBQUU7O0FBRXJCLFVBQUksZ0NBQ0MsSUFBSSxJQUNQLFFBQVEsRUFBRSxTQUFTLEVBQ3BCLENBQUM7QUFDRixVQUFNLFVBQVUsR0FBRyxpQ0FBZSxDQUFDO0FBQ25DLGFBQU8sTUFBTSxrQ0FBYSxVQUFVLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3REOzs7U0FwUVUsV0FBVyIsImZpbGUiOiJGbG93UHJvY2Vzcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtwcm9jZXNzJGFzeW5jRXhlY3V0ZVJldH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcblxuaW1wb3J0IHR5cGUge1NlcnZlclN0YXR1c1R5cGV9IGZyb20gJy4uJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge0JlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZX0gZnJvbSAncngnO1xuXG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5cbmltcG9ydCB7XG4gIGFzeW5jRXhlY3V0ZSxcbiAgc2FmZVNwYXduLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuXG5pbXBvcnQge1xuICBpc0Zsb3dJbnN0YWxsZWQsXG4gIGdldFBhdGhUb0Zsb3csXG4gIGdldFN0b3BGbG93T25FeGl0LFxufSBmcm9tICcuL0Zsb3dIZWxwZXJzJztcblxuaW1wb3J0IHtTZXJ2ZXJTdGF0dXN9IGZyb20gJy4vRmxvd0NvbnN0YW50cyc7XG5cbi8vIE5hbWVzIG1vZGVsZWQgYWZ0ZXIgaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL2Zsb3cvYmxvYi9tYXN0ZXIvc3JjL2NvbW1vbi9mbG93RXhpdFN0YXR1cy5tbFxuZXhwb3J0IGNvbnN0IEZMT1dfUkVUVVJOX0NPREVTID0ge1xuICBvazogMCxcbiAgc2VydmVySW5pdGlhbGl6aW5nOiAxLFxuICB0eXBlRXJyb3I6IDIsXG4gIG5vU2VydmVyUnVubmluZzogNixcbiAgLy8gVGhpcyBtZWFucyB0aGF0IHRoZSBzZXJ2ZXIgZXhpc3RzLCBidXQgaXQgaXMgbm90IHJlc3BvbmRpbmcsIHR5cGljYWxseSBiZWNhdXNlIGl0IGlzIGJ1c3kgZG9pbmdcbiAgLy8gb3RoZXIgd29yay5cbiAgb3V0T2ZSZXRyaWVzOiA3LFxuICBidWlsZElkTWlzbWF0Y2g6IDksXG59O1xuXG5jb25zdCBTRVJWRVJfUkVBRFlfVElNRU9VVF9NUyA9IDEwICogMTAwMDtcblxuY29uc3QgRVhFQ19GTE9XX1JFVFJJRVMgPSA1O1xuXG5leHBvcnQgY2xhc3MgRmxvd1Byb2Nlc3Mge1xuICAvLyBJZiB3ZSBoYWQgdG8gc3RhcnQgYSBGbG93IHNlcnZlciwgc3RvcmUgdGhlIHByb2Nlc3MgaGVyZSBzbyB3ZSBjYW4ga2lsbCBpdCB3aGVuIHdlIHNodXQgZG93bi5cbiAgX3N0YXJ0ZWRTZXJ2ZXI6ID9jaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcztcbiAgLy8gVGhlIGN1cnJlbnQgc3RhdGUgb2YgdGhlIEZsb3cgc2VydmVyIGluIHRoaXMgZGlyZWN0b3J5XG4gIF9zZXJ2ZXJTdGF0dXM6IEJlaGF2aW9yU3ViamVjdDxTZXJ2ZXJTdGF0dXNUeXBlPjtcbiAgLy8gVGhlIHBhdGggdG8gdGhlIGRpcmVjdG9yeSB3aGVyZSB0aGUgLmZsb3djb25maWcgaXMgLS0gaS5lLiB0aGUgcm9vdCBvZiB0aGUgRmxvdyBwcm9qZWN0LlxuICBfcm9vdDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHJvb3Q6IHN0cmluZykge1xuICAgIHRoaXMuX3NlcnZlclN0YXR1cyA9IG5ldyBCZWhhdmlvclN1YmplY3QoU2VydmVyU3RhdHVzLlVOS05PV04pO1xuICAgIHRoaXMuX3Jvb3QgPSByb290O1xuXG4gICAgdGhpcy5fc2VydmVyU3RhdHVzLmZpbHRlcih4ID0+IHggPT09IFNlcnZlclN0YXR1cy5OT1RfUlVOTklORykuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgIHRoaXMuX3N0YXJ0Rmxvd1NlcnZlcigpO1xuICAgICAgdGhpcy5fcGluZ1NlcnZlcigpO1xuICAgIH0pO1xuICAgIGZ1bmN0aW9uIGlzQnVzeU9ySW5pdChzdGF0dXM6IFNlcnZlclN0YXR1c1R5cGUpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiBzdGF0dXMgPT09IFNlcnZlclN0YXR1cy5CVVNZIHx8IHN0YXR1cyA9PT0gU2VydmVyU3RhdHVzLklOSVQ7XG4gICAgfVxuICAgIHRoaXMuX3NlcnZlclN0YXR1cy5maWx0ZXIoaXNCdXN5T3JJbml0KS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5fcGluZ1NlcnZlcigpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5fc2VydmVyU3RhdHVzLmZpbHRlcihzdGF0dXMgPT4gc3RhdHVzID09PSBTZXJ2ZXJTdGF0dXMuRkFJTEVEKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdHJhY2soJ2Zsb3ctc2VydmVyLWZhaWxlZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXJ2ZXJTdGF0dXMub25Db21wbGV0ZWQoKTtcbiAgICBpZiAodGhpcy5fc3RhcnRlZFNlcnZlciAmJiBnZXRTdG9wRmxvd09uRXhpdCgpKSB7XG4gICAgICAvLyBUaGUgZGVmYXVsdCwgU0lHVEVSTSwgZG9lcyBub3QgcmVsaWFibHkga2lsbCB0aGUgZmxvdyBzZXJ2ZXJzLlxuICAgICAgdGhpcy5fc3RhcnRlZFNlcnZlci5raWxsKCdTSUdLSUxMJyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIElmIHRoZSBGbG93IHNlcnZlciBmYWlscyB3ZSB3aWxsIG5vdCB0cnkgdG8gcmVzdGFydCBpdCBhZ2FpbiBhdXRvbWF0aWNhbGx5LiBDYWxsaW5nIHRoaXNcbiAgICogbWV0aG9kIGxldHMgdXMgZXhpdCB0aGF0IHN0YXRlIGFuZCByZXRyeS5cbiAgICovXG4gIGFsbG93U2VydmVyUmVzdGFydCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc2VydmVyU3RhdHVzLmdldFZhbHVlKCkgPT09IFNlcnZlclN0YXR1cy5GQUlMRUQpIHtcbiAgICAgIHRoaXMuX3NlcnZlclN0YXR1cy5vbk5leHQoU2VydmVyU3RhdHVzLlVOS05PV04pO1xuICAgIH1cbiAgfVxuXG4gIGdldFNlcnZlclN0YXR1c1VwZGF0ZXMoKTogT2JzZXJ2YWJsZTxTZXJ2ZXJTdGF0dXNUeXBlPiB7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZlclN0YXR1cy5hc09ic2VydmFibGUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIG51bGwgaWYgRmxvdyBjYW5ub3QgYmUgZm91bmQuXG4gICAqL1xuICBhc3luYyBleGVjRmxvdyhcbiAgICBhcmdzOiBBcnJheTxhbnk+LFxuICAgIG9wdGlvbnM6IE9iamVjdCxcbiAgICBmaWxlOiBzdHJpbmcsXG4gICAgd2FpdEZvclNlcnZlcj86IGJvb2xlYW4gPSBmYWxzZSxcbiAgKTogUHJvbWlzZTw/cHJvY2VzcyRhc3luY0V4ZWN1dGVSZXQ+IHtcbiAgICBjb25zdCBtYXhSZXRyaWVzID0gd2FpdEZvclNlcnZlciA/IEVYRUNfRkxPV19SRVRSSUVTIDogMDtcbiAgICBpZiAodGhpcy5fc2VydmVyU3RhdHVzLmdldFZhbHVlKCkgPT09IFNlcnZlclN0YXR1cy5GQUlMRUQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgOyBpKyspIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX3Jhd0V4ZWNGbG93KCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhYmVsL25vLWF3YWl0LWluLWxvb3BcbiAgICAgICAgICBhcmdzLFxuICAgICAgICAgIG9wdGlvbnMsXG4gICAgICAgICk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNvbnN0IGNvdWxkUmV0cnkgPSBbU2VydmVyU3RhdHVzLk5PVF9SVU5OSU5HLCBTZXJ2ZXJTdGF0dXMuSU5JVCwgU2VydmVyU3RhdHVzLkJVU1ldXG4gICAgICAgICAgLmluZGV4T2YodGhpcy5fc2VydmVyU3RhdHVzLmdldFZhbHVlKCkpICE9PSAtMTtcbiAgICAgICAgaWYgKGkgPCBtYXhSZXRyaWVzICYmIGNvdWxkUmV0cnkpIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLl9zZXJ2ZXJJc1JlYWR5KCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgICAgIC8vIFRoZW4gdHJ5IGFnYWluLlxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElmIGl0IGNvdWxkbid0IHJldHJ5LCBpdCBtZWFucyB0aGVyZSB3YXMgYSBsZWdpdGltYXRlIGVycm9yLiBJZiBpdCBjb3VsZCByZXRyeSwgd2VcbiAgICAgICAgICAvLyBkb24ndCB3YW50IHRvIGxvZyBiZWNhdXNlIGl0IGp1c3QgbWVhbnMgdGhlIHNlcnZlciBpcyBidXN5IGFuZCB3ZSBkb24ndCB3YW50IHRvIHdhaXQuXG4gICAgICAgICAgaWYgKCFjb3VsZFJldHJ5KSB7XG4gICAgICAgICAgICAvLyBub3Qgc3VyZSB3aGF0IGhhcHBlbmVkLCBidXQgd2UnbGwgbGV0IHRoZSBjYWxsZXIgZGVhbCB3aXRoIGl0XG4gICAgICAgICAgICBsb2dnZXIuZXJyb3IoYEZsb3cgZmFpbGVkOiBmbG93ICR7YXJncy5qb2luKCcgJyl9LiBFcnJvcjogJHtKU09OLnN0cmluZ2lmeShlKX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgfVxuICAgICAgICAvLyB0cnkgYWdhaW5cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gb3RoZXJ3aXNlIGZsb3cgY29tcGxhaW5zXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKiogU3RhcnRzIGEgRmxvdyBzZXJ2ZXIgaW4gdGhlIGN1cnJlbnQgcm9vdCAqL1xuICBhc3luYyBfc3RhcnRGbG93U2VydmVyKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHBhdGhUb0Zsb3cgPSBnZXRQYXRoVG9GbG93KCk7XG4gICAgLy8gYGZsb3cgc2VydmVyYCB3aWxsIHN0YXJ0IGEgc2VydmVyIGluIHRoZSBmb3JlZ3JvdW5kLiBhc3luY0V4ZWN1dGVcbiAgICAvLyB3aWxsIG5vdCByZXNvbHZlIHRoZSBwcm9taXNlIHVudGlsIHRoZSBwcm9jZXNzIGV4aXRzLCB3aGljaCBpbiB0aGlzXG4gICAgLy8gY2FzZSBpcyBuZXZlci4gV2UgbmVlZCB0byB1c2Ugc3Bhd24gZGlyZWN0bHkgdG8gZ2V0IGFjY2VzcyB0byB0aGVcbiAgICAvLyBDaGlsZFByb2Nlc3Mgb2JqZWN0LlxuICAgIGNvbnN0IHNlcnZlclByb2Nlc3MgPSBhd2FpdCBzYWZlU3Bhd24oIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgcGF0aFRvRmxvdyxcbiAgICAgIFsnc2VydmVyJywgJy0tZnJvbScsICdudWNsaWRlJywgdGhpcy5fcm9vdF0sXG4gICAgKTtcbiAgICBjb25zdCBsb2dJdCA9IGRhdGEgPT4ge1xuICAgICAgY29uc3QgcGlkID0gc2VydmVyUHJvY2Vzcy5waWQ7XG4gICAgICBsb2dnZXIuZGVidWcoYGZsb3cgc2VydmVyICgke3BpZH0pOiAke2RhdGF9YCk7XG4gICAgfTtcbiAgICBzZXJ2ZXJQcm9jZXNzLnN0ZG91dC5vbignZGF0YScsIGxvZ0l0KTtcbiAgICBzZXJ2ZXJQcm9jZXNzLnN0ZGVyci5vbignZGF0YScsIGxvZ0l0KTtcbiAgICBzZXJ2ZXJQcm9jZXNzLm9uKCdleGl0JywgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgLy8gV2Ugb25seSB3YW50IHRvIGJsYWNrbGlzdCB0aGlzIHJvb3QgaWYgdGhlIEZsb3cgcHJvY2Vzc2VzXG4gICAgICAvLyBhY3R1YWxseSBmYWlsZWQsIHJhdGhlciB0aGFuIGJlaW5nIGtpbGxlZCBtYW51YWxseS4gSXQgc2VlbXMgdGhhdFxuICAgICAgLy8gaWYgdGhleSBhcmUga2lsbGVkLCB0aGUgY29kZSBpcyBudWxsIGFuZCB0aGUgc2lnbmFsIGlzICdTSUdURVJNJy5cbiAgICAgIC8vIEluIHRoZSBGbG93IGNyYXNoZXMgSSBoYXZlIG9ic2VydmVkLCB0aGUgY29kZSBpcyAyIGFuZCB0aGUgc2lnbmFsXG4gICAgICAvLyBpcyBudWxsLiBTbywgbGV0J3MgYmxhY2tsaXN0IGNvbnNlcnZhdGl2ZWx5IGZvciBub3cgYW5kIHdlIGNhblxuICAgICAgLy8gYWRkIGNhc2VzIGxhdGVyIGlmIHdlIG9ic2VydmUgRmxvdyBjcmFzaGVzIHRoYXQgZG8gbm90IGZpdCB0aGlzXG4gICAgICAvLyBwYXR0ZXJuLlxuICAgICAgaWYgKGNvZGUgPT09IDIgJiYgc2lnbmFsID09PSBudWxsKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcignRmxvdyBzZXJ2ZXIgdW5leHBlY3RlZGx5IGV4aXRlZCcsIHRoaXMuX3Jvb3QpO1xuICAgICAgICB0aGlzLl9zZXJ2ZXJTdGF0dXMub25OZXh0KFNlcnZlclN0YXR1cy5GQUlMRUQpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX3N0YXJ0ZWRTZXJ2ZXIgPSBzZXJ2ZXJQcm9jZXNzO1xuICB9XG5cbiAgLyoqIEV4ZWN1dGUgRmxvdyB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudHMgKi9cbiAgYXN5bmMgX3Jhd0V4ZWNGbG93KGFyZ3M6IEFycmF5PGFueT4sIG9wdGlvbnM/OiBPYmplY3QgPSB7fSk6IFByb21pc2U8P3Byb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gICAgY29uc3QgZmxvd09wdGlvbnMgPSBhd2FpdCB0aGlzLl9nZXRGbG93RXhlY09wdGlvbnMoKTtcbiAgICBpZiAoIWZsb3dPcHRpb25zKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgb3B0aW9ucyA9IHsuLi5mbG93T3B0aW9ucywgLi4ub3B0aW9uc307XG4gICAgYXJncyA9IFtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICAnLS1yZXRyeS1pZi1pbml0JywgJ2ZhbHNlJyxcbiAgICAgICctLXJldHJpZXMnLCAnMCcsXG4gICAgICAnLS1uby1hdXRvLXN0YXJ0JyxcbiAgICBdO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBGbG93UHJvY2Vzcy5leGVjRmxvd0NsaWVudChhcmdzLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVNlcnZlclN0YXR1cyhyZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl91cGRhdGVTZXJ2ZXJTdGF0dXMoZSk7XG4gICAgICBpZiAoZS5leGl0Q29kZSA9PT0gRkxPV19SRVRVUk5fQ09ERVMudHlwZUVycm9yKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdXBkYXRlU2VydmVyU3RhdHVzKHJlc3VsdDogP3Byb2Nlc3MkYXN5bmNFeGVjdXRlUmV0KTogdm9pZCB7XG4gICAgbGV0IHN0YXR1cztcbiAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgIHN0YXR1cyA9IFNlcnZlclN0YXR1cy5OT1RfSU5TVEFMTEVEO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKHJlc3VsdC5leGl0Q29kZSkge1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLm9rOlxuICAgICAgICAgIC8vIGZhbGxzIHRocm91Z2hcbiAgICAgICAgY2FzZSBGTE9XX1JFVFVSTl9DT0RFUy50eXBlRXJyb3I6XG4gICAgICAgICAgc3RhdHVzID0gU2VydmVyU3RhdHVzLlJFQURZO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLnNlcnZlckluaXRpYWxpemluZzpcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuSU5JVDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGTE9XX1JFVFVSTl9DT0RFUy5ub1NlcnZlclJ1bm5pbmc6XG4gICAgICAgICAgc3RhdHVzID0gU2VydmVyU3RhdHVzLk5PVF9SVU5OSU5HO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLm91dE9mUmV0cmllczpcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuQlVTWTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGTE9XX1JFVFVSTl9DT0RFUy5idWlsZElkTWlzbWF0Y2g6XG4gICAgICAgICAgLy8gSWYgdGhlIHZlcnNpb24gZG9lc24ndCBtYXRjaCwgdGhlIHNlcnZlciBpcyBhdXRvbWF0aWNhbGx5IGtpbGxlZCBhbmQgdGhlIGNsaWVudFxuICAgICAgICAgIC8vIHJldHVybnMgOS5cbiAgICAgICAgICBsb2dnZXIuaW5mbygnS2lsbGVkIGZsb3cgc2VydmVyIHdpdGggaW5jb3JyZWN0IHZlcnNpb24gaW4nLCB0aGlzLl9yb290KTtcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuTk9UX1JVTk5JTkc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdVbmtub3duIHJldHVybiBjb2RlIGZyb20gRmxvdzogJyArIHJlc3VsdC5leGl0Q29kZSk7XG4gICAgICAgICAgc3RhdHVzID0gU2VydmVyU3RhdHVzLlVOS05PV047XG4gICAgICB9XG4gICAgfVxuICAgIGludmFyaWFudChzdGF0dXMgIT0gbnVsbCk7XG4gICAgY29uc3QgY3VycmVudFN0YXR1cyA9IHRoaXMuX3NlcnZlclN0YXR1cy5nZXRWYWx1ZSgpO1xuICAgIC8vIEF2b2lkIGR1cGxpY2F0ZSB1cGRhdGVzIGFuZCBhdm9pZCBtb3ZpbmcgdGhlIHN0YXR1cyBhd2F5IGZyb20gRkFJTEVELCB0byBsZXQgYW55IGV4aXN0aW5nXG4gICAgLy8gd29yayBkaWUgb3V0IHdoZW4gdGhlIHNlcnZlciBmYWlscy5cbiAgICBpZiAoc3RhdHVzICE9PSBjdXJyZW50U3RhdHVzICYmIGN1cnJlbnRTdGF0dXMgIT09IFNlcnZlclN0YXR1cy5GQUlMRUQpIHtcbiAgICAgIHRoaXMuX3NlcnZlclN0YXR1cy5vbk5leHQoc3RhdHVzKTtcbiAgICB9XG4gIH1cblxuICAvKiogUGluZyB0aGUgc2VydmVyIHVudGlsIGl0IGxlYXZlcyB0aGUgY3VycmVudCBzdGF0ZSAqL1xuICBhc3luYyBfcGluZ1NlcnZlcih0cmllcz86IG51bWJlciA9IDUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmcm9tU3RhdGUgPSB0aGlzLl9zZXJ2ZXJTdGF0dXMuZ2V0VmFsdWUoKTtcbiAgICBsZXQgc3RhdGVDaGFuZ2VkID0gZmFsc2U7XG4gICAgdGhpcy5fc2VydmVyU3RhdHVzLmZpbHRlcihuZXdTdGF0ZSA9PiBuZXdTdGF0ZSAhPT0gZnJvbVN0YXRlKS5maXJzdCgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBzdGF0ZUNoYW5nZWQgPSB0cnVlO1xuICAgIH0pO1xuICAgIGZvciAobGV0IGkgPSAwOyAhc3RhdGVDaGFuZ2VkICYmIGkgPCB0cmllczsgaSsrKSB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgICBhd2FpdCB0aGlzLl9yYXdFeGVjRmxvdyhbJ3N0YXR1cyddKS5jYXRjaCgoKSA9PiBudWxsKTtcbiAgICAgIC8vIFdhaXQgMSBzZWNvbmRcbiAgICAgIGF3YWl0IE9ic2VydmFibGUuanVzdChudWxsKS5kZWxheSgxMDAwKS50b1Byb21pc2UoKTtcbiAgICAgIC8qIGVzbGludC1lbmFibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyB3aGVuIHRoZSBzZXJ2ZXIgaXMgcmVhZHkgb3IgdGhlIHJlcXVlc3QgdGltZXMgb3V0LCBhcyBpbmRpY2F0ZWQgYnkgdGhlIHJlc3VsdCBvZiB0aGVcbiAgICogcmV0dXJuZWQgUHJvbWlzZS5cbiAgICovXG4gIF9zZXJ2ZXJJc1JlYWR5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2ZXJTdGF0dXNcbiAgICAgIC5maWx0ZXIoeCA9PiB4ID09PSBTZXJ2ZXJTdGF0dXMuUkVBRFkpXG4gICAgICAubWFwKCgpID0+IHRydWUpXG4gICAgICAudGltZW91dChcbiAgICAgICAgU0VSVkVSX1JFQURZX1RJTUVPVVRfTVMsXG4gICAgICAgIE9ic2VydmFibGUuanVzdChmYWxzZSksXG4gICAgICApXG4gICAgICAvLyBJZiB0aGUgc3RyZWFtIGlzIGNvbXBsZXRlZCB0aW1lb3V0IHdpbGwgbm90IHJldHVybiBpdHMgZGVmYXVsdCB2YWx1ZSBhbmQgd2Ugd2lsbCBzZWUgYW5cbiAgICAgIC8vIEVtcHR5RXJyb3IuIFNvLCBwcm92aWRlIGEgZGVmYXVsdFZhbHVlIGhlcmUgc28gdGhlIHByb21pc2UgcmVzb2x2ZXMuXG4gICAgICAuZmlyc3Qoe2RlZmF1bHRWYWx1ZTogZmFsc2V9KVxuICAgICAgLnRvUHJvbWlzZSgpO1xuICB9XG5cbiAgLyoqXG4gICogSWYgdGhpcyByZXR1cm5zIG51bGwsIHRoZW4gaXQgaXMgbm90IHNhZmUgdG8gcnVuIGZsb3cuXG4gICovXG4gIGFzeW5jIF9nZXRGbG93RXhlY09wdGlvbnMoKTogUHJvbWlzZTw/e2N3ZDogc3RyaW5nfT4ge1xuICAgIGNvbnN0IGluc3RhbGxlZCA9IGF3YWl0IGlzRmxvd0luc3RhbGxlZCgpO1xuICAgIGlmIChpbnN0YWxsZWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGN3ZDogdGhpcy5fcm9vdCxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIHNob3VsZCBiZSB1c2VkIHRvIGV4ZWN1dGUgRmxvdyBjb21tYW5kcyB0aGF0IGRvIG5vdCByZWx5IG9uIGEgRmxvdyBzZXJ2ZXIuIFNvLCB0aGV5IGRvIG5vdFxuICAgKiBuZWVkIHRvIGJlIGFzc29jaWF0ZWQgd2l0aCBhIEZsb3dQcm9jZXNzIGluc3RhbmNlIGFuZCB0aGV5IG1heSBiZSBleGVjdXRlZCBmcm9tIGFueSB3b3JraW5nXG4gICAqIGRpcmVjdG9yeS5cbiAgICpcbiAgICogTm90ZSB0aGF0IHVzaW5nIHRoaXMgbWV0aG9kIG1lYW5zIHRoYXQgeW91IGdldCBubyBndWFyYW50ZWUgdGhhdCB0aGUgRmxvdyB2ZXJzaW9uIHNwZWNpZmllZCBpblxuICAgKiBhbnkgZ2l2ZW4gLmZsb3djb25maWcgaXMgdGhlIG9uZSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgaGVyZSwgYmVjYXVzZSBpdCBoYXMgbm8gYXNzb2NpYXRpb24gd2l0aFxuICAgKiBhbnkgZ2l2ZW4gcm9vdC4gSWYgeW91IG5lZWQgdGhpcyBwcm9wZXJ0eSwgY3JlYXRlIGFuIGluc3RhbmNlIHdpdGggdGhlIGFwcHJvcHJpYXRlIHJvb3QgYW5kIHVzZVxuICAgKiBleGVjRmxvdy5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBleGVjRmxvd0NsaWVudChcbiAgICBhcmdzOiBBcnJheTxhbnk+LFxuICAgIG9wdGlvbnM/OiBPYmplY3QgPSB7fVxuICApOiBQcm9taXNlPD9wcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAgIGFyZ3MgPSBbXG4gICAgICAuLi5hcmdzLFxuICAgICAgJy0tZnJvbScsICdudWNsaWRlJyxcbiAgICBdO1xuICAgIGNvbnN0IHBhdGhUb0Zsb3cgPSBnZXRQYXRoVG9GbG93KCk7XG4gICAgcmV0dXJuIGF3YWl0IGFzeW5jRXhlY3V0ZShwYXRoVG9GbG93LCBhcmdzLCBvcHRpb25zKTtcbiAgfVxufVxuIl19