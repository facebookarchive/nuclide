'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

export type FileSearchResult = {
  path: NuclideUri;
  score: number;
  matchIndexes: Array<number>;
};

import {fileSearchForDirectory} from '../../nuclide-path-search';
import {fsPromise} from '../../nuclide-commons';

/**
 * Performs a fuzzy file search in the specified directory.
 */
export async function queryFuzzyFile(
  rootDirectory: NuclideUri,
  queryString: string
): Promise<Array<FileSearchResult>> {
  const search = await fileSearchForDirectory(rootDirectory);
  return search.query(queryString);
}

/**
 * @return whether this service can perform fuzzy file queries on the
 *   specified directory.
 */
export function isFuzzySearchAvailableFor(
  rootDirectory: NuclideUri
): Promise<boolean> {
  return fsPromise.exists(rootDirectory);
}
