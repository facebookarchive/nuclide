Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var fileSearchForDirectory = _asyncToGenerator(function* (directoryUri, pathSetUpdater) {
  var fileSearch = fileSearchForDirectoryUri[directoryUri];
  if (fileSearch) {
    return fileSearch;
  }

  var realpath = yield _nuclideCommons.fsPromise.realpath((0, _nuclideRemoteUri.parse)(directoryUri).path);
  var paths = yield (0, _PathSetFactory.getPaths)(realpath);
  var pathSet = new _PathSet.PathSet(paths);

  var thisPathSetUpdater = pathSetUpdater || getPathSetUpdater();
  try {
    yield thisPathSetUpdater.startUpdatingPathSet(pathSet, realpath);
  } catch (e) {
    logger.warn('Could not update path sets for ' + realpath + '. Searches may be stale', e);
    // TODO(hansonw): Fall back to manual refresh or node watches
  }

  // TODO: Stop updating the pathSet when the fileSearch is torn down. But
  // currently the fileSearch is never torn down.

  fileSearch = new FileSearch(directoryUri, pathSet);
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

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideLogging = require('../../nuclide-logging');

var _PathSet = require('./PathSet');

var _PathSetFactory = require('./PathSetFactory');

var _PathSetUpdater = require('./PathSetUpdater');

var _PathSetUpdater2 = _interopRequireDefault(_PathSetUpdater);

var logger = (0, _nuclideLogging.getLogger)();

var FileSearch = (function () {
  function FileSearch(fullUri, pathSet) {
    _classCallCheck(this, FileSearch);

    this._originalUri = fullUri;
    this._pathSet = pathSet;
  }

  _createClass(FileSearch, [{
    key: 'query',
    value: _asyncToGenerator(function* (_query) {
      var _this = this;

      var results = this._pathSet.match(_query).map(function (result) {
        var matchIndexes = result.matchIndexes;

        if (matchIndexes != null) {
          matchIndexes = matchIndexes.map(function (idx) {
            return idx + _this._originalUri.length + 1;
          });
        }
        return {
          score: result.score,
          path: (0, _urlJoin2['default'])(_this._originalUri, '/', result.value),
          matchIndexes: matchIndexes || []
        };
      });
      return results;
    })
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
//# sourceMappingURL=data:application/json;base64,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O0FBK0JyQyxJQUFJLGNBQWMsWUFBQSxDQUFDOztBQUVuQixTQUFTLGlCQUFpQixHQUFHO0FBQzNCLE1BQUksQ0FBQyxjQUFjLEVBQUU7QUFDbkIsWUEvQkYsY0FBK0IsR0ErQjdCLGNBQWMsR0FBRyxpQ0FBb0IsQ0FBQztHQUN2QztBQUNELFNBQU8sY0FBYyxDQUFDO0NBQ3ZCIiwiZmlsZSI6IkZpbGVTZWFyY2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdXJsSm9pbiBmcm9tICd1cmwtam9pbic7XG5cbmltcG9ydCB7cGFyc2V9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQge2ZzUHJvbWlzZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuXG5pbXBvcnQge1BhdGhTZXR9IGZyb20gJy4vUGF0aFNldCc7XG5pbXBvcnQge2dldFBhdGhzfSBmcm9tICcuL1BhdGhTZXRGYWN0b3J5JztcbmltcG9ydCBQYXRoU2V0VXBkYXRlciBmcm9tICcuL1BhdGhTZXRVcGRhdGVyJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbmV4cG9ydCB0eXBlIEZpbGVTZWFyY2hSZXN1bHQgPSB7XG4gIHNjb3JlOiBudW1iZXI7XG4gIHBhdGg6IHN0cmluZztcbiAgbWF0Y2hJbmRleGVzOiBBcnJheTxudW1iZXI+O1xufTtcblxuY2xhc3MgRmlsZVNlYXJjaCB7XG4gIF9vcmlnaW5hbFVyaTogc3RyaW5nO1xuICBfcGF0aFNldDogUGF0aFNldDtcblxuICBjb25zdHJ1Y3RvcihmdWxsVXJpOiBzdHJpbmcsIHBhdGhTZXQ6IFBhdGhTZXQpIHtcbiAgICB0aGlzLl9vcmlnaW5hbFVyaSA9IGZ1bGxVcmk7XG4gICAgdGhpcy5fcGF0aFNldCA9IHBhdGhTZXQ7XG4gIH1cblxuICBhc3luYyBxdWVyeShxdWVyeTogc3RyaW5nKTogUHJvbWlzZTxBcnJheTxGaWxlU2VhcmNoUmVzdWx0Pj4ge1xuICAgIGNvbnN0IHJlc3VsdHMgPSB0aGlzLl9wYXRoU2V0Lm1hdGNoKHF1ZXJ5KS5tYXAocmVzdWx0ID0+IHtcbiAgICAgIGxldCB7bWF0Y2hJbmRleGVzfSA9IHJlc3VsdDtcbiAgICAgIGlmIChtYXRjaEluZGV4ZXMgIT0gbnVsbCkge1xuICAgICAgICBtYXRjaEluZGV4ZXMgPSBtYXRjaEluZGV4ZXMubWFwKGlkeCA9PiBpZHggKyB0aGlzLl9vcmlnaW5hbFVyaS5sZW5ndGggKyAxKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNjb3JlOiByZXN1bHQuc2NvcmUsXG4gICAgICAgIHBhdGg6IHVybEpvaW4odGhpcy5fb3JpZ2luYWxVcmksICcvJywgcmVzdWx0LnZhbHVlKSxcbiAgICAgICAgbWF0Y2hJbmRleGVzOiBtYXRjaEluZGV4ZXMgfHwgW10sXG4gICAgICB9O1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG59XG5cbmNvbnN0IGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlVcmkgPSB7fTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZpbGVTZWFyY2hGb3JEaXJlY3RvcnkoXG4gIGRpcmVjdG9yeVVyaTogc3RyaW5nLFxuICBwYXRoU2V0VXBkYXRlcjogP1BhdGhTZXRVcGRhdGVyLFxuKTogUHJvbWlzZTxGaWxlU2VhcmNoPiB7XG4gIGxldCBmaWxlU2VhcmNoID0gZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaVtkaXJlY3RvcnlVcmldO1xuICBpZiAoZmlsZVNlYXJjaCkge1xuICAgIHJldHVybiBmaWxlU2VhcmNoO1xuICB9XG5cbiAgY29uc3QgcmVhbHBhdGggPSBhd2FpdCBmc1Byb21pc2UucmVhbHBhdGgocGFyc2UoZGlyZWN0b3J5VXJpKS5wYXRoKTtcbiAgY29uc3QgcGF0aHMgPSBhd2FpdCBnZXRQYXRocyhyZWFscGF0aCk7XG4gIGNvbnN0IHBhdGhTZXQgPSBuZXcgUGF0aFNldChwYXRocyk7XG5cbiAgY29uc3QgdGhpc1BhdGhTZXRVcGRhdGVyID0gcGF0aFNldFVwZGF0ZXIgfHwgZ2V0UGF0aFNldFVwZGF0ZXIoKTtcbiAgdHJ5IHtcbiAgICBhd2FpdCB0aGlzUGF0aFNldFVwZGF0ZXIuc3RhcnRVcGRhdGluZ1BhdGhTZXQocGF0aFNldCwgcmVhbHBhdGgpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgbG9nZ2VyLndhcm4oYENvdWxkIG5vdCB1cGRhdGUgcGF0aCBzZXRzIGZvciAke3JlYWxwYXRofS4gU2VhcmNoZXMgbWF5IGJlIHN0YWxlYCwgZSk7XG4gICAgLy8gVE9ETyhoYW5zb253KTogRmFsbCBiYWNrIHRvIG1hbnVhbCByZWZyZXNoIG9yIG5vZGUgd2F0Y2hlc1xuICB9XG5cbiAgLy8gVE9ETzogU3RvcCB1cGRhdGluZyB0aGUgcGF0aFNldCB3aGVuIHRoZSBmaWxlU2VhcmNoIGlzIHRvcm4gZG93bi4gQnV0XG4gIC8vIGN1cnJlbnRseSB0aGUgZmlsZVNlYXJjaCBpcyBuZXZlciB0b3JuIGRvd24uXG5cbiAgZmlsZVNlYXJjaCA9IG5ldyBGaWxlU2VhcmNoKGRpcmVjdG9yeVVyaSwgcGF0aFNldCk7XG4gIGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlVcmlbZGlyZWN0b3J5VXJpXSA9IGZpbGVTZWFyY2g7XG4gIHJldHVybiBmaWxlU2VhcmNoO1xufVxuXG5sZXQgcGF0aFNldFVwZGF0ZXI7XG5cbmZ1bmN0aW9uIGdldFBhdGhTZXRVcGRhdGVyKCkge1xuICBpZiAoIXBhdGhTZXRVcGRhdGVyKSB7XG4gICAgcGF0aFNldFVwZGF0ZXIgPSBuZXcgUGF0aFNldFVwZGF0ZXIoKTtcbiAgfVxuICByZXR1cm4gcGF0aFNldFVwZGF0ZXI7XG59XG5cbi8vIFRoZSByZXR1cm4gdmFsdWVzIG9mIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIG11c3QgYmUgSlNPTi1zZXJpYWxpemFibGUgc28gdGhleVxuLy8gY2FuIGJlIHNlbnQgYWNyb3NzIGEgcHJvY2VzcyBib3VuZGFyeS5cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGluaXRGaWxlU2VhcmNoRm9yRGlyZWN0b3J5KGRpcmVjdG9yeVVyaTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gIGF3YWl0IGZpbGVTZWFyY2hGb3JEaXJlY3RvcnkoZGlyZWN0b3J5VXJpKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRvU2VhcmNoKFxuICBkaXJlY3RvcnlVcmk6IHN0cmluZyxcbiAgcXVlcnk6IHN0cmluZyxcbik6IFByb21pc2U8QXJyYXk8RmlsZVNlYXJjaFJlc3VsdD4+IHtcbiAgY29uc3QgZmlsZVNlYXJjaCA9IGF3YWl0IGZpbGVTZWFyY2hGb3JEaXJlY3RvcnkoZGlyZWN0b3J5VXJpKTtcbiAgcmV0dXJuIGZpbGVTZWFyY2gucXVlcnkocXVlcnkpO1xufVxuIl19