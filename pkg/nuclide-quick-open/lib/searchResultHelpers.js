/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {FileResult} from './types';

export type ProviderResult = {
  error: ?Object,
  loading: boolean,
  results: Array<FileResult>,
};

export type GroupedResult = {
  priority: number,
  results: {[key: NuclideUri]: ProviderResult},
  title: string,
};

export type GroupedResults = {
  [key: string]: GroupedResult,
};

import {isEmpty} from '../../commons-node/collection';

export function filterEmptyResults(resultsGroupedByService: GroupedResults): GroupedResults {
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

export function flattenResults(resultsGroupedByService: GroupedResults): Array<FileResult> {
  const items = [];
  for (const serviceName in resultsGroupedByService) {
    for (const dirName in resultsGroupedByService[serviceName].results) {
      items.push(resultsGroupedByService[serviceName].results[dirName].results);
    }
  }
  return Array.prototype.concat.apply([], items);
}
