'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {RemoteDirectory} = require('nuclide-remote-connection');

type SearchResult = {
  filePath: string;
  matches: Array<{lineText: string; lineTextOffset: number; matchText: string; range: Array<Array<number>>}>;
};

type DirectorySearchDelegate = {
  didMatch: (result: SearchResult) => void;
  didSearchPaths: (count: number) => void;
};

type RemoteDirectorySearch = {
  then: (onFullfilled: any, onRejected: any) => Promise<any>;
  cancel: () => void;
}

class RemoteDirectorySearcher {
  _serviceProvider: (dir: RemoteDirectory) => any;

  // When constructed, RemoteDirectorySearcher must be passed a function that
  // it can use to get a 'FindInProjectService' for a given remote path.
  constructor(serviceProvider: (dir: RemoteDirectory) => any) {
    this._serviceProvider = serviceProvider;
  }

  canSearchDirectory(directory: Directory | RemoteDirectory): boolean {
    return RemoteDirectory.isRemoteDirectory(directory);
  }

  search(directories: Array<RemoteDirectory>, regex: RegExp, options: Object): RemoteDirectorySearch {
    var isCancelled = false;
    var promise = new Promise((resolve, reject) => {
      // Create and resolve a promise for each search directory.
      var searchPromises = directories.map(dir => {
        var service = this._serviceProvider(dir);
        return service.search(dir.getPath(), regex.source);
      });

      var pathsSearched = 0;
      Promise.all(searchPromises).then(allResults => {
        allResults.forEach(results => {
          results.forEach(options.didMatch);
          pathsSearched += results.length;
          options.didSearchPaths(pathsSearched);
        });

        // Reject the promise if the search was cancelled, otherwise resolve.
        (isCancelled ? reject : resolve)(null);
      });
    });

    // Return a thenable object with a 'cancel' function that can end a search.
    return {
      then: promise.then.bind(promise),
      cancel() {
        isCancelled = true;
      }
    };
  }
}

module.exports = RemoteDirectorySearcher;
