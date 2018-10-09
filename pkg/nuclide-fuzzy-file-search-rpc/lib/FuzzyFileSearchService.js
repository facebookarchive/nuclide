"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryFuzzyFile = queryFuzzyFile;
exports.queryAllExistingFuzzyFile = queryAllExistingFuzzyFile;
exports.isFuzzySearchAvailableFor = isFuzzySearchAvailableFor;
exports.disposeFuzzySearch = disposeFuzzySearch;

function _lruCache() {
  const data = _interopRequireDefault(require("lru-cache"));

  _lruCache = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _FileSearchProcess() {
  const data = require("./FileSearchProcess");

  _FileSearchProcess = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
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
function createCacheKey(directory, preferCustomSearch) {
  return `${directory}:${String(preferCustomSearch)}`;
}

const searchConfigCache = (0, _lruCache().default)({
  // In practice, we expect this cache to have one entry for each item in
  // `atom.project.getPaths()`. We do not expect this number to be particularly
  // large, so we add a bit of a buffer and log an error if we actually fill the
  // cache.
  max: 25,

  dispose(key, value) {
    (0, _log4js().getLogger)('FuzzyFileSearchService').error(`Unexpected eviction of ${key} from the searchConfigCache.`);
  }

});

const getSearchConfig = function () {
  try {
    // $FlowFB
    return require("./fb-custom-file-search").getSearchConfig;
  } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') {
      throw e;
    }

    return function (directory, preferCustomSearch) {
      return Promise.resolve({
        useCustomSearch: false
      });
    };
  }
}();
/**
 * Performs a fuzzy file search in the specified directory.
 */


async function queryFuzzyFile(config) {
  const {
    rootDirectory,
    preferCustomSearch
  } = config;
  const cacheKey = createCacheKey(rootDirectory, preferCustomSearch);
  let searchConfigPromise = searchConfigCache.get(cacheKey);

  if (searchConfigPromise == null) {
    searchConfigPromise = getSearchConfig(rootDirectory, preferCustomSearch);
    searchConfigCache.set(cacheKey, searchConfigPromise);
  }

  const searchConfig = await searchConfigPromise;
  return (0, _nuclideAnalytics().trackTiming)('fuzzy-file-search', async () => {
    if (searchConfig.useCustomSearch) {
      return searchConfig.search(config.queryString, rootDirectory, config.context);
    } else {
      const search = await (0, _FileSearchProcess().fileSearchForDirectory)(rootDirectory, config.ignoredNames);
      return search.query(config.queryString, {
        queryRoot: config.queryRoot,
        smartCase: config.smartCase
      });
    }
  }, {
    path: rootDirectory,
    useCustomSearch: searchConfig.useCustomSearch
  });
}

async function queryAllExistingFuzzyFile(queryString, ignoredNames, preferCustomSearch, context) {
  const directories = (0, _FileSearchProcess().getExistingSearchDirectories)();
  const aggregateResults = await Promise.all(directories.map(rootDirectory => queryFuzzyFile({
    ignoredNames,
    queryString,
    rootDirectory,
    preferCustomSearch,
    context
  }))); // Optimize for the common case.

  if (aggregateResults.length === 1) {
    return aggregateResults[0];
  } else {
    return [].concat(...aggregateResults).sort((a, b) => b.score - a.score);
  }
}
/**
 * @return whether this service can perform fuzzy file queries on the
 *   specified directory.
 */


function isFuzzySearchAvailableFor(rootDirectory) {
  return _fsPromise().default.exists(rootDirectory);
}
/**
 * This should be called when the directory is removed from Atom.
 */


function disposeFuzzySearch(rootDirectory) {
  return (0, _FileSearchProcess().disposeSearchForDirectory)(rootDirectory);
}