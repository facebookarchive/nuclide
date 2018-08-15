"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ExecRpcMethods = void 0;

var path = _interopRequireWildcard(require("path"));

function _ExecProcess() {
  const data = require("./ExecProcess");

  _ExecProcess = function () {
    return data;
  };

  return data;
}

function proto() {
  const data = _interopRequireWildcard(require("./Protocol.js"));

  proto = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

/** This should point to the dir of the `code` script. */
const BIG_DIG_BIN = __dirname;

class ExecRpcMethods {
  constructor() {
    this._processes = new Map();
  }

  register(registrar) {
    registrar.registerObservable('exec/spawn', this._doExecSpawn.bind(this));
    registrar.registerFun('exec/stdin', this._doExecStdin.bind(this));
    registrar.registerObservable('exec/observe', this._doExecObserve.bind(this));
    registrar.registerFun('exec/kill', this._doExecKill.bind(this));
    registrar.registerFun('exec/resize', this._doExecResize.bind(this));
  }

  dispose() {
    // Kill all attached processes
    for (const proc of this._processes.values()) {
      proc.kill('SIGTERM');
    }

    this._processes.clear();
  }

  _doExecSpawn(params) {
    const {
      cmd,
      cwd
    } = params;
    const args = params.args || [];
    const env = params.inheritEnv === true || params.inheritEnv === undefined ? process.env : {};

    if (params.addBigDigToPath === true) {
      // Make the `code` script available in PATH
      env.PATH = [env.PATH, BIG_DIG_BIN].join(path.delimiter);
    }

    const shell = params.shell == null ? false : params.shell || false;
    const usePty = params.usePty == null ? false : params.usePty;
    Object.assign(env, params.env || {});
    const proc = (0, _ExecProcess().exec)({
      cmd,
      args,
      cwd,
      env,
      shell,
      usePty
    }); // Attached processes will be killed if the client disconnects

    this._processes.set(proc.pid, proc); // A process should be removed once it completes. It is possible that we are disposed first;
    // this will cause all attached processes to be killed, and so they will remove themselves
    // from this map... there's no gaurantee this will happen before the dispose method returns.


    proc.onComplete(() => {
      // If we have been disposed first, then `this._processes` will be empty and this line
      // should do nothing:
      this._processes.delete(proc.pid);
    }); // This stream will send a `SpawnResponse` as the first message upon any subscription.

    return proc.stream;
  }

  _doExecStdin(params) {
    return this._withExecProcess(params.pid, proc => {
      proc.write(params.data);
      return Promise.resolve({});
    });
  }

  _doExecObserve(params) {
    return this._withExecProcess(params.pid, proc => proc.stream);
  }

  _doExecKill(params) {
    return this._withExecProcess(params.pid, proc => {
      proc.kill(params.signal);
      return Promise.resolve({});
    });
  }

  _doExecResize(params) {
    return this._withExecProcess(params.pid, proc => {
      proc.resize(params.columns, params.rows);
      return Promise.resolve({});
    });
  }

  _withExecProcess(pid, f) {
    const proc = this._processes.get(pid);

    if (proc == null) {
      throw new Error(`Invalid pid: ${pid}`);
    } else {
      return f(proc);
    }
  }

}

exports.ExecRpcMethods = ExecRpcMethods;