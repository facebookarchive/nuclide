var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

/**
 * This class creates and stores the output of a process and can push updates
 * to listeners.
 */

var ProcessOutputStore = (function () {
  function ProcessOutputStore(runProcess) {
    _classCallCheck(this, ProcessOutputStore);

    this._runProcess = runProcess;
    this._emitter = new (_atom2 || _atom()).Emitter();
    this._listenerSubscriptions = new (_atom2 || _atom()).CompositeDisposable();
  }

  _createClass(ProcessOutputStore, [{
    key: 'dispose',
    value: function dispose() {
      this.stopProcess();
      this._emitter.dispose();
      this._listenerSubscriptions.dispose();
    }

    /**
     * Starts the process if it has not already been started.
     * Currently the BufferedProcessStore is one-time use; `startProcess` will only
     * take effect on the first call.
     * @return A Promise that resolves to the exit code when the process exits.
     */
  }, {
    key: 'startProcess',
    value: _asyncToGenerator(function* () {
      var _this = this;

      if (this._processPromise) {
        return this._processPromise;
      }
      var options = {
        stdout: function stdout(data) {
          return _this._receiveStdout(data);
        },
        stderr: function stderr(data) {
          return _this._receiveStderr(data);
        },
        error: (function (_error) {
          function error(_x) {
            return _error.apply(this, arguments);
          }

          error.toString = function () {
            return _error.toString();
          };

          return error;
        })(function (error) {
          return _this._handleProcessError(error);
        }),
        exit: function exit(code) {
          return _this._handleProcessExit(code);
        }
      };
      this._processPromise = new Promise(function (resolve, reject) {
        // this._handleProcessExit() will emit this.
        _this._emitter.on('exit', resolve);
      });
      this._process = yield this._runProcess(options);
      return this._processPromise;
    })
  }, {
    key: 'stopProcess',
    value: function stopProcess() {
      if (this._process) {
        // Don't null out this._processPromise; this prevents `startProcess` from running again.
        this._process.kill();
      }
    }

    /**
     * The owner of the BufferedProcessStore should subscribe to this and handle
     * any errors.
     */
  }, {
    key: 'onWillThrowError',
    value: function onWillThrowError(callback) {
      var listenerSubscription = this._emitter.on('will-throw-error', callback);
      this._listenerSubscriptions.add(listenerSubscription);
      return listenerSubscription;
    }

    /**
     * Get notified when the process exits.
     */
  }, {
    key: 'onProcessExit',
    value: function onProcessExit(callback) {
      var listenerSubscription = this._emitter.on('exit', callback);
      this._listenerSubscriptions.add(listenerSubscription);
      return listenerSubscription;
    }
  }, {
    key: '_receiveStdout',
    value: function _receiveStdout(data) {
      this._stdout = this._stdout ? this._stdout.concat(data) : data;
      this._emitter.emit('stdout', data);
    }
  }, {
    key: '_receiveStderr',
    value: function _receiveStderr(data) {
      this._stderr = this._stderr ? this._stderr.concat(data) : data;
      this._emitter.emit('stderr', data);
    }
  }, {
    key: '_handleProcessExit',
    value: function _handleProcessExit(code) {
      this._emitter.emit('exit', code);
      this._listenerSubscriptions.dispose();
    }
  }, {
    key: '_handleProcessError',
    value: function _handleProcessError(error) {
      this._emitter.emit('will-throw-error', error);
    }

    /**
     * Gets the stdout at this point in time.
     * Not recommended: `observeStdout` provides more complete information.
     */
  }, {
    key: 'getStdout',
    value: function getStdout() {
      return this._stdout;
    }

    /**
     * Gets the stderr at this point in time.
     * Not recommended: `observeStderr` provides more complete information.
     */
  }, {
    key: 'getStderr',
    value: function getStderr() {
      return this._stderr;
    }

    /**
     * @param A callback that will be called immediately with any stored data, and
     *   called whenever the BufferedProcessStore has new data.
     * @return A Disposable that should be disposed to stop updates. This Disposable
     *   will also be automatically disposed when the process exits.
     */
  }, {
    key: 'observeStdout',
    value: function observeStdout(callback) {
      if (this._stdout) {
        callback(this._stdout);
      }
      var listenerSubscription = this._emitter.on('stdout', callback);
      this._listenerSubscriptions.add(listenerSubscription);
      return listenerSubscription;
    }

    /**
     * @param A callback that will be called immediately with any stored data, and
     *   called whenever the BufferedProcessStore has new data.
     * @return A Disposable that should be disposed to stop updates. This Disposable
     *   will also be automatically disposed when the process exits.
     */
  }, {
    key: 'observeStderr',
    value: function observeStderr(callback) {
      if (this._stderr) {
        callback(this._stderr);
      }
      var listenerSubscription = this._emitter.on('stderr', callback);
      this._listenerSubscriptions.add(listenerSubscription);
      return listenerSubscription;
    }
  }]);

  return ProcessOutputStore;
})();

module.exports = ProcessOutputStore;