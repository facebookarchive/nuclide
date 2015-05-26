'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var Dequeue = require('dequeue');
var {EventEmitter} = require('events');


/**
 * FIFO queue that executes Promise executors one at a time, in order.
 *
 * The executor function passed to the constructor of a Promise is evaluated
 * immediately. This may not always be desirable. Use a PromiseQueue if you have
 * a sequence of async operations that need to use a shared resource serially.
 */
module.exports =
class PromiseQueue {

  constructor() {
    this._fifo = new Dequeue();
    this._emitter = new EventEmitter();
    this._isRunning = false;
    this._nextRequestId = 1;
  }

  /**
   * @param executor A function that takes resolve and reject callbacks, just
   *     like the Promise constructor.
   * @return A Promise that will be resolved/rejected in response to the
   *     execution of the executor.
   */
  submit(executor): Promise {
    var id = this._getNextRequestId();
    this._fifo.push({id: id, executor: executor});
    var promise = new Promise((resolve, reject) => {
      this._emitter.once(id, (result) => {
        var {isSuccess, value} = result;
        (isSuccess ? resolve : reject)(value);
      });
    });
    this._run();
    return promise;
  }

  _run() {
    if (this._isRunning) {
      return;
    }

    if (this._fifo.length === 0) {
      return;
    }

    var {id, executor} = this._fifo.shift();
    this._isRunning = true;
    new Promise(executor).then((result) => {
      this._emitter.emit(id, {isSuccess: true, value: result});
      this._isRunning = false;
      this._run();
    }, (error) => {
      this._emitter.emit(id, {isSuccess: false, value: error});
      this._isRunning = false;
      this._run();
    });
  }

  _getNextRequestId(): string {
    return (this._nextRequestId++).toString(16);
  }
}
