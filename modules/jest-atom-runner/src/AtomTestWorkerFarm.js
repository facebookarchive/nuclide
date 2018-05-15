'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _AtomTestWorker;



















function _load_AtomTestWorker() {return _AtomTestWorker = _interopRequireDefault(require('./AtomTestWorker'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                              * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                              * All rights reserved.
                                                                                                                                                                                                              *
                                                                                                                                                                                                              * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                              * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                              * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                              *
                                                                                                                                                                                                              *  strict-local
                                                                                                                                                                                                              * @format
                                                                                                                                                                                                              */ /* An abstroction that acts as a sempaphore for Atom workers. */ /* eslint-disable nuclide-internal/no-commonjs */class AtomTestWorkerFarm {
  constructor({
    ipcServer,
    serverID,
    globalConfig,
    concurrency })





  {
    if (concurrency < 1) {
      throw new Error(
      `concurrency has to be greater than 1, given: ${concurrency}`);

    }
    this._workers = [];
    this._queue = [];
    for (let i = 0; i < concurrency; i++) {
      const worker = new (_AtomTestWorker || _load_AtomTestWorker()).default({ ipcServer, serverID, globalConfig });
      this._workers.push(worker);
    }
  }

  start() {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      yield Promise.all(_this._workers.map(function (w) {return w.start();})).then(function (results) {return (
          results.forEach(function () {return _this._processNext();}));});})();

  }

  stop() {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      yield Promise.all(_this2._workers.map(function (w) {return w.stop();}));})();
  }

  _processNext() {
    const availableWorker = this._workers.find(w => !w.isBusy());
    if (availableWorker) {
      const nextInQueue = this._queue.shift();
      if (nextInQueue) {
        nextInQueue.onStart(nextInQueue.test);
        availableWorker.
        runTest(nextInQueue.test).
        then(testResult => {
          nextInQueue.resolve(testResult);
          this._processNext();
        }).
        catch(error => {
          nextInQueue.reject(error);
          this._processNext();
        });
      }
    }
  }

  runTest(test, onStart) {
    return new Promise((resolve, reject) => {
      this._queue.push({ test, resolve, reject, onStart });
      this._processNext();
    });
  }}exports.default =


AtomTestWorkerFarm;