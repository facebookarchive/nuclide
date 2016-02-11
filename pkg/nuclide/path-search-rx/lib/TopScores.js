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

var _heap = require('heap');

var _heap2 = _interopRequireDefault(_heap);

var _utils = require('./utils');

/**
 * This data structure is designed to hold the top K scores from a collection of
 * N scores where scores become available one at a time. The expectation is that
 * N will be much, much greater than K.
 *
 * insert() is O(lg K)
 * getTopScores() is O(K lg K)
 *
 * Therefore, finding the top K scores from a collection of N elements should be
 * O(N lg K).
 */

var TopScores = (function () {
  function TopScores(capacity) {
    _classCallCheck(this, TopScores);

    this._capacity = capacity;
    this._full = false;
    this._heap = new _heap2['default'](_utils.inverseScoreComparator);
    this._min = null;
  }

  _createClass(TopScores, [{
    key: 'insert',
    value: function insert(score) {
      if (this._full && this._min) {
        var cmp = (0, _utils.scoreComparator)(score, this._min);
        if (cmp < 0) {
          this._doInsert(score);
        }
      } else {
        this._doInsert(score);
      }
    }
  }, {
    key: '_doInsert',
    value: function _doInsert(score) {
      if (this._full) {
        this._heap.replace(score);
      } else {
        this._heap.insert(score);
        this._full = this._heap.size() === this._capacity;
      }
      this._min = this._heap.peek();
    }
  }, {
    key: 'getSize',
    value: function getSize() {
      return this._heap.size();
    }

    /**
     * @return an Array where Scores will be sorted in ascending order.
     */
  }, {
    key: 'getTopScores',
    value: function getTopScores() {
      var array = this._heap.toArray();
      array.sort(_utils.scoreComparator);
      return array;
    }
  }]);

  return TopScores;
})();

