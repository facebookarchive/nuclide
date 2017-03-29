'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RemoteDirectorySearcher {

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

    const searchStreams = directories.map((dir, index) => services[index].grepSearch(dir.getPath(), regex, RemoteDirectorySearcher.processPaths(dir.getPath(), options.inclusions)).refCount());

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
      cancel() {
        // Cancel the subscription, which should also kill the grep process.
        subscription.unsubscribe();
      }
    };
  }

  /**
   * If a query's prefix matches the rootPath's basename, treat the query as a relative search.
   * Based on https://github.com/atom/atom/blob/master/src/scan-handler.coffee.
   * Marked as static for testing.
   */
  static processPaths(rootPath, paths) {
    if (paths == null) {
      return [];
    }
    const rootPathBase = (_nuclideUri || _load_nuclideUri()).default.basename(rootPath);
    const results = [];
    for (const path of paths) {
      const segments = (_nuclideUri || _load_nuclideUri()).default.split(path);
      const firstSegment = segments.shift();
      results.push(path);
      if (firstSegment === rootPathBase) {
        if (segments.length === 0) {
          // Search everything.
          return [];
        } else {
          // Try interpreting this as a subdirectory of the base as well.
          results.push((_nuclideUri || _load_nuclideUri()).default.join(...segments));
        }
      }
    }
    return results;
  }
}
exports.default = RemoteDirectorySearcher; /**
                                            * Copyright (c) 2015-present, Facebook, Inc.
                                            * All rights reserved.
                                            *
                                            * This source code is licensed under the license found in the LICENSE file in
                                            * the root directory of this source tree.
                                            *
                                            * 
                                            */