'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  FileResult,
  GroupedResult,
} from 'nuclide-quick-open-interfaces';

var {
  isEmpty,
} = require('nuclide-commons').object;

export function filterEmptyResults(resultsGroupedByService: GroupedResult): GroupedResult {
  var filteredTree = {};

  for (var serviceName in resultsGroupedByService) {
    var directories = resultsGroupedByService[serviceName].results;
    var nonEmptyDirectories = {};
    for (var dirName in directories) {
      if (directories[dirName].results.length) {
        nonEmptyDirectories[dirName] = directories[dirName];
      }
    }
    if (!isEmpty(nonEmptyDirectories)) {
      filteredTree[serviceName] = {results: nonEmptyDirectories};
    }
  }
  return filteredTree;
}

export function flattenResults(resultsGroupedByService: GroupedResult): Array<FileResult> {
  var items = [];
  for (var serviceName in resultsGroupedByService) {
    for (var dirName in resultsGroupedByService[serviceName].results) {
      items.push(resultsGroupedByService[serviceName].results[dirName].results);
    }
  }
  return Array.prototype.concat.apply([], items);
}
