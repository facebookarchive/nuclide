'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {createPathSet} = require('./PathSetFactory');
var {fsPromise} = require('nuclide-commons');
var url = require('url');

var PathSearch = require('./PathSearch');

type QueryScore = {
  key: string;
  string: string;
  score: number;
  matchIndexes: Array<number>;
}

type FileSearchResult = {
  score: number;
  path: string;
  matchIndexes: Array<number>;
}

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
  constructor(localDirectory: string, fullUri: string, pathSearch: PathSearch) {
    this._localDirectory = localDirectory;
    this._originalUri = fullUri;
    this._pathSearch = pathSearch;
  }

  async query(query: string): Promise<Array<FileSearchResult>> {
    var resultSet = await this._pathSearch.doQuery(query);
    // TODO: Cache the result of this call to map().
    return resultSet.results.map(result => {
      return { score: result.score,
               path: url.resolve(this._originalUri + '/', result.value),
               matchIndexes: result.matchIndexes.map((index) => index + this._originalUri.length + 1),
             };
      });
  }

  getLocalDirectory(): string {
    return this._localDirectory;
  }

  getFullBaseUri(): string {
    return this._originalUri;
  }
}

var fileSearchForDirectoryUri = {};

/**
 * FileSearch is an object with a query() method.
 * @param directoryUri The directory to get the FileSearch for.
 * @param pathSetUpdater Exposed for testing purposes. The pathSetUpdater to use
 *   in this method--likely a mock.
 */
async function fileSearchForDirectory(directoryUri: string, pathSetUpdater: ?PathSetUpdater): Promise<FileSearch> {
  var fileSearch = fileSearchForDirectoryUri[directoryUri];
  if (fileSearch) {
    return fileSearch;
  }

  var directory = url.parse(directoryUri).path;
  var realpath = await fsPromise.realpath(directory);
  var pathSet = await createPathSet(realpath);

  var pathSetUpdater = pathSetUpdater || getPathSetUpdater();
  var disposable = await pathSetUpdater.startUpdatingPathSet(pathSet, realpath);
  // TODO: Stop updating the pathSet when the fileSearch is torn down. But
  // currently the fileSearch is never torn down.

  var pathSearch = new PathSearch(pathSet);
  fileSearch = new FileSearch(realpath, directoryUri, pathSearch);
  fileSearchForDirectoryUri[directoryUri] = fileSearch;
  return fileSearch;
}

var pathSetUpdater;

function getPathSetUpdater() {
  if (!pathSetUpdater) {
    var PathSetUpdater = require('./PathSetUpdater');
    pathSetUpdater = new PathSetUpdater();
  }
  return pathSetUpdater;
}

// The return values of the following functions must be JSON-serializable so they
// can be sent across a process boundary.

async function initFileSearchForDirectory(directoryUri: string): Promise<void> {
  await fileSearchForDirectory(directoryUri);
  return null;
}

async function doSearch(directoryUri: string, query: string): Promise<Array<FileSearchResult>> {
  var fileSearch = await fileSearchForDirectory(directoryUri);
  return fileSearch.query(query);
}

module.exports = {
  initFileSearchForDirectory,
  doSearch,

  // Currently, this is visible only for testing.
  fileSearchForDirectory,
};
