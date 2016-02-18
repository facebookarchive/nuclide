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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVTZWFyY2guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7OztJQWtGc0Isc0JBQXNCLHFCQUFyQyxXQUNMLFlBQW9CLEVBQ3BCLGNBQStCLEVBQ1Y7QUFDckIsTUFBSSxVQUFVLEdBQUcseUJBQXlCLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDekQsTUFBSSxVQUFVLEVBQUU7QUFDZCxXQUFPLFVBQVUsQ0FBQztHQUNuQjs7QUFFRCxNQUFNLFFBQVEsR0FBRyxNQUFNLG1CQUFVLFFBQVEsQ0FBQyxzQkFBTSxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwRSxNQUFNLE9BQU8sR0FBRyxNQUFNLG1DQUFjLFFBQVEsQ0FBQyxDQUFDOztBQUU5QyxNQUFNLGtCQUFrQixHQUFHLGNBQWMsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0FBQ2pFLFFBQU0sa0JBQWtCLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDOzs7OztBQUtqRSxNQUFNLFVBQVUsR0FBRyw0QkFBZSxPQUFPLENBQUMsQ0FBQztBQUMzQyxZQUFVLEdBQUcsSUFBSSxVQUFVLENBQUMsUUFBUSxFQUFFLFlBQVksRUFBRSxVQUFVLENBQUMsQ0FBQztBQUNoRSwyQkFBeUIsQ0FBQyxZQUFZLENBQUMsR0FBRyxVQUFVLENBQUM7QUFDckQsU0FBTyxVQUFVLENBQUM7Q0FDbkI7Ozs7Ozs7SUFjcUIsMEJBQTBCLHFCQUF6QyxXQUEwQyxZQUFvQixFQUFpQjtBQUNwRixRQUFNLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxDQUFDO0NBQzVDOzs7O0lBRXFCLFFBQVEscUJBQXZCLFdBQ0wsWUFBb0IsRUFDcEIsS0FBYSxFQUNxQjtBQUNsQyxNQUFNLFVBQVUsR0FBRyxNQUFNLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzlELFNBQU8sVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztDQUNoQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O3VCQXJIbUIsVUFBVTs7Ozt5QkFFVixrQkFBa0I7O3VCQUNkLGVBQWU7OzhCQUVYLGtCQUFrQjs7MEJBQ3ZCLGNBQWM7Ozs7OEJBQ1Ysa0JBQWtCOzs7Ozs7Ozs7Ozs7Ozs7SUFrQnZDLFVBQVU7QUFLSCxXQUxQLFVBQVUsQ0FLRixjQUFzQixFQUFFLE9BQWUsRUFBRSxVQUFzQixFQUFFOzBCQUx6RSxVQUFVOztBQU1aLFFBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0FBQ3RDLFFBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDO0FBQzVCLFFBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0dBQy9COztlQVRHLFVBQVU7OzZCQVdILFdBQUMsTUFBYSxFQUFvQzs7O0FBQzNELFVBQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBSyxDQUFDLENBQUM7O0FBRXhELFVBQU0sT0FBZ0MsR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFBLE1BQU0sRUFBSTtBQUN2RSxZQUFNLFlBQVksR0FBRztBQUNuQixlQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7QUFDbkIsY0FBSSxFQUFFLDBCQUFRLE1BQUssWUFBWSxFQUFFLEdBQUcsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDO0FBQ25ELHNCQUFZLEVBQUUsRUFBRTtTQUNqQixDQUFDO0FBQ0YsWUFBSSxNQUFNLENBQUMsWUFBWSxFQUFFO0FBQ3ZCLHNCQUFZLENBQUMsWUFBWSxHQUN2QixNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFBLEtBQUs7bUJBQUksS0FBSyxHQUFHLE1BQUssWUFBWSxDQUFDLE1BQU0sR0FBRyxDQUFDO1dBQUEsQ0FBQyxDQUFDO1NBQzFFO0FBQ0QsZUFBTyxZQUFZLENBQUM7T0FDckIsQ0FBQyxDQUFDO0FBQ0gsYUFBTyxPQUFPLENBQUM7S0FDaEI7OztXQUVnQiw2QkFBVztBQUMxQixhQUFPLElBQUksQ0FBQyxlQUFlLENBQUM7S0FDN0I7OztXQUVhLDBCQUFXO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztLQUMxQjs7O1NBbkNHLFVBQVU7OztBQXNDaEIsSUFBTSx5QkFBeUIsR0FBRyxFQUFFLENBQUM7O0FBZ0NyQyxJQUFJLGNBQWMsWUFBQSxDQUFDOztBQUVuQixTQUFTLGlCQUFpQixHQUFHO0FBQzNCLE1BQUksQ0FBQyxjQUFjLEVBQUU7QUFDbkIsWUExQkYsY0FBK0IsR0EwQjdCLGNBQWMsR0FBRyxpQ0FBb0IsQ0FBQztHQUN2QztBQUNELFNBQU8sY0FBYyxDQUFDO0NBQ3ZCIiwiZmlsZSI6IkZpbGVTZWFyY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdXJsSm9pbiBmcm9tICd1cmwtam9pbic7XG5cbmltcG9ydCB7cGFyc2V9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHtmc1Byb21pc2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuXG5pbXBvcnQge2NyZWF0ZVBhdGhTZXR9IGZyb20gJy4vUGF0aFNldEZhY3RvcnknO1xuaW1wb3J0IFBhdGhTZWFyY2ggZnJvbSAnLi9QYXRoU2VhcmNoJztcbmltcG9ydCBQYXRoU2V0VXBkYXRlciBmcm9tICcuL1BhdGhTZXRVcGRhdGVyJztcblxuZXhwb3J0IHR5cGUgRmlsZVNlYXJjaFJlc3VsdCA9IHtcbiAgc2NvcmU6IG51bWJlcixcbiAgcGF0aDogc3RyaW5nLFxuICBtYXRjaEluZGV4ZXM6IEFycmF5PG51bWJlcj4sXG59O1xuXG4vKipcbiAqIFV0aWxpdHkgdG8gc2VhcmNoIHRoZSBzZXQgb2YgZmlsZXMgdW5kZXIgYGxvY2FsRGlyZWN0b3J5YC4gSXQgYXR0ZW1wdHMgdG8gdXNlXG4gKiBzb3VyY2UgY29udHJvbCB0byBwb3B1bGF0ZSB0aGUgc2VhcmNoIHNwYWNlIHF1aWNrbHksIGFzIHdlbGwgYXMgdG8gZXhjbHVkZVxuICogc291cmNlIGNvbnRyb2wgbWV0YWRhdGEgZmlsZXMgZnJvbSBzZWFyY2guXG4gKlxuICogQHBhcmFtIGxvY2FsRGlyZWN0b3J5IHRoZSBkaXJlY3Rvcnkgd2hvc2UgZmlsZXMgc2hvdWxkIGJlIHNlYXJjaGVkXG4gKiBAcGFyYW0gZnVsbFVyaSBpcyB0aGUgb3JpZ2luYWwgcGF0aCBwcm92aWRlZCB0byBgZmlsZVNlYXJjaEZvckRpcmVjdG9yeWAsXG4gKiAgICAgd2hpY2ggaXMgcHJlcGVuZGVkIHRvIGFsbCByZXN1bHRzLlxuICogQHBhcmFtIHBhdGhTZWFyY2ggZGVsZWdhdGUgdG8gdXNlIGZvciB0aGUgYWN0dWFsIHNlYXJjaGluZy5cbiAqL1xuY2xhc3MgRmlsZVNlYXJjaCB7XG4gIF9sb2NhbERpcmVjdG9yeTogc3RyaW5nO1xuICBfb3JpZ2luYWxVcmk6IHN0cmluZztcbiAgX3BhdGhTZWFyY2g6IFBhdGhTZWFyY2g7XG5cbiAgY29uc3RydWN0b3IobG9jYWxEaXJlY3Rvcnk6IHN0cmluZywgZnVsbFVyaTogc3RyaW5nLCBwYXRoU2VhcmNoOiBQYXRoU2VhcmNoKSB7XG4gICAgdGhpcy5fbG9jYWxEaXJlY3RvcnkgPSBsb2NhbERpcmVjdG9yeTtcbiAgICB0aGlzLl9vcmlnaW5hbFVyaSA9IGZ1bGxVcmk7XG4gICAgdGhpcy5fcGF0aFNlYXJjaCA9IHBhdGhTZWFyY2g7XG4gIH1cblxuICBhc3luYyBxdWVyeShxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxGaWxlU2VhcmNoUmVzdWx0Pj4ge1xuICAgIGNvbnN0IHJlc3VsdFNldCA9IGF3YWl0IHRoaXMuX3BhdGhTZWFyY2guZG9RdWVyeShxdWVyeSk7XG4gICAgLy8gVE9ETzogQ2FjaGUgdGhlIHJlc3VsdCBvZiB0aGlzIGNhbGwgdG8gbWFwKCkuXG4gICAgY29uc3QgcmVzdWx0czogQXJyYXk8RmlsZVNlYXJjaFJlc3VsdD4gPSByZXN1bHRTZXQucmVzdWx0cy5tYXAocmVzdWx0ID0+IHtcbiAgICAgIGNvbnN0IG1hcHBlZFJlc3VsdCA9IHtcbiAgICAgICAgc2NvcmU6IHJlc3VsdC5zY29yZSxcbiAgICAgICAgcGF0aDogdXJsSm9pbih0aGlzLl9vcmlnaW5hbFVyaSwgJy8nLCByZXN1bHQudmFsdWUpLFxuICAgICAgICBtYXRjaEluZGV4ZXM6IFtdLFxuICAgICAgfTtcbiAgICAgIGlmIChyZXN1bHQubWF0Y2hJbmRleGVzKSB7XG4gICAgICAgIG1hcHBlZFJlc3VsdC5tYXRjaEluZGV4ZXMgPVxuICAgICAgICAgIHJlc3VsdC5tYXRjaEluZGV4ZXMubWFwKGluZGV4ID0+IGluZGV4ICsgdGhpcy5fb3JpZ2luYWxVcmkubGVuZ3RoICsgMSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFwcGVkUmVzdWx0O1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgZ2V0TG9jYWxEaXJlY3RvcnkoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fbG9jYWxEaXJlY3Rvcnk7XG4gIH1cblxuICBnZXRGdWxsQmFzZVVyaSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9vcmlnaW5hbFVyaTtcbiAgfVxufVxuXG5jb25zdCBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5VXJpID0ge307XG5cbi8qKlxuICogRmlsZVNlYXJjaCBpcyBhbiBvYmplY3Qgd2l0aCBhIHF1ZXJ5KCkgbWV0aG9kLiBDdXJyZW50bHksIHRoaXMgaXMgdmlzaWJsZSBvbmx5IGZvciB0ZXN0aW5nLlxuICogQHBhcmFtIGRpcmVjdG9yeVVyaSBUaGUgZGlyZWN0b3J5IHRvIGdldCB0aGUgRmlsZVNlYXJjaCBmb3IuXG4gKiBAcGFyYW0gcGF0aFNldFVwZGF0ZXIgRXhwb3NlZCBmb3IgdGVzdGluZyBwdXJwb3Nlcy4gVGhlIHBhdGhTZXRVcGRhdGVyIHRvIHVzZVxuICogICBpbiB0aGlzIG1ldGhvZC0tbGlrZWx5IGEgbW9jay5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbGVTZWFyY2hGb3JEaXJlY3RvcnkoXG4gIGRpcmVjdG9yeVVyaTogc3RyaW5nLFxuICBwYXRoU2V0VXBkYXRlcjogP1BhdGhTZXRVcGRhdGVyLFxuKTogUHJvbWlzZTxGaWxlU2VhcmNoPiB7XG4gIGxldCBmaWxlU2VhcmNoID0gZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaVtkaXJlY3RvcnlVcmldO1xuICBpZiAoZmlsZVNlYXJjaCkge1xuICAgIHJldHVybiBmaWxlU2VhcmNoO1xuICB9XG5cbiAgY29uc3QgcmVhbHBhdGggPSBhd2FpdCBmc1Byb21pc2UucmVhbHBhdGgocGFyc2UoZGlyZWN0b3J5VXJpKS5wYXRoKTtcbiAgY29uc3QgcGF0aFNldCA9IGF3YWl0IGNyZWF0ZVBhdGhTZXQocmVhbHBhdGgpO1xuXG4gIGNvbnN0IHRoaXNQYXRoU2V0VXBkYXRlciA9IHBhdGhTZXRVcGRhdGVyIHx8IGdldFBhdGhTZXRVcGRhdGVyKCk7XG4gIGF3YWl0IHRoaXNQYXRoU2V0VXBkYXRlci5zdGFydFVwZGF0aW5nUGF0aFNldChwYXRoU2V0LCByZWFscGF0aCk7XG5cbiAgLy8gVE9ETzogU3RvcCB1cGRhdGluZyB0aGUgcGF0aFNldCB3aGVuIHRoZSBmaWxlU2VhcmNoIGlzIHRvcm4gZG93bi4gQnV0XG4gIC8vIGN1cnJlbnRseSB0aGUgZmlsZVNlYXJjaCBpcyBuZXZlciB0b3JuIGRvd24uXG5cbiAgY29uc3QgcGF0aFNlYXJjaCA9IG5ldyBQYXRoU2VhcmNoKHBhdGhTZXQpO1xuICBmaWxlU2VhcmNoID0gbmV3IEZpbGVTZWFyY2gocmVhbHBhdGgsIGRpcmVjdG9yeVVyaSwgcGF0aFNlYXJjaCk7XG4gIGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlVcmlbZGlyZWN0b3J5VXJpXSA9IGZpbGVTZWFyY2g7XG4gIHJldHVybiBmaWxlU2VhcmNoO1xufVxuXG5sZXQgcGF0aFNldFVwZGF0ZXI7XG5cbmZ1bmN0aW9uIGdldFBhdGhTZXRVcGRhdGVyKCkge1xuICBpZiAoIXBhdGhTZXRVcGRhdGVyKSB7XG4gICAgcGF0aFNldFVwZGF0ZXIgPSBuZXcgUGF0aFNldFVwZGF0ZXIoKTtcbiAgfVxuICByZXR1cm4gcGF0aFNldFVwZGF0ZXI7XG59XG5cbi8vIFRoZSByZXR1cm4gdmFsdWVzIG9mIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIG11c3QgYmUgSlNPTi1zZXJpYWxpemFibGUgc28gdGhleVxuLy8gY2FuIGJlIHNlbnQgYWNyb3NzIGEgcHJvY2VzcyBib3VuZGFyeS5cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRGaWxlU2VhcmNoRm9yRGlyZWN0b3J5KGRpcmVjdG9yeVVyaTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGF3YWl0IGZpbGVTZWFyY2hGb3JEaXJlY3RvcnkoZGlyZWN0b3J5VXJpKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvU2VhcmNoKFxuICBkaXJlY3RvcnlVcmk6IHN0cmluZyxcbiAgcXVlcnk6IHN0cmluZyxcbik6IFByb21pc2U8QXJyYXk8RmlsZVNlYXJjaFJlc3VsdD4+IHtcbiAgY29uc3QgZmlsZVNlYXJjaCA9IGF3YWl0IGZpbGVTZWFyY2hGb3JEaXJlY3RvcnkoZGlyZWN0b3J5VXJpKTtcbiAgcmV0dXJuIGZpbGVTZWFyY2gucXVlcnkocXVlcnkpO1xufVxuIl19