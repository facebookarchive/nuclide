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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _QueryItem = require('./QueryItem');

var _QueryItem2 = _interopRequireDefault(_QueryItem);

var _TopScores = require('./TopScores');

var _TopScores2 = _interopRequireDefault(_TopScores);

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

      var topScores = new _TopScores2['default'](options.maxResults || 0);
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
        _this._queryItems.set(candidate, new _QueryItem2['default'](candidate));
      });
    }
  }, {
    key: 'removeCandidates',
    value: function removeCandidates(candidates) {
      var _this2 = this;

      candidates.forEach(function (candidate) {
        _this2._queryItems['delete'](candidate);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZhbGxiYWNrTWF0Y2hlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBZ0JzQixhQUFhOzs7O3lCQUNiLGFBQWE7Ozs7Ozs7OztJQU10QixPQUFPO0FBR1AsV0FIQSxPQUFPLENBR04sVUFBeUIsRUFBRTswQkFINUIsT0FBTzs7QUFJaEIsUUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztHQUNoQzs7Ozs7O2VBTFUsT0FBTzs7V0FVYixlQUFDLEtBQWEsRUFBb0Q7VUFBbEQsT0FBdUIseURBQUcsRUFBRTs7QUFDL0MsVUFBTSxTQUFTLEdBQUcsMkJBQWMsT0FBTyxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN6RCxVQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUMvQixZQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLFlBQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixtQkFBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUN6QjtPQUNGLENBQUMsQ0FBQztBQUNILGFBQU8sU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDO0tBQ2pDOzs7V0FFWSx1QkFBQyxVQUF5QixFQUFROzs7QUFDN0MsZ0JBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxTQUFTLEVBQUk7QUFDOUIsY0FBSyxXQUFXLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSwyQkFBYyxTQUFTLENBQUMsQ0FBQyxDQUFDO09BQzNELENBQUMsQ0FBQztLQUNKOzs7V0FFZSwwQkFBQyxVQUF5QixFQUFROzs7QUFDaEQsZ0JBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxTQUFTLEVBQUk7QUFDOUIsZUFBSyxXQUFXLFVBQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUNwQyxDQUFDLENBQUM7S0FDSjs7O1dBRVksdUJBQUMsVUFBeUIsRUFBUTtBQUM3QyxVQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDN0IsVUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztLQUNoQzs7O1NBcENVLE9BQU8iLCJmaWxlIjoiRmFsbGJhY2tNYXRjaGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1xuICBNYXRjaGVyT3B0aW9ucyxcbiAgTWF0Y2hSZXN1bHQsXG59IGZyb20gJy4uL1ZlbmRvckxpYi9mdXp6eS1uYXRpdmUnO1xuXG5pbXBvcnQgUXVlcnlJdGVtIGZyb20gJy4vUXVlcnlJdGVtJztcbmltcG9ydCBUb3BTY29yZXMgZnJvbSAnLi9Ub3BTY29yZXMnO1xuXG4vKipcbiAqIEZhbGxiYWNrIGBNYXRjaGVyYCBjbGFzcyBjb21wYXRpYmxlIHdpdGggdGhlIGZ1enp5LW5hdGl2ZSBpbXBsZW1lbnRhdGlvbi5cbiAqIE5vdGUgdGhhdCB0aGUgc2NvcmVzIGFyZSBkaWZmZXJlbnQ6IDAgcmVwcmVzZW50cyB0aGUgYmVzdCBtYXRjaCB3aGlsZSBsYXJnZXIgbnVtYmVycyBhcmUgd29yc2UuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXRjaGVyIHtcbiAgX3F1ZXJ5SXRlbXM6IE1hcDxzdHJpbmcsIFF1ZXJ5SXRlbT47XG5cbiAgY29uc3RydWN0b3IoY2FuZGlkYXRlczogQXJyYXk8c3RyaW5nPikge1xuICAgIHRoaXMuc2V0Q2FuZGlkYXRlcyhjYW5kaWRhdGVzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RlOiBjYXNlU2Vuc2l0aXZlLCBudW1UaHJlYWRzLCBhbmQgcmVjb3JkTWF0Y2hJbmRleGVzIHdpbGwgYmUgaWdub3JlZC5cbiAgICovXG4gIG1hdGNoKHF1ZXJ5OiBzdHJpbmcsIG9wdGlvbnM6IE1hdGNoZXJPcHRpb25zID0ge30pOiBBcnJheTxNYXRjaFJlc3VsdD4ge1xuICAgIGNvbnN0IHRvcFNjb3JlcyA9IG5ldyBUb3BTY29yZXMob3B0aW9ucy5tYXhSZXN1bHRzIHx8IDApO1xuICAgIHRoaXMuX3F1ZXJ5SXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGNvbnN0IHNjb3JlID0gaXRlbS5zY29yZShxdWVyeSk7XG4gICAgICBpZiAoc2NvcmUgIT0gbnVsbCkge1xuICAgICAgICB0b3BTY29yZXMuaW5zZXJ0KHNjb3JlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gdG9wU2NvcmVzLmdldFRvcFNjb3JlcygpO1xuICB9XG5cbiAgYWRkQ2FuZGlkYXRlcyhjYW5kaWRhdGVzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgY2FuZGlkYXRlcy5mb3JFYWNoKGNhbmRpZGF0ZSA9PiB7XG4gICAgICB0aGlzLl9xdWVyeUl0ZW1zLnNldChjYW5kaWRhdGUsIG5ldyBRdWVyeUl0ZW0oY2FuZGlkYXRlKSk7XG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVDYW5kaWRhdGVzKGNhbmRpZGF0ZXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICBjYW5kaWRhdGVzLmZvckVhY2goY2FuZGlkYXRlID0+IHtcbiAgICAgIHRoaXMuX3F1ZXJ5SXRlbXMuZGVsZXRlKGNhbmRpZGF0ZSk7XG4gICAgfSk7XG4gIH1cblxuICBzZXRDYW5kaWRhdGVzKGNhbmRpZGF0ZXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICB0aGlzLl9xdWVyeUl0ZW1zID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuYWRkQ2FuZGlkYXRlcyhjYW5kaWRhdGVzKTtcbiAgfVxufVxuIl19