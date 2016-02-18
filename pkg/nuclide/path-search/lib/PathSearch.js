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
//# sourceMappingURL=data:application/json;base64,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ZSxFQUFFO0FBQzdCLGlCQUFPLE9BQUssY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ25DO09BQ0YsQ0FBQzs7QUFFRixxQkFBZSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBTTtBQUNuQyxZQUFNLE9BQU8sR0FBRyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7OztBQUd6QyxrQkFBVSxDQUFDLGFBQWEsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0FBQ2xELFlBQU0sTUFBaUIsR0FBRyxFQUFDLEtBQUssRUFBTCxLQUFLLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBQyxDQUFDO0FBQzNDLGVBQU8sTUFBTSxDQUFDO09BQ2YsRUFBRSxVQUFDLEtBQUssRUFBbUI7QUFDMUIscUJBQWEsRUFBRSxDQUFDO0FBQ2hCLFlBQUksS0FBSyxDQUFDLFNBQVMsS0FBSyxxQkFBUSxtQkFBbUIsRUFBRTs7QUFFbkQsaUJBQU87QUFDTCxpQkFBSyxFQUFMLEtBQUs7QUFDTCxtQkFBTyxFQUFFLEVBQUU7V0FDWixDQUFDO1NBQ0gsTUFBTTtBQUNMLGdCQUFNLEtBQUssQ0FBQztTQUNiO09BQ0YsQ0FBQyxDQUFDOztBQUVILHFCQUFlLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7QUFDOUMsVUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsR0FBRyxlQUFlLENBQUM7QUFDN0MsYUFBTyxlQUFlLENBQUM7S0FDeEI7OztTQTFJa0IsVUFBVTs7O3FCQUFWLFVBQVUiLCJmaWxlIjoiUGF0aFNlYXJjaC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtRdWVyeVNjb3JlfSBmcm9tICcuL1F1ZXJ5U2NvcmUnO1xuaW1wb3J0IHR5cGUge1BhdGhTZXRFcnJvcn0gZnJvbSAnLi9QYXRoU2V0JztcbmltcG9ydCBRdWVyeUl0ZW0gZnJvbSAnLi9RdWVyeUl0ZW0nO1xuaW1wb3J0IFBhdGhTZXQgZnJvbSAnLi9QYXRoU2V0JztcbmltcG9ydCBUb3BTY29yZXMgZnJvbSAnLi9Ub3BTY29yZXMnO1xuXG50eXBlIFJlc3VsdFNldCA9IHtcbiAgcXVlcnk6IHN0cmluZyxcbiAgcmVzdWx0czogQXJyYXk8UXVlcnlTY29yZT4sXG59O1xuXG5jb25zdCBQQVRIX1NFQVJDSF9USU1FT1VUX01TID0gNjAgKiAxMDAwO1xuY29uc3QgTUFYX1JFU1VMVFNfQ09VTlQgPSA1MDtcblxuLyoqXG4gKiBNYW5hZ2VzIG11bHRpcGxlIHNpbXVsdGFuZW91cyBxdWVyaWVzIGFnYWluc3QgYSBQYXRoU2V0LiBUaGUgUGF0aFNlYXJjaCBpc1xuICogcmVzcG9uc2libGUgZm9yIGRlY2lkaW5nIHdoaWNoIHF1ZXJpZXMgdG8gY2FuY2VsIGJhc2VkIG9uIG5ld2VyIHF1ZXJpZXMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGhTZWFyY2gge1xuICBfcGF0aFNldDogUGF0aFNldDtcbiAgX2FjdGl2ZVF1ZXJpZXM6IHtba2V5OiBzdHJpbmddOiBQcm9taXNlPFJlc3VsdFNldD59O1xuICBfcXVlcnlJdGVtRm9yUGF0aDoge1trZXk6IHN0cmluZ106IFF1ZXJ5SXRlbX07XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBwYXRoU2V0IHRoYXQga2VlcHMgaXRzZWxmIGluIHN5bmMgd2l0aCB3aGF0ZXZlciBkaXJlY3RvcnkgaXRcbiAgICogICAgIHJlcHJlc2VudHMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXRoU2V0OiBQYXRoU2V0KSB7XG4gICAgdGhpcy5fcGF0aFNldCA9IHBhdGhTZXQ7XG4gICAgdGhpcy5fYWN0aXZlUXVlcmllcyA9IHt9O1xuICAgIHRoaXMuX3F1ZXJ5SXRlbUZvclBhdGggPSB7fTsgLy8gSXQgbWlnaHQgYmUgbW9yZSBlZmZpY2llbnQgdG8gc3RvcmUgdGhpcyBpbiBQYXRoU2V0LlxuICB9XG5cbiAgX2RvRnV6enlGaWxlbmFtZVNlYXJjaChxdWVyeTogc3RyaW5nLCB0b3BTY29yZXM6IFRvcFNjb3Jlcyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHByb2Nlc3NvciA9IChwYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgIGxldCBxdWVyeUl0ZW0gPSB0aGlzLl9xdWVyeUl0ZW1Gb3JQYXRoW3BhdGhdO1xuICAgICAgaWYgKCFxdWVyeUl0ZW0pIHtcbiAgICAgICAgcXVlcnlJdGVtID0gbmV3IFF1ZXJ5SXRlbShwYXRoKTtcbiAgICAgICAgLy8gQ3VycmVudGx5LCBub3RoaW5nIGlzIGV2ZXIgcmVtb3ZlZCBmcm9tIF9xdWVyeUl0ZW1Gb3JQYXRoLiBJdCdzXG4gICAgICAgIC8vIHVuY2xlYXIgaWYgdGhlIGFkZGl0aW9uYWwgY29tcGxleGl0eSBpbiBib29ra2VlcGluZyBlZmZvcnQgd291bGRcbiAgICAgICAgLy8gbWVyaXQgdGhlIG1lbW9yeSBzYXZpbmdzLlxuICAgICAgICB0aGlzLl9xdWVyeUl0ZW1Gb3JQYXRoW3BhdGhdID0gcXVlcnlJdGVtO1xuICAgICAgfVxuICAgICAgY29uc3QgYWxwaGFudW1lcmljUXVlcnkgPSBxdWVyeS5yZXBsYWNlKC9bXmEtejAtOS9dL2csICcnKTtcbiAgICAgIGNvbnN0IHNjb3JlZEl0ZW0gPSBxdWVyeUl0ZW0uc2NvcmUoYWxwaGFudW1lcmljUXVlcnkpO1xuICAgICAgaWYgKHNjb3JlZEl0ZW0gIT0gbnVsbCkge1xuICAgICAgICB0b3BTY29yZXMuaW5zZXJ0KHNjb3JlZEl0ZW0pO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIHRoaXMuX3BhdGhTZXQuc3VibWl0KHByb2Nlc3Nvcik7XG4gIH1cblxuICAvLyBgcXVlcnlgIGlzIGFzc3VtZWQgdG8gYmUgYSBsb3dlci1jYXNlIHN0cmluZy5cbiAgX2RvUGF0aFNlYXJjaChxdWVyeTogc3RyaW5nLCB0b3BTY29yZXM6IFRvcFNjb3Jlcyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHByb2Nlc3NvciA9IChwYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgIGlmICh0b3BTY29yZXMuZ2V0U2l6ZSgpIDwgTUFYX1JFU1VMVFNfQ09VTlQgJiYgcGF0aC50b0xvd2VyQ2FzZSgpLmluZGV4T2YocXVlcnkpICE9PSAtMSkge1xuICAgICAgICB0b3BTY29yZXMuaW5zZXJ0KHtcbiAgICAgICAgICBtYXRjaEluZGV4ZXM6IFtdLFxuICAgICAgICAgIHNjb3JlOiAwLFxuICAgICAgICAgIHZhbHVlOiBwYXRoLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbnN0IHBhdGhTZXRKb2IgPSB0aGlzLl9wYXRoU2V0LnN1Ym1pdChwcm9jZXNzb3IpO1xuICAgIGNvbnN0IG5leHRKb2IgPSBwYXRoU2V0Sm9iLnRoZW4oKCkgPT4ge1xuICAgICAgaWYgKHRvcFNjb3Jlcy5nZXRTaXplKCkgPT09IDAgJiYgcXVlcnkuaW5kZXhPZignLycpICE9PSAtMSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZG9QYXRoU2VhcmNoKHF1ZXJ5LnN1YnN0cmluZyhxdWVyeS5pbmRleE9mKCcvJykgKyAxKSwgdG9wU2NvcmVzKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwYXRoU2V0Sm9iO1xuICAgIH0pO1xuICAgIC8vIFRoZSBjYW5jZWxKb2IgZXhwYW5kbyBwcm9wZXJ0eSBuZWVkcyB0byBiZSBmb3J3YXJkZWQgbWFudWFsbHkuXG4gICAgLy8gVGhpcyBpcyBhbHNvIHRoZSByZWFzb24gd2UgY2Fubm90IHVzZSBgYXdhaXRgIGluIHRoaXMgbG9naWMsIHNpbmNlIGl0J3Mgbm90IHBvc3NpYmxlIHRvIHBhc3NcbiAgICAvLyBjYW5jZWxKb2IgdG8gdGhlIHJlc3VsdGluZyBhdXRvLWJveGVkIFByb21pc2UuXG4gICAgLy8gJEZsb3dGaXhNZTogUmVtb3ZlIHRoZSBjYW5jZWxKb2IgZXhwYW5kbyBvZmYgdGhlIHByb21pc2UuXG4gICAgbmV4dEpvYi5jYW5jZWxKb2IgPSBwYXRoU2V0Sm9iLmNhbmNlbEpvYjtcbiAgICByZXR1cm4gbmV4dEpvYjtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gcXVlcnkgSXMgZXhwZWN0ZWQgdG8gYmUgd2hhdCB0aGUgdXNlciBoYXMgdHlwZWQgaW4gYSBwYXRoLW1hdGNoaW5nXG4gICAqICAgICB0eXBlYWhlYWQgVUkuXG4gICAqIEByZXR1cm4gUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIGVtcHR5IFJlc3VsdFNldCBpZiBpdCBpcyBjYW5jZWxlZC5cbiAgICovXG4gIGRvUXVlcnkocXVlcnk6IHN0cmluZyk6IFByb21pc2U8UmVzdWx0U2V0PiB7XG4gICAgcXVlcnkgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChxdWVyeS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe3F1ZXJ5OiAnJywgcmVzdWx0czogW119KTtcbiAgICB9XG5cbiAgICAvLyBTZWUgaWYgYSByZXF1ZXN0IGZvciB0aGlzIHF1ZXJ5IGlzIGFscmVhZHkgaW4gZmxpZ2h0LlxuICAgIGNvbnN0IGFjdGl2ZVF1ZXJ5ID0gdGhpcy5fYWN0aXZlUXVlcmllc1txdWVyeV07XG4gICAgaWYgKGFjdGl2ZVF1ZXJ5KSB7XG4gICAgICByZXR1cm4gYWN0aXZlUXVlcnk7XG4gICAgfVxuXG4gICAgLy8gSWYgYW55IG9mIHRoZSBleGlzdGluZyBxdWVyaWVzIGFyZSBhIHByZWZpeCBvZiB0aGlzIG5ldyBxdWVyeSwgY2FuY2VsXG4gICAgLy8gdGhlbS4gSGVyZSwgd2UgYXJlIGFzc3VtaW5nIHRoaXMgaXMgdXNlZCB0byBwb3dlciBhIHR5cGVhaGVhZCwgc28gdGhlXG4gICAgLy8gcmVzdWx0cyBvZiB0aGUgb2xkIHF1ZXJpZXMgd2lsbCBubyBsb25nZXIgYmUgb2YgaW50ZXJlc3QuXG4gICAgY29uc3Qga2V5c1RvUmVtb3ZlID0gW107XG4gICAgZm9yIChjb25zdCBrZXkgaW4gdGhpcy5fYWN0aXZlUXVlcmllcykge1xuICAgICAgaWYgKHF1ZXJ5LnN0YXJ0c1dpdGgoa2V5KSkge1xuICAgICAgICBrZXlzVG9SZW1vdmUucHVzaChrZXkpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEJlY2F1c2UgY2FuY2VsSm9iKCkgd2lsbCBjYWxsIHJlbW92ZVByb21pc2UoKSwgd2hpY2ggd2lsbCBtb2RpZnlcbiAgICAvLyB0aGlzLl9hY3RpdmVRdWVyaWVzLCB3ZSBjYW5ub3QgY2FsbCBjYW5jZWxKb2IoKSB3aGlsZSBpdGVyYXRpbmdcbiAgICAvLyB0aGlzLl9hY3RpdmVRdWVyaWVzIGluIHRoZSBmb3IvaW4gbG9vcCBhYm92ZSBiZWNhdXNlIHRoYXQgY291bGQgaW50ZXJmZXJlXG4gICAgLy8gd2l0aCB0aGUgaXRlcmF0aW9uLlxuICAgIGlmIChrZXlzVG9SZW1vdmUubGVuZ3RoKSB7XG4gICAgICAvLyAkRmxvd0ZpeE1lOiBSZW1vdmUgdGhlIGNhbmNlbEpvYiBleHBhbmRvIG9mZiB0aGUgcHJvbWlzZS5cbiAgICAgIGtleXNUb1JlbW92ZS5mb3JFYWNoKGtleSA9PiB0aGlzLl9hY3RpdmVRdWVyaWVzW2tleV0uY2FuY2VsSm9iKCkpO1xuICAgIH1cblxuXG4gICAgY29uc3QgdG9wU2NvcmVzID0gbmV3IFRvcFNjb3JlcygvKiBjYXBhY2l0eSAqLyBNQVhfUkVTVUxUU19DT1VOVCk7XG5cbiAgICAvLyBJZiB0aGVyZSBpcyBhIHNsYXNoIGluIHRoZSBxdWVyeSwgd2UgYXNzdW1lIHdlJ3JlIHNlYXJjaGluZyBwYXRocyBpbnN0ZWFkIG9mIGZpbGVuYW1lc1xuICAgIC8vIGFuZCB0aGVyZWZvcmUgd2Ugd29uJ3QgcmVtb3ZlIHNwZWNpYWwgY2hhcmFjdGVycywgYW5kIHdvbid0IHVzZSB0aGUgZnV6enkgc2VhcmNoIGxvZ2ljXG4gICAgY29uc3Qgc2hvdWxkU2VhcmNoUGF0aHMgPSBxdWVyeS5pbmRleE9mKCcvJykgIT09IC0xO1xuICAgIGNvbnN0IHByb21pc2UgPSBzaG91bGRTZWFyY2hQYXRoc1xuICAgICAgPyB0aGlzLl9kb1BhdGhTZWFyY2gocXVlcnksIHRvcFNjb3JlcylcbiAgICAgIDogdGhpcy5fZG9GdXp6eUZpbGVuYW1lU2VhcmNoKHF1ZXJ5LCB0b3BTY29yZXMpO1xuXG4gICAgbGV0IHByb21pc2VGb3JRdWVyeTtcbiAgICBjb25zdCByZW1vdmVQcm9taXNlID0gKCkgPT4ge1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLl9hY3RpdmVRdWVyaWVzW3F1ZXJ5XTtcbiAgICAgIC8vIFJlbW92ZSB0aGUgZW50cnkgb25seSBpZiBpdCBoYXMgbm90IGJlZW4gcmVwbGFjZWQgYnkgYSBtb3JlIHJlY2VudCBvbmUuXG4gICAgICBpZiAoZW50cnkgPT09IHByb21pc2VGb3JRdWVyeSkge1xuICAgICAgICBkZWxldGUgdGhpcy5fYWN0aXZlUXVlcmllc1txdWVyeV07XG4gICAgICB9XG4gICAgfTtcblxuICAgIHByb21pc2VGb3JRdWVyeSA9IHByb21pc2UudGhlbigoKSA9PiB7XG4gICAgICBjb25zdCByZXN1bHRzID0gdG9wU2NvcmVzLmdldFRvcFNjb3JlcygpO1xuICAgICAgLy8gRG8gdGhlIGRlbGV0aW9uIGluIGEgdGltZW91dCBpbiBjYXNlIHRoZSB1c2VyIHR5cGVzIGJhY2tzcGFjZSxcbiAgICAgIC8vIGVmZmVjdGl2ZWx5IGFza2luZyBmb3IgdGhlIHByZXZpb3VzIHJlc3VsdHMgYWdhaW4uXG4gICAgICBzZXRUaW1lb3V0KHJlbW92ZVByb21pc2UsIFBBVEhfU0VBUkNIX1RJTUVPVVRfTVMpO1xuICAgICAgY29uc3QgcmVzdWx0OiBSZXN1bHRTZXQgPSB7cXVlcnksIHJlc3VsdHN9O1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9LCAoZXJyb3I6IFBhdGhTZXRFcnJvcikgPT4ge1xuICAgICAgcmVtb3ZlUHJvbWlzZSgpO1xuICAgICAgaWYgKGVycm9yLmVycm9yQ29kZSA9PT0gUGF0aFNldC5FUlJPUl9DT0RFX0NBTkNFTEVEKSB7XG4gICAgICAgIC8vIFRoaXMgcmVxdWVzdCB3YXMgY2FuY2VsZWQ6IHJlc29sdmUgdG8gYW4gZW1wdHkgUmVzdWx0U2V0LlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHF1ZXJ5LFxuICAgICAgICAgIHJlc3VsdHM6IFtdLFxuICAgICAgICB9O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICB9XG4gICAgfSk7XG4gICAgLy8gJEZsb3dGaXhNZTogUmVtb3ZlIHRoZSBjYW5jZWxKb2IgZXhwYW5kbyBvZmYgdGhlIHByb21pc2UuXG4gICAgcHJvbWlzZUZvclF1ZXJ5LmNhbmNlbEpvYiA9IHByb21pc2UuY2FuY2VsSm9iO1xuICAgIHRoaXMuX2FjdGl2ZVF1ZXJpZXNbcXVlcnldID0gcHJvbWlzZUZvclF1ZXJ5O1xuICAgIHJldHVybiBwcm9taXNlRm9yUXVlcnk7XG4gIH1cblxufVxuIl19