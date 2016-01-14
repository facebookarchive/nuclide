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
//# sourceMappingURL=data:application/json;base64,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QUFXO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztLQUMxQjs7O1NBbkNHLFVBQVU7OztBQXNDaEIsSUFBTSx5QkFBeUIsR0FBRyxFQUFFLENBQUM7O0FBZ0NyQyxJQUFJLGNBQWMsWUFBQSxDQUFDOztBQUVuQixTQUFTLGlCQUFpQixHQUFHO0FBQzNCLE1BQUksQ0FBQyxjQUFjLEVBQUU7QUFDbkIsWUExQkYsY0FBK0IsR0EwQjdCLGNBQWMsR0FBRyxpQ0FBb0IsQ0FBQztHQUN2QztBQUNELFNBQU8sY0FBYyxDQUFDO0NBQ3ZCIiwiZmlsZSI6IkZpbGVTZWFyY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdXJsSm9pbiBmcm9tICd1cmwtam9pbic7XG5cbmltcG9ydCB7cGFyc2V9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHtmc1Byb21pc2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuXG5pbXBvcnQge2NyZWF0ZVBhdGhTZXR9IGZyb20gJy4vUGF0aFNldEZhY3RvcnknO1xuaW1wb3J0IFBhdGhTZWFyY2ggZnJvbSAnLi9QYXRoU2VhcmNoJztcbmltcG9ydCBQYXRoU2V0VXBkYXRlciBmcm9tICcuL1BhdGhTZXRVcGRhdGVyJztcblxuZXhwb3J0IHR5cGUgRmlsZVNlYXJjaFJlc3VsdCA9IHtcbiAgc2NvcmU6IG51bWJlcjtcbiAgcGF0aDogc3RyaW5nO1xuICBtYXRjaEluZGV4ZXM6IEFycmF5PG51bWJlcj47XG59O1xuXG4vKipcbiAqIFV0aWxpdHkgdG8gc2VhcmNoIHRoZSBzZXQgb2YgZmlsZXMgdW5kZXIgYGxvY2FsRGlyZWN0b3J5YC4gSXQgYXR0ZW1wdHMgdG8gdXNlXG4gKiBzb3VyY2UgY29udHJvbCB0byBwb3B1bGF0ZSB0aGUgc2VhcmNoIHNwYWNlIHF1aWNrbHksIGFzIHdlbGwgYXMgdG8gZXhjbHVkZVxuICogc291cmNlIGNvbnRyb2wgbWV0YWRhdGEgZmlsZXMgZnJvbSBzZWFyY2guXG4gKlxuICogQHBhcmFtIGxvY2FsRGlyZWN0b3J5IHRoZSBkaXJlY3Rvcnkgd2hvc2UgZmlsZXMgc2hvdWxkIGJlIHNlYXJjaGVkXG4gKiBAcGFyYW0gZnVsbFVyaSBpcyB0aGUgb3JpZ2luYWwgcGF0aCBwcm92aWRlZCB0byBgZmlsZVNlYXJjaEZvckRpcmVjdG9yeWAsXG4gKiAgICAgd2hpY2ggaXMgcHJlcGVuZGVkIHRvIGFsbCByZXN1bHRzLlxuICogQHBhcmFtIHBhdGhTZWFyY2ggZGVsZWdhdGUgdG8gdXNlIGZvciB0aGUgYWN0dWFsIHNlYXJjaGluZy5cbiAqL1xuY2xhc3MgRmlsZVNlYXJjaCB7XG4gIF9sb2NhbERpcmVjdG9yeTogc3RyaW5nO1xuICBfb3JpZ2luYWxVcmk6IHN0cmluZztcbiAgX3BhdGhTZWFyY2g6IFBhdGhTZWFyY2g7XG5cbiAgY29uc3RydWN0b3IobG9jYWxEaXJlY3Rvcnk6IHN0cmluZywgZnVsbFVyaTogc3RyaW5nLCBwYXRoU2VhcmNoOiBQYXRoU2VhcmNoKSB7XG4gICAgdGhpcy5fbG9jYWxEaXJlY3RvcnkgPSBsb2NhbERpcmVjdG9yeTtcbiAgICB0aGlzLl9vcmlnaW5hbFVyaSA9IGZ1bGxVcmk7XG4gICAgdGhpcy5fcGF0aFNlYXJjaCA9IHBhdGhTZWFyY2g7XG4gIH1cblxuICBhc3luYyBxdWVyeShxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxGaWxlU2VhcmNoUmVzdWx0Pj4ge1xuICAgIGNvbnN0IHJlc3VsdFNldCA9IGF3YWl0IHRoaXMuX3BhdGhTZWFyY2guZG9RdWVyeShxdWVyeSk7XG4gICAgLy8gVE9ETzogQ2FjaGUgdGhlIHJlc3VsdCBvZiB0aGlzIGNhbGwgdG8gbWFwKCkuXG4gICAgY29uc3QgcmVzdWx0czogQXJyYXk8RmlsZVNlYXJjaFJlc3VsdD4gPSByZXN1bHRTZXQucmVzdWx0cy5tYXAocmVzdWx0ID0+IHtcbiAgICAgIGNvbnN0IG1hcHBlZFJlc3VsdCA9IHtcbiAgICAgICAgc2NvcmU6IHJlc3VsdC5zY29yZSxcbiAgICAgICAgcGF0aDogdXJsSm9pbih0aGlzLl9vcmlnaW5hbFVyaSwgJy8nLCByZXN1bHQudmFsdWUpLFxuICAgICAgICBtYXRjaEluZGV4ZXM6IFtdLFxuICAgICAgfTtcbiAgICAgIGlmIChyZXN1bHQubWF0Y2hJbmRleGVzKSB7XG4gICAgICAgIG1hcHBlZFJlc3VsdC5tYXRjaEluZGV4ZXMgPVxuICAgICAgICAgIHJlc3VsdC5tYXRjaEluZGV4ZXMubWFwKChpbmRleCkgPT4gaW5kZXggKyB0aGlzLl9vcmlnaW5hbFVyaS5sZW5ndGggKyAxKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtYXBwZWRSZXN1bHQ7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH1cblxuICBnZXRMb2NhbERpcmVjdG9yeSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9sb2NhbERpcmVjdG9yeTtcbiAgfVxuXG4gIGdldEZ1bGxCYXNlVXJpKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX29yaWdpbmFsVXJpO1xuICB9XG59XG5cbmNvbnN0IGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlVcmkgPSB7fTtcblxuLyoqXG4gKiBGaWxlU2VhcmNoIGlzIGFuIG9iamVjdCB3aXRoIGEgcXVlcnkoKSBtZXRob2QuIEN1cnJlbnRseSwgdGhpcyBpcyB2aXNpYmxlIG9ubHkgZm9yIHRlc3RpbmcuXG4gKiBAcGFyYW0gZGlyZWN0b3J5VXJpIFRoZSBkaXJlY3RvcnkgdG8gZ2V0IHRoZSBGaWxlU2VhcmNoIGZvci5cbiAqIEBwYXJhbSBwYXRoU2V0VXBkYXRlciBFeHBvc2VkIGZvciB0ZXN0aW5nIHB1cnBvc2VzLiBUaGUgcGF0aFNldFVwZGF0ZXIgdG8gdXNlXG4gKiAgIGluIHRoaXMgbWV0aG9kLS1saWtlbHkgYSBtb2NrLlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmlsZVNlYXJjaEZvckRpcmVjdG9yeShcbiAgZGlyZWN0b3J5VXJpOiBzdHJpbmcsXG4gIHBhdGhTZXRVcGRhdGVyOiA/UGF0aFNldFVwZGF0ZXIsXG4pOiBQcm9taXNlPEZpbGVTZWFyY2g+IHtcbiAgbGV0IGZpbGVTZWFyY2ggPSBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5VXJpW2RpcmVjdG9yeVVyaV07XG4gIGlmIChmaWxlU2VhcmNoKSB7XG4gICAgcmV0dXJuIGZpbGVTZWFyY2g7XG4gIH1cblxuICBjb25zdCByZWFscGF0aCA9IGF3YWl0IGZzUHJvbWlzZS5yZWFscGF0aChwYXJzZShkaXJlY3RvcnlVcmkpLnBhdGgpO1xuICBjb25zdCBwYXRoU2V0ID0gYXdhaXQgY3JlYXRlUGF0aFNldChyZWFscGF0aCk7XG5cbiAgY29uc3QgdGhpc1BhdGhTZXRVcGRhdGVyID0gcGF0aFNldFVwZGF0ZXIgfHwgZ2V0UGF0aFNldFVwZGF0ZXIoKTtcbiAgYXdhaXQgdGhpc1BhdGhTZXRVcGRhdGVyLnN0YXJ0VXBkYXRpbmdQYXRoU2V0KHBhdGhTZXQsIHJlYWxwYXRoKTtcblxuICAvLyBUT0RPOiBTdG9wIHVwZGF0aW5nIHRoZSBwYXRoU2V0IHdoZW4gdGhlIGZpbGVTZWFyY2ggaXMgdG9ybiBkb3duLiBCdXRcbiAgLy8gY3VycmVudGx5IHRoZSBmaWxlU2VhcmNoIGlzIG5ldmVyIHRvcm4gZG93bi5cblxuICBjb25zdCBwYXRoU2VhcmNoID0gbmV3IFBhdGhTZWFyY2gocGF0aFNldCk7XG4gIGZpbGVTZWFyY2ggPSBuZXcgRmlsZVNlYXJjaChyZWFscGF0aCwgZGlyZWN0b3J5VXJpLCBwYXRoU2VhcmNoKTtcbiAgZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaVtkaXJlY3RvcnlVcmldID0gZmlsZVNlYXJjaDtcbiAgcmV0dXJuIGZpbGVTZWFyY2g7XG59XG5cbmxldCBwYXRoU2V0VXBkYXRlcjtcblxuZnVuY3Rpb24gZ2V0UGF0aFNldFVwZGF0ZXIoKSB7XG4gIGlmICghcGF0aFNldFVwZGF0ZXIpIHtcbiAgICBwYXRoU2V0VXBkYXRlciA9IG5ldyBQYXRoU2V0VXBkYXRlcigpO1xuICB9XG4gIHJldHVybiBwYXRoU2V0VXBkYXRlcjtcbn1cblxuLy8gVGhlIHJldHVybiB2YWx1ZXMgb2YgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgbXVzdCBiZSBKU09OLXNlcmlhbGl6YWJsZSBzbyB0aGV5XG4vLyBjYW4gYmUgc2VudCBhY3Jvc3MgYSBwcm9jZXNzIGJvdW5kYXJ5LlxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdEZpbGVTZWFyY2hGb3JEaXJlY3RvcnkoZGlyZWN0b3J5VXJpOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgYXdhaXQgZmlsZVNlYXJjaEZvckRpcmVjdG9yeShkaXJlY3RvcnlVcmkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG9TZWFyY2goXG4gIGRpcmVjdG9yeVVyaTogc3RyaW5nLFxuICBxdWVyeTogc3RyaW5nLFxuKTogUHJvbWlzZTxBcnJheTxGaWxlU2VhcmNoUmVzdWx0Pj4ge1xuICBjb25zdCBmaWxlU2VhcmNoID0gYXdhaXQgZmlsZVNlYXJjaEZvckRpcmVjdG9yeShkaXJlY3RvcnlVcmkpO1xuICByZXR1cm4gZmlsZVNlYXJjaC5xdWVyeShxdWVyeSk7XG59XG4iXX0=