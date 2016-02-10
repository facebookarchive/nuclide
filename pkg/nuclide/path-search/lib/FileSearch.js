'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import urlJoin from 'url-join';

import {parse} from '../../remote-uri';
import {fsPromise} from '../../commons';

import {createPathSet} from './PathSetFactory';
import PathSearch from './PathSearch';
import PathSetUpdater from './PathSetUpdater';

export type FileSearchResult = {
  score: number,
  path: string,
  matchIndexes: Array<number>,
};

/**
 * Utility to search the set of files under `localDirectory`. It attempts to use
 * source control to populate the search space quickly, as well as to exclude
 * source control metadata files from search.
 *
 * @param localDirectory the directory whose files should be searched
 * @param fullUri is the original path provided to `fileSearchForDirectory`,
 *     which is prepended to all results.
 * @param pathSearch delegate to use for the actual searching.
 */
class FileSearch {
  _localDirectory: string;
  _originalUri: string;
  _pathSearch: PathSearch;

  constructor(localDirectory: string, fullUri: string, pathSearch: PathSearch) {
    this._localDirectory = localDirectory;
    this._originalUri = fullUri;
    this._pathSearch = pathSearch;
  }

  async query(query: string): Promise<Array<FileSearchResult>> {
    const resultSet = await this._pathSearch.doQuery(query);
    // TODO: Cache the result of this call to map().
    const results: Array<FileSearchResult> = resultSet.results.map(result => {
      const mappedResult = {
        score: result.score,
        path: urlJoin(this._originalUri, '/', result.value),
        matchIndexes: [],
      };
      if (result.matchIndexes) {
        mappedResult.matchIndexes =
          result.matchIndexes.map(index => index + this._originalUri.length + 1);
      }
      return mappedResult;
    });
    return results;
  }

  getLocalDirectory(): string {
    return this._localDirectory;
  }

  getFullBaseUri(): string {
    return this._originalUri;
  }
}

const fileSearchForDirectoryUri = {};

/**
 * FileSearch is an object with a query() method. Currently, this is visible only for testing.
 * @param directoryUri The directory to get the FileSearch for.
 * @param pathSetUpdater Exposed for testing purposes. The pathSetUpdater to use
 *   in this method--likely a mock.
 */
export async function fileSearchForDirectory(
  directoryUri: string,
  pathSetUpdater: ?PathSetUpdater,
): Promise<FileSearch> {
  let fileSearch = fileSearchForDirectoryUri[directoryUri];
  if (fileSearch) {
    return fileSearch;
  }

  const realpath = await fsPromise.realpath(parse(directoryUri).path);
  const pathSet = await createPathSet(realpath);

  const thisPathSetUpdater = pathSetUpdater || getPathSetUpdater();
  await thisPathSetUpdater.startUpdatingPathSet(pathSet, realpath);

  // TODO: Stop updating the pathSet when the fileSearch is torn down. But
  // currently the fileSearch is never torn down.

  const pathSearch = new PathSearch(pathSet);
  fileSearch = new FileSearch(realpath, directoryUri, pathSearch);
  fileSearchForDirectoryUri[directoryUri] = fileSearch;
  return fileSearch;
}

let pathSetUpdater;

function getPathSetUpdater() {
  if (!pathSetUpdater) {
    pathSetUpdater = new PathSetUpdater();
  }
  return pathSetUpdater;
}

// The return values of the following functions must be JSON-serializable so they
// can be sent across a process boundary.

export async function initFileSearchForDirectory(directoryUri: string): Promise<void> {
  await fileSearchForDirectory(directoryUri);
}

export async function doSearch(
  directoryUri: string,
  query: string,
): Promise<Array<FileSearchResult>> {
  const fileSearch = await fileSearchForDirectory(directoryUri);
  return fileSearch.query(query);
}
