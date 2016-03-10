Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/**
 * FileSearch is an object with a query() method. Currently, this is visible only for testing.
 * @param directoryUri The directory to get the FileSearch for.
 * @param pathSetUpdater Exposed for testing purposes. The pathSetUpdater to use
 *   in this method--likely a mock.
 */

var fileSearchForDirectory = _asyncToGenerator(function* (directoryUri, pathSetUpdater) {
  var fileSearch = fileSearchForDirectoryUri[directoryUri];
  if (fileSearch) {
    return fileSearch;
  }

  var realpath = yield _commons.fsPromise.realpath((0, _remoteUri.parse)(directoryUri).path);
  var pathSet = yield (0, _PathSetFactory.createPathSet)(realpath);

  var thisPathSetUpdater = pathSetUpdater || getPathSetUpdater();
  // $FlowIgnore TODO Fully remove PathSet and use LazyPathSet type throughout.
  yield thisPathSetUpdater.startUpdatingPathSet(pathSet, realpath);

  // TODO: Stop updating the pathSet when the fileSearch is torn down. But
  // currently the fileSearch is never torn down.

  var pathSearch = new _PathSearch2['default'](pathSet);
  fileSearch = new FileSearch(realpath, directoryUri, pathSearch);
  fileSearchForDirectoryUri[directoryUri] = fileSearch;
  return fileSearch;
});

exports.fileSearchForDirectory = fileSearchForDirectory;

// The return values of the following functions must be JSON-serializable so they
// can be sent across a process boundary.

var initFileSearchForDirectory = _asyncToGenerator(function* (directoryUri) {
  yield fileSearchForDirectory(directoryUri);
});

exports.initFileSearchForDirectory = initFileSearchForDirectory;

var doSearch = _asyncToGenerator(function* (directoryUri, query) {
  var fileSearch = yield fileSearchForDirectory(directoryUri);
  return fileSearch.query(query);
});

exports.doSearch = doSearch;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _urlJoin = require('url-join');

var _urlJoin2 = _interopRequireDefault(_urlJoin);

var _remoteUri = require('../../remote-uri');

var _commons = require('../../commons');

var _PathSetFactory = require('./PathSetFactory');

var _PathSearch = require('./PathSearch');

var _PathSearch2 = _interopRequireDefault(_PathSearch);

var _PathSetUpdater = require('./PathSetUpdater');

var _PathSetUpdater2 = _interopRequireDefault(_PathSetUpdater);

/**
 * Utility to search the set of files under `localDirectory`. It attempts to use
 * source control to populate the search space quickly, as well as to exclude
 * source control metadata files from search.
 *
 * @param localDirectory the directory whose files should be searched
 * @param fullUri is the original path provided to `fileSearchForDirectory`,
 *     which is prepended to all results.
 * @param pathSearch delegate to use for the actual searching.
 */

var FileSearch = (function () {
  function FileSearch(localDirectory, fullUri, pathSearch) {
    _classCallCheck(this, FileSearch);

    this._localDirectory = localDirectory;
    this._originalUri = fullUri;
    this._pathSearch = pathSearch;
  }

  _createClass(FileSearch, [{
    key: 'query',
    value: _asyncToGenerator(function* (_query) {
      var _this = this;

      var resultSet = yield this._pathSearch.doQuery(_query);
      // TODO: Cache the result of this call to map().
      var results = resultSet.results.map(function (result) {
        var mappedResult = {
          score: result.score,
          path: (0, _urlJoin2['default'])(_this._originalUri, '/', result.value),
          matchIndexes: []
        };
        if (result.matchIndexes) {
          mappedResult.matchIndexes = result.matchIndexes.map(function (index) {
            return index + _this._originalUri.length + 1;
          });
        }
        return mappedResult;
      });
      return results;
    })
  }, {
    key: 'getLocalDirectory',
    value: function getLocalDirectory() {
      return this._localDirectory;
    }
  }, {
    key: 'getFullBaseUri',
    value: function getFullBaseUri() {
      return this._originalUri;
    }
  }]);

  return FileSearch;
})();

