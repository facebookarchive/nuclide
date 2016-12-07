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
exports.filterEmptyResults = filterEmptyResults;
exports.flattenResults = flattenResults;

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

function filterEmptyResults(resultsGroupedByService) {
  const filteredTree = {};

  for (const serviceName in resultsGroupedByService) {
    const directories = resultsGroupedByService[serviceName].results;
    const nonEmptyDirectories = {};
    for (const dirName in directories) {
      if (directories[dirName].results.length) {
        nonEmptyDirectories[dirName] = directories[dirName];
      }
    }
    if (!(0, (_collection || _load_collection()).isEmpty)(nonEmptyDirectories)) {
      filteredTree[serviceName] = { results: nonEmptyDirectories };
    }
  }
  return filteredTree;
}function flattenResults(resultsGroupedByService) {
  const items = [];
  for (const serviceName in resultsGroupedByService) {
    for (const dirName in resultsGroupedByService[serviceName].results) {
      items.push(resultsGroupedByService[serviceName].results[dirName].results);
    }
  }
  return Array.prototype.concat.apply([], items);
}