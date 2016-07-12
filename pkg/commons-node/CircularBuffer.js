Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var CircularBuffer = (function () {

  /**
   * @param capacity is the maximum number of elements this CircularBuffer can hold. It must be an
   *   integer greater than zero.
   */

  function CircularBuffer(capacity) {
    _classCallCheck(this, CircularBuffer);

    if (!Number.isInteger(capacity)) {
      throw new Error('capacity must be an integer, but was ' + capacity + '.');
    }
    if (capacity <= 0) {
      throw new Error('capacity must be greater than zero, but was ' + capacity + '.');
    }
    this._capacity = capacity;
    this._elements = new Array(capacity);
    this._nextInsertIndex = 0;
    this._isFull = false;
    this._generation = 0;
  }

  /**
   * The maximum number of elements this CircularBuffer can hold.
   */

  _createClass(CircularBuffer, [{
    key: 'push',
    value: function push(element) {
      ++this._generation;
      this._elements[this._nextInsertIndex] = element;
      var nextIndex = this._nextInsertIndex + 1;
      this._nextInsertIndex = nextIndex % this._capacity;
      if (this._nextInsertIndex === 0 && !this._isFull) {
        this._isFull = true;
      }
    }

    /**
     * @return an `Iterator` that iterates through the last N elements added to the buffer where N
     *   is <= `capacty`. If the buffer is modified while it is being iterated, an Error will be
     *   thrown.
     */
    // $FlowIssue: t6187050
  }, {
    key: Symbol.iterator,
    value: function value() {
      var _this = this;

      var generation = this._generation;
      var index = this._isFull ? this._nextInsertIndex : 0;
      var numIterations = this._isFull ? this._capacity : this._nextInsertIndex;

      var next = function next() {
        if (numIterations === 0) {
          return { done: true, value: undefined };
        }
        if (generation !== _this._generation) {
          throw new Error('CircularBuffer was modified during iteration.');
        }
        --numIterations;
        var value = _this._elements[index];
        index = (index + 1) % _this._capacity;
        return { done: false, value: value };
      };

      return { next: next };
    }
  }, {
    key: 'capacity',
    get: function get() {
      return this._capacity;
    }
  }]);

  return CircularBuffer;
})();

exports.default = CircularBuffer;
module.exports = exports.default;

/** The maximum number of elements this CircularBuffer can hold. */

/** Whether this CircularBuffer has reached its capacity. */

/**
 * Represents the state of the CircularBuffer when an Iterator for it is created. If the
 * state of the CircularBuffer changes while it is being iterated, it will throw an exception.
 */