exports['default'] = TopScores;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlRvcFNjb3Jlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBV2lCLE1BQU07Ozs7cUJBTWhCLFNBQVM7Ozs7Ozs7Ozs7Ozs7O0lBYUssU0FBUztBQU1qQixXQU5RLFNBQVMsQ0FNaEIsUUFBZ0IsRUFBRTswQkFOWCxTQUFTOztBQU8xQixRQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztBQUMxQixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixRQUFJLENBQUMsS0FBSyxHQUFHLG9EQUFnQyxDQUFDO0FBQzlDLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0dBQ2xCOztlQVhrQixTQUFTOztXQWF0QixnQkFBQyxLQUFpQixFQUFFO0FBQ3hCLFVBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQzNCLFlBQU0sR0FBRyxHQUFHLDRCQUFnQixLQUFLLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzlDLFlBQUksR0FBRyxHQUFHLENBQUMsRUFBRTtBQUNYLGNBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdkI7T0FDRixNQUFNO0FBQ0wsWUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUN2QjtLQUNGOzs7V0FFUSxtQkFBQyxLQUFpQixFQUFFO0FBQzNCLFVBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNkLFlBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQzNCLE1BQU07QUFDTCxZQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN6QixZQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQztPQUNuRDtBQUNELFVBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUMvQjs7O1dBRU0sbUJBQVc7QUFDaEIsYUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQzFCOzs7Ozs7O1dBS1csd0JBQXNCO0FBQ2hDLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbkMsV0FBSyxDQUFDLElBQUksd0JBQWlCLENBQUM7QUFDNUIsYUFBTyxLQUFLLENBQUM7S0FDZDs7O1NBN0NrQixTQUFTOzs7cUJBQVQsU0FBUyIsImZpbGUiOiJUb3BTY29yZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgSGVhcCBmcm9tICdoZWFwJztcblxuaW1wb3J0IHR5cGUge1F1ZXJ5U2NvcmV9IGZyb20gJy4vUXVlcnlTY29yZSc7XG5pbXBvcnQge1xuICBzY29yZUNvbXBhcmF0b3IsXG4gIGludmVyc2VTY29yZUNvbXBhcmF0b3IsXG59IGZyb20gJy4vdXRpbHMnO1xuXG4vKipcbiAqIFRoaXMgZGF0YSBzdHJ1Y3R1cmUgaXMgZGVzaWduZWQgdG8gaG9sZCB0aGUgdG9wIEsgc2NvcmVzIGZyb20gYSBjb2xsZWN0aW9uIG9mXG4gKiBOIHNjb3JlcyB3aGVyZSBzY29yZXMgYmVjb21lIGF2YWlsYWJsZSBvbmUgYXQgYSB0aW1lLiBUaGUgZXhwZWN0YXRpb24gaXMgdGhhdFxuICogTiB3aWxsIGJlIG11Y2gsIG11Y2ggZ3JlYXRlciB0aGFuIEsuXG4gKlxuICogaW5zZXJ0KCkgaXMgTyhsZyBLKVxuICogZ2V0VG9wU2NvcmVzKCkgaXMgTyhLIGxnIEspXG4gKlxuICogVGhlcmVmb3JlLCBmaW5kaW5nIHRoZSB0b3AgSyBzY29yZXMgZnJvbSBhIGNvbGxlY3Rpb24gb2YgTiBlbGVtZW50cyBzaG91bGQgYmVcbiAqIE8oTiBsZyBLKS5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVG9wU2NvcmVzIHtcbiAgX2NhcGFjaXR5OiBudW1iZXI7XG4gIF9mdWxsOiBib29sZWFuO1xuICBfaGVhcDogSGVhcDtcbiAgX21pbjogP1F1ZXJ5U2NvcmU7XG5cbiAgY29uc3RydWN0b3IoY2FwYWNpdHk6IG51bWJlcikge1xuICAgIHRoaXMuX2NhcGFjaXR5ID0gY2FwYWNpdHk7XG4gICAgdGhpcy5fZnVsbCA9IGZhbHNlO1xuICAgIHRoaXMuX2hlYXAgPSBuZXcgSGVhcChpbnZlcnNlU2NvcmVDb21wYXJhdG9yKTtcbiAgICB0aGlzLl9taW4gPSBudWxsO1xuICB9XG5cbiAgaW5zZXJ0KHNjb3JlOiBRdWVyeVNjb3JlKSB7XG4gICAgaWYgKHRoaXMuX2Z1bGwgJiYgdGhpcy5fbWluKSB7XG4gICAgICBjb25zdCBjbXAgPSBzY29yZUNvbXBhcmF0b3Ioc2NvcmUsIHRoaXMuX21pbik7XG4gICAgICBpZiAoY21wIDwgMCkge1xuICAgICAgICB0aGlzLl9kb0luc2VydChzY29yZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RvSW5zZXJ0KHNjb3JlKTtcbiAgICB9XG4gIH1cblxuICBfZG9JbnNlcnQoc2NvcmU6IFF1ZXJ5U2NvcmUpIHtcbiAgICBpZiAodGhpcy5fZnVsbCkge1xuICAgICAgdGhpcy5faGVhcC5yZXBsYWNlKHNjb3JlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faGVhcC5pbnNlcnQoc2NvcmUpO1xuICAgICAgdGhpcy5fZnVsbCA9IHRoaXMuX2hlYXAuc2l6ZSgpID09PSB0aGlzLl9jYXBhY2l0eTtcbiAgICB9XG4gICAgdGhpcy5fbWluID0gdGhpcy5faGVhcC5wZWVrKCk7XG4gIH1cblxuICBnZXRTaXplKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX2hlYXAuc2l6ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gYW4gQXJyYXkgd2hlcmUgU2NvcmVzIHdpbGwgYmUgc29ydGVkIGluIGFzY2VuZGluZyBvcmRlci5cbiAgICovXG4gIGdldFRvcFNjb3JlcygpOiBBcnJheTxRdWVyeVNjb3JlPiB7XG4gICAgY29uc3QgYXJyYXkgPSB0aGlzLl9oZWFwLnRvQXJyYXkoKTtcbiAgICBhcnJheS5zb3J0KHNjb3JlQ29tcGFyYXRvcik7XG4gICAgcmV0dXJuIGFycmF5O1xuICB9XG59XG4iXX0=