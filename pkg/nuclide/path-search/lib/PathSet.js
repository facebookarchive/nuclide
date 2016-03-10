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

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fuzzyNative = require('../../fuzzy-native');

var PathSet = (function () {
  function PathSet(paths) {
    _classCallCheck(this, PathSet);

    this._matcher = new _fuzzyNative.Matcher(paths);
  }

  _createClass(PathSet, [{
    key: 'addPaths',
    value: function addPaths(paths) {
      this._matcher.addCandidates(paths);
    }
  }, {
    key: 'removePaths',
    value: function removePaths(paths) {
      this._matcher.removeCandidates(paths);
    }
  }, {
    key: 'match',
    value: function match(query) {
      return this._matcher.match(query, {
        maxResults: 20,
        numThreads: _os2['default'].cpus().length,
        recordMatchIndexes: true
      });
    }
  }]);

  return PathSet;
})();

exports.PathSet = PathSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhdGhTZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQWFlLElBQUk7Ozs7MkJBQ0csb0JBQW9COztJQUU3QixPQUFPO0FBR1AsV0FIQSxPQUFPLENBR04sS0FBb0IsRUFBRTswQkFIdkIsT0FBTzs7QUFJaEIsUUFBSSxDQUFDLFFBQVEsR0FBRyx5QkFBWSxLQUFLLENBQUMsQ0FBQztHQUNwQzs7ZUFMVSxPQUFPOztXQU9WLGtCQUFDLEtBQW9CLEVBQUU7QUFDN0IsVUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDcEM7OztXQUVVLHFCQUFDLEtBQW9CLEVBQUU7QUFDaEMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN2Qzs7O1dBRUksZUFBQyxLQUFhLEVBQXNCO0FBQ3ZDLGFBQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFO0FBQ2hDLGtCQUFVLEVBQUUsRUFBRTtBQUNkLGtCQUFVLEVBQUUsZ0JBQUcsSUFBSSxFQUFFLENBQUMsTUFBTTtBQUM1QiwwQkFBa0IsRUFBRSxJQUFJO09BQ3pCLENBQUMsQ0FBQztLQUNKOzs7U0FyQlUsT0FBTyIsImZpbGUiOiJQYXRoU2V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge01hdGNoUmVzdWx0fSBmcm9tICcuLi8uLi9mdXp6eS1uYXRpdmUnO1xuXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHtNYXRjaGVyfSBmcm9tICcuLi8uLi9mdXp6eS1uYXRpdmUnO1xuXG5leHBvcnQgY2xhc3MgUGF0aFNldCB7XG4gIF9tYXRjaGVyOiBNYXRjaGVyO1xuXG4gIGNvbnN0cnVjdG9yKHBhdGhzOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgdGhpcy5fbWF0Y2hlciA9IG5ldyBNYXRjaGVyKHBhdGhzKTtcbiAgfVxuXG4gIGFkZFBhdGhzKHBhdGhzOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgdGhpcy5fbWF0Y2hlci5hZGRDYW5kaWRhdGVzKHBhdGhzKTtcbiAgfVxuXG4gIHJlbW92ZVBhdGhzKHBhdGhzOiBBcnJheTxzdHJpbmc+KSB7XG4gICAgdGhpcy5fbWF0Y2hlci5yZW1vdmVDYW5kaWRhdGVzKHBhdGhzKTtcbiAgfVxuXG4gIG1hdGNoKHF1ZXJ5OiBzdHJpbmcpOiBBcnJheTxNYXRjaFJlc3VsdD4ge1xuICAgIHJldHVybiB0aGlzLl9tYXRjaGVyLm1hdGNoKHF1ZXJ5LCB7XG4gICAgICBtYXhSZXN1bHRzOiAyMCxcbiAgICAgIG51bVRocmVhZHM6IG9zLmNwdXMoKS5sZW5ndGgsXG4gICAgICByZWNvcmRNYXRjaEluZGV4ZXM6IHRydWUsXG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==