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

/**
 * Performs a fuzzy file search in the specified directory.
 */

var queryFuzzyFile = _asyncToGenerator(function* (rootDirectory, queryString, ignoredNames) {
  var search = yield (0, (_FileSearchProcess2 || _FileSearchProcess()).fileSearchForDirectory)(rootDirectory, ignoredNames);
  return search.query(queryString);
});

exports.queryFuzzyFile = queryFuzzyFile;

var queryAllExistingFuzzyFile = _asyncToGenerator(function* (queryString, ignoredNames) {
  var directories = (0, (_FileSearchProcess2 || _FileSearchProcess()).getExistingSearchDirectories)();
  var aggregateResults = yield Promise.all(directories.map(function (rootDirectory) {
    return queryFuzzyFile(rootDirectory, queryString, ignoredNames);
  }));
  // Optimize for the common case.
  if (aggregateResults.length === 1) {
    return aggregateResults[0];
  } else {
    var _ref;

    return (_ref = []).concat.apply(_ref, _toConsumableArray(aggregateResults)).sort(function (a, b) {
      return b.score - a.score;
    });
  }
}

/**
 * @return whether this service can perform fuzzy file queries on the
 *   specified directory.
 */
);

exports.queryAllExistingFuzzyFile = queryAllExistingFuzzyFile;
exports.isFuzzySearchAvailableFor = isFuzzySearchAvailableFor;
exports.disposeFuzzySearch = disposeFuzzySearch;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _FileSearchProcess2;

function _FileSearchProcess() {
  return _FileSearchProcess2 = require('./FileSearchProcess');
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

function isFuzzySearchAvailableFor(rootDirectory) {
  return (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.exists(rootDirectory);
}

/**
 * This should be called when the directory is removed from Atom.
 */

function disposeFuzzySearch(rootDirectory) {
  return (0, (_FileSearchProcess2 || _FileSearchProcess()).disposeSearchForDirectory)(rootDirectory);
}