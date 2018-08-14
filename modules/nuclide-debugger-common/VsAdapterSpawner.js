"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _process() {
  const data = require("../nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

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
class VsAdapterSpawner {
  constructor() {
    this._stdin = new _RxMin.Subject();
  }

  spawnAdapter(adapter) {
    const environment = _RxMin.Observable.fromPromise((0, _process().getOriginalEnvironment)());

    return _RxMin.Observable.forkJoin(this._stdin.buffer(environment), environment).switchMap(([stdinBuffer, env]) => {
      const options = {
        stdio: ['pipe', // stdin
        'pipe', // stdout
        'pipe'],
        env: Object.assign({}, env, {
          ELECTRON_RUN_AS_NODE: 1
        }),
        input: _RxMin.Observable.from(stdinBuffer).concat(this._stdin),
        killTreeWhenDone: true,
        killTreeSignal: 'SIGKILL'
      };

      if (adapter.command === 'node') {
        adapter.command = process.execPath;
      }

      return (0, _process().observeProcessRaw)(adapter.command, adapter.args, options);
    }).publish();
  }

  async write(input) {
    this._stdin.next(input);
  }

  async dispose() {
    this._stdin.complete();
  }

}

exports.default = VsAdapterSpawner;