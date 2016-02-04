Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.createTask = createTask;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _events = require('events');

/**
 * Task creates and manages communication with another Node process. In addition
 * to executing ordinary .js files, the other Node process can also run .js files
 * under the Babel transpiler, so long as they have the `'use babel'` pragma
 * used in Atom.
 */

var _Task = (function () {
  function _Task() {
    var _this = this;

    _classCallCheck(this, _Task);

    this._id = 0;
    this._emitter = new _events.EventEmitter();
    var options = { silent: true }; // Needed so stdout/stderr are available.
    var child = this._child = require('child_process').fork(require('path').join(__dirname, '/bootstrap.js'), options);
    /*eslint-disable no-console*/
    var log = function log(buffer) {
      return console.log('TASK(' + child.pid + '): ' + buffer);
    };
    /*eslint-enable no-console*/
    child.stdout.on('data', log);
    child.stderr.on('data', log);
    // The Flow error on the following line is due to a bug in Flow:
    // https://github.com/facebook/flow/issues/428.
    child.on('message', function (response) {
      var id = response['id'];
      _this._emitter.emit(id, response);
    });
    child.on('error', log);
    child.send({
      action: 'bootstrap',
      transpiler: require.resolve('../../node-transpiler')
    });

    var onExitCallback = function onExitCallback() {
      return child.kill();
    };
    process.on('exit', onExitCallback);
    child.on('exit', function () {
      process.removeListener('exit', onExitCallback);
    });
  }

  /**
   * Invokes a remote method that is specified as an export of a .js file.
   *
   * The absolute path to the .js file must be specified via the `file`
   * property. In practice, `require.resolve()` is helpful in producing this
   * path.
   *
   * If the .js file exports an object with multiple properties (rather than a
   * single function), the name of the property (that should correspond to a
   * function to invoke) must be specified via the `method` property.
   *
   * Any arguments to pass to the function must be specified via the `args`
   * property as an Array. (This property can be omitted if there are no args.)
   *
   * Note that both the args for the remote method, as well as the return type
   * of the remote method, must be JSON-serializable. (The return type of the
   * remote method can also be a Promise that resolves to a JSON-serializable
   * object.)
   *
   * @return Promise that resolves with the result of invoking the remote
   *     method. If an error is thrown, a rejected Promise will be returned
   *     instead.
   */

  _createClass(_Task, [{
    key: 'invokeRemoteMethod',
    value: function invokeRemoteMethod(params) {
      var _this2 = this;

      var requestId = (++this._id).toString(16);
      var request = {
        id: requestId,
        action: 'request',
        file: params.file,
        method: params.method,
        args: params.args
      };

      return new Promise(function (resolve, reject) {
        // Ensure the response listener is set up before the request is sent.
        _this2._emitter.once(requestId, function (response) {
          var err = response['error'];
          if (!err) {
            resolve(response['result']);
          } else {
            // Need to synthesize an Error object from its JSON representation.
            var error = new Error();
            error.message = err.message;
            error.stack = err.stack;
            reject(error);
          }
        });
        _this2._child.send(request);
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._child.connected) {
        this._child.kill();
      }
      this._emitter.removeAllListeners();
    }
  }]);

  return _Task;
})();

function createTask() {
  return new _Task();
}
//# sourceMappingURL=data:application/json;base64,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QUM7QUFDMUIsaUJBQUssQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQztBQUM1QixpQkFBSyxDQUFDLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO0FBQ3hCLGtCQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7V0FDZjtTQUNGLENBQUMsQ0FBQztBQUNILGVBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUMzQixDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFO0FBQ3pCLFlBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDcEI7QUFDRCxVQUFJLENBQUMsUUFBUSxDQUFDLGtCQUFrQixFQUFFLENBQUM7S0FDcEM7OztTQTNGRyxLQUFLOzs7QUFnR0osU0FBUyxVQUFVLEdBQVM7QUFDakMsU0FBTyxJQUFJLEtBQUssRUFBRSxDQUFDO0NBQ3BCIiwiZmlsZSI6ImJvb3Rsb2FkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcblxuZXhwb3J0IHR5cGUgSW52b2tlUmVtb3RlTWV0aG9kUGFyYW1zID0ge1xuICBmaWxlOiBzdHJpbmc7XG4gIG1ldGhvZDogP3N0cmluZztcbiAgYXJnczogP0FycmF5PGFueT47XG59O1xuXG4vKipcbiAqIFRhc2sgY3JlYXRlcyBhbmQgbWFuYWdlcyBjb21tdW5pY2F0aW9uIHdpdGggYW5vdGhlciBOb2RlIHByb2Nlc3MuIEluIGFkZGl0aW9uXG4gKiB0byBleGVjdXRpbmcgb3JkaW5hcnkgLmpzIGZpbGVzLCB0aGUgb3RoZXIgTm9kZSBwcm9jZXNzIGNhbiBhbHNvIHJ1biAuanMgZmlsZXNcbiAqIHVuZGVyIHRoZSBCYWJlbCB0cmFuc3BpbGVyLCBzbyBsb25nIGFzIHRoZXkgaGF2ZSB0aGUgYCd1c2UgYmFiZWwnYCBwcmFnbWFcbiAqIHVzZWQgaW4gQXRvbS5cbiAqL1xuY2xhc3MgX1Rhc2sge1xuICBfaWQ6IG51bWJlcjtcbiAgX2VtaXR0ZXI6IEV2ZW50RW1pdHRlcjtcbiAgX2NoaWxkOiBjaGlsZF9wcm9jZXNzJENoaWxkUHJvY2VzcztcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9pZCA9IDA7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBjb25zdCBvcHRpb25zID0ge3NpbGVudDogdHJ1ZX07IC8vIE5lZWRlZCBzbyBzdGRvdXQvc3RkZXJyIGFyZSBhdmFpbGFibGUuXG4gICAgY29uc3QgY2hpbGQgPSB0aGlzLl9jaGlsZCA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKVxuICAgICAgICAuZm9yayhyZXF1aXJlKCdwYXRoJykuam9pbihfX2Rpcm5hbWUsICcvYm9vdHN0cmFwLmpzJyksIG9wdGlvbnMpO1xuICAgIC8qZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSovXG4gICAgY29uc3QgbG9nID0gYnVmZmVyID0+IGNvbnNvbGUubG9nKGBUQVNLKCR7Y2hpbGQucGlkfSk6ICR7YnVmZmVyfWApO1xuICAgIC8qZXNsaW50LWVuYWJsZSBuby1jb25zb2xlKi9cbiAgICBjaGlsZC5zdGRvdXQub24oJ2RhdGEnLCBsb2cpO1xuICAgIGNoaWxkLnN0ZGVyci5vbignZGF0YScsIGxvZyk7XG4gICAgLy8gVGhlIEZsb3cgZXJyb3Igb24gdGhlIGZvbGxvd2luZyBsaW5lIGlzIGR1ZSB0byBhIGJ1ZyBpbiBGbG93OlxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9mbG93L2lzc3Vlcy80MjguXG4gICAgY2hpbGQub24oJ21lc3NhZ2UnLCByZXNwb25zZSA9PiB7XG4gICAgICBjb25zdCBpZCA9IHJlc3BvbnNlWydpZCddO1xuICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KGlkLCByZXNwb25zZSk7XG4gICAgfSk7XG4gICAgY2hpbGQub24oJ2Vycm9yJywgbG9nKTtcbiAgICBjaGlsZC5zZW5kKHtcbiAgICAgIGFjdGlvbjogJ2Jvb3RzdHJhcCcsXG4gICAgICB0cmFuc3BpbGVyOiByZXF1aXJlLnJlc29sdmUoJy4uLy4uL25vZGUtdHJhbnNwaWxlcicpLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb25FeGl0Q2FsbGJhY2sgPSAoKSA9PiBjaGlsZC5raWxsKCk7XG4gICAgcHJvY2Vzcy5vbignZXhpdCcsIG9uRXhpdENhbGxiYWNrKTtcbiAgICBjaGlsZC5vbignZXhpdCcsICgpID0+IHtcbiAgICAgIHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIoJ2V4aXQnLCBvbkV4aXRDYWxsYmFjayk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW52b2tlcyBhIHJlbW90ZSBtZXRob2QgdGhhdCBpcyBzcGVjaWZpZWQgYXMgYW4gZXhwb3J0IG9mIGEgLmpzIGZpbGUuXG4gICAqXG4gICAqIFRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSAuanMgZmlsZSBtdXN0IGJlIHNwZWNpZmllZCB2aWEgdGhlIGBmaWxlYFxuICAgKiBwcm9wZXJ0eS4gSW4gcHJhY3RpY2UsIGByZXF1aXJlLnJlc29sdmUoKWAgaXMgaGVscGZ1bCBpbiBwcm9kdWNpbmcgdGhpc1xuICAgKiBwYXRoLlxuICAgKlxuICAgKiBJZiB0aGUgLmpzIGZpbGUgZXhwb3J0cyBhbiBvYmplY3Qgd2l0aCBtdWx0aXBsZSBwcm9wZXJ0aWVzIChyYXRoZXIgdGhhbiBhXG4gICAqIHNpbmdsZSBmdW5jdGlvbiksIHRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSAodGhhdCBzaG91bGQgY29ycmVzcG9uZCB0byBhXG4gICAqIGZ1bmN0aW9uIHRvIGludm9rZSkgbXVzdCBiZSBzcGVjaWZpZWQgdmlhIHRoZSBgbWV0aG9kYCBwcm9wZXJ0eS5cbiAgICpcbiAgICogQW55IGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBmdW5jdGlvbiBtdXN0IGJlIHNwZWNpZmllZCB2aWEgdGhlIGBhcmdzYFxuICAgKiBwcm9wZXJ0eSBhcyBhbiBBcnJheS4gKFRoaXMgcHJvcGVydHkgY2FuIGJlIG9taXR0ZWQgaWYgdGhlcmUgYXJlIG5vIGFyZ3MuKVxuICAgKlxuICAgKiBOb3RlIHRoYXQgYm90aCB0aGUgYXJncyBmb3IgdGhlIHJlbW90ZSBtZXRob2QsIGFzIHdlbGwgYXMgdGhlIHJldHVybiB0eXBlXG4gICAqIG9mIHRoZSByZW1vdGUgbWV0aG9kLCBtdXN0IGJlIEpTT04tc2VyaWFsaXphYmxlLiAoVGhlIHJldHVybiB0eXBlIG9mIHRoZVxuICAgKiByZW1vdGUgbWV0aG9kIGNhbiBhbHNvIGJlIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgSlNPTi1zZXJpYWxpemFibGVcbiAgICogb2JqZWN0LilcbiAgICpcbiAgICogQHJldHVybiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgcmVzdWx0IG9mIGludm9raW5nIHRoZSByZW1vdGVcbiAgICogICAgIG1ldGhvZC4gSWYgYW4gZXJyb3IgaXMgdGhyb3duLCBhIHJlamVjdGVkIFByb21pc2Ugd2lsbCBiZSByZXR1cm5lZFxuICAgKiAgICAgaW5zdGVhZC5cbiAgICovXG4gIGludm9rZVJlbW90ZU1ldGhvZChwYXJhbXM6IEludm9rZVJlbW90ZU1ldGhvZFBhcmFtcyk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVxdWVzdElkID0gKCsrdGhpcy5faWQpLnRvU3RyaW5nKDE2KTtcbiAgICBjb25zdCByZXF1ZXN0ID0ge1xuICAgICAgaWQ6IHJlcXVlc3RJZCxcbiAgICAgIGFjdGlvbjogJ3JlcXVlc3QnLFxuICAgICAgZmlsZTogcGFyYW1zLmZpbGUsXG4gICAgICBtZXRob2Q6IHBhcmFtcy5tZXRob2QsXG4gICAgICBhcmdzOiBwYXJhbXMuYXJncyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIEVuc3VyZSB0aGUgcmVzcG9uc2UgbGlzdGVuZXIgaXMgc2V0IHVwIGJlZm9yZSB0aGUgcmVxdWVzdCBpcyBzZW50LlxuICAgICAgdGhpcy5fZW1pdHRlci5vbmNlKHJlcXVlc3RJZCwgcmVzcG9uc2UgPT4ge1xuICAgICAgICBjb25zdCBlcnIgPSByZXNwb25zZVsnZXJyb3InXTtcbiAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlWydyZXN1bHQnXSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTmVlZCB0byBzeW50aGVzaXplIGFuIEVycm9yIG9iamVjdCBmcm9tIGl0cyBKU09OIHJlcHJlc2VudGF0aW9uLlxuICAgICAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKCk7XG4gICAgICAgICAgZXJyb3IubWVzc2FnZSA9IGVyci5tZXNzYWdlO1xuICAgICAgICAgIGVycm9yLnN0YWNrID0gZXJyLnN0YWNrO1xuICAgICAgICAgIHJlamVjdChlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhpcy5fY2hpbGQuc2VuZChyZXF1ZXN0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgaWYgKHRoaXMuX2NoaWxkLmNvbm5lY3RlZCkge1xuICAgICAgdGhpcy5fY2hpbGQua2lsbCgpO1xuICAgIH1cbiAgICB0aGlzLl9lbWl0dGVyLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFRhc2sgPSBfVGFzaztcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRhc2soKTogVGFzayB7XG4gIHJldHVybiBuZXcgX1Rhc2soKTtcbn1cbiJdfQ==