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

var _PathSet = require('./PathSet');

var _PathSet2 = _interopRequireDefault(_PathSet);

var _TopScores = require('./TopScores');

var _TopScores2 = _interopRequireDefault(_TopScores);

var PATH_SEARCH_TIMEOUT_MS = 60 * 1000;
var MAX_RESULTS_COUNT = 50;

/**
 * Manages multiple simultaneous queries against a PathSet. The PathSearch is
 * responsible for deciding which queries to cancel based on newer queries.
 */

var PathSearch = (function () {

  /**
   * @param pathSet that keeps itself in sync with whatever directory it
   *     represents.
   */

  function PathSearch(pathSet) {
    _classCallCheck(this, PathSearch);

    this._pathSet = pathSet;
    this._activeQueries = {};
    this._queryItemForPath = {}; // It might be more efficient to store this in PathSet.
  }

  _createClass(PathSearch, [{
    key: '_doFuzzyFilenameSearch',
    value: function _doFuzzyFilenameSearch(query, topScores) {
      var _this = this;

      var processor = function processor(path) {
        var queryItem = _this._queryItemForPath[path];
        if (!queryItem) {
          queryItem = new _QueryItem2['default'](path);
          // Currently, nothing is ever removed from _queryItemForPath. It's
          // unclear if the additional complexity in bookkeeping effort would
          // merit the memory savings.
          _this._queryItemForPath[path] = queryItem;
        }
        var alphanumericQuery = query.replace(/[^a-z0-9/]/g, '');
        var scoredItem = queryItem.score(alphanumericQuery);
        if (scoredItem != null) {
          topScores.insert(scoredItem);
        }
      };
      return this._pathSet.submit(processor);
    }

    // `query` is assumed to be a lower-case string.
  }, {
    key: '_doPathSearch',
    value: function _doPathSearch(query, topScores) {
      var _this2 = this;

      var processor = function processor(path) {
        if (topScores.getSize() < MAX_RESULTS_COUNT && path.toLowerCase().indexOf(query) !== -1) {
          topScores.insert({
            matchIndexes: [],
            score: 0,
            value: path
          });
        }
      };
      var pathSetJob = this._pathSet.submit(processor);
      var nextJob = pathSetJob.then(function () {
        if (topScores.getSize() === 0 && query.indexOf('/') !== -1) {
          return _this2._doPathSearch(query.substring(query.indexOf('/') + 1), topScores);
        }
        return pathSetJob;
      });
      // The cancelJob expando property needs to be forwarded manually.
      // This is also the reason we cannot use `await` in this logic, since it's not possible to pass
      // cancelJob to the resulting auto-boxed Promise.
      // $FlowFixMe: Remove the cancelJob expando off the promise.
      nextJob.cancelJob = pathSetJob.cancelJob;
      return nextJob;
    }

    /**
     * @param query Is expected to be what the user has typed in a path-matching
     *     typeahead UI.
     * @return Promise that resolves to an empty ResultSet if it is canceled.
     */
  }, {
    key: 'doQuery',
    value: function doQuery(query) {
      var _this3 = this;

      query = query.toLowerCase();
      if (query.length === 0) {
        return Promise.resolve({ query: '', results: [] });
      }

      // See if a request for this query is already in flight.
      var activeQuery = this._activeQueries[query];
      if (activeQuery) {
        return activeQuery;
      }

      // If any of the existing queries are a prefix of this new query, cancel
      // them. Here, we are assuming this is used to power a typeahead, so the
      // results of the old queries will no longer be of interest.
      var keysToRemove = [];
      for (var _key in this._activeQueries) {
        if (query.startsWith(_key)) {
          keysToRemove.push(_key);
        }
      }

      // Because cancelJob() will call removePromise(), which will modify
      // this._activeQueries, we cannot call cancelJob() while iterating
      // this._activeQueries in the for/in loop above because that could interfere
      // with the iteration.
      if (keysToRemove.length) {
        // $FlowFixMe: Remove the cancelJob expando off the promise.
        keysToRemove.forEach(function (key) {
          return _this3._activeQueries[key].cancelJob();
        });
      }

      var topScores = new _TopScores2['default']( /* capacity */MAX_RESULTS_COUNT);

      // If there is a slash in the query, we assume we're searching paths instead of filenames
      // and therefore we won't remove special characters, and won't use the fuzzy search logic
      var shouldSearchPaths = query.indexOf('/') !== -1;
      var promise = shouldSearchPaths ? this._doPathSearch(query, topScores) : this._doFuzzyFilenameSearch(query, topScores);

      var promiseForQuery = undefined;
      var removePromise = function removePromise() {
        var entry = _this3._activeQueries[query];
        // Remove the entry only if it has not been replaced by a more recent one.
        if (entry === promiseForQuery) {
          delete _this3._activeQueries[query];
        }
      };

      promiseForQuery = promise.then(function () {
        var results = topScores.getTopScores();
        // Do the deletion in a timeout in case the user types backspace,
        // effectively asking for the previous results again.
        setTimeout(removePromise, PATH_SEARCH_TIMEOUT_MS);
        var result = { query: query, results: results };
        return result;
      }, function (error) {
        removePromise();
        if (error.errorCode === _PathSet2['default'].ERROR_CODE_CANCELED) {
          // This request was canceled: resolve to an empty ResultSet.
          return {
            query: query,
            results: []
          };
        } else {
          throw error;
        }
      });
      // $FlowFixMe: Remove the cancelJob expando off the promise.
      promiseForQuery.cancelJob = promise.cancelJob;
      this._activeQueries[query] = promiseForQuery;
      return promiseForQuery;
    }
  }]);

  return PathSearch;
})();

