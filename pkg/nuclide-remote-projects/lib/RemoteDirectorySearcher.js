'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

let RemoteDirectorySearcher = class RemoteDirectorySearcher {

  // When constructed, RemoteDirectorySearcher must be passed a function that
  // it can use to get a 'GrepService' for a given remote path.
  constructor(serviceProvider) {
    this._serviceProvider = serviceProvider;
  }

  canSearchDirectory(directory) {
    return (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).RemoteDirectory.isRemoteDirectory(directory);
  }

  search(directories, regex, options) {
    // Track the files that we have seen updates for.
    const seenFiles = new Set();

    // Get the remote service that corresponds to each remote directory.
    const services = directories.map(dir => this._serviceProvider(dir));

    const searchStreams = directories.map((dir, index) => services[index].grepSearch(dir.getPath(), regex, options.inclusions).refCount());

    // Start the search in each directory, and merge the resulting streams.
    const searchStream = _rxjsBundlesRxMinJs.Observable.merge(...searchStreams);

    // Create a subject that we can use to track search completion.
    const searchCompletion = new _rxjsBundlesRxMinJs.ReplaySubject();
    searchCompletion.next();

    const subscription = searchStream.subscribe(next => {
      options.didMatch(next);

      // Call didSearchPaths with the number of unique files we have seen matches in. This is
      // not technically correct, as didSearchPaths is also supposed to count files for which
      // no matches were found. However, we currently have no way of obtaining this information.
      seenFiles.add(next.filePath);
      options.didSearchPaths(seenFiles.size);
    }, error => {
      options.didError(error);
      searchCompletion.error(error);
    }, () => {
      searchCompletion.complete();
    });

    // Return a promise that resolves on search completion.
    const completionPromise = searchCompletion.toPromise();
    return {
      then: completionPromise.then.bind(completionPromise),
      cancel: function () {
        // Cancel the subscription, which should also kill the grep process.
        subscription.unsubscribe();
      }
    };
  }
};


module.exports = RemoteDirectorySearcher;