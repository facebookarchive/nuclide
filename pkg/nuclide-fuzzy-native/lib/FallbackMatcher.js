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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _QueryItem2;

function _QueryItem() {
  return _QueryItem2 = _interopRequireDefault(require('./QueryItem'));
}

var _TopScores2;

function _TopScores() {
  return _TopScores2 = _interopRequireDefault(require('./TopScores'));
}

/**
 * Fallback `Matcher` class compatible with the fuzzy-native implementation.
 * Note that the scores are different: 0 represents the best match while larger numbers are worse.
 */

var Matcher = (function () {
  function Matcher(candidates) {
    _classCallCheck(this, Matcher);

    this.setCandidates(candidates);
  }

  /**
   * Note: caseSensitive, numThreads, and recordMatchIndexes will be ignored.
   */

  _createClass(Matcher, [{
    key: 'match',
    value: function match(query) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var topScores = new (_TopScores2 || _TopScores()).default(options.maxResults || 0);
      this._queryItems.forEach(function (item) {
        var score = item.score(query);
        if (score != null) {
          topScores.insert(score);
        }
      });
      return topScores.getTopScores();
    }
  }, {
    key: 'addCandidates',
    value: function addCandidates(candidates) {
      var _this = this;

      candidates.forEach(function (candidate) {
        _this._queryItems.set(candidate, new (_QueryItem2 || _QueryItem()).default(candidate));
      });
    }
  }, {
    key: 'removeCandidates',
    value: function removeCandidates(candidates) {
      var _this2 = this;

      candidates.forEach(function (candidate) {
        _this2._queryItems.delete(candidate);
      });
    }
  }, {
    key: 'setCandidates',
    value: function setCandidates(candidates) {
      this._queryItems = new Map();
      this.addCandidates(candidates);
    }
  }]);

  return Matcher;
})();

exports.Matcher = Matcher;