exports['default'] = PathSearch;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,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ZSxFQUFFO0FBQzdCLGlCQUFPLE9BQUssY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ25DO09BQ0YsQ0FBQzs7QUFFRixxQkFBZSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUNuQyxZQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7OztBQUd6QyxrQkFBVSxDQUFDLGFBQWEsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0FBQ2xELFlBQU0sTUFBaUIsR0FBRyxFQUFDLEtBQUssRUFBTCxLQUFLLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBQyxDQUFDO0FBQzNDLGVBQU8sTUFBTSxDQUFDO09BQ2YsRUFBRSxVQUFDLEtBQUssRUFBWTtBQUNuQixxQkFBYSxFQUFFLENBQUM7QUFDaEIsWUFBSSxLQUFLLENBQUMsU0FBUyxLQUFLLHFCQUFRLG1CQUFtQixFQUFFOztBQUVuRCxpQkFBTztBQUNMLGlCQUFLLEVBQUwsS0FBSztBQUNMLG1CQUFPLEVBQUUsRUFBRTtXQUNaLENBQUM7U0FDSCxNQUFNO0FBQ0wsZ0JBQU0sS0FBSyxDQUFDO1NBQ2I7T0FDRixDQUFDLENBQUM7O0FBRUgscUJBQWUsQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQztBQUM5QyxVQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxHQUFHLGVBQWUsQ0FBQztBQUM3QyxhQUFPLGVBQWUsQ0FBQztLQUN4Qjs7O1NBMUlrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiJQYXRoU2VhcmNoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1F1ZXJ5U2NvcmV9IGZyb20gJy4vUXVlcnlTY29yZSc7XG5pbXBvcnQgUXVlcnlJdGVtIGZyb20gJy4vUXVlcnlJdGVtJztcbmltcG9ydCBQYXRoU2V0IGZyb20gJy4vUGF0aFNldCc7XG5pbXBvcnQgVG9wU2NvcmVzIGZyb20gJy4vVG9wU2NvcmVzJztcblxudHlwZSBSZXN1bHRTZXQgPSB7XG4gIHF1ZXJ5OiBzdHJpbmc7XG4gIHJlc3VsdHM6IEFycmF5PFF1ZXJ5U2NvcmU+O1xufTtcblxuY29uc3QgUEFUSF9TRUFSQ0hfVElNRU9VVF9NUyA9IDYwICogMTAwMDtcbmNvbnN0IE1BWF9SRVNVTFRTX0NPVU5UID0gNTA7XG5cbi8qKlxuICogTWFuYWdlcyBtdWx0aXBsZSBzaW11bHRhbmVvdXMgcXVlcmllcyBhZ2FpbnN0IGEgUGF0aFNldC4gVGhlIFBhdGhTZWFyY2ggaXNcbiAqIHJlc3BvbnNpYmxlIGZvciBkZWNpZGluZyB3aGljaCBxdWVyaWVzIHRvIGNhbmNlbCBiYXNlZCBvbiBuZXdlciBxdWVyaWVzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXRoU2VhcmNoIHtcbiAgX3BhdGhTZXQ6IFBhdGhTZXQ7XG4gIF9hY3RpdmVRdWVyaWVzOiB7W2tleTogc3RyaW5nXTogUHJvbWlzZTxSZXN1bHRTZXQ+fTtcbiAgX3F1ZXJ5SXRlbUZvclBhdGg6IHtba2V5OiBzdHJpbmddOiBRdWVyeUl0ZW19O1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gcGF0aFNldCB0aGF0IGtlZXBzIGl0c2VsZiBpbiBzeW5jIHdpdGggd2hhdGV2ZXIgZGlyZWN0b3J5IGl0XG4gICAqICAgICByZXByZXNlbnRzLlxuICAgKi9cbiAgY29uc3RydWN0b3IocGF0aFNldDogUGF0aFNldCkge1xuICAgIHRoaXMuX3BhdGhTZXQgPSBwYXRoU2V0O1xuICAgIHRoaXMuX2FjdGl2ZVF1ZXJpZXMgPSB7fTtcbiAgICB0aGlzLl9xdWVyeUl0ZW1Gb3JQYXRoID0ge307IC8vIEl0IG1pZ2h0IGJlIG1vcmUgZWZmaWNpZW50IHRvIHN0b3JlIHRoaXMgaW4gUGF0aFNldC5cbiAgfVxuXG4gIF9kb0Z1enp5RmlsZW5hbWVTZWFyY2gocXVlcnk6IHN0cmluZywgdG9wU2NvcmVzOiBUb3BTY29yZXMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwcm9jZXNzb3IgPSAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICBsZXQgcXVlcnlJdGVtID0gdGhpcy5fcXVlcnlJdGVtRm9yUGF0aFtwYXRoXTtcbiAgICAgIGlmICghcXVlcnlJdGVtKSB7XG4gICAgICAgIHF1ZXJ5SXRlbSA9IG5ldyBRdWVyeUl0ZW0ocGF0aCk7XG4gICAgICAgIC8vIEN1cnJlbnRseSwgbm90aGluZyBpcyBldmVyIHJlbW92ZWQgZnJvbSBfcXVlcnlJdGVtRm9yUGF0aC4gSXQnc1xuICAgICAgICAvLyB1bmNsZWFyIGlmIHRoZSBhZGRpdGlvbmFsIGNvbXBsZXhpdHkgaW4gYm9va2tlZXBpbmcgZWZmb3J0IHdvdWxkXG4gICAgICAgIC8vIG1lcml0IHRoZSBtZW1vcnkgc2F2aW5ncy5cbiAgICAgICAgdGhpcy5fcXVlcnlJdGVtRm9yUGF0aFtwYXRoXSA9IHF1ZXJ5SXRlbTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGFscGhhbnVtZXJpY1F1ZXJ5ID0gcXVlcnkucmVwbGFjZSgvW15hLXowLTkvXS9nLCAnJyk7XG4gICAgICBjb25zdCBzY29yZWRJdGVtID0gcXVlcnlJdGVtLnNjb3JlKGFscGhhbnVtZXJpY1F1ZXJ5KTtcbiAgICAgIGlmIChzY29yZWRJdGVtICE9IG51bGwpIHtcbiAgICAgICAgdG9wU2NvcmVzLmluc2VydChzY29yZWRJdGVtKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiB0aGlzLl9wYXRoU2V0LnN1Ym1pdChwcm9jZXNzb3IpO1xuICB9XG5cbiAgLy8gYHF1ZXJ5YCBpcyBhc3N1bWVkIHRvIGJlIGEgbG93ZXItY2FzZSBzdHJpbmcuXG4gIF9kb1BhdGhTZWFyY2gocXVlcnk6IHN0cmluZywgdG9wU2NvcmVzOiBUb3BTY29yZXMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBwcm9jZXNzb3IgPSAocGF0aDogc3RyaW5nKSA9PiB7XG4gICAgICBpZiAodG9wU2NvcmVzLmdldFNpemUoKSA8IE1BWF9SRVNVTFRTX0NPVU5UICYmIHBhdGgudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5KSAhPT0gLTEpIHtcbiAgICAgICAgdG9wU2NvcmVzLmluc2VydCh7XG4gICAgICAgICAgbWF0Y2hJbmRleGVzOiBbXSxcbiAgICAgICAgICBzY29yZTogMCxcbiAgICAgICAgICB2YWx1ZTogcGF0aCxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBwYXRoU2V0Sm9iID0gdGhpcy5fcGF0aFNldC5zdWJtaXQocHJvY2Vzc29yKTtcbiAgICBjb25zdCBuZXh0Sm9iID0gcGF0aFNldEpvYi50aGVuKCgpID0+IHtcbiAgICAgIGlmICh0b3BTY29yZXMuZ2V0U2l6ZSgpID09PSAwICYmIHF1ZXJ5LmluZGV4T2YoJy8nKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RvUGF0aFNlYXJjaChxdWVyeS5zdWJzdHJpbmcocXVlcnkuaW5kZXhPZignLycpICsgMSksIHRvcFNjb3Jlcyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcGF0aFNldEpvYjtcbiAgICB9KTtcbiAgICAvLyBUaGUgY2FuY2VsSm9iIGV4cGFuZG8gcHJvcGVydHkgbmVlZHMgdG8gYmUgZm9yd2FyZGVkIG1hbnVhbGx5LlxuICAgIC8vIFRoaXMgaXMgYWxzbyB0aGUgcmVhc29uIHdlIGNhbm5vdCB1c2UgYGF3YWl0YCBpbiB0aGlzIGxvZ2ljLCBzaW5jZSBpdCdzIG5vdCBwb3NzaWJsZSB0byBwYXNzXG4gICAgLy8gY2FuY2VsSm9iIHRvIHRoZSByZXN1bHRpbmcgYXV0by1ib3hlZCBQcm9taXNlLlxuICAgIC8vICRGbG93Rml4TWU6IFJlbW92ZSB0aGUgY2FuY2VsSm9iIGV4cGFuZG8gb2ZmIHRoZSBwcm9taXNlLlxuICAgIG5leHRKb2IuY2FuY2VsSm9iID0gcGF0aFNldEpvYi5jYW5jZWxKb2I7XG4gICAgcmV0dXJuIG5leHRKb2I7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHF1ZXJ5IElzIGV4cGVjdGVkIHRvIGJlIHdoYXQgdGhlIHVzZXIgaGFzIHR5cGVkIGluIGEgcGF0aC1tYXRjaGluZ1xuICAgKiAgICAgdHlwZWFoZWFkIFVJLlxuICAgKiBAcmV0dXJuIFByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBlbXB0eSBSZXN1bHRTZXQgaWYgaXQgaXMgY2FuY2VsZWQuXG4gICAqL1xuICBkb1F1ZXJ5KHF1ZXJ5OiBzdHJpbmcpOiBQcm9taXNlPFJlc3VsdFNldD4ge1xuICAgIHF1ZXJ5ID0gcXVlcnkudG9Mb3dlckNhc2UoKTtcbiAgICBpZiAocXVlcnkubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtxdWVyeTogJycsIHJlc3VsdHM6IFtdfSk7XG4gICAgfVxuXG4gICAgLy8gU2VlIGlmIGEgcmVxdWVzdCBmb3IgdGhpcyBxdWVyeSBpcyBhbHJlYWR5IGluIGZsaWdodC5cbiAgICBjb25zdCBhY3RpdmVRdWVyeSA9IHRoaXMuX2FjdGl2ZVF1ZXJpZXNbcXVlcnldO1xuICAgIGlmIChhY3RpdmVRdWVyeSkge1xuICAgICAgcmV0dXJuIGFjdGl2ZVF1ZXJ5O1xuICAgIH1cblxuICAgIC8vIElmIGFueSBvZiB0aGUgZXhpc3RpbmcgcXVlcmllcyBhcmUgYSBwcmVmaXggb2YgdGhpcyBuZXcgcXVlcnksIGNhbmNlbFxuICAgIC8vIHRoZW0uIEhlcmUsIHdlIGFyZSBhc3N1bWluZyB0aGlzIGlzIHVzZWQgdG8gcG93ZXIgYSB0eXBlYWhlYWQsIHNvIHRoZVxuICAgIC8vIHJlc3VsdHMgb2YgdGhlIG9sZCBxdWVyaWVzIHdpbGwgbm8gbG9uZ2VyIGJlIG9mIGludGVyZXN0LlxuICAgIGNvbnN0IGtleXNUb1JlbW92ZSA9IFtdO1xuICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuX2FjdGl2ZVF1ZXJpZXMpIHtcbiAgICAgIGlmIChxdWVyeS5zdGFydHNXaXRoKGtleSkpIHtcbiAgICAgICAga2V5c1RvUmVtb3ZlLnB1c2goa2V5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBCZWNhdXNlIGNhbmNlbEpvYigpIHdpbGwgY2FsbCByZW1vdmVQcm9taXNlKCksIHdoaWNoIHdpbGwgbW9kaWZ5XG4gICAgLy8gdGhpcy5fYWN0aXZlUXVlcmllcywgd2UgY2Fubm90IGNhbGwgY2FuY2VsSm9iKCkgd2hpbGUgaXRlcmF0aW5nXG4gICAgLy8gdGhpcy5fYWN0aXZlUXVlcmllcyBpbiB0aGUgZm9yL2luIGxvb3AgYWJvdmUgYmVjYXVzZSB0aGF0IGNvdWxkIGludGVyZmVyZVxuICAgIC8vIHdpdGggdGhlIGl0ZXJhdGlvbi5cbiAgICBpZiAoa2V5c1RvUmVtb3ZlLmxlbmd0aCkge1xuICAgICAgLy8gJEZsb3dGaXhNZTogUmVtb3ZlIHRoZSBjYW5jZWxKb2IgZXhwYW5kbyBvZmYgdGhlIHByb21pc2UuXG4gICAgICBrZXlzVG9SZW1vdmUuZm9yRWFjaChrZXkgPT4gdGhpcy5fYWN0aXZlUXVlcmllc1trZXldLmNhbmNlbEpvYigpKTtcbiAgICB9XG5cblxuICAgIGNvbnN0IHRvcFNjb3JlcyA9IG5ldyBUb3BTY29yZXMoLyogY2FwYWNpdHkgKi8gTUFYX1JFU1VMVFNfQ09VTlQpO1xuXG4gICAgLy8gSWYgdGhlcmUgaXMgYSBzbGFzaCBpbiB0aGUgcXVlcnksIHdlIGFzc3VtZSB3ZSdyZSBzZWFyY2hpbmcgcGF0aHMgaW5zdGVhZCBvZiBmaWxlbmFtZXNcbiAgICAvLyBhbmQgdGhlcmVmb3JlIHdlIHdvbid0IHJlbW92ZSBzcGVjaWFsIGNoYXJhY3RlcnMsIGFuZCB3b24ndCB1c2UgdGhlIGZ1enp5IHNlYXJjaCBsb2dpY1xuICAgIGNvbnN0IHNob3VsZFNlYXJjaFBhdGhzID0gcXVlcnkuaW5kZXhPZignLycpICE9PSAtMTtcbiAgICBjb25zdCBwcm9taXNlID0gc2hvdWxkU2VhcmNoUGF0aHNcbiAgICAgID8gdGhpcy5fZG9QYXRoU2VhcmNoKHF1ZXJ5LCB0b3BTY29yZXMpXG4gICAgICA6IHRoaXMuX2RvRnV6enlGaWxlbmFtZVNlYXJjaChxdWVyeSwgdG9wU2NvcmVzKTtcblxuICAgIGxldCBwcm9taXNlRm9yUXVlcnk7XG4gICAgY29uc3QgcmVtb3ZlUHJvbWlzZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5fYWN0aXZlUXVlcmllc1txdWVyeV07XG4gICAgICAvLyBSZW1vdmUgdGhlIGVudHJ5IG9ubHkgaWYgaXQgaGFzIG5vdCBiZWVuIHJlcGxhY2VkIGJ5IGEgbW9yZSByZWNlbnQgb25lLlxuICAgICAgaWYgKGVudHJ5ID09PSBwcm9taXNlRm9yUXVlcnkpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuX2FjdGl2ZVF1ZXJpZXNbcXVlcnldO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBwcm9taXNlRm9yUXVlcnkgPSBwcm9taXNlLnRoZW4oKCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0cyA9IHRvcFNjb3Jlcy5nZXRUb3BTY29yZXMoKTtcbiAgICAgIC8vIERvIHRoZSBkZWxldGlvbiBpbiBhIHRpbWVvdXQgaW4gY2FzZSB0aGUgdXNlciB0eXBlcyBiYWNrc3BhY2UsXG4gICAgICAvLyBlZmZlY3RpdmVseSBhc2tpbmcgZm9yIHRoZSBwcmV2aW91cyByZXN1bHRzIGFnYWluLlxuICAgICAgc2V0VGltZW91dChyZW1vdmVQcm9taXNlLCBQQVRIX1NFQVJDSF9USU1FT1VUX01TKTtcbiAgICAgIGNvbnN0IHJlc3VsdDogUmVzdWx0U2V0ID0ge3F1ZXJ5LCByZXN1bHRzfTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfSwgKGVycm9yOiBFcnJvcikgPT4ge1xuICAgICAgcmVtb3ZlUHJvbWlzZSgpO1xuICAgICAgaWYgKGVycm9yLmVycm9yQ29kZSA9PT0gUGF0aFNldC5FUlJPUl9DT0RFX0NBTkNFTEVEKSB7XG4gICAgICAgIC8vIFRoaXMgcmVxdWVzdCB3YXMgY2FuY2VsZWQ6IHJlc29sdmUgdG8gYW4gZW1wdHkgUmVzdWx0U2V0LlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgIHJlc3VsdHM6IFtdLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSk7XG4gICAgLy8gJEZsb3dGaXhNZTogUmVtb3ZlIHRoZSBjYW5jZWxKb2IgZXhwYW5kbyBvZmYgdGhlIHByb21pc2UuXG4gICAgcHJvbWlzZUZvclF1ZXJ5LmNhbmNlbEpvYiA9IHByb21pc2UuY2FuY2VsSm9iO1xuICAgIHRoaXMuX2FjdGl2ZVF1ZXJpZXNbcXVlcnldID0gcHJvbWlzZUZvclF1ZXJ5O1xuICAgIHJldHVybiBwcm9taXNlRm9yUXVlcnk7XG4gIH1cblxufVxuIl19