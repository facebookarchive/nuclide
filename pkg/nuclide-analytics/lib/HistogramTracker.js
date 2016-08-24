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

var _track2;

function _track() {
  return _track2 = require('./track');
}

var HISTOGRAM_TRACKER_KEY = 'performance-histogram';

var Bucket = (function () {
  function Bucket() {
    _classCallCheck(this, Bucket);

    this._count = 0;
    this._sum = 0;
  }

  _createClass(Bucket, [{
    key: 'addValue',
    value: function addValue(value) {
      this._sum += value;
      this._count++;
    }
  }, {
    key: 'getCount',
    value: function getCount() {
      return this._count;
    }
  }, {
    key: 'getAverage',
    value: function getAverage() {
      return this._count > 0 ? this._sum / this._count : 0;
    }
  }, {
    key: 'clear',
    value: function clear() {
      this._count = 0;
      this._sum = 0;
    }
  }]);

  return Bucket;
})();

var HistogramTracker = (function () {
  function HistogramTracker(eventName, maxValue, numBuckets) {
    var _this = this;

    var intervalSeconds = arguments.length <= 3 || arguments[3] === undefined ? 60 : arguments[3];

    _classCallCheck(this, HistogramTracker);

    this._eventName = eventName;
    this._maxValue = maxValue;
    this._bucketSize = maxValue / numBuckets;
    this._buckets = new Array(numBuckets);
    for (var i = 0; i < numBuckets; i++) {
      this._buckets[i] = new Bucket();
    }

    this._intervalId = setInterval(function () {
      // Potential race condition if intervalSeconds is too small.
      _this.saveAnalytics();
    }, intervalSeconds * 1000);
  }

  _createClass(HistogramTracker, [{
    key: 'dispose',
    value: function dispose() {
      clearInterval(this._intervalId);
    }
  }, {
    key: 'track',
    value: function track(value) {
      var bucket = Math.min(this._buckets.length - 1, Math.floor(value / this._bucketSize));
      this._buckets[bucket].addValue(value);
      return this;
    }
  }, {
    key: 'saveAnalytics',
    value: function saveAnalytics() {
      for (var i = 0; i < this._buckets.length; i++) {
        var bucket = this._buckets[i];
        if (bucket.getCount() > 0 && (_track2 || _track()).track != null) {
          (0, (_track2 || _track()).track)(HISTOGRAM_TRACKER_KEY, {
            eventName: this._eventName,
            average: bucket.getAverage(),
            samples: bucket.getCount()
          });
        }
      }
      this.clear();
    }
  }, {
    key: 'clear',
    value: function clear() {
      for (var i = 0; i < this._buckets.length; i++) {
        this._buckets[i].clear();
      }
    }
  }]);

  return HistogramTracker;
})();

exports.HistogramTracker = HistogramTracker;