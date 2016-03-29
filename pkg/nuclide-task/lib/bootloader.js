Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.createTask = createTask;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

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
    var child = this._child = _child_process2['default'].fork(_path2['default'].join(__dirname, '/bootstrap.js'), options);
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
    child.on('error', function (buffer) {
      log(buffer);
      child.kill();
      _this._emitter.emit('error', buffer.toString());
    });
    child.send({
      action: 'bootstrap',
      transpiler: require.resolve('../../nuclide-node-transpiler')
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
        var errListener = function errListener(error) {
          reject(error);
        };
        // Ensure the response listener is set up before the request is sent.
        _this2._emitter.once(requestId, function (response) {
          _this2._emitter.removeListener('error', errListener);
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
        _this2._emitter.once('error', errListener);
        _this2._child.send(request);
      });
    }
  }, {
    key: 'onError',
    value: function onError(callback) {
      this._child.on('error', callback);
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
//# sourceMappingURL=data:application/json;base64,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bnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IGNoaWxkX3Byb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuXG5leHBvcnQgdHlwZSBJbnZva2VSZW1vdGVNZXRob2RQYXJhbXMgPSB7XG4gIGZpbGU6IHN0cmluZztcbiAgbWV0aG9kOiA/c3RyaW5nO1xuICBhcmdzOiA/QXJyYXk8YW55Pjtcbn07XG5cbi8qKlxuICogVGFzayBjcmVhdGVzIGFuZCBtYW5hZ2VzIGNvbW11bmljYXRpb24gd2l0aCBhbm90aGVyIE5vZGUgcHJvY2Vzcy4gSW4gYWRkaXRpb25cbiAqIHRvIGV4ZWN1dGluZyBvcmRpbmFyeSAuanMgZmlsZXMsIHRoZSBvdGhlciBOb2RlIHByb2Nlc3MgY2FuIGFsc28gcnVuIC5qcyBmaWxlc1xuICogdW5kZXIgdGhlIEJhYmVsIHRyYW5zcGlsZXIsIHNvIGxvbmcgYXMgdGhleSBoYXZlIHRoZSBgJ3VzZSBiYWJlbCdgIHByYWdtYVxuICogdXNlZCBpbiBBdG9tLlxuICovXG5jbGFzcyBfVGFzayB7XG4gIF9pZDogbnVtYmVyO1xuICBfZW1pdHRlcjogRXZlbnRFbWl0dGVyO1xuICBfY2hpbGQ6IGNoaWxkX3Byb2Nlc3MkQ2hpbGRQcm9jZXNzO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2lkID0gMDtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgIGNvbnN0IG9wdGlvbnMgPSB7c2lsZW50OiB0cnVlfTsgLy8gTmVlZGVkIHNvIHN0ZG91dC9zdGRlcnIgYXJlIGF2YWlsYWJsZS5cbiAgICBjb25zdCBjaGlsZCA9IHRoaXMuX2NoaWxkID0gY2hpbGRfcHJvY2Vzc1xuICAgICAgICAuZm9yayhwYXRoLmpvaW4oX19kaXJuYW1lLCAnL2Jvb3RzdHJhcC5qcycpLCBvcHRpb25zKTtcbiAgICAvKmVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUqL1xuICAgIGNvbnN0IGxvZyA9IGJ1ZmZlciA9PiBjb25zb2xlLmxvZyhgVEFTSygke2NoaWxkLnBpZH0pOiAke2J1ZmZlcn1gKTtcbiAgICAvKmVzbGludC1lbmFibGUgbm8tY29uc29sZSovXG4gICAgY2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgbG9nKTtcbiAgICBjaGlsZC5zdGRlcnIub24oJ2RhdGEnLCBsb2cpO1xuICAgIC8vIFRoZSBGbG93IGVycm9yIG9uIHRoZSBmb2xsb3dpbmcgbGluZSBpcyBkdWUgdG8gYSBidWcgaW4gRmxvdzpcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svZmxvdy9pc3N1ZXMvNDI4LlxuICAgIGNoaWxkLm9uKCdtZXNzYWdlJywgcmVzcG9uc2UgPT4ge1xuICAgICAgY29uc3QgaWQgPSByZXNwb25zZVsnaWQnXTtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChpZCwgcmVzcG9uc2UpO1xuICAgIH0pO1xuICAgIGNoaWxkLm9uKCdlcnJvcicsIGJ1ZmZlciA9PiB7XG4gICAgICBsb2coYnVmZmVyKTtcbiAgICAgIGNoaWxkLmtpbGwoKTtcbiAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnZXJyb3InLCBidWZmZXIudG9TdHJpbmcoKSk7XG4gICAgfSk7XG4gICAgY2hpbGQuc2VuZCh7XG4gICAgICBhY3Rpb246ICdib290c3RyYXAnLFxuICAgICAgdHJhbnNwaWxlcjogcmVxdWlyZS5yZXNvbHZlKCcuLi8uLi9udWNsaWRlLW5vZGUtdHJhbnNwaWxlcicpLFxuICAgIH0pO1xuXG4gICAgY29uc3Qgb25FeGl0Q2FsbGJhY2sgPSAoKSA9PiBjaGlsZC5raWxsKCk7XG4gICAgcHJvY2Vzcy5vbignZXhpdCcsIG9uRXhpdENhbGxiYWNrKTtcbiAgICBjaGlsZC5vbignZXhpdCcsICgpID0+IHtcbiAgICAgIHByb2Nlc3MucmVtb3ZlTGlzdGVuZXIoJ2V4aXQnLCBvbkV4aXRDYWxsYmFjayk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW52b2tlcyBhIHJlbW90ZSBtZXRob2QgdGhhdCBpcyBzcGVjaWZpZWQgYXMgYW4gZXhwb3J0IG9mIGEgLmpzIGZpbGUuXG4gICAqXG4gICAqIFRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSAuanMgZmlsZSBtdXN0IGJlIHNwZWNpZmllZCB2aWEgdGhlIGBmaWxlYFxuICAgKiBwcm9wZXJ0eS4gSW4gcHJhY3RpY2UsIGByZXF1aXJlLnJlc29sdmUoKWAgaXMgaGVscGZ1bCBpbiBwcm9kdWNpbmcgdGhpc1xuICAgKiBwYXRoLlxuICAgKlxuICAgKiBJZiB0aGUgLmpzIGZpbGUgZXhwb3J0cyBhbiBvYmplY3Qgd2l0aCBtdWx0aXBsZSBwcm9wZXJ0aWVzIChyYXRoZXIgdGhhbiBhXG4gICAqIHNpbmdsZSBmdW5jdGlvbiksIHRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSAodGhhdCBzaG91bGQgY29ycmVzcG9uZCB0byBhXG4gICAqIGZ1bmN0aW9uIHRvIGludm9rZSkgbXVzdCBiZSBzcGVjaWZpZWQgdmlhIHRoZSBgbWV0aG9kYCBwcm9wZXJ0eS5cbiAgICpcbiAgICogQW55IGFyZ3VtZW50cyB0byBwYXNzIHRvIHRoZSBmdW5jdGlvbiBtdXN0IGJlIHNwZWNpZmllZCB2aWEgdGhlIGBhcmdzYFxuICAgKiBwcm9wZXJ0eSBhcyBhbiBBcnJheS4gKFRoaXMgcHJvcGVydHkgY2FuIGJlIG9taXR0ZWQgaWYgdGhlcmUgYXJlIG5vIGFyZ3MuKVxuICAgKlxuICAgKiBOb3RlIHRoYXQgYm90aCB0aGUgYXJncyBmb3IgdGhlIHJlbW90ZSBtZXRob2QsIGFzIHdlbGwgYXMgdGhlIHJldHVybiB0eXBlXG4gICAqIG9mIHRoZSByZW1vdGUgbWV0aG9kLCBtdXN0IGJlIEpTT04tc2VyaWFsaXphYmxlLiAoVGhlIHJldHVybiB0eXBlIG9mIHRoZVxuICAgKiByZW1vdGUgbWV0aG9kIGNhbiBhbHNvIGJlIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgSlNPTi1zZXJpYWxpemFibGVcbiAgICogb2JqZWN0LilcbiAgICpcbiAgICogQHJldHVybiBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgcmVzdWx0IG9mIGludm9raW5nIHRoZSByZW1vdGVcbiAgICogICAgIG1ldGhvZC4gSWYgYW4gZXJyb3IgaXMgdGhyb3duLCBhIHJlamVjdGVkIFByb21pc2Ugd2lsbCBiZSByZXR1cm5lZFxuICAgKiAgICAgaW5zdGVhZC5cbiAgICovXG4gIGludm9rZVJlbW90ZU1ldGhvZChwYXJhbXM6IEludm9rZVJlbW90ZU1ldGhvZFBhcmFtcyk6IFByb21pc2U8YW55PiB7XG4gICAgY29uc3QgcmVxdWVzdElkID0gKCsrdGhpcy5faWQpLnRvU3RyaW5nKDE2KTtcbiAgICBjb25zdCByZXF1ZXN0ID0ge1xuICAgICAgaWQ6IHJlcXVlc3RJZCxcbiAgICAgIGFjdGlvbjogJ3JlcXVlc3QnLFxuICAgICAgZmlsZTogcGFyYW1zLmZpbGUsXG4gICAgICBtZXRob2Q6IHBhcmFtcy5tZXRob2QsXG4gICAgICBhcmdzOiBwYXJhbXMuYXJncyxcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGVyckxpc3RlbmVyID0gZXJyb3IgPT4ge1xuICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgfTtcbiAgICAgIC8vIEVuc3VyZSB0aGUgcmVzcG9uc2UgbGlzdGVuZXIgaXMgc2V0IHVwIGJlZm9yZSB0aGUgcmVxdWVzdCBpcyBzZW50LlxuICAgICAgdGhpcy5fZW1pdHRlci5vbmNlKHJlcXVlc3RJZCwgcmVzcG9uc2UgPT4ge1xuICAgICAgICB0aGlzLl9lbWl0dGVyLnJlbW92ZUxpc3RlbmVyKCdlcnJvcicsIGVyckxpc3RlbmVyKTtcbiAgICAgICAgY29uc3QgZXJyID0gcmVzcG9uc2VbJ2Vycm9yJ107XG4gICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgcmVzb2x2ZShyZXNwb25zZVsncmVzdWx0J10pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE5lZWQgdG8gc3ludGhlc2l6ZSBhbiBFcnJvciBvYmplY3QgZnJvbSBpdHMgSlNPTiByZXByZXNlbnRhdGlvbi5cbiAgICAgICAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcigpO1xuICAgICAgICAgIGVycm9yLm1lc3NhZ2UgPSBlcnIubWVzc2FnZTtcbiAgICAgICAgICBlcnJvci5zdGFjayA9IGVyci5zdGFjaztcbiAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2VtaXR0ZXIub25jZSgnZXJyb3InLCBlcnJMaXN0ZW5lcik7XG4gICAgICB0aGlzLl9jaGlsZC5zZW5kKHJlcXVlc3QpO1xuICAgIH0pO1xuICB9XG5cbiAgb25FcnJvcihjYWxsYmFjazogKGJ1ZmZlcjogQnVmZmVyKSA9PiBhbnkpOiB2b2lkIHtcbiAgICB0aGlzLl9jaGlsZC5vbignZXJyb3InLCBjYWxsYmFjayk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIGlmICh0aGlzLl9jaGlsZC5jb25uZWN0ZWQpIHtcbiAgICAgIHRoaXMuX2NoaWxkLmtpbGwoKTtcbiAgICB9XG4gICAgdGhpcy5fZW1pdHRlci5yZW1vdmVBbGxMaXN0ZW5lcnMoKTtcbiAgfVxufVxuXG5leHBvcnQgdHlwZSBUYXNrID0gX1Rhc2s7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUYXNrKCk6IFRhc2sge1xuICByZXR1cm4gbmV3IF9UYXNrKCk7XG59XG4iXX0=