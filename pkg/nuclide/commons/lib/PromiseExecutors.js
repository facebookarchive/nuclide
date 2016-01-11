Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _dequeue = require('dequeue');

var _dequeue2 = _interopRequireDefault(_dequeue);

var _events = require('events');

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

    this._fifo = new _dequeue2['default']();
    this._emitter = new _events.EventEmitter();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlByb21pc2VFeGVjdXRvcnMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VCQVdvQixTQUFTOzs7O3NCQUNGLFFBQVE7Ozs7Ozs7Ozs7O0lBWXRCLFdBQVc7QUFPWCxXQVBBLFdBQVcsQ0FPVixRQUFnQixFQUFFOzBCQVBuQixXQUFXOztBQVFwQixRQUFJLENBQUMsS0FBSyxHQUFHLDBCQUFhLENBQUM7QUFDM0IsUUFBSSxDQUFDLFFBQVEsR0FBRywwQkFBa0IsQ0FBQztBQUNuQyxRQUFJLENBQUMsbUJBQW1CLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDO0dBQ3pCOzs7Ozs7Ozs7Ozs7Ozs7OztlQWJVLFdBQVc7O1dBcUJoQixnQkFBQyxRQUFrQixFQUFXOzs7QUFDbEMsVUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFDcEMsVUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0FBQzlDLFVBQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLFVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBSztBQUMvQyxjQUFLLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLFVBQUMsTUFBTSxFQUFLO2NBQzFCLFNBQVMsR0FBVyxNQUFNLENBQTFCLFNBQVM7Y0FBRSxLQUFLLEdBQUksTUFBTSxDQUFmLEtBQUs7O0FBQ3ZCLFdBQUMsU0FBUyxHQUFHLE9BQU8sR0FBRyxNQUFNLENBQUEsQ0FBRSxLQUFLLENBQUMsQ0FBQztTQUN2QyxDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7QUFDSCxVQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWixhQUFPLE9BQU8sQ0FBQztLQUNoQjs7O1dBRUcsZ0JBQUc7OztBQUNMLFVBQUksSUFBSSxDQUFDLG1CQUFtQixLQUFLLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDL0MsZUFBTztPQUNSOztBQUVELFVBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQzNCLGVBQU87T0FDUjs7d0JBRXNCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFOztVQUFsQyxFQUFFLGVBQUYsRUFBRTtVQUFFLFFBQVEsZUFBUixRQUFROztBQUNuQixVQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUMzQixVQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxNQUFNLEVBQUs7QUFDckMsZUFBSyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7QUFDekQsZUFBSyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNCLGVBQUssSUFBSSxFQUFFLENBQUM7T0FDYixFQUFFLFVBQUMsS0FBSyxFQUFLO0FBQ1osZUFBSyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBQyxDQUFDLENBQUM7QUFDekQsZUFBSyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNCLGVBQUssSUFBSSxFQUFFLENBQUM7T0FDYixDQUFDLENBQUM7S0FDSjs7O1dBRWdCLDZCQUFXO0FBQzFCLGFBQU8sQ0FBQyxJQUFJLENBQUMsY0FBYyxHQUFFLENBQUUsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzdDOzs7U0ExRFUsV0FBVzs7Ozs7SUFvRVgsWUFBWTtBQUdaLFdBSEEsWUFBWSxHQUdUOzBCQUhILFlBQVk7O0FBSXJCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDeEM7Ozs7Ozs7OztlQUxVLFlBQVk7O1dBYWpCLGdCQUFDLFFBQWtCLEVBQVc7QUFDbEMsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMzQzs7O1NBZlUsWUFBWSIsImZpbGUiOiJQcm9taXNlRXhlY3V0b3JzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IERlcXVldWUgZnJvbSAnZGVxdWV1ZSc7XG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcblxudHlwZSBFeGVjdXRvciA9IChyZXNvbHZlOiBhbnksIHJlamVjdDogYW55KSA9PiBhbnk7XG5cbi8qKlxuICogQSBwb29sIHRoYXQgZXhlY3V0ZXMgUHJvbWlzZSBleGVjdXRvcnMgaW4gcGFyYWxsZWwgZ2l2ZW4gdGhlIHBvb2xTaXplLCBpbiBvcmRlci5cbiAqXG4gKiBUaGUgZXhlY3V0b3IgZnVuY3Rpb24gcGFzc2VkIHRvIHRoZSBjb25zdHJ1Y3RvciBvZiBhIFByb21pc2UgaXMgZXZhbHVhdGVkXG4gKiBpbW1lZGlhdGVseS4gVGhpcyBtYXkgbm90IGFsd2F5cyBiZSBkZXNpcmFibGUuIFVzZSBhIFByb21pc2VQb29sIGlmIHlvdSBoYXZlXG4gKiBhIHNlcXVlbmNlIG9mIGFzeW5jIG9wZXJhdGlvbnMgdGhhdCBuZWVkIHRvIGJlIHJ1biBpbiBwYXJhbGxlbCBhbmQgeW91IGFsc28gd2FudFxuICogY29udHJvbCB0aGUgbnVtYmVyIG9mIGNvbmN1cnJlbnQgZXhlY3V0aW9ucy5cbiAqL1xuZXhwb3J0IGNsYXNzIFByb21pc2VQb29sIHtcbiAgX2ZpZm86IERlcXVldWU7XG4gIF9lbWl0dGVyOiBFdmVudEVtaXR0ZXI7XG4gIF9udW1Qcm9taXNlc1J1bm5pbmc6IG51bWJlcjtcbiAgX3Bvb2xTaXplOiBudW1iZXI7XG4gIF9uZXh0UmVxdWVzdElkOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IocG9vbFNpemU6IG51bWJlcikge1xuICAgIHRoaXMuX2ZpZm8gPSBuZXcgRGVxdWV1ZSgpO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgdGhpcy5fbnVtUHJvbWlzZXNSdW5uaW5nID0gMDtcbiAgICB0aGlzLl9wb29sU2l6ZSA9IHBvb2xTaXplO1xuICAgIHRoaXMuX25leHRSZXF1ZXN0SWQgPSAxO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBleGVjdXRvciBBIGZ1bmN0aW9uIHRoYXQgdGFrZXMgcmVzb2x2ZSBhbmQgcmVqZWN0IGNhbGxiYWNrcywganVzdFxuICAgKiAgICAgbGlrZSB0aGUgUHJvbWlzZSBjb25zdHJ1Y3Rvci5cbiAgICogQHJldHVybiBBIFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkL3JlamVjdGVkIGluIHJlc3BvbnNlIHRvIHRoZVxuICAgKiAgICAgZXhlY3V0aW9uIG9mIHRoZSBleGVjdXRvci5cbiAgICovXG4gIHN1Ym1pdChleGVjdXRvcjogRXhlY3V0b3IpOiBQcm9taXNlIHtcbiAgICBjb25zdCBpZCA9IHRoaXMuX2dldE5leHRSZXF1ZXN0SWQoKTtcbiAgICB0aGlzLl9maWZvLnB1c2goe2lkOiBpZCwgZXhlY3V0b3I6IGV4ZWN1dG9yfSk7XG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2VtaXR0ZXIub25jZShpZCwgKHJlc3VsdCkgPT4ge1xuICAgICAgICBjb25zdCB7aXNTdWNjZXNzLCB2YWx1ZX0gPSByZXN1bHQ7XG4gICAgICAgIChpc1N1Y2Nlc3MgPyByZXNvbHZlIDogcmVqZWN0KSh2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICB0aGlzLl9ydW4oKTtcbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIF9ydW4oKSB7XG4gICAgaWYgKHRoaXMuX251bVByb21pc2VzUnVubmluZyA9PT0gdGhpcy5fcG9vbFNpemUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZmlmby5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7aWQsIGV4ZWN1dG9yfSA9IHRoaXMuX2ZpZm8uc2hpZnQoKTtcbiAgICB0aGlzLl9udW1Qcm9taXNlc1J1bm5pbmcrKztcbiAgICBuZXcgUHJvbWlzZShleGVjdXRvcikudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoaWQsIHtpc1N1Y2Nlc3M6IHRydWUsIHZhbHVlOiByZXN1bHR9KTtcbiAgICAgIHRoaXMuX251bVByb21pc2VzUnVubmluZy0tO1xuICAgICAgdGhpcy5fcnVuKCk7XG4gICAgfSwgKGVycm9yKSA9PiB7XG4gICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoaWQsIHtpc1N1Y2Nlc3M6IGZhbHNlLCB2YWx1ZTogZXJyb3J9KTtcbiAgICAgIHRoaXMuX251bVByb21pc2VzUnVubmluZy0tO1xuICAgICAgdGhpcy5fcnVuKCk7XG4gICAgfSk7XG4gIH1cblxuICBfZ2V0TmV4dFJlcXVlc3RJZCgpOiBzdHJpbmcge1xuICAgIHJldHVybiAodGhpcy5fbmV4dFJlcXVlc3RJZCsrKS50b1N0cmluZygxNik7XG4gIH1cbn1cblxuLyoqXG4gKiBGSUZPIHF1ZXVlIHRoYXQgZXhlY3V0ZXMgUHJvbWlzZSBleGVjdXRvcnMgb25lIGF0IGEgdGltZSwgaW4gb3JkZXIuXG4gKlxuICogVGhlIGV4ZWN1dG9yIGZ1bmN0aW9uIHBhc3NlZCB0byB0aGUgY29uc3RydWN0b3Igb2YgYSBQcm9taXNlIGlzIGV2YWx1YXRlZFxuICogaW1tZWRpYXRlbHkuIFRoaXMgbWF5IG5vdCBhbHdheXMgYmUgZGVzaXJhYmxlLiBVc2UgYSBQcm9taXNlUXVldWUgaWYgeW91IGhhdmVcbiAqIGEgc2VxdWVuY2Ugb2YgYXN5bmMgb3BlcmF0aW9ucyB0aGF0IG5lZWQgdG8gdXNlIGEgc2hhcmVkIHJlc291cmNlIHNlcmlhbGx5LlxuICovXG5leHBvcnQgY2xhc3MgUHJvbWlzZVF1ZXVlIHtcbiAgX3Byb21pc2VQb29sOiBQcm9taXNlUG9vbDtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9wcm9taXNlUG9vbCA9IG5ldyBQcm9taXNlUG9vbCgxKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gZXhlY3V0b3IgQSBmdW5jdGlvbiB0aGF0IHRha2VzIHJlc29sdmUgYW5kIHJlamVjdCBjYWxsYmFja3MsIGp1c3RcbiAgICogICAgIGxpa2UgdGhlIFByb21pc2UgY29uc3RydWN0b3IuXG4gICAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZC9yZWplY3RlZCBpbiByZXNwb25zZSB0byB0aGVcbiAgICogICAgIGV4ZWN1dGlvbiBvZiB0aGUgZXhlY3V0b3IuXG4gICAqL1xuICBzdWJtaXQoZXhlY3V0b3I6IEV4ZWN1dG9yKTogUHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb21pc2VQb29sLnN1Ym1pdChleGVjdXRvcik7XG4gIH1cbn1cbiJdfQ==