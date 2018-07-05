/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import pathModule from 'path';
import {runCommand} from 'nuclide-commons/process';

// Limit the number of file search results that are sent back to the client.
const MAX_RESULTS = 20;

export interface FileSearcher {
  /** @return a list of absolute file paths. */
  search(directory: string, query: string): Promise<Array<string>>;
}

/** A `FileSearcher` that is hardcoded to search a specific directory. */
export interface DirectoryFileSearcher {
  /** @return a list of absolute file paths. */
  search(query: string): Promise<Array<string>>;
}

/** Creates a new FileSearcher for the local host. */
export async function createFileSearcher(): Promise<FileSearcher> {
  return new FileSearcherProxy();
}

/**
 * FileSearcher that creates a cache of directories to DirectoryFileSearchers.
 * It forwards search requests to the appropriate DirectoryFileSearcher,
 * creating a new one, if necessary.
 *
 * In practice, we expect most search requests from the client to be rooted at
 * the same directory. Because it takes a bit of work to create a
 * DirectoryFileSearcher (and because the DirectoryFileSearchers may be
 * stateful), it makes sense to keep them around.
 */
class FileSearcherProxy implements FileSearcher {
  _searchers: Map<string, Promise<DirectoryFileSearcher>>;

  constructor() {
    this._searchers = new Map();
  }

  search(directory: string, query: string): Promise<Array<string>> {
    let searcherPromise = this._searchers.get(directory);
    if (searcherPromise == null) {
      searcherPromise = getFileSearcherForDirectory(directory);
      this._searchers.set(directory, searcherPromise);
    }
    return searcherPromise.then(searcher => searcher.search(query));
  }
}

async function getFileSearcherForDirectory(
  directoryToSearch: string,
): Promise<DirectoryFileSearcher> {
  try {
    // $FlowFB
    const {getCustomFileSearcher} = require('./fb-CustomFileSearcher');
    const searcher = await getCustomFileSearcher(directoryToSearch);
    if (searcher != null) {
      return searcher;
    }
  } catch (err) {}

  return new FindAndGrepFileSearcher(directoryToSearch);
}

/** Crude file search using `find` and `grep`. */
class FindAndGrepFileSearcher implements DirectoryFileSearcher {
  /** Absolute path of the directory that will be searched by this searcher. */
  _directoryToSearch: string;

  constructor(directoryToSearch: string) {
    this._directoryToSearch = directoryToSearch;
  }

  async search(query: string): Promise<Array<string>> {
    const findArgs = ['.', '-type', 'f', '-iname', `*${query}*`];
    const stdout = await runCommand('find', findArgs, {
      cwd: this._directoryToSearch,
    }).toPromise();
    const lines = stdout.split('\n').slice(0, MAX_RESULTS);
    // Trim lines and return non-empty ones. Each resulting line should be
    // a path relative to _directoryToSearch.
    return lines
      .map(x => pathModule.join(this._directoryToSearch, x))
      .filter(line => line.length > 0);
  }
}
