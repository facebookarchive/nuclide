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

var _nuclideCommons = require('../../nuclide-commons');

var REPORTING_PERIOD = 1000;

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
      this._track(events);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuYWx5dGljc0JhdGNoZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs4QkFha0MsdUJBQXVCOztBQUV6RCxJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQzs7SUFJakIsZ0JBQWdCO0FBSWhCLFdBSkEsZ0JBQWdCLENBSWYsS0FBb0IsRUFBRTs7OzBCQUp2QixnQkFBZ0I7O0FBS3pCLFFBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFFBQUksQ0FBQyxNQUFNLEdBQUcsd0NBQ1osZ0JBQWdCLEVBQ2hCLFVBQUEsTUFBTSxFQUFJO0FBQ1IsWUFBSyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDM0IsQ0FBQyxDQUFDO0dBQ047O2VBWFUsZ0JBQWdCOztXQWFmLHNCQUFDLE1BQXlCLEVBQVE7QUFDNUMsVUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNyQjs7O1dBRUksZUFBQyxHQUFXLEVBQUUsTUFBOEIsRUFBUTtBQUN2RCxVQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFDLEdBQUcsRUFBSCxHQUFHLEVBQUUsTUFBTSxFQUFOLE1BQU0sRUFBQyxDQUFDLENBQUM7S0FDaEM7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUN2Qjs7O1NBdkJVLGdCQUFnQiIsImZpbGUiOiJBbmFseXRpY3NCYXRjaGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1RyYWNrRXZlbnR9IGZyb20gJy4vdHJhY2snO1xuXG5pbXBvcnQge0JhdGNoUHJvY2Vzc2VkUXVldWV9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5cbmNvbnN0IFJFUE9SVElOR19QRVJJT0QgPSAxMDAwO1xuXG50eXBlIFRyYWNrQ2FsbGJhY2sgPSAoZXZlbnRzOiBBcnJheTxUcmFja0V2ZW50PikgPT4gUHJvbWlzZTx2b2lkPjtcblxuZXhwb3J0IGNsYXNzIEFuYWx5dGljc0JhdGNoZXIge1xuICBfcXVldWU6IEJhdGNoUHJvY2Vzc2VkUXVldWU8VHJhY2tFdmVudD47XG4gIF90cmFjazogVHJhY2tDYWxsYmFjaztcblxuICBjb25zdHJ1Y3Rvcih0cmFjazogVHJhY2tDYWxsYmFjaykge1xuICAgIHRoaXMuX3RyYWNrID0gdHJhY2s7XG4gICAgdGhpcy5fcXVldWUgPSBuZXcgQmF0Y2hQcm9jZXNzZWRRdWV1ZShcbiAgICAgIFJFUE9SVElOR19QRVJJT0QsXG4gICAgICBldmVudHMgPT4ge1xuICAgICAgICB0aGlzLl9oYW5kbGVCYXRjaChldmVudHMpO1xuICAgICAgfSk7XG4gIH1cblxuICBfaGFuZGxlQmF0Y2goZXZlbnRzOiBBcnJheTxUcmFja0V2ZW50Pik6IHZvaWQge1xuICAgIHRoaXMuX3RyYWNrKGV2ZW50cyk7XG4gIH1cblxuICB0cmFjayhrZXk6IHN0cmluZywgdmFsdWVzOiB7W2tleTogc3RyaW5nXTogbWl4ZWR9KTogdm9pZCB7XG4gICAgdGhpcy5fcXVldWUuYWRkKHtrZXksIHZhbHVlc30pO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9xdWV1ZS5kaXNwb3NlKCk7XG4gIH1cbn1cbiJdfQ==