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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _LazyPathSet = require('./LazyPathSet');

var _LazyPathSet2 = _interopRequireDefault(_LazyPathSet);

/**
 * Manages multiple simultaneous queries against a PathSet. The PathSearch is
 * responsible for deciding which queries to cancel based on newer queries.
 * TODO jxg revisit whether this ^ contract still stands. Presumably, the use of RX will provide
 * this behavior for free.
 */

var PathSearch = (function () {

  /**
   * @param pathSet that keeps itself in sync with whatever directory it
   *     represents.
   */

  function PathSearch(pathSet) {
    _classCallCheck(this, PathSearch);

    this._pathSet = pathSet;
  }

  // TODO forward an actual RX stream instead of a Promise of the entire results array.

  _createClass(PathSearch, [{
    key: 'doRXQuery',
    value: function doRXQuery(query) {
      return this._pathSet.doQuery(query).toArray().toPromise();
    }

    /**
     * @param query Is expected to be what the user has typed in a path-matching
     *     typeahead UI.
     * @return Promise that resolves to an empty ResultSet if it is canceled.
     */
  }, {
    key: 'doQuery',
    value: _asyncToGenerator(function* (query) {
      query = query.toLowerCase();
      if (query.length === 0) {
        return Promise.resolve({ query: '', results: [] });
      }
      var results = yield this.doRXQuery(query);
      return { query: query, results: results };
    })
  }]);

  return PathSearch;
})();

exports['default'] = PathSearch;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBhdGhTZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7MkJBYXdCLGVBQWU7Ozs7Ozs7Ozs7O0lBYWxCLFVBQVU7Ozs7Ozs7QUFPbEIsV0FQUSxVQUFVLENBT2pCLE9BQW9CLEVBQUU7MEJBUGYsVUFBVTs7QUFRM0IsUUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7R0FDekI7Ozs7ZUFUa0IsVUFBVTs7V0FZcEIsbUJBQUMsS0FBYSxFQUEwQjtBQUMvQyxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDO0tBQzNEOzs7Ozs7Ozs7NkJBT1ksV0FBQyxLQUFhLEVBQXNCO0FBQy9DLFdBQUssR0FBRyxLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDNUIsVUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUN0QixlQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDO09BQ2xEO0FBQ0QsVUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzVDLGFBQU8sRUFBQyxLQUFLLEVBQUwsS0FBSyxFQUFFLE9BQU8sRUFBUCxPQUFPLEVBQUMsQ0FBQztLQUN6Qjs7O1NBNUJrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiJQYXRoU2VhcmNoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge1F1ZXJ5U2NvcmV9IGZyb20gJy4vUXVlcnlTY29yZSc7XG5cbmltcG9ydCBMYXp5UGF0aFNldCBmcm9tICcuL0xhenlQYXRoU2V0JztcblxudHlwZSBSZXN1bHRTZXQgPSB7XG4gIHF1ZXJ5OiBzdHJpbmc7XG4gIHJlc3VsdHM6IEFycmF5PFF1ZXJ5U2NvcmU+O1xufTtcblxuLyoqXG4gKiBNYW5hZ2VzIG11bHRpcGxlIHNpbXVsdGFuZW91cyBxdWVyaWVzIGFnYWluc3QgYSBQYXRoU2V0LiBUaGUgUGF0aFNlYXJjaCBpc1xuICogcmVzcG9uc2libGUgZm9yIGRlY2lkaW5nIHdoaWNoIHF1ZXJpZXMgdG8gY2FuY2VsIGJhc2VkIG9uIG5ld2VyIHF1ZXJpZXMuXG4gKiBUT0RPIGp4ZyByZXZpc2l0IHdoZXRoZXIgdGhpcyBeIGNvbnRyYWN0IHN0aWxsIHN0YW5kcy4gUHJlc3VtYWJseSwgdGhlIHVzZSBvZiBSWCB3aWxsIHByb3ZpZGVcbiAqIHRoaXMgYmVoYXZpb3IgZm9yIGZyZWUuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGhTZWFyY2gge1xuICBfcGF0aFNldDogTGF6eVBhdGhTZXQ7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBwYXRoU2V0IHRoYXQga2VlcHMgaXRzZWxmIGluIHN5bmMgd2l0aCB3aGF0ZXZlciBkaXJlY3RvcnkgaXRcbiAgICogICAgIHJlcHJlc2VudHMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXRoU2V0OiBMYXp5UGF0aFNldCkge1xuICAgIHRoaXMuX3BhdGhTZXQgPSBwYXRoU2V0O1xuICB9XG5cbiAgLy8gVE9ETyBmb3J3YXJkIGFuIGFjdHVhbCBSWCBzdHJlYW0gaW5zdGVhZCBvZiBhIFByb21pc2Ugb2YgdGhlIGVudGlyZSByZXN1bHRzIGFycmF5LlxuICBkb1JYUXVlcnkocXVlcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8T2JqZWN0Pj4ge1xuICAgIHJldHVybiB0aGlzLl9wYXRoU2V0LmRvUXVlcnkocXVlcnkpLnRvQXJyYXkoKS50b1Byb21pc2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gcXVlcnkgSXMgZXhwZWN0ZWQgdG8gYmUgd2hhdCB0aGUgdXNlciBoYXMgdHlwZWQgaW4gYSBwYXRoLW1hdGNoaW5nXG4gICAqICAgICB0eXBlYWhlYWQgVUkuXG4gICAqIEByZXR1cm4gUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIGVtcHR5IFJlc3VsdFNldCBpZiBpdCBpcyBjYW5jZWxlZC5cbiAgICovXG4gIGFzeW5jIGRvUXVlcnkocXVlcnk6IHN0cmluZyk6IFByb21pc2U8UmVzdWx0U2V0PiB7XG4gICAgcXVlcnkgPSBxdWVyeS50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChxdWVyeS5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe3F1ZXJ5OiAnJywgcmVzdWx0czogW119KTtcbiAgICB9XG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuZG9SWFF1ZXJ5KHF1ZXJ5KTtcbiAgICByZXR1cm4ge3F1ZXJ5LCByZXN1bHRzfTtcbiAgfVxuXG59XG4iXX0=