"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PromiseQueue = exports.PromisePool = void 0;

function _doubleEndedQueue() {
  const data = _interopRequireDefault(require("double-ended-queue"));

  _doubleEndedQueue = function () {
    return data;
  };

  return data;
}

var _events = _interopRequireDefault(require("events"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

/**
 * A pool that executes Promise executors in parallel given the poolSize, in order.
 *
 * The executor function passed to the constructor of a Promise is evaluated
 * immediately. This may not always be desirable. Use a PromisePool if you have
 * a sequence of async operations that need to be run in parallel and you also want
 * control the number of concurrent executions.
 */
class PromisePool {
  constructor(poolSize) {
    this._fifo = new (_doubleEndedQueue().default)();
    this._emitter = new _events.default();
    this._numPromisesRunning = 0;
    this._poolSize = poolSize;
    this._nextRequestId = 1;
  }
  /**
   * @param executor A function that takes resolve and reject callbacks, just
   *     like the Promise constructor.
   * @return A Promise that will be resolved/rejected in response to the
   *     execution of the executor.
   */


  submit(executor) {
    const id = this._getNextRequestId();

    this._fifo.push({
      id,
      executor
    });

    const promise = new Promise((resolve, reject) => {
      this._emitter.once(id, result => {
        const {
          isSuccess,
          value
        } = result;
        (isSuccess ? resolve : reject)(value);
      });
    });

    this._run();

    return promise;
  }

  _run() {
    if (this._numPromisesRunning === this._poolSize) {
      return;
    }

    const first = this._fifo.shift();

    if (first == null) {
      return;
    }

    const {
      id,
      executor
    } = first;
    this._numPromisesRunning++;
    executor().then(result => {
      this._emitter.emit(id, {
        isSuccess: true,
        value: result
      });

      this._numPromisesRunning--;

      this._run();
    }, error => {
      this._emitter.emit(id, {
        isSuccess: false,
        value: error
      });

      this._numPromisesRunning--;

      this._run();
    });
  }

  _getNextRequestId() {
    return (this._nextRequestId++).toString(16);
  }

}
/**
 * FIFO queue that executes Promise executors one at a time, in order.
 *
 * The executor function passed to the constructor of a Promise is evaluated
 * immediately. This may not always be desirable. Use a PromiseQueue if you have
 * a sequence of async operations that need to use a shared resource serially.
 */


exports.PromisePool = PromisePool;

class PromiseQueue {
  constructor() {
    this._promisePool = new PromisePool(1);
  }
  /**
   * @param executor A function that takes resolve and reject callbacks, just
   *     like the Promise constructor.
   * @return A Promise that will be resolved/rejected in response to the
   *     execution of the executor.
   */


  submit(executor) {
    return this._promisePool.submit(executor);
  }

}

exports.PromiseQueue = PromiseQueue;