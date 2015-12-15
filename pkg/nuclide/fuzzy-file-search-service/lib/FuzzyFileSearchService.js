'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../remote-uri';

export type FileSearchResult = {
  path: NuclideUri;
  score: number;
  matchIndexes: Array<number>;
};

import {fileSearchForDirectory, FileSearch} from '../../path-search';
import {fsPromise} from '../../commons';
const fileSearchers: Map<string, FileSearch> = new Map();

/**
 * Performs a fuzzy file search in the specified directory.
 */
export async function queryFuzzyFile(
  rootDirectory: NuclideUri,
  queryString: string
): Promise<Array<FileSearchResult>> {
  let search = fileSearchers.get(rootDirectory);

  if (search == null) {
    const exists = await fsPromise.exists(rootDirectory);
    if (!exists) {
      throw new Error('Could not find directory to search : ' + rootDirectory);
    }

    const stat = await fsPromise.stat(rootDirectory);
    if (!stat.isDirectory()) {
      throw new Error('Provided path is not a directory : ' + rootDirectory);
    }

    search = await fileSearchForDirectory(rootDirectory);
    fileSearchers.set(rootDirectory, search);
  }

  return await search.query(queryString);
}

/**
 * @return whether this service can perform fuzzy file queries on the
 *   specified directory.
 */
export async function isFuzzySearchAvailableFor(
    rootDirectory: NuclideUri
): Promise<boolean> {
  return await fsPromise.exists(rootDirectory);
}