var fileSearchForDirectoryUri = {};

var pathSetUpdater = undefined;

function getPathSetUpdater() {
  if (!pathSetUpdater) {
    exports.pathSetUpdater = pathSetUpdater = new _PathSetUpdater2['default']();
  }
  return pathSetUpdater;
}
//# sourceMappingURL=data:application/json;base64,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QkFBVztBQUN2QixhQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7S0FDMUI7OztTQW5DRyxVQUFVOzs7QUFzQ2hCLElBQU0seUJBQXlCLEdBQUcsRUFBRSxDQUFDOztBQWlDckMsSUFBSSxjQUFjLFlBQUEsQ0FBQzs7QUFFbkIsU0FBUyxpQkFBaUIsR0FBRztBQUMzQixNQUFJLENBQUMsY0FBYyxFQUFFO0FBQ25CLFlBM0JGLGNBQStCLEdBMkI3QixjQUFjLEdBQUcsaUNBQW9CLENBQUM7R0FDdkM7QUFDRCxTQUFPLGNBQWMsQ0FBQztDQUN2QiIsImZpbGUiOiJGaWxlU2VhcmNoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHVybEpvaW4gZnJvbSAndXJsLWpvaW4nO1xuXG5pbXBvcnQge3BhcnNlfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB7ZnNQcm9taXNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcblxuaW1wb3J0IHtjcmVhdGVQYXRoU2V0fSBmcm9tICcuL1BhdGhTZXRGYWN0b3J5JztcbmltcG9ydCBQYXRoU2VhcmNoIGZyb20gJy4vUGF0aFNlYXJjaCc7XG5pbXBvcnQgUGF0aFNldFVwZGF0ZXIgZnJvbSAnLi9QYXRoU2V0VXBkYXRlcic7XG5cbmV4cG9ydCB0eXBlIEZpbGVTZWFyY2hSZXN1bHQgPSB7XG4gIHNjb3JlOiBudW1iZXI7XG4gIHBhdGg6IHN0cmluZztcbiAgbWF0Y2hJbmRleGVzOiBBcnJheTxudW1iZXI+O1xufTtcblxuLyoqXG4gKiBVdGlsaXR5IHRvIHNlYXJjaCB0aGUgc2V0IG9mIGZpbGVzIHVuZGVyIGBsb2NhbERpcmVjdG9yeWAuIEl0IGF0dGVtcHRzIHRvIHVzZVxuICogc291cmNlIGNvbnRyb2wgdG8gcG9wdWxhdGUgdGhlIHNlYXJjaCBzcGFjZSBxdWlja2x5LCBhcyB3ZWxsIGFzIHRvIGV4Y2x1ZGVcbiAqIHNvdXJjZSBjb250cm9sIG1ldGFkYXRhIGZpbGVzIGZyb20gc2VhcmNoLlxuICpcbiAqIEBwYXJhbSBsb2NhbERpcmVjdG9yeSB0aGUgZGlyZWN0b3J5IHdob3NlIGZpbGVzIHNob3VsZCBiZSBzZWFyY2hlZFxuICogQHBhcmFtIGZ1bGxVcmkgaXMgdGhlIG9yaWdpbmFsIHBhdGggcHJvdmlkZWQgdG8gYGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlgLFxuICogICAgIHdoaWNoIGlzIHByZXBlbmRlZCB0byBhbGwgcmVzdWx0cy5cbiAqIEBwYXJhbSBwYXRoU2VhcmNoIGRlbGVnYXRlIHRvIHVzZSBmb3IgdGhlIGFjdHVhbCBzZWFyY2hpbmcuXG4gKi9cbmNsYXNzIEZpbGVTZWFyY2gge1xuICBfbG9jYWxEaXJlY3Rvcnk6IHN0cmluZztcbiAgX29yaWdpbmFsVXJpOiBzdHJpbmc7XG4gIF9wYXRoU2VhcmNoOiBQYXRoU2VhcmNoO1xuXG4gIGNvbnN0cnVjdG9yKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcsIGZ1bGxVcmk6IHN0cmluZywgcGF0aFNlYXJjaDogUGF0aFNlYXJjaCkge1xuICAgIHRoaXMuX2xvY2FsRGlyZWN0b3J5ID0gbG9jYWxEaXJlY3Rvcnk7XG4gICAgdGhpcy5fb3JpZ2luYWxVcmkgPSBmdWxsVXJpO1xuICAgIHRoaXMuX3BhdGhTZWFyY2ggPSBwYXRoU2VhcmNoO1xuICB9XG5cbiAgYXN5bmMgcXVlcnkocXVlcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8RmlsZVNlYXJjaFJlc3VsdD4+IHtcbiAgICBjb25zdCByZXN1bHRTZXQgPSBhd2FpdCB0aGlzLl9wYXRoU2VhcmNoLmRvUXVlcnkocXVlcnkpO1xuICAgIC8vIFRPRE86IENhY2hlIHRoZSByZXN1bHQgb2YgdGhpcyBjYWxsIHRvIG1hcCgpLlxuICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PEZpbGVTZWFyY2hSZXN1bHQ+ID0gcmVzdWx0U2V0LnJlc3VsdHMubWFwKHJlc3VsdCA9PiB7XG4gICAgICBjb25zdCBtYXBwZWRSZXN1bHQgPSB7XG4gICAgICAgIHNjb3JlOiByZXN1bHQuc2NvcmUsXG4gICAgICAgIHBhdGg6IHVybEpvaW4odGhpcy5fb3JpZ2luYWxVcmksICcvJywgcmVzdWx0LnZhbHVlKSxcbiAgICAgICAgbWF0Y2hJbmRleGVzOiBbXSxcbiAgICAgIH07XG4gICAgICBpZiAocmVzdWx0Lm1hdGNoSW5kZXhlcykge1xuICAgICAgICBtYXBwZWRSZXN1bHQubWF0Y2hJbmRleGVzID1cbiAgICAgICAgICByZXN1bHQubWF0Y2hJbmRleGVzLm1hcChpbmRleCA9PiBpbmRleCArIHRoaXMuX29yaWdpbmFsVXJpLmxlbmd0aCArIDEpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1hcHBlZFJlc3VsdDtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxuXG4gIGdldExvY2FsRGlyZWN0b3J5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2xvY2FsRGlyZWN0b3J5O1xuICB9XG5cbiAgZ2V0RnVsbEJhc2VVcmkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fb3JpZ2luYWxVcmk7XG4gIH1cbn1cblxuY29uc3QgZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaSA9IHt9O1xuXG4vKipcbiAqIEZpbGVTZWFyY2ggaXMgYW4gb2JqZWN0IHdpdGggYSBxdWVyeSgpIG1ldGhvZC4gQ3VycmVudGx5LCB0aGlzIGlzIHZpc2libGUgb25seSBmb3IgdGVzdGluZy5cbiAqIEBwYXJhbSBkaXJlY3RvcnlVcmkgVGhlIGRpcmVjdG9yeSB0byBnZXQgdGhlIEZpbGVTZWFyY2ggZm9yLlxuICogQHBhcmFtIHBhdGhTZXRVcGRhdGVyIEV4cG9zZWQgZm9yIHRlc3RpbmcgcHVycG9zZXMuIFRoZSBwYXRoU2V0VXBkYXRlciB0byB1c2VcbiAqICAgaW4gdGhpcyBtZXRob2QtLWxpa2VseSBhIG1vY2suXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5KFxuICBkaXJlY3RvcnlVcmk6IHN0cmluZyxcbiAgcGF0aFNldFVwZGF0ZXI6ID9QYXRoU2V0VXBkYXRlcixcbik6IFByb21pc2U8RmlsZVNlYXJjaD4ge1xuICBsZXQgZmlsZVNlYXJjaCA9IGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlVcmlbZGlyZWN0b3J5VXJpXTtcbiAgaWYgKGZpbGVTZWFyY2gpIHtcbiAgICByZXR1cm4gZmlsZVNlYXJjaDtcbiAgfVxuXG4gIGNvbnN0IHJlYWxwYXRoID0gYXdhaXQgZnNQcm9taXNlLnJlYWxwYXRoKHBhcnNlKGRpcmVjdG9yeVVyaSkucGF0aCk7XG4gIGNvbnN0IHBhdGhTZXQgPSBhd2FpdCBjcmVhdGVQYXRoU2V0KHJlYWxwYXRoKTtcblxuICBjb25zdCB0aGlzUGF0aFNldFVwZGF0ZXIgPSBwYXRoU2V0VXBkYXRlciB8fCBnZXRQYXRoU2V0VXBkYXRlcigpO1xuICAvLyAkRmxvd0lnbm9yZSBUT0RPIEZ1bGx5IHJlbW92ZSBQYXRoU2V0IGFuZCB1c2UgTGF6eVBhdGhTZXQgdHlwZSB0aHJvdWdob3V0LlxuICBhd2FpdCB0aGlzUGF0aFNldFVwZGF0ZXIuc3RhcnRVcGRhdGluZ1BhdGhTZXQocGF0aFNldCwgcmVhbHBhdGgpO1xuXG4gIC8vIFRPRE86IFN0b3AgdXBkYXRpbmcgdGhlIHBhdGhTZXQgd2hlbiB0aGUgZmlsZVNlYXJjaCBpcyB0b3JuIGRvd24uIEJ1dFxuICAvLyBjdXJyZW50bHkgdGhlIGZpbGVTZWFyY2ggaXMgbmV2ZXIgdG9ybiBkb3duLlxuXG4gIGNvbnN0IHBhdGhTZWFyY2ggPSBuZXcgUGF0aFNlYXJjaChwYXRoU2V0KTtcbiAgZmlsZVNlYXJjaCA9IG5ldyBGaWxlU2VhcmNoKHJlYWxwYXRoLCBkaXJlY3RvcnlVcmksIHBhdGhTZWFyY2gpO1xuICBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5VXJpW2RpcmVjdG9yeVVyaV0gPSBmaWxlU2VhcmNoO1xuICByZXR1cm4gZmlsZVNlYXJjaDtcbn1cblxubGV0IHBhdGhTZXRVcGRhdGVyO1xuXG5mdW5jdGlvbiBnZXRQYXRoU2V0VXBkYXRlcigpIHtcbiAgaWYgKCFwYXRoU2V0VXBkYXRlcikge1xuICAgIHBhdGhTZXRVcGRhdGVyID0gbmV3IFBhdGhTZXRVcGRhdGVyKCk7XG4gIH1cbiAgcmV0dXJuIHBhdGhTZXRVcGRhdGVyO1xufVxuXG4vLyBUaGUgcmV0dXJuIHZhbHVlcyBvZiB0aGUgZm9sbG93aW5nIGZ1bmN0aW9ucyBtdXN0IGJlIEpTT04tc2VyaWFsaXphYmxlIHNvIHRoZXlcbi8vIGNhbiBiZSBzZW50IGFjcm9zcyBhIHByb2Nlc3MgYm91bmRhcnkuXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0RmlsZVNlYXJjaEZvckRpcmVjdG9yeShkaXJlY3RvcnlVcmk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICBhd2FpdCBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5KGRpcmVjdG9yeVVyaSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkb1NlYXJjaChcbiAgZGlyZWN0b3J5VXJpOiBzdHJpbmcsXG4gIHF1ZXJ5OiBzdHJpbmcsXG4pOiBQcm9taXNlPEFycmF5PEZpbGVTZWFyY2hSZXN1bHQ+PiB7XG4gIGNvbnN0IGZpbGVTZWFyY2ggPSBhd2FpdCBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5KGRpcmVjdG9yeVVyaSk7XG4gIHJldHVybiBmaWxlU2VhcmNoLnF1ZXJ5KHF1ZXJ5KTtcbn1cbiJdfQ==