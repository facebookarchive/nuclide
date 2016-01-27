Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

// A Queue which will process elements at intervals, only if the
// queue contains any elements.

var BatchProcessedQueue = (function () {
  function BatchProcessedQueue(batchPeriod, handler) {
    _classCallCheck(this, BatchProcessedQueue);

    this._batchPeriod = batchPeriod;
    this._handler = handler;
    this._timeoutId = null;
    this._items = [];
  }

  _createClass(BatchProcessedQueue, [{
    key: 'add',
    value: function add(item) {
      var _this = this;

      this._items.push(item);
      if (this._timeoutId === null) {
        this._timeoutId = setTimeout(function () {
          _this._handleBatch();
        }, this._batchPeriod);
      }
    }
  }, {
    key: '_handleBatch',
    value: function _handleBatch() {
      this._timeoutId = null;
      var batch = this._items;
      this._items = [];
      this._handler(batch);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._timeoutId !== null) {
        clearTimeout(this._timeoutId);
        this._handleBatch();
      }
    }
  }]);

  return BatchProcessedQueue;
})();

exports.BatchProcessedQueue = BatchProcessedQueue;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkJhdGNoUHJvY2Vzc2VkUXVldWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQWVhLG1CQUFtQjtBQU1uQixXQU5BLG1CQUFtQixDQU1sQixXQUFtQixFQUFFLE9BQXdCLEVBQUU7MEJBTmhELG1CQUFtQjs7QUFPNUIsUUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7QUFDaEMsUUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7QUFDeEIsUUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7QUFDdkIsUUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7R0FDbEI7O2VBWFUsbUJBQW1COztXQWEzQixhQUFDLElBQU8sRUFBUTs7O0FBQ2pCLFVBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZCLFVBQUksSUFBSSxDQUFDLFVBQVUsS0FBSyxJQUFJLEVBQUU7QUFDNUIsWUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsWUFBTTtBQUNqQyxnQkFBSyxZQUFZLEVBQUUsQ0FBQztTQUNyQixFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztPQUN2QjtLQUNGOzs7V0FFVyx3QkFBRztBQUNiLFVBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO0FBQ3ZCLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDMUIsVUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDakIsVUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN0Qjs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLElBQUksQ0FBQyxVQUFVLEtBQUssSUFBSSxFQUFFO0FBQzVCLG9CQUFZLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzlCLFlBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztPQUNyQjtLQUNGOzs7U0FsQ1UsbUJBQW1CIiwiZmlsZSI6IkJhdGNoUHJvY2Vzc2VkUXVldWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5leHBvcnQgdHlwZSBCYXRjaEhhbmRsZXI8VD4gPSAoYmF0Y2g6IEFycmF5PFQ+KSA9PiB2b2lkO1xuXG4vLyBBIFF1ZXVlIHdoaWNoIHdpbGwgcHJvY2VzcyBlbGVtZW50cyBhdCBpbnRlcnZhbHMsIG9ubHkgaWYgdGhlXG4vLyBxdWV1ZSBjb250YWlucyBhbnkgZWxlbWVudHMuXG5leHBvcnQgY2xhc3MgQmF0Y2hQcm9jZXNzZWRRdWV1ZTxUPiB7XG4gIF9iYXRjaFBlcmlvZDogbnVtYmVyO1xuICBfaGFuZGxlcjogQmF0Y2hIYW5kbGVyPFQ+O1xuICBfdGltZW91dElkOiA/bnVtYmVyO1xuICBfaXRlbXM6IEFycmF5PFQ+O1xuXG4gIGNvbnN0cnVjdG9yKGJhdGNoUGVyaW9kOiBudW1iZXIsIGhhbmRsZXI6IEJhdGNoSGFuZGxlcjxUPikge1xuICAgIHRoaXMuX2JhdGNoUGVyaW9kID0gYmF0Y2hQZXJpb2Q7XG4gICAgdGhpcy5faGFuZGxlciA9IGhhbmRsZXI7XG4gICAgdGhpcy5fdGltZW91dElkID0gbnVsbDtcbiAgICB0aGlzLl9pdGVtcyA9IFtdO1xuICB9XG5cbiAgYWRkKGl0ZW06IFQpOiB2b2lkIHtcbiAgICB0aGlzLl9pdGVtcy5wdXNoKGl0ZW0pO1xuICAgIGlmICh0aGlzLl90aW1lb3V0SWQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3RpbWVvdXRJZCA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLl9oYW5kbGVCYXRjaCgpO1xuICAgICAgfSwgdGhpcy5fYmF0Y2hQZXJpb2QpO1xuICAgIH1cbiAgfVxuXG4gIF9oYW5kbGVCYXRjaCgpIHtcbiAgICB0aGlzLl90aW1lb3V0SWQgPSBudWxsO1xuICAgIGNvbnN0IGJhdGNoID0gdGhpcy5faXRlbXM7XG4gICAgdGhpcy5faXRlbXMgPSBbXTtcbiAgICB0aGlzLl9oYW5kbGVyKGJhdGNoKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3RpbWVvdXRJZCAhPT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVvdXRJZCk7XG4gICAgICB0aGlzLl9oYW5kbGVCYXRjaCgpO1xuICAgIH1cbiAgfVxufVxuIl19