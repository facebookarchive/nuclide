Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.createTask = createTask;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _child_process2;

function _child_process() {
  return _child_process2 = _interopRequireDefault(require('child_process'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _events2;

function _events() {
  return _events2 = require('events');
}

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
    this._emitter = new (_events2 || _events()).EventEmitter();
    var options = { silent: true }; // Needed so stdout/stderr are available.
    var child = this._child = (_child_process2 || _child_process()).default.fork((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, '/bootstrap.js'), options);
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
      var id = response.id;
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
          var err = response.error;
          if (!err) {
            resolve(response.result);
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