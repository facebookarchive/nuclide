Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _commons = require('../../commons');

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
    this._queue = new _commons.BatchProcessedQueue(REPORTING_PERIOD, function (events) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFuYWx5dGljc0JhdGNoZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7dUJBYWtDLGVBQWU7Ozs7Ozs7Ozs7QUFGakQsSUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDOztBQVM1QixJQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQzs7Ozs7O0lBS2pCLGdCQUFnQjtBQUloQixXQUpBLGdCQUFnQixDQUlmLEtBQTZFLEVBQUU7OzswQkFKaEYsZ0JBQWdCOztBQUt6QixRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixRQUFJLENBQUMsTUFBTSxHQUFHLGlDQUNaLGdCQUFnQixFQUNoQixVQUFBLE1BQU0sRUFBSTtBQUNSLFlBQUssWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQzNCLENBQUMsQ0FBQztHQUNOOztlQVhVLGdCQUFnQjs7V0FhZixzQkFBQyxNQUF5QixFQUFRO0FBQzVDLFVBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0tBQzlEOzs7V0FFSSxlQUFDLEdBQVcsRUFBRSxNQUErQixFQUFRO0FBQ3hELFVBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUMsR0FBRyxFQUFILEdBQUcsRUFBRSxNQUFNLEVBQU4sTUFBTSxFQUFDLENBQUMsQ0FBQztLQUNoQzs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3ZCOzs7U0F2QlUsZ0JBQWdCIiwiZmlsZSI6IkFuYWx5dGljc0JhdGNoZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5jb25zdCBCQVRDSF9FVkVOVCA9ICdiYXRjaCc7XG5cbmltcG9ydCB7QmF0Y2hQcm9jZXNzZWRRdWV1ZX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5cbnR5cGUgVHJhY2tFdmVudCA9IHtcbiAga2V5OiBzdHJpbmc7XG4gIHZhbHVlczoge1trZXk6IHN0cmluZ106IHN0cmluZ307XG59O1xuXG5jb25zdCBSRVBPUlRJTkdfUEVSSU9EID0gMTAwMDtcblxuLy8gRmVhdHVyZXM6XG4vLyAgSW1tZWRpYXRlIHJlcG9ydGluZyBvZiBmaXJzdCB0aW1lIGZhaWx1cmUuXG4vLyAgUGVyaW9kaWMgcmVwb3J0aW5nIG9mIHN1Y2Nlc3NlcyBhbmQgc3Vic2VxdWVudCBmYWlsdXJlcy5cbmV4cG9ydCBjbGFzcyBBbmFseXRpY3NCYXRjaGVyIHtcbiAgX3F1ZXVlOiBCYXRjaFByb2Nlc3NlZFF1ZXVlPFRyYWNrRXZlbnQ+O1xuICBfdHJhY2s6IChldmVudE5hbWU6IHN0cmluZywgdmFsdWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkgPT4gUHJvbWlzZTxtaXhlZD47XG5cbiAgY29uc3RydWN0b3IodHJhY2s6IChldmVudE5hbWU6IHN0cmluZywgdmFsdWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSkgPT4gUHJvbWlzZTxtaXhlZD4pIHtcbiAgICB0aGlzLl90cmFjayA9IHRyYWNrO1xuICAgIHRoaXMuX3F1ZXVlID0gbmV3IEJhdGNoUHJvY2Vzc2VkUXVldWUoXG4gICAgICBSRVBPUlRJTkdfUEVSSU9ELFxuICAgICAgZXZlbnRzID0+IHtcbiAgICAgICAgdGhpcy5faGFuZGxlQmF0Y2goZXZlbnRzKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgX2hhbmRsZUJhdGNoKGV2ZW50czogQXJyYXk8VHJhY2tFdmVudD4pOiB2b2lkIHtcbiAgICB0aGlzLl90cmFjayhCQVRDSF9FVkVOVCwgeyBldmVudHM6IEpTT04uc3RyaW5naWZ5KGV2ZW50cykgfSk7XG4gIH1cblxuICB0cmFjayhrZXk6IHN0cmluZywgdmFsdWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSk6IHZvaWQge1xuICAgIHRoaXMuX3F1ZXVlLmFkZCh7a2V5LCB2YWx1ZXN9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgdGhpcy5fcXVldWUuZGlzcG9zZSgpO1xuICB9XG59XG4iXX0=