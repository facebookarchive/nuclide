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
//# sourceMappingURL=data:application/json;base64,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QUM7QUFDbkMsYUFBTyxNQUFNLDJCQUFhLFVBQVUsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDdEQ7OztTQWpQVSxXQUFXIiwiZmlsZSI6IkZsb3dQcm9jZXNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge3Byb2Nlc3MkYXN5bmNFeGVjdXRlUmV0fSBmcm9tICcuLi8uLi9jb21tb25zJztcblxuaW1wb3J0IHR5cGUge1NlcnZlclN0YXR1c1R5cGV9IGZyb20gJy4vRmxvd1NlcnZpY2UnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7QmVoYXZpb3JTdWJqZWN0LCBPYnNlcnZhYmxlfSBmcm9tICdyeCc7XG5cbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG5pbXBvcnQge1xuICBhc3luY0V4ZWN1dGUsXG4gIHNhZmVTcGF3bixcbn0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5cbmltcG9ydCB7XG4gIGlzRmxvd0luc3RhbGxlZCxcbiAgZ2V0UGF0aFRvRmxvdyxcbiAgZ2V0U3RvcEZsb3dPbkV4aXQsXG59IGZyb20gJy4vRmxvd0hlbHBlcnMuanMnO1xuXG5pbXBvcnQge1NlcnZlclN0YXR1c30gZnJvbSAnLi9GbG93Q29uc3RhbnRzJztcblxuLy8gTmFtZXMgbW9kZWxlZCBhZnRlciBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9ibG9iL21hc3Rlci9zcmMvY29tbW9uL2Zsb3dFeGl0U3RhdHVzLm1sXG5leHBvcnQgY29uc3QgRkxPV19SRVRVUk5fQ09ERVMgPSB7XG4gIG9rOiAwLFxuICBzZXJ2ZXJJbml0aWFsaXppbmc6IDEsXG4gIHR5cGVFcnJvcjogMixcbiAgbm9TZXJ2ZXJSdW5uaW5nOiA2LFxuICAvLyBUaGlzIG1lYW5zIHRoYXQgdGhlIHNlcnZlciBleGlzdHMsIGJ1dCBpdCBpcyBub3QgcmVzcG9uZGluZywgdHlwaWNhbGx5IGJlY2F1c2UgaXQgaXMgYnVzeSBkb2luZ1xuICAvLyBvdGhlciB3b3JrLlxuICBvdXRPZlJldHJpZXM6IDcsXG4gIGJ1aWxkSWRNaXNtYXRjaDogOSxcbn07XG5cbmNvbnN0IFNFUlZFUl9SRUFEWV9USU1FT1VUX01TID0gMTAgKiAxMDAwO1xuXG5jb25zdCBFWEVDX0ZMT1dfUkVUUklFUyA9IDU7XG5cbmV4cG9ydCBjbGFzcyBGbG93UHJvY2VzcyB7XG4gIC8vIElmIHdlIGhhZCB0byBzdGFydCBhIEZsb3cgc2VydmVyLCBzdG9yZSB0aGUgcHJvY2VzcyBoZXJlIHNvIHdlIGNhbiBraWxsIGl0IHdoZW4gd2Ugc2h1dCBkb3duLlxuICBfc3RhcnRlZFNlcnZlcjogP2NoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuICAvLyBUaGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgRmxvdyBzZXJ2ZXIgaW4gdGhpcyBkaXJlY3RvcnlcbiAgX3NlcnZlclN0YXR1czogQmVoYXZpb3JTdWJqZWN0PFNlcnZlclN0YXR1c1R5cGU+O1xuICAvLyBUaGUgcGF0aCB0byB0aGUgZGlyZWN0b3J5IHdoZXJlIHRoZSAuZmxvd2NvbmZpZyBpcyAtLSBpLmUuIHRoZSByb290IG9mIHRoZSBGbG93IHByb2plY3QuXG4gIF9yb290OiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3Iocm9vdDogc3RyaW5nKSB7XG4gICAgdGhpcy5fc2VydmVyU3RhdHVzID0gbmV3IEJlaGF2aW9yU3ViamVjdChTZXJ2ZXJTdGF0dXMuVU5LTk9XTik7XG4gICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG5cbiAgICB0aGlzLl9zZXJ2ZXJTdGF0dXMuZmlsdGVyKHggPT4geCA9PT0gU2VydmVyU3RhdHVzLk5PVF9SVU5OSU5HKS5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgdGhpcy5fc3RhcnRGbG93U2VydmVyKCk7XG4gICAgICB0aGlzLl9waW5nU2VydmVyKCk7XG4gICAgfSk7XG4gICAgZnVuY3Rpb24gaXNCdXN5T3JJbml0KHN0YXR1czogU2VydmVyU3RhdHVzVHlwZSk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHN0YXR1cyA9PT0gU2VydmVyU3RhdHVzLkJVU1kgfHwgc3RhdHVzID09PSBTZXJ2ZXJTdGF0dXMuSU5JVDtcbiAgICB9XG4gICAgdGhpcy5fc2VydmVyU3RhdHVzLmZpbHRlcihpc0J1c3lPckluaXQpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICB0aGlzLl9waW5nU2VydmVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3NlcnZlclN0YXR1cy5vbkNvbXBsZXRlZCgpO1xuICAgIGlmICh0aGlzLl9zdGFydGVkU2VydmVyICYmIGdldFN0b3BGbG93T25FeGl0KCkpIHtcbiAgICAgIC8vIFRoZSBkZWZhdWx0LCBTSUdURVJNLCBkb2VzIG5vdCByZWxpYWJseSBraWxsIHRoZSBmbG93IHNlcnZlcnMuXG4gICAgICB0aGlzLl9zdGFydGVkU2VydmVyLmtpbGwoJ1NJR0tJTEwnKTtcbiAgICB9XG4gIH1cblxuICBnZXRTZXJ2ZXJTdGF0dXNVcGRhdGVzKCk6IE9ic2VydmFibGU8U2VydmVyU3RhdHVzVHlwZT4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2ZXJTdGF0dXMuYXNPYnNlcnZhYmxlKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBudWxsIGlmIEZsb3cgY2Fubm90IGJlIGZvdW5kLlxuICAgKi9cbiAgYXN5bmMgZXhlY0Zsb3coXG4gICAgYXJnczogQXJyYXk8YW55PixcbiAgICBvcHRpb25zOiBPYmplY3QsXG4gICAgZmlsZTogc3RyaW5nLFxuICAgIHdhaXRGb3JTZXJ2ZXI/OiBib29sZWFuID0gZmFsc2UsXG4gICk6IFByb21pc2U8P3Byb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gICAgY29uc3QgbWF4UmV0cmllcyA9IHdhaXRGb3JTZXJ2ZXIgPyBFWEVDX0ZMT1dfUkVUUklFUyA6IDA7XG4gICAgaWYgKHRoaXMuX3NlcnZlclN0YXR1cy5nZXRWYWx1ZSgpID09PSBTZXJ2ZXJTdGF0dXMuRkFJTEVEKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IDsgaSsrKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9yYXdFeGVjRmxvdyggLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wXG4gICAgICAgICAgYXJncyxcbiAgICAgICAgICBvcHRpb25zLFxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zdCBjb3VsZFJldHJ5ID0gW1NlcnZlclN0YXR1cy5OT1RfUlVOTklORywgU2VydmVyU3RhdHVzLklOSVQsIFNlcnZlclN0YXR1cy5CVVNZXVxuICAgICAgICAgIC5pbmRleE9mKHRoaXMuX3NlcnZlclN0YXR1cy5nZXRWYWx1ZSgpKSAhPT0gLTE7XG4gICAgICAgIGlmIChpIDwgbWF4UmV0cmllcyAmJiBjb3VsZFJldHJ5KSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5fc2VydmVySXNSZWFkeSgpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhYmVsL25vLWF3YWl0LWluLWxvb3BcbiAgICAgICAgICAvLyBUaGVuIHRyeSBhZ2Fpbi5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBpdCBjb3VsZG4ndCByZXRyeSwgaXQgbWVhbnMgdGhlcmUgd2FzIGEgbGVnaXRpbWF0ZSBlcnJvci4gSWYgaXQgY291bGQgcmV0cnksIHdlXG4gICAgICAgICAgLy8gZG9uJ3Qgd2FudCB0byBsb2cgYmVjYXVzZSBpdCBqdXN0IG1lYW5zIHRoZSBzZXJ2ZXIgaXMgYnVzeSBhbmQgd2UgZG9uJ3Qgd2FudCB0byB3YWl0LlxuICAgICAgICAgIGlmICghY291bGRSZXRyeSkge1xuICAgICAgICAgICAgLy8gbm90IHN1cmUgd2hhdCBoYXBwZW5lZCwgYnV0IHdlJ2xsIGxldCB0aGUgY2FsbGVyIGRlYWwgd2l0aCBpdFxuICAgICAgICAgICAgbG9nZ2VyLmVycm9yKGBGbG93IGZhaWxlZDogZmxvdyAke2FyZ3Muam9pbignICcpfS4gRXJyb3I6ICR7SlNPTi5zdHJpbmdpZnkoZSl9YCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gdHJ5IGFnYWluXG4gICAgICB9XG4gICAgfVxuICAgIC8vIG90aGVyd2lzZSBmbG93IGNvbXBsYWluc1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqIFN0YXJ0cyBhIEZsb3cgc2VydmVyIGluIHRoZSBjdXJyZW50IHJvb3QgKi9cbiAgYXN5bmMgX3N0YXJ0Rmxvd1NlcnZlcigpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwYXRoVG9GbG93ID0gZ2V0UGF0aFRvRmxvdygpO1xuICAgIC8vIGBmbG93IHNlcnZlcmAgd2lsbCBzdGFydCBhIHNlcnZlciBpbiB0aGUgZm9yZWdyb3VuZC4gYXN5bmNFeGVjdXRlXG4gICAgLy8gd2lsbCBub3QgcmVzb2x2ZSB0aGUgcHJvbWlzZSB1bnRpbCB0aGUgcHJvY2VzcyBleGl0cywgd2hpY2ggaW4gdGhpc1xuICAgIC8vIGNhc2UgaXMgbmV2ZXIuIFdlIG5lZWQgdG8gdXNlIHNwYXduIGRpcmVjdGx5IHRvIGdldCBhY2Nlc3MgdG8gdGhlXG4gICAgLy8gQ2hpbGRQcm9jZXNzIG9iamVjdC5cbiAgICBjb25zdCBzZXJ2ZXJQcm9jZXNzID0gYXdhaXQgc2FmZVNwYXduKCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhYmVsL25vLWF3YWl0LWluLWxvb3BcbiAgICAgIHBhdGhUb0Zsb3csXG4gICAgICBbJ3NlcnZlcicsICctLWZyb20nLCAnbnVjbGlkZScsIHRoaXMuX3Jvb3RdLFxuICAgICk7XG4gICAgY29uc3QgbG9nSXQgPSBkYXRhID0+IHtcbiAgICAgIGxvZ2dlci5kZWJ1ZygnZmxvdyBzZXJ2ZXI6ICcgKyBkYXRhKTtcbiAgICB9O1xuICAgIHNlcnZlclByb2Nlc3Muc3Rkb3V0Lm9uKCdkYXRhJywgbG9nSXQpO1xuICAgIHNlcnZlclByb2Nlc3Muc3RkZXJyLm9uKCdkYXRhJywgbG9nSXQpO1xuICAgIHNlcnZlclByb2Nlc3Mub24oJ2V4aXQnLCAoY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICAvLyBXZSBvbmx5IHdhbnQgdG8gYmxhY2tsaXN0IHRoaXMgcm9vdCBpZiB0aGUgRmxvdyBwcm9jZXNzZXNcbiAgICAgIC8vIGFjdHVhbGx5IGZhaWxlZCwgcmF0aGVyIHRoYW4gYmVpbmcga2lsbGVkIG1hbnVhbGx5LiBJdCBzZWVtcyB0aGF0XG4gICAgICAvLyBpZiB0aGV5IGFyZSBraWxsZWQsIHRoZSBjb2RlIGlzIG51bGwgYW5kIHRoZSBzaWduYWwgaXMgJ1NJR1RFUk0nLlxuICAgICAgLy8gSW4gdGhlIEZsb3cgY3Jhc2hlcyBJIGhhdmUgb2JzZXJ2ZWQsIHRoZSBjb2RlIGlzIDIgYW5kIHRoZSBzaWduYWxcbiAgICAgIC8vIGlzIG51bGwuIFNvLCBsZXQncyBibGFja2xpc3QgY29uc2VydmF0aXZlbHkgZm9yIG5vdyBhbmQgd2UgY2FuXG4gICAgICAvLyBhZGQgY2FzZXMgbGF0ZXIgaWYgd2Ugb2JzZXJ2ZSBGbG93IGNyYXNoZXMgdGhhdCBkbyBub3QgZml0IHRoaXNcbiAgICAgIC8vIHBhdHRlcm4uXG4gICAgICBpZiAoY29kZSA9PT0gMiAmJiBzaWduYWwgPT09IG51bGwpIHtcbiAgICAgICAgbG9nZ2VyLmVycm9yKCdGbG93IHNlcnZlciB1bmV4cGVjdGVkbHkgZXhpdGVkJywgdGhpcy5fcm9vdCk7XG4gICAgICAgIHRoaXMuX3NlcnZlclN0YXR1cy5vbk5leHQoU2VydmVyU3RhdHVzLkZBSUxFRCk7XG4gICAgICAgIHRoaXMuX3NlcnZlclN0YXR1cy5vbkNvbXBsZXRlZCgpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX3N0YXJ0ZWRTZXJ2ZXIgPSBzZXJ2ZXJQcm9jZXNzO1xuICB9XG5cbiAgLyoqIEV4ZWN1dGUgRmxvdyB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudHMgKi9cbiAgYXN5bmMgX3Jhd0V4ZWNGbG93KGFyZ3M6IEFycmF5PGFueT4sIG9wdGlvbnM/OiBPYmplY3QgPSB7fSk6IFByb21pc2U8P3Byb2Nlc3MkYXN5bmNFeGVjdXRlUmV0PiB7XG4gICAgY29uc3QgZmxvd09wdGlvbnMgPSBhd2FpdCB0aGlzLl9nZXRGbG93RXhlY09wdGlvbnMoKTtcbiAgICBpZiAoIWZsb3dPcHRpb25zKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgb3B0aW9ucyA9IHsuLi5mbG93T3B0aW9ucywgLi4ub3B0aW9uc307XG4gICAgYXJncyA9IFtcbiAgICAgIC4uLmFyZ3MsXG4gICAgICAnLS1yZXRyeS1pZi1pbml0JywgJ2ZhbHNlJyxcbiAgICAgICctLXJldHJpZXMnLCAnMCcsXG4gICAgICAnLS1uby1hdXRvLXN0YXJ0JyxcbiAgICBdO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBGbG93UHJvY2Vzcy5leGVjRmxvd0NsaWVudChhcmdzLCBvcHRpb25zKTtcbiAgICAgIHRoaXMuX3VwZGF0ZVNlcnZlclN0YXR1cyhyZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aGlzLl91cGRhdGVTZXJ2ZXJTdGF0dXMoZSk7XG4gICAgICBpZiAoZS5leGl0Q29kZSA9PT0gRkxPV19SRVRVUk5fQ09ERVMudHlwZUVycm9yKSB7XG4gICAgICAgIHJldHVybiBlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfdXBkYXRlU2VydmVyU3RhdHVzKHJlc3VsdDogP3Byb2Nlc3MkYXN5bmNFeGVjdXRlUmV0KTogdm9pZCB7XG4gICAgbGV0IHN0YXR1cztcbiAgICBpZiAocmVzdWx0ID09IG51bGwpIHtcbiAgICAgIHN0YXR1cyA9IFNlcnZlclN0YXR1cy5OT1RfSU5TVEFMTEVEO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKHJlc3VsdC5leGl0Q29kZSkge1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLm9rOlxuICAgICAgICAgIC8vIGZhbGxzIHRocm91Z2hcbiAgICAgICAgY2FzZSBGTE9XX1JFVFVSTl9DT0RFUy50eXBlRXJyb3I6XG4gICAgICAgICAgc3RhdHVzID0gU2VydmVyU3RhdHVzLlJFQURZO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLnNlcnZlckluaXRpYWxpemluZzpcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuSU5JVDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGTE9XX1JFVFVSTl9DT0RFUy5ub1NlcnZlclJ1bm5pbmc6XG4gICAgICAgICAgc3RhdHVzID0gU2VydmVyU3RhdHVzLk5PVF9SVU5OSU5HO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIEZMT1dfUkVUVVJOX0NPREVTLm91dE9mUmV0cmllczpcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuQlVTWTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBGTE9XX1JFVFVSTl9DT0RFUy5idWlsZElkTWlzbWF0Y2g6XG4gICAgICAgICAgLy8gSWYgdGhlIHZlcnNpb24gZG9lc24ndCBtYXRjaCwgdGhlIHNlcnZlciBpcyBhdXRvbWF0aWNhbGx5IGtpbGxlZCBhbmQgdGhlIGNsaWVudFxuICAgICAgICAgIC8vIHJldHVybnMgOS5cbiAgICAgICAgICBsb2dnZXIuaW5mbygnS2lsbGVkIGZsb3cgc2VydmVyIHdpdGggaW5jb3JyZWN0IHZlcnNpb24gaW4nLCB0aGlzLl9yb290KTtcbiAgICAgICAgICBzdGF0dXMgPSBTZXJ2ZXJTdGF0dXMuTk9UX1JVTk5JTkc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgbG9nZ2VyLmVycm9yKCdVbmtub3duIHJldHVybiBjb2RlIGZyb20gRmxvdzogJyArIHJlc3VsdC5leGl0Q29kZSk7XG4gICAgICAgICAgc3RhdHVzID0gU2VydmVyU3RhdHVzLlVOS05PV047XG4gICAgICB9XG4gICAgfVxuICAgIGludmFyaWFudChzdGF0dXMgIT0gbnVsbCk7XG4gICAgaWYgKHN0YXR1cyAhPT0gdGhpcy5fc2VydmVyU3RhdHVzLmdldFZhbHVlKCkpIHtcbiAgICAgIHRoaXMuX3NlcnZlclN0YXR1cy5vbk5leHQoc3RhdHVzKTtcbiAgICB9XG4gIH1cblxuICAvKiogUGluZyB0aGUgc2VydmVyIHVudGlsIGl0IGxlYXZlcyB0aGUgY3VycmVudCBzdGF0ZSAqL1xuICBhc3luYyBfcGluZ1NlcnZlcih0cmllcz86IG51bWJlciA9IDUpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmcm9tU3RhdGUgPSB0aGlzLl9zZXJ2ZXJTdGF0dXMuZ2V0VmFsdWUoKTtcbiAgICBsZXQgc3RhdGVDaGFuZ2VkID0gZmFsc2U7XG4gICAgdGhpcy5fc2VydmVyU3RhdHVzLmZpbHRlcihuZXdTdGF0ZSA9PiBuZXdTdGF0ZSAhPT0gZnJvbVN0YXRlKS5maXJzdCgpLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICBzdGF0ZUNoYW5nZWQgPSB0cnVlO1xuICAgIH0pO1xuICAgIGZvciAobGV0IGkgPSAwOyAhc3RhdGVDaGFuZ2VkICYmIGkgPCB0cmllczsgaSsrKSB7XG4gICAgICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgICBhd2FpdCB0aGlzLl9yYXdFeGVjRmxvdyhbJ3N0YXR1cyddKS5jYXRjaCgoKSA9PiBudWxsKTtcbiAgICAgIC8vIFdhaXQgMSBzZWNvbmRcbiAgICAgIGF3YWl0IE9ic2VydmFibGUuanVzdChudWxsKS5kZWxheSgxMDAwKS50b1Byb21pc2UoKTtcbiAgICAgIC8qIGVzbGludC1lbmFibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNvbHZlcyB3aGVuIHRoZSBzZXJ2ZXIgaXMgcmVhZHkgb3IgdGhlIHJlcXVlc3QgdGltZXMgb3V0LCBhcyBpbmRpY2F0ZWQgYnkgdGhlIHJlc3VsdCBvZiB0aGVcbiAgICogcmV0dXJuZWQgUHJvbWlzZS5cbiAgICovXG4gIF9zZXJ2ZXJJc1JlYWR5KCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLl9zZXJ2ZXJTdGF0dXNcbiAgICAgIC5maWx0ZXIoeCA9PiB4ID09PSBTZXJ2ZXJTdGF0dXMuUkVBRFkpXG4gICAgICAubWFwKCgpID0+IHRydWUpXG4gICAgICAudGltZW91dChcbiAgICAgICAgU0VSVkVSX1JFQURZX1RJTUVPVVRfTVMsXG4gICAgICAgIE9ic2VydmFibGUuanVzdChmYWxzZSksXG4gICAgICApXG4gICAgICAuZmlyc3QoKVxuICAgICAgLnRvUHJvbWlzZSgpO1xuICB9XG5cbiAgLyoqXG4gICogSWYgdGhpcyByZXR1cm5zIG51bGwsIHRoZW4gaXQgaXMgbm90IHNhZmUgdG8gcnVuIGZsb3cuXG4gICovXG4gIGFzeW5jIF9nZXRGbG93RXhlY09wdGlvbnMoKTogUHJvbWlzZTw/e2N3ZDogc3RyaW5nfT4ge1xuICAgIGNvbnN0IGluc3RhbGxlZCA9IGF3YWl0IGlzRmxvd0luc3RhbGxlZCgpO1xuICAgIGlmIChpbnN0YWxsZWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGN3ZDogdGhpcy5fcm9vdCxcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIHNob3VsZCBiZSB1c2VkIHRvIGV4ZWN1dGUgRmxvdyBjb21tYW5kcyB0aGF0IGRvIG5vdCByZWx5IG9uIGEgRmxvdyBzZXJ2ZXIuIFNvLCB0aGV5IGRvIG5vdFxuICAgKiBuZWVkIHRvIGJlIGFzc29jaWF0ZWQgd2l0aCBhIEZsb3dQcm9jZXNzIGluc3RhbmNlIGFuZCB0aGV5IG1heSBiZSBleGVjdXRlZCBmcm9tIGFueSB3b3JraW5nXG4gICAqIGRpcmVjdG9yeS5cbiAgICpcbiAgICogTm90ZSB0aGF0IHVzaW5nIHRoaXMgbWV0aG9kIG1lYW5zIHRoYXQgeW91IGdldCBubyBndWFyYW50ZWUgdGhhdCB0aGUgRmxvdyB2ZXJzaW9uIHNwZWNpZmllZCBpblxuICAgKiBhbnkgZ2l2ZW4gLmZsb3djb25maWcgaXMgdGhlIG9uZSB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgaGVyZSwgYmVjYXVzZSBpdCBoYXMgbm8gYXNzb2NpYXRpb24gd2l0aFxuICAgKiBhbnkgZ2l2ZW4gcm9vdC4gSWYgeW91IG5lZWQgdGhpcyBwcm9wZXJ0eSwgY3JlYXRlIGFuIGluc3RhbmNlIHdpdGggdGhlIGFwcHJvcHJpYXRlIHJvb3QgYW5kIHVzZVxuICAgKiBleGVjRmxvdy5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBleGVjRmxvd0NsaWVudChcbiAgICBhcmdzOiBBcnJheTxhbnk+LFxuICAgIG9wdGlvbnM/OiBPYmplY3QgPSB7fVxuICApOiBQcm9taXNlPD9wcm9jZXNzJGFzeW5jRXhlY3V0ZVJldD4ge1xuICAgIGFyZ3MgPSBbXG4gICAgICAuLi5hcmdzLFxuICAgICAgJy0tZnJvbScsICdudWNsaWRlJyxcbiAgICBdO1xuICAgIGNvbnN0IHBhdGhUb0Zsb3cgPSBnZXRQYXRoVG9GbG93KCk7XG4gICAgcmV0dXJuIGF3YWl0IGFzeW5jRXhlY3V0ZShwYXRoVG9GbG93LCBhcmdzLCBvcHRpb25zKTtcbiAgfVxufVxuIl19