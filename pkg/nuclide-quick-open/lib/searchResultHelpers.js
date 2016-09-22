'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GroupedResult} from './types';
import type {FileResult} from './rpc-types';

import {isEmpty} from '../../commons-node/collection';

export function filterEmptyResults(resultsGroupedByService: GroupedResult): GroupedResult {
  const filteredTree = {};

  for (const serviceName in resultsGroupedByService) {
    const directories = resultsGroupedByService[serviceName].results;
    const nonEmptyDirectories = {};
    for (const dirName in directories) {
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
  const items = [];
  for (const serviceName in resultsGroupedByService) {
    for (const dirName in resultsGroupedByService[serviceName].results) {
      items.push(resultsGroupedByService[serviceName].results[dirName].results);
    }
  }
  return Array.prototype.concat.apply([], items);
}
