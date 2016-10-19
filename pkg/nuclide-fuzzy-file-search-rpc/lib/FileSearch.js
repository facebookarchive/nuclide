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
  var ignoredNames = arguments.length <= 2 || arguments[2] === undefined ? [] : arguments[2];

  var fileSearch = fileSearchForDirectoryUri[directoryUri];
  if (fileSearch) {
    return fileSearch;
  }

  var realpath = yield (_commonsNodeFsPromise || _load_commonsNodeFsPromise()).default.realpath((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.parse(directoryUri).path);
  var paths = yield (0, (_PathSetFactory || _load_PathSetFactory()).getPaths)(realpath);
  var pathSet = new (_PathSet || _load_PathSet()).PathSet(paths, ignoredNames || []);

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

var initFileSearchForDirectory = _asyncToGenerator(function* (directoryUri, ignoredNames) {
  yield fileSearchForDirectory(directoryUri, null, ignoredNames);
});

exports.initFileSearchForDirectory = initFileSearchForDirectory;

var doSearch = _asyncToGenerator(function* (directoryUri, query) {
  var fileSearch = yield fileSearchForDirectory(directoryUri);
  return fileSearch.query(query);
});

exports.doSearch = doSearch;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _urlJoin;

function _load_urlJoin() {
  return _urlJoin = _interopRequireDefault(require('url-join'));
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _commonsNodeFsPromise;

function _load_commonsNodeFsPromise() {
  return _commonsNodeFsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _PathSet;

function _load_PathSet() {
  return _PathSet = require('./PathSet');
}

var _PathSetFactory;

function _load_PathSetFactory() {
  return _PathSetFactory = require('./PathSetFactory');
}

var _PathSetUpdater;

function _load_PathSetUpdater() {
  return _PathSetUpdater = _interopRequireDefault(require('./PathSetUpdater'));
}

var logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

var FileSearch = (function () {
  function FileSearch(fullUri, pathSet) {
    _classCallCheck(this, FileSearch);

    this._originalUri = fullUri;
    this._pathSet = pathSet;
  }

  _createClass(FileSearch, [{
    key: 'query',
    value: function query(_query) {
      var _this = this;

      // Attempt to relativize paths that people might e.g. copy + paste.
      var relQuery = _query;
      // Remove the leading home directory qualifier.
      if (relQuery.startsWith('~/')) {
        relQuery = relQuery.substr(2);
      }
      // If a full path is pasted, make the path relative.
      if (relQuery.startsWith((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.ensureTrailingSeparator(this._originalUri))) {
        relQuery = relQuery.substr(this._originalUri.length + 1);
      } else {
        // Also try to relativize queries that start with the dirname alone.
        var dirname = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(this._originalUri);
        if (relQuery.startsWith((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.ensureTrailingSeparator(dirname))) {
          relQuery = relQuery.substr(dirname.length + 1);
        }
      }

      var results = this._pathSet.match(relQuery).map(function (result) {
        var matchIndexes = result.matchIndexes;

        if (matchIndexes != null) {
          matchIndexes = matchIndexes.map(function (idx) {
            return idx + _this._originalUri.length + 1;
          });
        }
        return {
          score: result.score,
          path: (0, (_urlJoin || _load_urlJoin()).default)(_this._originalUri, '/', result.value),
          matchIndexes: matchIndexes || []
        };
      });

      return Promise.resolve(results);
    }
  }]);

  return FileSearch;
})();

var fileSearchForDirectoryUri = {};

var pathSetUpdater = undefined;

function getPathSetUpdater() {
  if (!pathSetUpdater) {
    exports.pathSetUpdater = exports.pathSetUpdater = pathSetUpdater = new (_PathSetUpdater || _load_PathSetUpdater()).default();
  }
  return pathSetUpdater;
}