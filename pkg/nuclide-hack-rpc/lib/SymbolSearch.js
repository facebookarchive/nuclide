'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.executeQuery = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let executeQuery = exports.executeQuery = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (filePath, queryString_) {
    const hackRoot = yield (0, (_hackConfig || _load_hackConfig()).findHackConfigDir)(filePath);
    if (hackRoot == null) {
      return [];
    }

    const { queryString, searchPostfix } = parseQueryString(queryString_);
    if (queryString === '') {
      return [];
    }

    // `pendingSearchPromises` is used to temporally cache search result promises.
    // So, when a matching search query is done in parallel, it will wait and resolve
    // with the original search call.
    let searchPromise = pendingSearchPromises.get(queryString);
    if (!searchPromise) {
      searchPromise = (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--search' + (searchPostfix || ''), queryString],
      /* errorStream */false,
      /* processInput */null,
      /* file */filePath);
      pendingSearchPromises.set(queryString, searchPromise);
    }

    let searchResponse = null;
    try {
      searchResponse = yield searchPromise;
    } finally {
      pendingSearchPromises.delete(queryString);
    }

    return convertSearchResults(hackRoot, searchResponse);
  });

  return function executeQuery(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

exports.parseQueryString = parseQueryString;
exports.convertSearchResults = convertSearchResults;

var _hackConfig;

function _load_hackConfig() {
  return _hackConfig = require('./hack-config');
}

var _HackHelpers;

function _load_HackHelpers() {
  return _HackHelpers = require('./HackHelpers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const pendingSearchPromises = new Map(); /**
                                          * Copyright (c) 2015-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the license found in the LICENSE file in
                                          * the root directory of this source tree.
                                          *
                                          * 
                                          * @format
                                          */

function parseQueryString(queryString_) {
  let queryString;
  let searchPostfix;
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
    searchPostfix,
    queryString
  };
}

function convertSearchResults(hackRoot, searchResponse) {
  if (searchResponse == null) {
    return [];
  }

  const searchResult = searchResponse;
  const result = [];
  for (const entry of searchResult) {
    const resultFile = entry.filename;
    if (!resultFile.startsWith(hackRoot)) {
      // Filter out files out of repo results, e.g. hh internal files.
      continue;
    }
    result.push({
      line: entry.line - 1,
      column: entry.char_start - 1,
      name: entry.name,
      path: resultFile,
      containerName: entry.scope,
      icon: bestIconForDesc(entry.desc),
      hoverText: entry.desc
    });
  }

  return result;
}

const ICONS = {
  interface: 'puzzle',
  function: 'zap',
  method: 'zap',
  typedef: 'tag',
  class: 'code',
  'abstract class': 'code',
  constant: 'quote',
  trait: 'checklist',
  enum: 'file-binary',
  default: null,
  unknown: 'squirrel'
};

function bestIconForDesc(desc) {
  // flowlint-next-line sketchy-null-string:off
  if (!desc) {
    return ICONS.default;
  }
  // Look for exact match.
  if (ICONS[desc]) {
    return ICONS[desc];
  }
  // Look for presence match, e.g. in 'static method in FooBarClass'.
  for (const keyword in ICONS) {
    if (desc.indexOf(keyword) !== -1) {
      return ICONS[keyword];
    }
  }
  return ICONS.unknown;
}