'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _child_process = _interopRequireDefault(require('child_process'));

var _events = _interopRequireDefault(require('events'));

var _env;

function _load_env() {
  return _env = require('../../nuclide-node-transpiler/lib/env');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const BOOTSTRAP_PATH = require.resolve('./bootstrap'); /**
                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                        * All rights reserved.
                                                        *
                                                        * This source code is licensed under the license found in the LICENSE file in
                                                        * the root directory of this source tree.
                                                        *
                                                        * 
                                                        * @format
                                                        */

const TRANSPILER_PATH = require.resolve('../../nuclide-node-transpiler');

/**
 * Task creates and manages communication with another Node process. In addition
 * to executing ordinary .js files, the other Node process can also run .js files
 * under the Babel transpiler, so long as they have the  pragma.
 */
class Task {

  constructor() {
    this._id = 0;
    this._emitter = new _events.default();
    this._child = null;
  }

  _initialize() {
    if (!(this._child == null)) {
      throw new Error('Invariant violation: "this._child == null"');
    }

    const child = this._child = this._fork();
    const log = buffer => {
      // eslint-disable-next-line no-console
      console.log(`TASK(${child.pid}): ${buffer}`);
    };
    child.stdout.on('data', log);
    child.stderr.on('data', log);
    child.on('message', response => {
      const id = response.id;
      this._emitter.emit(id, response);
    });
    child.on('error', buffer => {
      log(buffer);
      child.kill();
      this._emitter.emit('error', buffer.toString());
      this._emitter.emit('child-process-error', buffer);
    });

    const onExitCallback = () => {
      child.kill();
    };
    process.on('exit', onExitCallback);
    child.on('exit', () => {
      this._emitter.emit('exit');
      process.removeListener('exit', onExitCallback);
    });
  }

  _fork() {
    // The transpiler is only loaded in development.
    if ((_env || _load_env()).__DEV__) {
      return _child_process.default.fork('--require', [TRANSPILER_PATH, BOOTSTRAP_PATH], { silent: true });
    } else {
      return _child_process.default.fork(BOOTSTRAP_PATH, [], { silent: true });
    }
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
  invokeRemoteMethod(params) {
    if (this._child == null) {
      this._initialize();
    }

    const requestId = (++this._id).toString(16);
    const request = {
      id: requestId,
      file: params.file,
      method: params.method,
      args: params.args
    };

    return new Promise((resolve, reject) => {
      // Ensure the response listener is set up before the request is sent.
      this._emitter.once(requestId, response => {
        this._emitter.removeListener('error', reject);
        const err = response.error;
        if (!err) {
          resolve(response.result);
        } else {
          // Need to synthesize an Error object from its JSON representation.
          const error = new Error();
          error.message = err.message;
          error.stack = err.stack;
          reject(error);
        }
      });
      this._emitter.once('error', reject);

      if (!(this._child != null)) {
        throw new Error('Invariant violation: "this._child != null"');
      }

      this._child.send(request);
    });
  }

  onError(callback) {
    this._emitter.on('child-process-error', callback);
  }

  onExit(callback) {
    this._emitter.on('exit', callback);
  }

  dispose() {
    if (this._child != null && this._child.connected) {
      this._child.kill();
    }
    this._emitter.removeAllListeners();
  }
}
exports.default = Task;