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

var _atom = require('atom');

/**
 * This class creates and stores the output of a process and can push updates
 * to listeners.
 */

var ProcessOutputStore = (function () {
  function ProcessOutputStore(runProcess) {
    _classCallCheck(this, ProcessOutputStore);

    this._runProcess = runProcess;
    this._emitter = new _atom.Emitter();
    this._listenerSubscriptions = new _atom.CompositeDisposable();
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
//# sourceMappingURL=data:application/json;base64,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UUFBUSxDQUFDLENBQUM7QUFDbEUsVUFBSSxDQUFDLHNCQUFzQixDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ3RELGFBQU8sb0JBQW9CLENBQUM7S0FDN0I7OztTQXRJRyxrQkFBa0I7OztBQXlJeEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJQcm9jZXNzT3V0cHV0U3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7S2lsbGFibGVQcm9jZXNzLCBSdW5Qcm9jZXNzV2l0aEhhbmRsZXJzfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5cbi8qKlxuICogVGhpcyBjbGFzcyBjcmVhdGVzIGFuZCBzdG9yZXMgdGhlIG91dHB1dCBvZiBhIHByb2Nlc3MgYW5kIGNhbiBwdXNoIHVwZGF0ZXNcbiAqIHRvIGxpc3RlbmVycy5cbiAqL1xuY2xhc3MgUHJvY2Vzc091dHB1dFN0b3JlIHtcbiAgX3J1blByb2Nlc3M6IFJ1blByb2Nlc3NXaXRoSGFuZGxlcnM7XG4gIF9wcm9jZXNzOiA/S2lsbGFibGVQcm9jZXNzO1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3Byb2Nlc3NQcm9taXNlOiA/UHJvbWlzZTxudW1iZXI+O1xuICBfc3Rkb3V0OiA/c3RyaW5nO1xuICBfc3RkZXJyOiA/c3RyaW5nO1xuICBfbGlzdGVuZXJTdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuXG4gIGNvbnN0cnVjdG9yKHJ1blByb2Nlc3M6IFJ1blByb2Nlc3NXaXRoSGFuZGxlcnMpIHtcbiAgICB0aGlzLl9ydW5Qcm9jZXNzID0gcnVuUHJvY2VzcztcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9saXN0ZW5lclN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLnN0b3BQcm9jZXNzKCk7XG4gICAgdGhpcy5fZW1pdHRlci5kaXNwb3NlKCk7XG4gICAgdGhpcy5fbGlzdGVuZXJTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHByb2Nlc3MgaWYgaXQgaGFzIG5vdCBhbHJlYWR5IGJlZW4gc3RhcnRlZC5cbiAgICogQ3VycmVudGx5IHRoZSBCdWZmZXJlZFByb2Nlc3NTdG9yZSBpcyBvbmUtdGltZSB1c2U7IGBzdGFydFByb2Nlc3NgIHdpbGwgb25seVxuICAgKiB0YWtlIGVmZmVjdCBvbiB0aGUgZmlyc3QgY2FsbC5cbiAgICogQHJldHVybiBBIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgZXhpdCBjb2RlIHdoZW4gdGhlIHByb2Nlc3MgZXhpdHMuXG4gICAqL1xuICBhc3luYyBzdGFydFByb2Nlc3MoKTogUHJvbWlzZTw/bnVtYmVyPiB7XG4gICAgaWYgKHRoaXMuX3Byb2Nlc3NQcm9taXNlKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcHJvY2Vzc1Byb21pc2U7XG4gICAgfVxuICAgIGNvbnN0IG9wdGlvbnMgPSB7XG4gICAgICBzdGRvdXQ6IChkYXRhKSA9PiB0aGlzLl9yZWNlaXZlU3Rkb3V0KGRhdGEpLFxuICAgICAgc3RkZXJyOiAoZGF0YSkgPT4gdGhpcy5fcmVjZWl2ZVN0ZGVycihkYXRhKSxcbiAgICAgIGVycm9yOiAoZXJyb3IpID0+IHRoaXMuX2hhbmRsZVByb2Nlc3NFcnJvcihlcnJvciksXG4gICAgICBleGl0OiAoY29kZSkgPT4gdGhpcy5faGFuZGxlUHJvY2Vzc0V4aXQoY29kZSksXG4gICAgfTtcbiAgICB0aGlzLl9wcm9jZXNzUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIHRoaXMuX2hhbmRsZVByb2Nlc3NFeGl0KCkgd2lsbCBlbWl0IHRoaXMuXG4gICAgICB0aGlzLl9lbWl0dGVyLm9uKCdleGl0JywgcmVzb2x2ZSk7XG4gICAgfSk7XG4gICAgdGhpcy5fcHJvY2VzcyA9IGF3YWl0IHRoaXMuX3J1blByb2Nlc3Mob3B0aW9ucyk7XG4gICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3NQcm9taXNlO1xuICB9XG5cbiAgc3RvcFByb2Nlc3MoKSB7XG4gICAgaWYgKHRoaXMuX3Byb2Nlc3MpIHtcbiAgICAgIC8vIERvbid0IG51bGwgb3V0IHRoaXMuX3Byb2Nlc3NQcm9taXNlOyB0aGlzIHByZXZlbnRzIGBzdGFydFByb2Nlc3NgIGZyb20gcnVubmluZyBhZ2Fpbi5cbiAgICAgIHRoaXMuX3Byb2Nlc3Mua2lsbCgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgb3duZXIgb2YgdGhlIEJ1ZmZlcmVkUHJvY2Vzc1N0b3JlIHNob3VsZCBzdWJzY3JpYmUgdG8gdGhpcyBhbmQgaGFuZGxlXG4gICAqIGFueSBlcnJvcnMuXG4gICAqL1xuICBvbldpbGxUaHJvd0Vycm9yKGNhbGxiYWNrOiAoZXJyb3I6IEVycm9yKSA9PiBtaXhlZCk6IERpc3Bvc2FibGUge1xuICAgIGNvbnN0IGxpc3RlbmVyU3Vic2NyaXB0aW9uID0gdGhpcy5fZW1pdHRlci5vbignd2lsbC10aHJvdy1lcnJvcicsIGNhbGxiYWNrKTtcbiAgICB0aGlzLl9saXN0ZW5lclN1YnNjcmlwdGlvbnMuYWRkKGxpc3RlbmVyU3Vic2NyaXB0aW9uKTtcbiAgICByZXR1cm4gbGlzdGVuZXJTdWJzY3JpcHRpb247XG4gIH1cblxuICAvKipcbiAgICogR2V0IG5vdGlmaWVkIHdoZW4gdGhlIHByb2Nlc3MgZXhpdHMuXG4gICAqL1xuICBvblByb2Nlc3NFeGl0KGNhbGxiYWNrOiAoZXhpdENvZGU6IG51bWJlcikgPT4gbWl4ZWQpOiBEaXNwb3NhYmxlIHtcbiAgICBjb25zdCBsaXN0ZW5lclN1YnNjcmlwdGlvbiA9IHRoaXMuX2VtaXR0ZXIub24oJ2V4aXQnLCBjYWxsYmFjayk7XG4gICAgdGhpcy5fbGlzdGVuZXJTdWJzY3JpcHRpb25zLmFkZChsaXN0ZW5lclN1YnNjcmlwdGlvbik7XG4gICAgcmV0dXJuIGxpc3RlbmVyU3Vic2NyaXB0aW9uO1xuICB9XG5cbiAgX3JlY2VpdmVTdGRvdXQoZGF0YTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc3Rkb3V0ID0gdGhpcy5fc3Rkb3V0ID8gdGhpcy5fc3Rkb3V0LmNvbmNhdChkYXRhKSA6IGRhdGE7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdzdGRvdXQnLCBkYXRhKTtcbiAgfVxuXG4gIF9yZWNlaXZlU3RkZXJyKGRhdGE6IHN0cmluZykge1xuICAgIHRoaXMuX3N0ZGVyciA9IHRoaXMuX3N0ZGVyciA/IHRoaXMuX3N0ZGVyci5jb25jYXQoZGF0YSkgOiBkYXRhO1xuICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnc3RkZXJyJywgZGF0YSk7XG4gIH1cblxuICBfaGFuZGxlUHJvY2Vzc0V4aXQoY29kZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCdleGl0JywgY29kZSk7XG4gICAgdGhpcy5fbGlzdGVuZXJTdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9oYW5kbGVQcm9jZXNzRXJyb3IoZXJyb3I6IEVycm9yKSB7XG4gICAgdGhpcy5fZW1pdHRlci5lbWl0KCd3aWxsLXRocm93LWVycm9yJywgZXJyb3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHN0ZG91dCBhdCB0aGlzIHBvaW50IGluIHRpbWUuXG4gICAqIE5vdCByZWNvbW1lbmRlZDogYG9ic2VydmVTdGRvdXRgIHByb3ZpZGVzIG1vcmUgY29tcGxldGUgaW5mb3JtYXRpb24uXG4gICAqL1xuICBnZXRTdGRvdXQoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3N0ZG91dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBzdGRlcnIgYXQgdGhpcyBwb2ludCBpbiB0aW1lLlxuICAgKiBOb3QgcmVjb21tZW5kZWQ6IGBvYnNlcnZlU3RkZXJyYCBwcm92aWRlcyBtb3JlIGNvbXBsZXRlIGluZm9ybWF0aW9uLlxuICAgKi9cbiAgZ2V0U3RkZXJyKCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdGRlcnI7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIEEgY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGNhbGxlZCBpbW1lZGlhdGVseSB3aXRoIGFueSBzdG9yZWQgZGF0YSwgYW5kXG4gICAqICAgY2FsbGVkIHdoZW5ldmVyIHRoZSBCdWZmZXJlZFByb2Nlc3NTdG9yZSBoYXMgbmV3IGRhdGEuXG4gICAqIEByZXR1cm4gQSBEaXNwb3NhYmxlIHRoYXQgc2hvdWxkIGJlIGRpc3Bvc2VkIHRvIHN0b3AgdXBkYXRlcy4gVGhpcyBEaXNwb3NhYmxlXG4gICAqICAgd2lsbCBhbHNvIGJlIGF1dG9tYXRpY2FsbHkgZGlzcG9zZWQgd2hlbiB0aGUgcHJvY2VzcyBleGl0cy5cbiAgICovXG4gIG9ic2VydmVTdGRvdXQoY2FsbGJhY2s6IChkYXRhOiBzdHJpbmcpID0+IG1peGVkKTogRGlzcG9zYWJsZSB7XG4gICAgaWYgKHRoaXMuX3N0ZG91dCkge1xuICAgICAgY2FsbGJhY2sodGhpcy5fc3Rkb3V0KTtcbiAgICB9XG4gICAgY29uc3QgbGlzdGVuZXJTdWJzY3JpcHRpb24gPSB0aGlzLl9lbWl0dGVyLm9uKCdzdGRvdXQnLCBjYWxsYmFjayk7XG4gICAgdGhpcy5fbGlzdGVuZXJTdWJzY3JpcHRpb25zLmFkZChsaXN0ZW5lclN1YnNjcmlwdGlvbik7XG4gICAgcmV0dXJuIGxpc3RlbmVyU3Vic2NyaXB0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBBIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgaW1tZWRpYXRlbHkgd2l0aCBhbnkgc3RvcmVkIGRhdGEsIGFuZFxuICAgKiAgIGNhbGxlZCB3aGVuZXZlciB0aGUgQnVmZmVyZWRQcm9jZXNzU3RvcmUgaGFzIG5ldyBkYXRhLlxuICAgKiBAcmV0dXJuIEEgRGlzcG9zYWJsZSB0aGF0IHNob3VsZCBiZSBkaXNwb3NlZCB0byBzdG9wIHVwZGF0ZXMuIFRoaXMgRGlzcG9zYWJsZVxuICAgKiAgIHdpbGwgYWxzbyBiZSBhdXRvbWF0aWNhbGx5IGRpc3Bvc2VkIHdoZW4gdGhlIHByb2Nlc3MgZXhpdHMuXG4gICAqL1xuICBvYnNlcnZlU3RkZXJyKGNhbGxiYWNrOiAoZGF0YTogc3RyaW5nKSA9PiBtaXhlZCk6IERpc3Bvc2FibGUge1xuICAgIGlmICh0aGlzLl9zdGRlcnIpIHtcbiAgICAgIGNhbGxiYWNrKHRoaXMuX3N0ZGVycik7XG4gICAgfVxuICAgIGNvbnN0IGxpc3RlbmVyU3Vic2NyaXB0aW9uID0gdGhpcy5fZW1pdHRlci5vbignc3RkZXJyJywgY2FsbGJhY2spO1xuICAgIHRoaXMuX2xpc3RlbmVyU3Vic2NyaXB0aW9ucy5hZGQobGlzdGVuZXJTdWJzY3JpcHRpb24pO1xuICAgIHJldHVybiBsaXN0ZW5lclN1YnNjcmlwdGlvbjtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2Nlc3NPdXRwdXRTdG9yZTtcbiJdfQ==