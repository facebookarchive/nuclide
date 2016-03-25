Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideCommons = require('../../nuclide-commons');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var BATCH_EVENT = 'batch';

var REPORTING_PERIOD = 1000;

// Features:
//  Immediate reporting of first time failure.
//  Periodic reporting of successes and subsequent failures.

var AnalyticsBatcher = (function () {
  function AnalyticsBatcher(track) {
    var _this = this;

    _classCallCheck(this, AnalyticsBatcher);

    this._track = track;
    this._queue = new _nuclideCommons.BatchProcessedQueue(REPORTING_PERIOD, function (events) {
      _this._handleBatch(events);
    });
  }

  _createClass(AnalyticsBatcher, [{
    key: '_handleBatch',
    value: function _handleBatch(events) {
      this._track(BATCH_EVENT, { events: JSON.stringify(events) });
    }
  }, {
    key: 'track',
    value: function track(key, values) {
      this._queue.add({ key: key, values: values });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._queue.dispose();
    }
  }]);

  return AnalyticsBatcher;
})();

exports.AnalyticsBatcher = AnalyticsBatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuYWx5dGljc0JhdGNoZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OEJBYWtDLHVCQUF1Qjs7Ozs7Ozs7OztBQUZ6RCxJQUFNLFdBQVcsR0FBRyxPQUFPLENBQUM7O0FBUzVCLElBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDOzs7Ozs7SUFLakIsZ0JBQWdCO0FBSWhCLFdBSkEsZ0JBQWdCLENBSWYsS0FBNkUsRUFBRTs7OzBCQUpoRixnQkFBZ0I7O0FBS3pCLFFBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxNQUFNLEdBQUcsd0NBQ1osZ0JBQWdCLEVBQ2hCLFVBQUEsTUFBTSxFQUFJO0FBQ1IsWUFBSyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDM0IsQ0FBQyxDQUFDO0dBQ047O2VBWFUsZ0JBQWdCOztXQWFmLHNCQUFDLE1BQXlCLEVBQVE7QUFDNUMsVUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7S0FDOUQ7OztXQUVJLGVBQUMsR0FBVyxFQUFFLE1BQStCLEVBQVE7QUFDeEQsVUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBQyxHQUFHLEVBQUgsR0FBRyxFQUFFLE1BQU0sRUFBTixNQUFNLEVBQUMsQ0FBQyxDQUFDO0tBQ2hDOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdkI7OztTQXZCVSxnQkFBZ0IiLCJmaWxlIjoiQW5hbHl0aWNzQmF0Y2hlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmNvbnN0IEJBVENIX0VWRU5UID0gJ2JhdGNoJztcblxuaW1wb3J0IHtCYXRjaFByb2Nlc3NlZFF1ZXVlfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuXG50eXBlIFRyYWNrRXZlbnQgPSB7XG4gIGtleTogc3RyaW5nO1xuICB2YWx1ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xufTtcblxuY29uc3QgUkVQT1JUSU5HX1BFUklPRCA9IDEwMDA7XG5cbi8vIEZlYXR1cmVzOlxuLy8gIEltbWVkaWF0ZSByZXBvcnRpbmcgb2YgZmlyc3QgdGltZSBmYWlsdXJlLlxuLy8gIFBlcmlvZGljIHJlcG9ydGluZyBvZiBzdWNjZXNzZXMgYW5kIHN1YnNlcXVlbnQgZmFpbHVyZXMuXG5leHBvcnQgY2xhc3MgQW5hbHl0aWNzQmF0Y2hlciB7XG4gIF9xdWV1ZTogQmF0Y2hQcm9jZXNzZWRRdWV1ZTxUcmFja0V2ZW50PjtcbiAgX3RyYWNrOiAoZXZlbnROYW1lOiBzdHJpbmcsIHZhbHVlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pID0+IFByb21pc2U8bWl4ZWQ+O1xuXG4gIGNvbnN0cnVjdG9yKHRyYWNrOiAoZXZlbnROYW1lOiBzdHJpbmcsIHZhbHVlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pID0+IFByb21pc2U8bWl4ZWQ+KSB7XG4gICAgdGhpcy5fdHJhY2sgPSB0cmFjaztcbiAgICB0aGlzLl9xdWV1ZSA9IG5ldyBCYXRjaFByb2Nlc3NlZFF1ZXVlKFxuICAgICAgUkVQT1JUSU5HX1BFUklPRCxcbiAgICAgIGV2ZW50cyA9PiB7XG4gICAgICAgIHRoaXMuX2hhbmRsZUJhdGNoKGV2ZW50cyk7XG4gICAgICB9KTtcbiAgfVxuXG4gIF9oYW5kbGVCYXRjaChldmVudHM6IEFycmF5PFRyYWNrRXZlbnQ+KTogdm9pZCB7XG4gICAgdGhpcy5fdHJhY2soQkFUQ0hfRVZFTlQsIHsgZXZlbnRzOiBKU09OLnN0cmluZ2lmeShldmVudHMpIH0pO1xuICB9XG5cbiAgdHJhY2soa2V5OiBzdHJpbmcsIHZhbHVlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pOiB2b2lkIHtcbiAgICB0aGlzLl9xdWV1ZS5hZGQoe2tleSwgdmFsdWVzfSk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3F1ZXVlLmRpc3Bvc2UoKTtcbiAgfVxufVxuIl19