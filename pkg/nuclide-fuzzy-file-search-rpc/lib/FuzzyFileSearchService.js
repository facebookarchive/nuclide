'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryAllExistingFuzzyFile = exports.queryFuzzyFile = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Performs a fuzzy file search in the specified directory.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

let queryFuzzyFile = exports.queryFuzzyFile = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (rootDirectory, queryString, ignoredNames) {
    const search = yield (0, (_FileSearchProcess || _load_FileSearchProcess()).fileSearchForDirectory)(rootDirectory, ignoredNames);
    return search.query(queryString);
  });

  return function queryFuzzyFile(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

let queryAllExistingFuzzyFile = exports.queryAllExistingFuzzyFile = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (queryString, ignoredNames) {
    const directories = (0, (_FileSearchProcess || _load_FileSearchProcess()).getExistingSearchDirectories)();
    const aggregateResults = yield Promise.all(directories.map(function (rootDirectory) {
      return queryFuzzyFile(rootDirectory, queryString, ignoredNames);
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

  return function queryAllExistingFuzzyFile(_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
})();

/**
 * @return whether this service can perform fuzzy file queries on the
 *   specified directory.
 */


exports.isFuzzySearchAvailableFor = isFuzzySearchAvailableFor;
exports.disposeFuzzySearch = disposeFuzzySearch;

var _FileSearchProcess;

function _load_FileSearchProcess() {
  return _FileSearchProcess = require('./FileSearchProcess');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isFuzzySearchAvailableFor(rootDirectory) {
  return (_fsPromise || _load_fsPromise()).default.exists(rootDirectory);
}

/**
 * This should be called when the directory is removed from Atom.
 */
function disposeFuzzySearch(rootDirectory) {
  return (0, (_FileSearchProcess || _load_FileSearchProcess()).disposeSearchForDirectory)(rootDirectory);
}