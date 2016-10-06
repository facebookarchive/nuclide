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

exports.parseQueryString = parseQueryString;

var executeQuery = _asyncToGenerator(function* (filePath, queryString_) {
  var hackRoot = yield (0, (_hackConfig2 || _hackConfig()).findHackConfigDir)(filePath);
  if (hackRoot == null) {
    return [];
  }

  var _parseQueryString = parseQueryString(queryString_);

  var queryString = _parseQueryString.queryString;
  var searchPostfix = _parseQueryString.searchPostfix;

  if (queryString === '') {
    return [];
  }

  // `pendingSearchPromises` is used to temporally cache search result promises.
  // So, when a matching search query is done in parallel, it will wait and resolve
  // with the original search call.
  var searchPromise = pendingSearchPromises.get(queryString);
  if (!searchPromise) {
    searchPromise = (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
    /* args */['--search' + (searchPostfix || ''), queryString],
    /* errorStream */false,
    /* processInput */null,
    /* file */filePath);
    pendingSearchPromises.set(queryString, searchPromise);
  }

  var searchResponse = null;
  try {
    searchResponse = yield searchPromise;
  } finally {
    pendingSearchPromises.delete(queryString);
  }

  return convertSearchResults(hackRoot, searchResponse);
});

exports.executeQuery = executeQuery;
exports.convertSearchResults = convertSearchResults;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _hackConfig2;

function _hackConfig() {
  return _hackConfig2 = require('./hack-config');
}

var _HackHelpers2;

function _HackHelpers() {
  return _HackHelpers2 = require('./HackHelpers');
}

var pendingSearchPromises = new Map();

function parseQueryString(queryString_) {
  var queryString = undefined;
  var searchPostfix = undefined;
  switch (queryString_[0]) {
    case '@':
      searchPostfix = '-function';
      queryString = queryString_.substring(1);
      break;
    case '#':
      searchPostfix = '-class';
      queryString = queryString_.substring(1);
      break;
    case '%':
      searchPostfix = '-constant';
      queryString = queryString_.substring(1);
      break;
    default:
      searchPostfix = null;
      queryString = queryString_;
      break;
  }
  return {
    searchPostfix: searchPostfix,
    queryString: queryString
  };
}

function convertSearchResults(hackRoot, searchResponse) {
  if (searchResponse == null) {
    return [];
  }

  var searchResult = searchResponse;
  var result = [];
  for (var entry of searchResult) {
    var resultFile = entry.filename;
    if (!resultFile.startsWith(hackRoot)) {
      // Filter out files out of repo results, e.g. hh internal files.
      continue;
    }
    result.push({
      line: entry.line - 1,
      column: entry.char_start - 1,
      name: entry.name,
      path: resultFile,
      length: entry.char_end - entry.char_start + 1,
      scope: entry.scope,
      additionalInfo: entry.desc
    });
  }

  return result;
}