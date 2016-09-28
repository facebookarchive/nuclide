'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {FileSearchResult} from './rpc-types';

import {
  fileSearchForDirectory,
  getExistingSearchDirectories,
  disposeSearchForDirectory,
} from './FileSearchProcess';
import fsPromise from '../../commons-node/fsPromise';

/**
 * Performs a fuzzy file search in the specified directory.
 */
export async function queryFuzzyFile(
  rootDirectory: NuclideUri,
  queryString: string,
  ignoredNames: Array<string>,
): Promise<Array<FileSearchResult>> {
  const search = await fileSearchForDirectory(rootDirectory, ignoredNames);
  return search.query(queryString);
}

export async function queryAllExistingFuzzyFile(
  queryString: string,
  ignoredNames: Array<string>,
): Promise<Array<FileSearchResult>> {
  const directories = getExistingSearchDirectories();
  const aggregateResults = await Promise.all(
    directories.map(rootDirectory =>
      queryFuzzyFile(rootDirectory, queryString, ignoredNames)),
  );
  // Optimize for the common case.
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
export function isFuzzySearchAvailableFor(
  rootDirectory: NuclideUri,
): Promise<boolean> {
  return fsPromise.exists(rootDirectory);
}

/**
 * This should be called when the directory is removed from Atom.
 */
export function disposeFuzzySearch(rootDirectory: NuclideUri): Promise<void> {
  return disposeSearchForDirectory(rootDirectory);
}
