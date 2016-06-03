Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _heap2;

function _heap() {
  return _heap2 = _interopRequireDefault(require('heap'));
}

var _utils2;

function _utils() {
  return _utils2 = require('./utils');
}

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
    this._heap = new (_heap2 || _heap()).default((_utils2 || _utils()).inverseScoreComparator);
    this._min = null;
  }

  _createClass(TopScores, [{
    key: 'insert',
    value: function insert(score) {
      if (this._full && this._min) {
        var cmp = (0, (_utils2 || _utils()).scoreComparator)(score, this._min);
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
      array.sort((_utils2 || _utils()).scoreComparator);
      return array;
    }
  }]);

  return TopScores;
})();

exports.default = TopScores;
module.exports = exports.default;