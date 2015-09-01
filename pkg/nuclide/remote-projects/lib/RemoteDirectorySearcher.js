'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Observable, ReplaySubject} from 'rx';
var {RemoteDirectory} = require('nuclide-remote-connection');

type SearchResult = {
  filePath: string;
  matches: Array<{
    lineText: string;
    lineTextOffset: number;
    matchText: string;
    range: Array<Array<number>>
  }>;
};

type DirectorySearchDelegate = {
  didMatch: (result: SearchResult) => void;
  didSearchPaths: (count: number) => void;
  inclusions: Array<string>;
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
    // Track the files that we have seen updates for.
    var seenFiles = new Set();

    // Get the remote service that corresponds to each remote directory.
    var services = directories.map(dir => this._serviceProvider(dir));

    // Start the search in each directory, and merge the resulting streams.
    var searchStream = Observable.merge(directories.map((dir, index) =>
      services[index].findInProjectSearch(dir.getPath(), regex, options.inclusions)));

    // Create a subject that we can use to track search completion.
    var searchCompletion = new ReplaySubject();
    searchCompletion.onNext();

    var subscription = searchStream.subscribe(next => {
      options.didMatch(next);

      // Call didSearchPaths with the number of unique files we have seen matches in. This is
      // not technically correct, as didSearchPaths is also supposed to count files for which
      // no matches were found. However, we currently have no way of obtaining this information.
      seenFiles.add(next.filePath);
      options.didSearchPaths(seenFiles.size);
    }, error => {
      searchCompletion.onError(error);
    }, () => {
      searchCompletion.onCompleted();
    });

    // Return a promise that resolves on search completion.
    var completionPromise = searchCompletion.toPromise();
    return {
      then: completionPromise.then.bind(completionPromise),
      cancel() {
        // Cancel the subscription, which should also kill the grep process.
        subscription.dispose();
      },
    };
  }
}

module.exports = RemoteDirectorySearcher;
