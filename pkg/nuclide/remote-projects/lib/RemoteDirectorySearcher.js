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
      var seenFiles = new Set(); // The files that we have seen updates for.
      var onUpdate = (requestId, update) => {
        // Ensure that this update is for one of our current requests.
        if (myRequests && myRequests.indexOf(requestId) === -1) {
          return;
        }

        options.didMatch(update);

        // Call didSearchPaths with the number of unique files we have seen matches in. This is
        // not technically correct, as didSearchPaths is also supposed to count files for which
        // no matches were found. However, we currently have no way of obtaining this information.
        seenFiles.add(update.filePath);
        options.didSearchPaths(seenFiles.size);
      };

      var myRequests = null; // We don't yet know what our search ids are.
      var completedRequests = new Set(); // Keep track of completed search ids.
      var onCompleted = requestId => {
        completedRequests.add(requestId);

        // Check if we've recieved our search id's, and that every search id is completed.
        var complete = myRequests && myRequests.every(request => completedRequests.has(request));
        if (complete) { // If all searches are complete.
          // Unsubscribe from events.
          updateDisposables.forEach(disposable => disposable.dispose());
          completionDisposables.forEach(disposable => disposable.dispose());

          // Reject the promise if the search was cancelled, otherwise resolve.
          (isCancelled ? reject : resolve)(null);
        }
      };

      // Get the remote service that corresponds to each remote directory.
      var services = directories.map(dir => this._serviceProvider(dir));

      // Subscribe to file update and search completion update.
      var updateDisposables = services.map(service => service.onMatchesUpdate(onUpdate));
      var completionDisposables = services.map(service => service.onSearchCompleted(onCompleted));

      // Start the search in each given directory, getting a list of requestIds.
      var searchIdPromises = directories.map((dir, index) =>
        services[index].search(dir.getPath(), regex.source));

      // Resolve all of the searchIds, and then wait for their completion.
      Promise.all(searchIdPromises).then(searchIds => {
        myRequests = searchIds; // Store our search Ids.
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
