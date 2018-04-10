'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryAllExistingFuzzyFile = exports.queryFuzzyFile = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Performs a fuzzy file search in the specified directory.
 */
let queryFuzzyFile = exports.queryFuzzyFile = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (config) {
    let searchConfigPromise = searchConfigCache.get(config.rootDirectory);
    if (searchConfigPromise == null) {
      searchConfigPromise = getSearchConfig(config.rootDirectory);
      searchConfigCache.set(config.rootDirectory, searchConfigPromise);
    }
    const searchConfig = yield searchConfigPromise;
    if (searchConfig.useCustomSearch) {
      return searchConfig.search(config.queryString, config.rootDirectory);
    } else {
      const search = yield (0, (_FileSearchProcess || _load_FileSearchProcess()).fileSearchForDirectory)(config.rootDirectory, config.ignoredNames);
      return search.query(config.queryString, {
        queryRoot: config.queryRoot,
        smartCase: config.smartCase
      });
    }
  });

  return function queryFuzzyFile(_x) {
    return _ref.apply(this, arguments);
  };
})();

let queryAllExistingFuzzyFile = exports.queryAllExistingFuzzyFile = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (queryString, ignoredNames) {
    const directories = (0, (_FileSearchProcess || _load_FileSearchProcess()).getExistingSearchDirectories)();
    const aggregateResults = yield Promise.all(directories.map(function (rootDirectory) {
      return queryFuzzyFile({
        ignoredNames,
        queryString,
        rootDirectory
      });
    }));
    // Optimize for the common case.
    if (aggregateResults.length === 1) {
      return aggregateResults[0];
    } else {
      return [].concat(...aggregateResults).sort(function (a, b) {
        return b.score - a.score;
      });
    }
  });

  return function queryAllExistingFuzzyFile(_x2, _x3) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * @return whether this service can perform fuzzy file queries on the
 *   specified directory.
 */


exports.isFuzzySearchAvailableFor = isFuzzySearchAvailableFor;
exports.disposeFuzzySearch = disposeFuzzySearch;

var _lruCache;

function _load_lruCache() {
  return _lruCache = _interopRequireDefault(require('lru-cache'));
}

var _FileSearchProcess;

function _load_FileSearchProcess() {
  return _FileSearchProcess = require('./FileSearchProcess');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const searchConfigCache = (0, (_lruCache || _load_lruCache()).default)({
  // In practice, we expect this cache to have one entry for each item in
  // `atom.project.getPaths()`. We do not expect this number to be particularly
  // large, so we add a bit of a buffer and log an error if we actually fill the
  // cache.
  max: 25,
  dispose(key, value) {
    (0, (_log4js || _load_log4js()).getLogger)('FuzzyFileSearchService').error(`Unexpected eviction of ${key} from the searchConfigCache.`);
  }
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */

const getSearchConfig = function () {
  try {
    // $FlowFB
    return require('./fb-custom-file-search').getSearchConfig;
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e;
    }

    return function (directory) {
      return Promise.resolve({ useCustomSearch: false });
    };
  }
}();function isFuzzySearchAvailableFor(rootDirectory) {
  return (_fsPromise || _load_fsPromise()).default.exists(rootDirectory);
}

/**
 * This should be called when the directory is removed from Atom.
 */
function disposeFuzzySearch(rootDirectory) {
  return (0, (_FileSearchProcess || _load_FileSearchProcess()).disposeSearchForDirectory)(rootDirectory);
}