'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.doSearch = exports.initFileSearchForDirectory = exports.fileSearchForDirectory = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let fileSearchForDirectory = exports.fileSearchForDirectory = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (directoryUri, pathSetUpdater) {
    let ignoredNames = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    let fileSearch = fileSearchForDirectoryUri[directoryUri];
    if (fileSearch) {
      return fileSearch;
    }

    const realpath = yield (_fsPromise || _load_fsPromise()).default.realpath((_nuclideUri || _load_nuclideUri()).default.parse(directoryUri).path);
    const paths = yield (0, (_PathSetFactory || _load_PathSetFactory()).getPaths)(realpath);
    const pathSet = new (_PathSet || _load_PathSet()).PathSet(paths, ignoredNames || []);

    const thisPathSetUpdater = pathSetUpdater || getPathSetUpdater();
    try {
      yield thisPathSetUpdater.startUpdatingPathSet(pathSet, realpath);
    } catch (e) {
      logger.warn(`Could not update path sets for ${ realpath }. Searches may be stale`, e);
      // TODO(hansonw): Fall back to manual refresh or node watches
    }

    // TODO: Stop updating the pathSet when the fileSearch is torn down. But
    // currently the fileSearch is never torn down.

    fileSearch = new FileSearch(directoryUri, pathSet);
    fileSearchForDirectoryUri[directoryUri] = fileSearch;
    return fileSearch;
  });

  return function fileSearchForDirectory(_x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

// The return values of the following functions must be JSON-serializable so they
// can be sent across a process boundary.

let initFileSearchForDirectory = exports.initFileSearchForDirectory = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (directoryUri, ignoredNames) {
    yield fileSearchForDirectory(directoryUri, null, ignoredNames);
  });

  return function initFileSearchForDirectory(_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
})();

let doSearch = exports.doSearch = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (directoryUri, query) {
    const fileSearch = yield fileSearchForDirectory(directoryUri);
    return fileSearch.query(query);
  });

  return function doSearch(_x6, _x7) {
    return _ref3.apply(this, arguments);
  };
})();

var _urlJoin;

function _load_urlJoin() {
  return _urlJoin = _interopRequireDefault(require('url-join'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)();

let FileSearch = class FileSearch {

  constructor(fullUri, pathSet) {
    this._originalUri = fullUri;
    this._pathSet = pathSet;
  }

  query(query) {
    // Attempt to relativize paths that people might e.g. copy + paste.
    let relQuery = query;
    // Remove the leading home directory qualifier.
    if (relQuery.startsWith('~/')) {
      relQuery = relQuery.substr(2);
    }
    // If a full path is pasted, make the path relative.
    if (relQuery.startsWith((_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(this._originalUri))) {
      relQuery = relQuery.substr(this._originalUri.length + 1);
    } else {
      // Also try to relativize queries that start with the dirname alone.
      const dirname = (_nuclideUri || _load_nuclideUri()).default.dirname(this._originalUri);
      if (relQuery.startsWith((_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(dirname))) {
        relQuery = relQuery.substr(dirname.length + 1);
      }
    }

    const results = this._pathSet.match(relQuery).map(result => {
      let matchIndexes = result.matchIndexes;

      if (matchIndexes != null) {
        matchIndexes = matchIndexes.map(idx => idx + this._originalUri.length + 1);
      }
      return {
        score: result.score,
        path: (0, (_urlJoin || _load_urlJoin()).default)(this._originalUri, '/', result.value),
        matchIndexes: matchIndexes || []
      };
    });

    return Promise.resolve(results);
  }
};


const fileSearchForDirectoryUri = {};

let pathSetUpdater;

function getPathSetUpdater() {
  if (!pathSetUpdater) {
    pathSetUpdater = new (_PathSetUpdater || _load_PathSetUpdater()).default();
  }
  return pathSetUpdater;
}