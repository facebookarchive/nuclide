'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.filterEmptyResults = filterEmptyResults;
exports.flattenResults = flattenResults;
exports.getOuterResults = getOuterResults;

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
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
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function flattenResults(resultsGroupedByService) {
  const items = [];
  for (const serviceName in resultsGroupedByService) {
    for (const dirName in resultsGroupedByService[serviceName].results) {
      items.push(resultsGroupedByService[serviceName].results[dirName].results);
    }
  }
  return Array.prototype.concat.apply([], items);
}

function getOuterResults(location, resultsByService) {
  const nonEmptyResults = filterEmptyResults(resultsByService);
  const serviceNames = Object.keys(nonEmptyResults);
  const serviceName = location === 'top' ? serviceNames[0] : serviceNames[serviceNames.length - 1];
  if (serviceName == null) {
    return null;
  }
  const directoryNames = Object.keys(nonEmptyResults[serviceName].results);
  const directoryName = location === 'top' ? directoryNames[0] : directoryNames[directoryNames.length - 1];
  const results = nonEmptyResults[serviceName].results[directoryName].results;
  return {
    serviceName,
    directoryName,
    results
  };
}