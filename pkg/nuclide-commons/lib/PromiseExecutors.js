Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _dequeue2;

function _dequeue() {
  return _dequeue2 = _interopRequireDefault(require('dequeue'));
}

var _events2;

function _events() {
  return _events2 = require('events');
}

/**
 * A pool that executes Promise executors in parallel given the poolSize, in order.
 *
 * The executor function passed to the constructor of a Promise is evaluated
 * immediately. This may not always be desirable. Use a PromisePool if you have
 * a sequence of async operations that need to be run in parallel and you also want
 * control the number of concurrent executions.
 */

var PromisePool = (function () {
  function PromisePool(poolSize) {
    _classCallCheck(this, PromisePool);

    this._fifo = new (_dequeue2 || _dequeue()).default();
    this._emitter = new (_events2 || _events()).EventEmitter();
    this._numPromisesRunning = 0;
    this._poolSize = poolSize;
    this._nextRequestId = 1;
  }

  /**
   * FIFO queue that executes Promise executors one at a time, in order.
   *
   * The executor function passed to the constructor of a Promise is evaluated
   * immediately. This may not always be desirable. Use a PromiseQueue if you have
   * a sequence of async operations that need to use a shared resource serially.
   */

  /**
   * @param executor A function that takes resolve and reject callbacks, just
   *     like the Promise constructor.
   * @return A Promise that will be resolved/rejected in response to the
   *     execution of the executor.
   */

  _createClass(PromisePool, [{
    key: 'submit',
    value: function submit(executor) {
      var _this = this;

      var id = this._getNextRequestId();
      this._fifo.push({ id: id, executor: executor });
      var promise = new Promise(function (resolve, reject) {
        _this._emitter.once(id, function (result) {
          var isSuccess = result.isSuccess;
          var value = result.value;

          (isSuccess ? resolve : reject)(value);
        });
      });
      this._run();
      return promise;
    }
  }, {
    key: '_run',
    value: function _run() {
      var _this2 = this;

      if (this._numPromisesRunning === this._poolSize) {
        return;
      }

      if (this._fifo.length === 0) {
        return;
      }

      var _fifo$shift = this._fifo.shift();

      var id = _fifo$shift.id;
      var executor = _fifo$shift.executor;

      this._numPromisesRunning++;
      new Promise(executor).then(function (result) {
        _this2._emitter.emit(id, { isSuccess: true, value: result });
        _this2._numPromisesRunning--;
        _this2._run();
      }, function (error) {
        _this2._emitter.emit(id, { isSuccess: false, value: error });
        _this2._numPromisesRunning--;
        _this2._run();
      });
    }
  }, {
    key: '_getNextRequestId',
    value: function _getNextRequestId() {
      return (this._nextRequestId++).toString(16);
    }
  }]);

  return PromisePool;
})();

exports.PromisePool = PromisePool;

var PromiseQueue = (function () {
  function PromiseQueue() {
    _classCallCheck(this, PromiseQueue);

    this._promisePool = new PromisePool(1);
  }

  /**
   * @param executor A function that takes resolve and reject callbacks, just
   *     like the Promise constructor.
   * @return A Promise that will be resolved/rejected in response to the
   *     execution of the executor.
   */

  _createClass(PromiseQueue, [{
    key: 'submit',
    value: function submit(executor) {
      return this._promisePool.submit(executor);
    }
  }]);

  return PromiseQueue;
})();

exports.PromiseQueue = PromiseQueue;