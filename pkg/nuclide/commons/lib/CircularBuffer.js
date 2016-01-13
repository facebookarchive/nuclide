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

exports['default'] = CircularBuffer;
module.exports = exports['default'];

/** The maximum number of elements this CircularBuffer can hold. */

/** Whether this CircularBuffer has reached its capacity. */

/**
 * Represents the state of the CircularBuffer when an Iterator for it is created. If the
 * state of the CircularBuffer changes while it is being iterated, it will throw an exception.
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkNpcmN1bGFyQnVmZmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7SUFXcUIsY0FBYzs7Ozs7OztBQW1CdEIsV0FuQlEsY0FBYyxDQW1CckIsUUFBZ0IsRUFBRTswQkFuQlgsY0FBYzs7QUFvQi9CLFFBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQy9CLFlBQU0sSUFBSSxLQUFLLDJDQUF5QyxRQUFRLE9BQUksQ0FBQztLQUN0RTtBQUNELFFBQUksUUFBUSxJQUFJLENBQUMsRUFBRTtBQUNqQixZQUFNLElBQUksS0FBSyxrREFBZ0QsUUFBUSxPQUFJLENBQUM7S0FDN0U7QUFDRCxRQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUMxQixRQUFJLENBQUMsU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFDMUIsUUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDckIsUUFBSSxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7R0FDdEI7Ozs7OztlQS9Ca0IsY0FBYzs7V0F3QzdCLGNBQUMsT0FBVSxFQUFRO0FBQ3JCLFFBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNuQixVQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQztBQUNoRCxVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO0FBQzVDLFVBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUNuRCxVQUFJLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ2hELFlBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO09BQ3JCO0tBQ0Y7Ozs7Ozs7OztTQVFBLE1BQU0sQ0FBQyxRQUFRO1dBQUMsaUJBQWdCOzs7QUFDL0IsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNwQyxVQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUM7QUFDckQsVUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQzs7QUFFMUUsVUFBTSxJQUFJLEdBQUcsU0FBUCxJQUFJLEdBQXFDO0FBQzdDLFlBQUksYUFBYSxLQUFLLENBQUMsRUFBRTtBQUN2QixpQkFBTyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBQyxDQUFDO1NBQ3ZDO0FBQ0QsWUFBSSxVQUFVLEtBQUssTUFBSyxXQUFXLEVBQUU7QUFDbkMsZ0JBQU0sSUFBSSxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FBQztTQUNsRTtBQUNELFVBQUUsYUFBYSxDQUFDO0FBQ2hCLFlBQU0sS0FBSyxHQUFHLE1BQUssU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLGFBQUssR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUEsR0FBSSxNQUFLLFNBQVMsQ0FBQztBQUNyQyxlQUFPLEVBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUwsS0FBSyxFQUFDLENBQUM7T0FDN0IsQ0FBQzs7QUFFRixhQUFPLEVBQUMsSUFBSSxFQUFKLElBQUksRUFBQyxDQUFDO0tBQ2Y7OztTQXZDVyxlQUFXO0FBQ3JCLGFBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztLQUN2Qjs7O1NBdENrQixjQUFjOzs7cUJBQWQsY0FBYyIsImZpbGUiOiJDaXJjdWxhckJ1ZmZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIENpcmN1bGFyQnVmZmVyPFQ+IHtcbiAgLyoqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBlbGVtZW50cyB0aGlzIENpcmN1bGFyQnVmZmVyIGNhbiBob2xkLiAqL1xuICBfY2FwYWNpdHk6IG51bWJlcjtcbiAgX2VsZW1lbnRzOiBBcnJheTxUPjtcbiAgX25leHRJbnNlcnRJbmRleDogbnVtYmVyO1xuXG4gIC8qKiBXaGV0aGVyIHRoaXMgQ2lyY3VsYXJCdWZmZXIgaGFzIHJlYWNoZWQgaXRzIGNhcGFjaXR5LiAqL1xuICBfaXNGdWxsOiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIHRoZSBzdGF0ZSBvZiB0aGUgQ2lyY3VsYXJCdWZmZXIgd2hlbiBhbiBJdGVyYXRvciBmb3IgaXQgaXMgY3JlYXRlZC4gSWYgdGhlXG4gICAqIHN0YXRlIG9mIHRoZSBDaXJjdWxhckJ1ZmZlciBjaGFuZ2VzIHdoaWxlIGl0IGlzIGJlaW5nIGl0ZXJhdGVkLCBpdCB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbi5cbiAgICovXG4gIF9nZW5lcmF0aW9uOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBjYXBhY2l0eSBpcyB0aGUgbWF4aW11bSBudW1iZXIgb2YgZWxlbWVudHMgdGhpcyBDaXJjdWxhckJ1ZmZlciBjYW4gaG9sZC4gSXQgbXVzdCBiZSBhblxuICAgKiAgIGludGVnZXIgZ3JlYXRlciB0aGFuIHplcm8uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihjYXBhY2l0eTogbnVtYmVyKSB7XG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGNhcGFjaXR5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBjYXBhY2l0eSBtdXN0IGJlIGFuIGludGVnZXIsIGJ1dCB3YXMgJHtjYXBhY2l0eX0uYCk7XG4gICAgfVxuICAgIGlmIChjYXBhY2l0eSA8PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGNhcGFjaXR5IG11c3QgYmUgZ3JlYXRlciB0aGFuIHplcm8sIGJ1dCB3YXMgJHtjYXBhY2l0eX0uYCk7XG4gICAgfVxuICAgIHRoaXMuX2NhcGFjaXR5ID0gY2FwYWNpdHk7XG4gICAgdGhpcy5fZWxlbWVudHMgPSBuZXcgQXJyYXkoY2FwYWNpdHkpO1xuICAgIHRoaXMuX25leHRJbnNlcnRJbmRleCA9IDA7XG4gICAgdGhpcy5faXNGdWxsID0gZmFsc2U7XG4gICAgdGhpcy5fZ2VuZXJhdGlvbiA9IDA7XG4gIH1cblxuICAvKipcbiAgICogVGhlIG1heGltdW0gbnVtYmVyIG9mIGVsZW1lbnRzIHRoaXMgQ2lyY3VsYXJCdWZmZXIgY2FuIGhvbGQuXG4gICAqL1xuICBnZXQgY2FwYWNpdHkoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY2FwYWNpdHk7XG4gIH1cblxuICBwdXNoKGVsZW1lbnQ6IFQpOiB2b2lkIHtcbiAgICArK3RoaXMuX2dlbmVyYXRpb247XG4gICAgdGhpcy5fZWxlbWVudHNbdGhpcy5fbmV4dEluc2VydEluZGV4XSA9IGVsZW1lbnQ7XG4gICAgY29uc3QgbmV4dEluZGV4ID0gdGhpcy5fbmV4dEluc2VydEluZGV4ICsgMTtcbiAgICB0aGlzLl9uZXh0SW5zZXJ0SW5kZXggPSBuZXh0SW5kZXggJSB0aGlzLl9jYXBhY2l0eTtcbiAgICBpZiAodGhpcy5fbmV4dEluc2VydEluZGV4ID09PSAwICYmICF0aGlzLl9pc0Z1bGwpIHtcbiAgICAgIHRoaXMuX2lzRnVsbCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gYW4gYEl0ZXJhdG9yYCB0aGF0IGl0ZXJhdGVzIHRocm91Z2ggdGhlIGxhc3QgTiBlbGVtZW50cyBhZGRlZCB0byB0aGUgYnVmZmVyIHdoZXJlIE5cbiAgICogICBpcyA8PSBgY2FwYWN0eWAuIElmIHRoZSBidWZmZXIgaXMgbW9kaWZpZWQgd2hpbGUgaXQgaXMgYmVpbmcgaXRlcmF0ZWQsIGFuIEVycm9yIHdpbGwgYmVcbiAgICogICB0aHJvd24uXG4gICAqL1xuICAvLyAkRmxvd0lzc3VlOiB0NjE4NzA1MFxuICBbU3ltYm9sLml0ZXJhdG9yXSgpOiBJdGVyYXRvcjxUPiB7XG4gICAgY29uc3QgZ2VuZXJhdGlvbiA9IHRoaXMuX2dlbmVyYXRpb247XG4gICAgbGV0IGluZGV4ID0gdGhpcy5faXNGdWxsID8gdGhpcy5fbmV4dEluc2VydEluZGV4IDogMDtcbiAgICBsZXQgbnVtSXRlcmF0aW9ucyA9IHRoaXMuX2lzRnVsbCA/IHRoaXMuX2NhcGFjaXR5IDogdGhpcy5fbmV4dEluc2VydEluZGV4O1xuXG4gICAgY29uc3QgbmV4dCA9ICgpOiB7ZG9uZTogYm9vbGVhbiwgdmFsdWU6ID9UfSA9PiB7XG4gICAgICBpZiAobnVtSXRlcmF0aW9ucyA9PT0gMCkge1xuICAgICAgICByZXR1cm4ge2RvbmU6IHRydWUsIHZhbHVlOiB1bmRlZmluZWR9O1xuICAgICAgfVxuICAgICAgaWYgKGdlbmVyYXRpb24gIT09IHRoaXMuX2dlbmVyYXRpb24pIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDaXJjdWxhckJ1ZmZlciB3YXMgbW9kaWZpZWQgZHVyaW5nIGl0ZXJhdGlvbi4nKTtcbiAgICAgIH1cbiAgICAgIC0tbnVtSXRlcmF0aW9ucztcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5fZWxlbWVudHNbaW5kZXhdO1xuICAgICAgaW5kZXggPSAoaW5kZXggKyAxKSAlIHRoaXMuX2NhcGFjaXR5O1xuICAgICAgcmV0dXJuIHtkb25lOiBmYWxzZSwgdmFsdWV9O1xuICAgIH07XG5cbiAgICByZXR1cm4ge25leHR9O1xuICB9XG59XG4iXX0=