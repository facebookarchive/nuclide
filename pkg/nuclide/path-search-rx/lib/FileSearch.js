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
//# sourceMappingURL=data:application/json;base64,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QkFBVztBQUN2QixhQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7S0FDMUI7OztTQW5DRyxVQUFVOzs7QUFzQ2hCLElBQU0seUJBQXlCLEdBQUcsRUFBRSxDQUFDOztBQWlDckMsSUFBSSxjQUFjLFlBQUEsQ0FBQzs7QUFFbkIsU0FBUyxpQkFBaUIsR0FBRztBQUMzQixNQUFJLENBQUMsY0FBYyxFQUFFO0FBQ25CLFlBM0JGLGNBQStCLEdBMkI3QixjQUFjLEdBQUcsaUNBQW9CLENBQUM7R0FDdkM7QUFDRCxTQUFPLGNBQWMsQ0FBQztDQUN2QiIsImZpbGUiOiJGaWxlU2VhcmNoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHVybEpvaW4gZnJvbSAndXJsLWpvaW4nO1xuXG5pbXBvcnQge3BhcnNlfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB7ZnNQcm9taXNlfSBmcm9tICcuLi8uLi9jb21tb25zJztcblxuaW1wb3J0IHtjcmVhdGVQYXRoU2V0fSBmcm9tICcuL1BhdGhTZXRGYWN0b3J5JztcbmltcG9ydCBQYXRoU2VhcmNoIGZyb20gJy4vUGF0aFNlYXJjaCc7XG5pbXBvcnQgUGF0aFNldFVwZGF0ZXIgZnJvbSAnLi9QYXRoU2V0VXBkYXRlcic7XG5cbmV4cG9ydCB0eXBlIEZpbGVTZWFyY2hSZXN1bHQgPSB7XG4gIHNjb3JlOiBudW1iZXI7XG4gIHBhdGg6IHN0cmluZztcbiAgbWF0Y2hJbmRleGVzOiBBcnJheTxudW1iZXI+O1xufTtcblxuLyoqXG4gKiBVdGlsaXR5IHRvIHNlYXJjaCB0aGUgc2V0IG9mIGZpbGVzIHVuZGVyIGBsb2NhbERpcmVjdG9yeWAuIEl0IGF0dGVtcHRzIHRvIHVzZVxuICogc291cmNlIGNvbnRyb2wgdG8gcG9wdWxhdGUgdGhlIHNlYXJjaCBzcGFjZSBxdWlja2x5LCBhcyB3ZWxsIGFzIHRvIGV4Y2x1ZGVcbiAqIHNvdXJjZSBjb250cm9sIG1ldGFkYXRhIGZpbGVzIGZyb20gc2VhcmNoLlxuICpcbiAqIEBwYXJhbSBsb2NhbERpcmVjdG9yeSB0aGUgZGlyZWN0b3J5IHdob3NlIGZpbGVzIHNob3VsZCBiZSBzZWFyY2hlZFxuICogQHBhcmFtIGZ1bGxVcmkgaXMgdGhlIG9yaWdpbmFsIHBhdGggcHJvdmlkZWQgdG8gYGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlgLFxuICogICAgIHdoaWNoIGlzIHByZXBlbmRlZCB0byBhbGwgcmVzdWx0cy5cbiAqIEBwYXJhbSBwYXRoU2VhcmNoIGRlbGVnYXRlIHRvIHVzZSBmb3IgdGhlIGFjdHVhbCBzZWFyY2hpbmcuXG4gKi9cbmNsYXNzIEZpbGVTZWFyY2gge1xuICBfbG9jYWxEaXJlY3Rvcnk6IHN0cmluZztcbiAgX29yaWdpbmFsVXJpOiBzdHJpbmc7XG4gIF9wYXRoU2VhcmNoOiBQYXRoU2VhcmNoO1xuXG4gIGNvbnN0cnVjdG9yKGxvY2FsRGlyZWN0b3J5OiBzdHJpbmcsIGZ1bGxVcmk6IHN0cmluZywgcGF0aFNlYXJjaDogUGF0aFNlYXJjaCkge1xuICAgIHRoaXMuX2xvY2FsRGlyZWN0b3J5ID0gbG9jYWxEaXJlY3Rvcnk7XG4gICAgdGhpcy5fb3JpZ2luYWxVcmkgPSBmdWxsVXJpO1xuICAgIHRoaXMuX3BhdGhTZWFyY2ggPSBwYXRoU2VhcmNoO1xuICB9XG5cbiAgYXN5bmMgcXVlcnkocXVlcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8RmlsZVNlYXJjaFJlc3VsdD4+IHtcbiAgICBjb25zdCByZXN1bHRTZXQgPSBhd2FpdCB0aGlzLl9wYXRoU2VhcmNoLmRvUXVlcnkocXVlcnkpO1xuICAgIC8vIFRPRE86IENhY2hlIHRoZSByZXN1bHQgb2YgdGhpcyBjYWxsIHRvIG1hcCgpLlxuICAgIGNvbnN0IHJlc3VsdHM6IEFycmF5PEZpbGVTZWFyY2hSZXN1bHQ+ID0gcmVzdWx0U2V0LnJlc3VsdHMubWFwKHJlc3VsdCA9PiB7XG4gICAgICBjb25zdCBtYXBwZWRSZXN1bHQgPSB7XG4gICAgICAgIHNjb3JlOiByZXN1bHQuc2NvcmUsXG4gICAgICAgIHBhdGg6IHVybEpvaW4odGhpcy5fb3JpZ2luYWxVcmksICcvJywgcmVzdWx0LnZhbHVlKSxcbiAgICAgICAgbWF0Y2hJbmRleGVzOiBbXSxcbiAgICAgIH07XG4gICAgICBpZiAocmVzdWx0Lm1hdGNoSW5kZXhlcykge1xuICAgICAgICBtYXBwZWRSZXN1bHQubWF0Y2hJbmRleGVzID1cbiAgICAgICAgICByZXN1bHQubWF0Y2hJbmRleGVzLm1hcCgoaW5kZXgpID0+IGluZGV4ICsgdGhpcy5fb3JpZ2luYWxVcmkubGVuZ3RoICsgMSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFwcGVkUmVzdWx0O1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgZ2V0TG9jYWxEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fbG9jYWxEaXJlY3Rvcnk7XG4gIH1cblxuICBnZXRGdWxsQmFzZVVyaSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9vcmlnaW5hbFVyaTtcbiAgfVxufVxuXG5jb25zdCBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5VXJpID0ge307XG5cbi8qKlxuICogRmlsZVNlYXJjaCBpcyBhbiBvYmplY3Qgd2l0aCBhIHF1ZXJ5KCkgbWV0aG9kLiBDdXJyZW50bHksIHRoaXMgaXMgdmlzaWJsZSBvbmx5IGZvciB0ZXN0aW5nLlxuICogQHBhcmFtIGRpcmVjdG9yeVVyaSBUaGUgZGlyZWN0b3J5IHRvIGdldCB0aGUgRmlsZVNlYXJjaCBmb3IuXG4gKiBAcGFyYW0gcGF0aFNldFVwZGF0ZXIgRXhwb3NlZCBmb3IgdGVzdGluZyBwdXJwb3Nlcy4gVGhlIHBhdGhTZXRVcGRhdGVyIHRvIHVzZVxuICogICBpbiB0aGlzIG1ldGhvZC0tbGlrZWx5IGEgbW9jay5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbGVTZWFyY2hGb3JEaXJlY3RvcnkoXG4gIGRpcmVjdG9yeVVyaTogc3RyaW5nLFxuICBwYXRoU2V0VXBkYXRlcjogP1BhdGhTZXRVcGRhdGVyLFxuKTogUHJvbWlzZTxGaWxlU2VhcmNoPiB7XG4gIGxldCBmaWxlU2VhcmNoID0gZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaVtkaXJlY3RvcnlVcmldO1xuICBpZiAoZmlsZVNlYXJjaCkge1xuICAgIHJldHVybiBmaWxlU2VhcmNoO1xuICB9XG5cbiAgY29uc3QgcmVhbHBhdGggPSBhd2FpdCBmc1Byb21pc2UucmVhbHBhdGgocGFyc2UoZGlyZWN0b3J5VXJpKS5wYXRoKTtcbiAgY29uc3QgcGF0aFNldCA9IGF3YWl0IGNyZWF0ZVBhdGhTZXQocmVhbHBhdGgpO1xuXG4gIGNvbnN0IHRoaXNQYXRoU2V0VXBkYXRlciA9IHBhdGhTZXRVcGRhdGVyIHx8IGdldFBhdGhTZXRVcGRhdGVyKCk7XG4gIC8vICRGbG93SWdub3JlIFRPRE8gRnVsbHkgcmVtb3ZlIFBhdGhTZXQgYW5kIHVzZSBMYXp5UGF0aFNldCB0eXBlIHRocm91Z2hvdXQuXG4gIGF3YWl0IHRoaXNQYXRoU2V0VXBkYXRlci5zdGFydFVwZGF0aW5nUGF0aFNldChwYXRoU2V0LCByZWFscGF0aCk7XG5cbiAgLy8gVE9ETzogU3RvcCB1cGRhdGluZyB0aGUgcGF0aFNldCB3aGVuIHRoZSBmaWxlU2VhcmNoIGlzIHRvcm4gZG93bi4gQnV0XG4gIC8vIGN1cnJlbnRseSB0aGUgZmlsZVNlYXJjaCBpcyBuZXZlciB0b3JuIGRvd24uXG5cbiAgY29uc3QgcGF0aFNlYXJjaCA9IG5ldyBQYXRoU2VhcmNoKHBhdGhTZXQpO1xuICBmaWxlU2VhcmNoID0gbmV3IEZpbGVTZWFyY2gocmVhbHBhdGgsIGRpcmVjdG9yeVVyaSwgcGF0aFNlYXJjaCk7XG4gIGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlVcmlbZGlyZWN0b3J5VXJpXSA9IGZpbGVTZWFyY2g7XG4gIHJldHVybiBmaWxlU2VhcmNoO1xufVxuXG5sZXQgcGF0aFNldFVwZGF0ZXI7XG5cbmZ1bmN0aW9uIGdldFBhdGhTZXRVcGRhdGVyKCkge1xuICBpZiAoIXBhdGhTZXRVcGRhdGVyKSB7XG4gICAgcGF0aFNldFVwZGF0ZXIgPSBuZXcgUGF0aFNldFVwZGF0ZXIoKTtcbiAgfVxuICByZXR1cm4gcGF0aFNldFVwZGF0ZXI7XG59XG5cbi8vIFRoZSByZXR1cm4gdmFsdWVzIG9mIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIG11c3QgYmUgSlNPTi1zZXJpYWxpemFibGUgc28gdGhleVxuLy8gY2FuIGJlIHNlbnQgYWNyb3NzIGEgcHJvY2VzcyBib3VuZGFyeS5cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRGaWxlU2VhcmNoRm9yRGlyZWN0b3J5KGRpcmVjdG9yeVVyaTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGF3YWl0IGZpbGVTZWFyY2hGb3JEaXJlY3RvcnkoZGlyZWN0b3J5VXJpKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvU2VhcmNoKFxuICBkaXJlY3RvcnlVcmk6IHN0cmluZyxcbiAgcXVlcnk6IHN0cmluZyxcbik6IFByb21pc2U8QXJyYXk8RmlsZVNlYXJjaFJlc3VsdD4+IHtcbiAgY29uc3QgZmlsZVNlYXJjaCA9IGF3YWl0IGZpbGVTZWFyY2hGb3JEaXJlY3RvcnkoZGlyZWN0b3J5VXJpKTtcbiAgcmV0dXJuIGZpbGVTZWFyY2gucXVlcnkocXVlcnkpO1xufVxuIl19