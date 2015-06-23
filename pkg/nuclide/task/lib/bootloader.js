'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {EventEmitter} = require('events');

export type InvokeRemoteMethodParams = {
  file: string;
  method: ?string;
  args: ?Array<any>;
};

/**
 * Task creates and manages communication with another Node process. In addition
 * to executing ordinary .js files, the other Node process can also run .js files
 * under the Babel transpiler, so long as they have the `'use babel'` pragma
 * used in Atom.
 */
class Task {
  constructor() {
    this._id = 0;
    this._emitter = new EventEmitter();
    var options = {silent: true}; // Needed so stdout/stderr are available.
    var child = this._child = require('child_process')
        .fork(require('path').join(__dirname, '/bootstrap.js'), options);
    /*eslint-disable no-console*/
    var log = buffer => console.log(`TASK(${child.pid}): ${buffer}`);
    /*eslint-enable no-console*/
    child.stdout.on('data', log);
    child.stderr.on('data', log);
    // The Flow error on the following line is due to a bug in Flow:
    // https://github.com/facebook/flow/issues/428.
    child.on('message', response => {
      var id = response['id'];
      this._emitter.emit(id, response);
    });
    child.on('error', log);
    child.send({
      action: 'bootstrap',
      transpiler: require.resolve('nuclide-node-transpiler'),
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
  invokeRemoteMethod(params: InvokeRemoteMethodParams): Promise<any> {
    var requestId = (++this._id).toString(16);
    var request = {
      id: requestId,
      action: 'request',
      file: params.file,
      method: params.method,
      args: params.args,
    };

    return new Promise((resolve, reject) => {
      // Ensure the response listener is set up before the request is sent.
      this._emitter.once(requestId, response => {
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
      this._child.send(request);
    });
  }

  dispose() {
    if (this._child.connected) {
      this._child.disconnect();
    }
    this._emitter.removeAllListeners();
  }
}

function createTask(): Task {
  return new Task();
}

module.exports = {
  createTask,
};
