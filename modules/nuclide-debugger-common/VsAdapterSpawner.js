'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _process;















function _load_process() {return _process = require('../nuclide-commons/process');}



var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class VsAdapterSpawner {


  constructor() {
    this._stdin = new _rxjsBundlesRxMinJs.Subject();
  }

  spawnAdapter(
  adapter)
  {
    const environment = _rxjsBundlesRxMinJs.Observable.fromPromise((0, (_process || _load_process()).getOriginalEnvironment)());
    return _rxjsBundlesRxMinJs.Observable.forkJoin(this._stdin.buffer(environment), environment).
    switchMap(([stdinBuffer, env]) => {
      const options = {
        stdio: [
        'pipe', // stdin
        'pipe', // stdout
        'pipe'],

        env: Object.assign({}, env, { ELECTRON_RUN_AS_NODE: 1 }),
        input: _rxjsBundlesRxMinJs.Observable.from(stdinBuffer).concat(this._stdin),
        killTreeWhenDone: true };

      if (adapter.command === 'node') {
        adapter.command = process.execPath;
      }
      return (0, (_process || _load_process()).observeProcessRaw)(adapter.command, adapter.args, options);
    }).
    publish();
  }

  write(input) {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      _this._stdin.next(input);})();
  }

  dispose() {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      _this2._stdin.complete();})();
  }}exports.default = VsAdapterSpawner; /**
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