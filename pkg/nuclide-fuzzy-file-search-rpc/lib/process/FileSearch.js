'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.doSearch = exports.initFileSearchForDirectory = exports.fileSearchForDirectory = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let fileSearchForDirectory = exports.fileSearchForDirectory = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (directory, pathSetUpdater, ignoredNames = []) {
    // Note: races are not an issue here since initialization is managed in
    // FileSearchProcess (which protects against simultaneous inits).
    const cached = fileSearchCache[directory];
    if (cached) {
      return cached;
    }

    const realpath = yield (_fsPromise || _load_fsPromise()).default.realpath(directory);
    const paths = yield (0, (_PathSetFactory || _load_PathSetFactory()).getPaths)(realpath);
    const pathSet = new (_PathSet || _load_PathSet()).PathSet(paths, ignoredNames || [], directory);

    const thisPathSetUpdater = pathSetUpdater || getPathSetUpdater();
    try {
      yield thisPathSetUpdater.startUpdatingPathSet(pathSet, realpath);
    } catch (e) {
      logger.warn(`Could not update path sets for ${realpath}. Searches may be stale`, e);
      // TODO(hansonw): Fall back to manual refresh or node watches
    }

    fileSearchCache[directory] = pathSet;
    return pathSet;
  });

  return function fileSearchForDirectory(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

// The return values of the following functions must be JSON-serializable so they
// can be sent across a process boundary.

let initFileSearchForDirectory = exports.initFileSearchForDirectory = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (directory, ignoredNames) {
    yield fileSearchForDirectory(directory, null, ignoredNames);
  });

  return function initFileSearchForDirectory(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

let doSearch = exports.doSearch = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (directory, query) {
    const pathSet = yield fileSearchForDirectory(directory);
    return pathSet.query(query);
  });

  return function doSearch(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})();

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-fuzzy-file-search-rpc');

const fileSearchCache = {};

let pathSetUpdater;

function getPathSetUpdater() {
  if (!pathSetUpdater) {
    pathSetUpdater = new (_PathSetUpdater || _load_PathSetUpdater()).default();
  }
  return pathSetUpdater;
}