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

var fileSearchForDirectory = _asyncToGenerator(function* (directoryUri, pathSetUpdater) {
  var fileSearch = fileSearchForDirectoryUri[directoryUri];
  if (fileSearch) {
    return fileSearch;
  }

  var realpath = yield _commons.fsPromise.realpath((0, _remoteUri.parse)(directoryUri).path);
  var paths = yield (0, _PathSetFactory.getPaths)(realpath);
  var pathSet = new _NativePathSet.NativePathSet(Object.keys(paths));

  var thisPathSetUpdater = pathSetUpdater || getPathSetUpdater();
  try {
    yield thisPathSetUpdater.startUpdatingPathSet(pathSet, realpath);
  } catch (e) {
    logger.warn('Could not update path sets for ' + realpath + '. Searches may be stale', e);
    // TODO(hansonw): Fall back to manual refresh or node watches
  }

  // TODO: Stop updating the pathSet when the fileSearch is torn down. But
  // currently the fileSearch is never torn down.

  fileSearch = new NativeFileSearch(directoryUri, pathSet);
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

var _urlJoin = require('url-join');

var _urlJoin2 = _interopRequireDefault(_urlJoin);

var _remoteUri = require('../../remote-uri');

var _commons = require('../../commons');

var _logging = require('../../logging');

var _NativePathSet = require('./NativePathSet');

var _PathSetFactory = require('./PathSetFactory');

var _PathSetUpdater = require('./PathSetUpdater');

var _PathSetUpdater2 = _interopRequireDefault(_PathSetUpdater);

var logger = (0, _logging.getLogger)();

var NativeFileSearch = (function () {
  function NativeFileSearch(fullUri, pathSet) {
    _classCallCheck(this, NativeFileSearch);

    this._originalUri = fullUri;
    this._pathSet = pathSet;
  }

  _createClass(NativeFileSearch, [{
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

  return NativeFileSearch;
})();

var fileSearchForDirectoryUri = {};

var pathSetUpdater = undefined;

function getPathSetUpdater() {
  if (!pathSetUpdater) {
    exports.pathSetUpdater = pathSetUpdater = new _PathSetUpdater2['default']();
  }
  return pathSetUpdater;
}
//# sourceMappingURL=data:application/json;base64,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QUFnQjs7O0FBeUJ0QixJQUFNLHlCQUF5QixHQUFHLEVBQUUsQ0FBQzs7QUErQnJDLElBQUksY0FBYyxZQUFBLENBQUM7O0FBRW5CLFNBQVMsaUJBQWlCLEdBQUc7QUFDM0IsTUFBSSxDQUFDLGNBQWMsRUFBRTtBQUNuQixZQS9CRixjQUErQixHQStCN0IsY0FBYyxHQUFHLGlDQUFvQixDQUFDO0dBQ3ZDO0FBQ0QsU0FBTyxjQUFjLENBQUM7Q0FDdkIiLCJmaWxlIjoiTmF0aXZlRmlsZVNlYXJjaC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtGaWxlU2VhcmNoUmVzdWx0fSBmcm9tICcuL0ZpbGVTZWFyY2gnO1xuXG5pbXBvcnQgdXJsSm9pbiBmcm9tICd1cmwtam9pbic7XG5cbmltcG9ydCB7cGFyc2V9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHtmc1Byb21pc2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuXG5pbXBvcnQge05hdGl2ZVBhdGhTZXR9IGZyb20gJy4vTmF0aXZlUGF0aFNldCc7XG5pbXBvcnQge2dldFBhdGhzfSBmcm9tICcuL1BhdGhTZXRGYWN0b3J5JztcbmltcG9ydCBQYXRoU2V0VXBkYXRlciBmcm9tICcuL1BhdGhTZXRVcGRhdGVyJztcblxuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbmNsYXNzIE5hdGl2ZUZpbGVTZWFyY2gge1xuICBfb3JpZ2luYWxVcmk6IHN0cmluZztcbiAgX3BhdGhTZXQ6IE5hdGl2ZVBhdGhTZXQ7XG5cbiAgY29uc3RydWN0b3IoZnVsbFVyaTogc3RyaW5nLCBwYXRoU2V0OiBOYXRpdmVQYXRoU2V0KSB7XG4gICAgdGhpcy5fb3JpZ2luYWxVcmkgPSBmdWxsVXJpO1xuICAgIHRoaXMuX3BhdGhTZXQgPSBwYXRoU2V0O1xuICB9XG5cbiAgYXN5bmMgcXVlcnkocXVlcnk6IHN0cmluZyk6IFByb21pc2U8QXJyYXk8RmlsZVNlYXJjaFJlc3VsdD4+IHtcbiAgICBjb25zdCByZXN1bHRzID0gdGhpcy5fcGF0aFNldC5tYXRjaChxdWVyeSkubWFwKHJlc3VsdCA9PiB7XG4gICAgICBsZXQge21hdGNoSW5kZXhlc30gPSByZXN1bHQ7XG4gICAgICBpZiAobWF0Y2hJbmRleGVzICE9IG51bGwpIHtcbiAgICAgICAgbWF0Y2hJbmRleGVzID0gbWF0Y2hJbmRleGVzLm1hcChpZHggPT4gaWR4ICsgdGhpcy5fb3JpZ2luYWxVcmkubGVuZ3RoICsgMSk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzY29yZTogcmVzdWx0LnNjb3JlLFxuICAgICAgICBwYXRoOiB1cmxKb2luKHRoaXMuX29yaWdpbmFsVXJpLCAnLycsIHJlc3VsdC52YWx1ZSksXG4gICAgICAgIG1hdGNoSW5kZXhlczogbWF0Y2hJbmRleGVzIHx8IFtdLFxuICAgICAgfTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfVxufVxuXG5jb25zdCBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5VXJpID0ge307XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBmaWxlU2VhcmNoRm9yRGlyZWN0b3J5KFxuICBkaXJlY3RvcnlVcmk6IHN0cmluZyxcbiAgcGF0aFNldFVwZGF0ZXI6ID9QYXRoU2V0VXBkYXRlcixcbik6IFByb21pc2U8TmF0aXZlRmlsZVNlYXJjaD4ge1xuICBsZXQgZmlsZVNlYXJjaCA9IGZpbGVTZWFyY2hGb3JEaXJlY3RvcnlVcmlbZGlyZWN0b3J5VXJpXTtcbiAgaWYgKGZpbGVTZWFyY2gpIHtcbiAgICByZXR1cm4gZmlsZVNlYXJjaDtcbiAgfVxuXG4gIGNvbnN0IHJlYWxwYXRoID0gYXdhaXQgZnNQcm9taXNlLnJlYWxwYXRoKHBhcnNlKGRpcmVjdG9yeVVyaSkucGF0aCk7XG4gIGNvbnN0IHBhdGhzID0gYXdhaXQgZ2V0UGF0aHMocmVhbHBhdGgpO1xuICBjb25zdCBwYXRoU2V0ID0gbmV3IE5hdGl2ZVBhdGhTZXQoT2JqZWN0LmtleXMocGF0aHMpKTtcblxuICBjb25zdCB0aGlzUGF0aFNldFVwZGF0ZXIgPSBwYXRoU2V0VXBkYXRlciB8fCBnZXRQYXRoU2V0VXBkYXRlcigpO1xuICB0cnkge1xuICAgIGF3YWl0IHRoaXNQYXRoU2V0VXBkYXRlci5zdGFydFVwZGF0aW5nUGF0aFNldChwYXRoU2V0LCByZWFscGF0aCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBsb2dnZXIud2FybihgQ291bGQgbm90IHVwZGF0ZSBwYXRoIHNldHMgZm9yICR7cmVhbHBhdGh9LiBTZWFyY2hlcyBtYXkgYmUgc3RhbGVgLCBlKTtcbiAgICAvLyBUT0RPKGhhbnNvbncpOiBGYWxsIGJhY2sgdG8gbWFudWFsIHJlZnJlc2ggb3Igbm9kZSB3YXRjaGVzXG4gIH1cblxuICAvLyBUT0RPOiBTdG9wIHVwZGF0aW5nIHRoZSBwYXRoU2V0IHdoZW4gdGhlIGZpbGVTZWFyY2ggaXMgdG9ybiBkb3duLiBCdXRcbiAgLy8gY3VycmVudGx5IHRoZSBmaWxlU2VhcmNoIGlzIG5ldmVyIHRvcm4gZG93bi5cblxuICBmaWxlU2VhcmNoID0gbmV3IE5hdGl2ZUZpbGVTZWFyY2goZGlyZWN0b3J5VXJpLCBwYXRoU2V0KTtcbiAgZmlsZVNlYXJjaEZvckRpcmVjdG9yeVVyaVtkaXJlY3RvcnlVcmldID0gZmlsZVNlYXJjaDtcbiAgcmV0dXJuIGZpbGVTZWFyY2g7XG59XG5cbmxldCBwYXRoU2V0VXBkYXRlcjtcblxuZnVuY3Rpb24gZ2V0UGF0aFNldFVwZGF0ZXIoKSB7XG4gIGlmICghcGF0aFNldFVwZGF0ZXIpIHtcbiAgICBwYXRoU2V0VXBkYXRlciA9IG5ldyBQYXRoU2V0VXBkYXRlcigpO1xuICB9XG4gIHJldHVybiBwYXRoU2V0VXBkYXRlcjtcbn1cblxuLy8gVGhlIHJldHVybiB2YWx1ZXMgb2YgdGhlIGZvbGxvd2luZyBmdW5jdGlvbnMgbXVzdCBiZSBKU09OLXNlcmlhbGl6YWJsZSBzbyB0aGV5XG4vLyBjYW4gYmUgc2VudCBhY3Jvc3MgYSBwcm9jZXNzIGJvdW5kYXJ5LlxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdEZpbGVTZWFyY2hGb3JEaXJlY3RvcnkoZGlyZWN0b3J5VXJpOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcbiAgYXdhaXQgZmlsZVNlYXJjaEZvckRpcmVjdG9yeShkaXJlY3RvcnlVcmkpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZG9TZWFyY2goXG4gIGRpcmVjdG9yeVVyaTogc3RyaW5nLFxuICBxdWVyeTogc3RyaW5nLFxuKTogUHJvbWlzZTxBcnJheTxGaWxlU2VhcmNoUmVzdWx0Pj4ge1xuICBjb25zdCBmaWxlU2VhcmNoID0gYXdhaXQgZmlsZVNlYXJjaEZvckRpcmVjdG9yeShkaXJlY3RvcnlVcmkpO1xuICByZXR1cm4gZmlsZVNlYXJjaC5xdWVyeShxdWVyeSk7XG59XG4iXX0=