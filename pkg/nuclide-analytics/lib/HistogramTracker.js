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

var _track = require('./track');

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
        if (bucket.getCount() > 0 && _track.track != null) {
          (0, _track.track)(HISTOGRAM_TRACKER_KEY, {
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
//# sourceMappingURL=data:application/json;base64,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QUFFO0FBQzVCLG1CQUFPLEVBQUUsTUFBTSxDQUFDLFFBQVEsRUFBRTtXQUMzQixDQUFDLENBQUM7U0FDSjtPQUNGO0FBQ0QsVUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ2Q7OztXQUVJLGlCQUFTO0FBQ1osV0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzdDLFlBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDMUI7S0FDRjs7O1NBdkRVLGdCQUFnQiIsImZpbGUiOiJIaXN0b2dyYW1UcmFja2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHt0cmFja30gZnJvbSAnLi90cmFjayc7XG5cbmNvbnN0IEhJU1RPR1JBTV9UUkFDS0VSX0tFWSA9ICdwZXJmb3JtYW5jZS1oaXN0b2dyYW0nO1xuXG5jbGFzcyBCdWNrZXQge1xuICBfY291bnQ6IG51bWJlcjtcbiAgX3N1bTogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2NvdW50ID0gMDtcbiAgICB0aGlzLl9zdW0gPSAwO1xuICB9XG5cbiAgYWRkVmFsdWUodmFsdWU6IG51bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX3N1bSArPSB2YWx1ZTtcbiAgICB0aGlzLl9jb3VudCsrO1xuICB9XG5cbiAgZ2V0Q291bnQoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5fY291bnQ7XG4gIH1cblxuICBnZXRBdmVyYWdlKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2NvdW50ID4gMCA/IHRoaXMuX3N1bSAvIHRoaXMuX2NvdW50IDogMDtcbiAgfVxuXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMuX2NvdW50ID0gMDtcbiAgICB0aGlzLl9zdW0gPSAwO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBIaXN0b2dyYW1UcmFja2VyIHtcbiAgX2V2ZW50TmFtZTogc3RyaW5nO1xuICBfbWF4VmFsdWU6IG51bWJlcjtcbiAgX2J1Y2tldFNpemU6IG51bWJlcjtcbiAgX2J1Y2tldHM6IEFycmF5PEJ1Y2tldD47XG4gIF9pbnRlcnZhbElkOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgZXZlbnROYW1lOiBzdHJpbmcsXG4gICAgbWF4VmFsdWU6IG51bWJlcixcbiAgICBudW1CdWNrZXRzOiBudW1iZXIsXG4gICAgaW50ZXJ2YWxTZWNvbmRzOiBudW1iZXIgPSA2MCxcbiAgKSB7XG4gICAgdGhpcy5fZXZlbnROYW1lID0gZXZlbnROYW1lO1xuICAgIHRoaXMuX21heFZhbHVlID0gbWF4VmFsdWU7XG4gICAgdGhpcy5fYnVja2V0U2l6ZSA9IG1heFZhbHVlIC8gbnVtQnVja2V0cztcbiAgICB0aGlzLl9idWNrZXRzID0gbmV3IEFycmF5KG51bUJ1Y2tldHMpO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtQnVja2V0czsgaSsrKSB7XG4gICAgICB0aGlzLl9idWNrZXRzW2ldID0gbmV3IEJ1Y2tldCgpO1xuICAgIH1cblxuICAgIHRoaXMuX2ludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAvLyBQb3RlbnRpYWwgcmFjZSBjb25kaXRpb24gaWYgaW50ZXJ2YWxTZWNvbmRzIGlzIHRvbyBzbWFsbC5cbiAgICAgIHRoaXMuc2F2ZUFuYWx5dGljcygpO1xuICAgIH0sIGludGVydmFsU2Vjb25kcyAqIDEwMDApO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICBjbGVhckludGVydmFsKHRoaXMuX2ludGVydmFsSWQpO1xuICB9XG5cbiAgdHJhY2sodmFsdWU6IG51bWJlcik6IEhpc3RvZ3JhbVRyYWNrZXIge1xuICAgIGNvbnN0IGJ1Y2tldCA9IE1hdGgubWluKHRoaXMuX2J1Y2tldHMubGVuZ3RoIC0gMSwgTWF0aC5mbG9vcih2YWx1ZSAvIHRoaXMuX2J1Y2tldFNpemUpKTtcbiAgICB0aGlzLl9idWNrZXRzW2J1Y2tldF0uYWRkVmFsdWUodmFsdWUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgc2F2ZUFuYWx5dGljcygpOiB2b2lkIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX2J1Y2tldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IGJ1Y2tldCA9IHRoaXMuX2J1Y2tldHNbaV07XG4gICAgICBpZiAoYnVja2V0LmdldENvdW50KCkgPiAwICYmIHRyYWNrICE9IG51bGwpIHtcbiAgICAgICAgdHJhY2soSElTVE9HUkFNX1RSQUNLRVJfS0VZLCB7XG4gICAgICAgICAgZXZlbnROYW1lOiB0aGlzLl9ldmVudE5hbWUsXG4gICAgICAgICAgYXZlcmFnZTogYnVja2V0LmdldEF2ZXJhZ2UoKSxcbiAgICAgICAgICBzYW1wbGVzOiBidWNrZXQuZ2V0Q291bnQoKSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuY2xlYXIoKTtcbiAgfVxuXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5fYnVja2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgdGhpcy5fYnVja2V0c1tpXS5jbGVhcigpO1xuICAgIH1cbiAgfVxufVxuIl19