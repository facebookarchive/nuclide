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

exports.CircularBuffer = CircularBuffer;

/** The maximum number of elements this CircularBuffer can hold. */

/** Whether this CircularBuffer has reached its capacity. */

/**
 * Represents the state of the CircularBuffer when an Iterator for it is created. If the
 * state of the CircularBuffer changes while it is being iterated, it will throw an exception.
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNpcmN1bGFyQnVmZmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7SUFXYSxjQUFjOzs7Ozs7O0FBbUJkLFdBbkJBLGNBQWMsQ0FtQmIsUUFBZ0IsRUFBRTswQkFuQm5CLGNBQWM7O0FBb0J2QixRQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRTtBQUMvQixZQUFNLElBQUksS0FBSywyQ0FBeUMsUUFBUSxPQUFJLENBQUM7S0FDdEU7QUFDRCxRQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7QUFDakIsWUFBTSxJQUFJLEtBQUssa0RBQWdELFFBQVEsT0FBSSxDQUFDO0tBQzdFO0FBQ0QsUUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7QUFDMUIsUUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNyQyxRQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLFFBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFFBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQ3RCOzs7Ozs7ZUEvQlUsY0FBYzs7V0F3Q3JCLGNBQUMsT0FBVSxFQUFRO0FBQ3JCLFFBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNuQixVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQztBQUNoRCxVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLFVBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUNuRCxVQUFJLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hELFlBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO09BQ3JCO0tBQ0Y7Ozs7Ozs7OztTQVFBLE1BQU0sQ0FBQyxRQUFRO1dBQUMsaUJBQWdCOzs7QUFDL0IsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNwQyxVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFDckQsVUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQzs7QUFFMUUsVUFBTSxJQUFJLEdBQUcsU0FBUCxJQUFJLEdBQXFDO0FBQzdDLFlBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtBQUN2QixpQkFBTyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBQyxDQUFDO1NBQ3ZDO0FBQ0QsWUFBSSxVQUFVLEtBQUssTUFBSyxXQUFXLEVBQUU7QUFDbkMsZ0JBQU0sSUFBSSxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FBQztTQUNsRTtBQUNELFVBQUUsYUFBYSxDQUFDO0FBQ2hCLFlBQU0sS0FBSyxHQUFHLE1BQUssU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLGFBQUssR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUEsR0FBSSxNQUFLLFNBQVMsQ0FBQztBQUNyQyxlQUFPLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUwsS0FBSyxFQUFDLENBQUM7T0FDN0IsQ0FBQzs7QUFFRixhQUFPLEVBQUMsSUFBSSxFQUFKLElBQUksRUFBQyxDQUFDO0tBQ2Y7OztTQXZDVyxlQUFXO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztLQUN2Qjs7O1NBdENVLGNBQWMiLCJmaWxlIjoiQ2lyY3VsYXJCdWZmZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5leHBvcnQgY2xhc3MgQ2lyY3VsYXJCdWZmZXI8VD4ge1xuICAvKiogVGhlIG1heGltdW0gbnVtYmVyIG9mIGVsZW1lbnRzIHRoaXMgQ2lyY3VsYXJCdWZmZXIgY2FuIGhvbGQuICovXG4gIF9jYXBhY2l0eTogbnVtYmVyO1xuICBfZWxlbWVudHM6IEFycmF5PFQ+O1xuICBfbmV4dEluc2VydEluZGV4OiBudW1iZXI7XG5cbiAgLyoqIFdoZXRoZXIgdGhpcyBDaXJjdWxhckJ1ZmZlciBoYXMgcmVhY2hlZCBpdHMgY2FwYWNpdHkuICovXG4gIF9pc0Z1bGw6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgdGhlIHN0YXRlIG9mIHRoZSBDaXJjdWxhckJ1ZmZlciB3aGVuIGFuIEl0ZXJhdG9yIGZvciBpdCBpcyBjcmVhdGVkLiBJZiB0aGVcbiAgICogc3RhdGUgb2YgdGhlIENpcmN1bGFyQnVmZmVyIGNoYW5nZXMgd2hpbGUgaXQgaXMgYmVpbmcgaXRlcmF0ZWQsIGl0IHdpbGwgdGhyb3cgYW4gZXhjZXB0aW9uLlxuICAgKi9cbiAgX2dlbmVyYXRpb246IG51bWJlcjtcblxuICAvKipcbiAgICogQHBhcmFtIGNhcGFjaXR5IGlzIHRoZSBtYXhpbXVtIG51bWJlciBvZiBlbGVtZW50cyB0aGlzIENpcmN1bGFyQnVmZmVyIGNhbiBob2xkLiBJdCBtdXN0IGJlIGFuXG4gICAqICAgaW50ZWdlciBncmVhdGVyIHRoYW4gemVyby5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGNhcGFjaXR5OiBudW1iZXIpIHtcbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIoY2FwYWNpdHkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGNhcGFjaXR5IG11c3QgYmUgYW4gaW50ZWdlciwgYnV0IHdhcyAke2NhcGFjaXR5fS5gKTtcbiAgICB9XG4gICAgaWYgKGNhcGFjaXR5IDw9IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgY2FwYWNpdHkgbXVzdCBiZSBncmVhdGVyIHRoYW4gemVybywgYnV0IHdhcyAke2NhcGFjaXR5fS5gKTtcbiAgICB9XG4gICAgdGhpcy5fY2FwYWNpdHkgPSBjYXBhY2l0eTtcbiAgICB0aGlzLl9lbGVtZW50cyA9IG5ldyBBcnJheShjYXBhY2l0eSk7XG4gICAgdGhpcy5fbmV4dEluc2VydEluZGV4ID0gMDtcbiAgICB0aGlzLl9pc0Z1bGwgPSBmYWxzZTtcbiAgICB0aGlzLl9nZW5lcmF0aW9uID0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbWF4aW11bSBudW1iZXIgb2YgZWxlbWVudHMgdGhpcyBDaXJjdWxhckJ1ZmZlciBjYW4gaG9sZC5cbiAgICovXG4gIGdldCBjYXBhY2l0eSgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl9jYXBhY2l0eTtcbiAgfVxuXG4gIHB1c2goZWxlbWVudDogVCk6IHZvaWQge1xuICAgICsrdGhpcy5fZ2VuZXJhdGlvbjtcbiAgICB0aGlzLl9lbGVtZW50c1t0aGlzLl9uZXh0SW5zZXJ0SW5kZXhdID0gZWxlbWVudDtcbiAgICBjb25zdCBuZXh0SW5kZXggPSB0aGlzLl9uZXh0SW5zZXJ0SW5kZXggKyAxO1xuICAgIHRoaXMuX25leHRJbnNlcnRJbmRleCA9IG5leHRJbmRleCAlIHRoaXMuX2NhcGFjaXR5O1xuICAgIGlmICh0aGlzLl9uZXh0SW5zZXJ0SW5kZXggPT09IDAgJiYgIXRoaXMuX2lzRnVsbCkge1xuICAgICAgdGhpcy5faXNGdWxsID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiBhbiBgSXRlcmF0b3JgIHRoYXQgaXRlcmF0ZXMgdGhyb3VnaCB0aGUgbGFzdCBOIGVsZW1lbnRzIGFkZGVkIHRvIHRoZSBidWZmZXIgd2hlcmUgTlxuICAgKiAgIGlzIDw9IGBjYXBhY3R5YC4gSWYgdGhlIGJ1ZmZlciBpcyBtb2RpZmllZCB3aGlsZSBpdCBpcyBiZWluZyBpdGVyYXRlZCwgYW4gRXJyb3Igd2lsbCBiZVxuICAgKiAgIHRocm93bi5cbiAgICovXG4gIC8vICRGbG93SXNzdWU6IHQ2MTg3MDUwXG4gIFtTeW1ib2wuaXRlcmF0b3JdKCk6IEl0ZXJhdG9yPFQ+IHtcbiAgICBjb25zdCBnZW5lcmF0aW9uID0gdGhpcy5fZ2VuZXJhdGlvbjtcbiAgICBsZXQgaW5kZXggPSB0aGlzLl9pc0Z1bGwgPyB0aGlzLl9uZXh0SW5zZXJ0SW5kZXggOiAwO1xuICAgIGxldCBudW1JdGVyYXRpb25zID0gdGhpcy5faXNGdWxsID8gdGhpcy5fY2FwYWNpdHkgOiB0aGlzLl9uZXh0SW5zZXJ0SW5kZXg7XG5cbiAgICBjb25zdCBuZXh0ID0gKCk6IHtkb25lOiBib29sZWFuOyB2YWx1ZTogP1R9ID0+IHtcbiAgICAgIGlmIChudW1JdGVyYXRpb25zID09PSAwKSB7XG4gICAgICAgIHJldHVybiB7ZG9uZTogdHJ1ZSwgdmFsdWU6IHVuZGVmaW5lZH07XG4gICAgICB9XG4gICAgICBpZiAoZ2VuZXJhdGlvbiAhPT0gdGhpcy5fZ2VuZXJhdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NpcmN1bGFyQnVmZmVyIHdhcyBtb2RpZmllZCBkdXJpbmcgaXRlcmF0aW9uLicpO1xuICAgICAgfVxuICAgICAgLS1udW1JdGVyYXRpb25zO1xuICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLl9lbGVtZW50c1tpbmRleF07XG4gICAgICBpbmRleCA9IChpbmRleCArIDEpICUgdGhpcy5fY2FwYWNpdHk7XG4gICAgICByZXR1cm4ge2RvbmU6IGZhbHNlLCB2YWx1ZX07XG4gICAgfTtcblxuICAgIHJldHVybiB7bmV4dH07XG4gIH1cbn1cbiJdfQ==