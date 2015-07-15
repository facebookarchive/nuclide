'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class FindInProjectService {
  // Create a search request.
  search(directory: NuclideUri, regex: string, caseSensitive: bool, subdirs: Array<string>): Promise<Number> {
    return Promise.reject('Not implemented');
  }

  // Subscribe to the completion of searches.
  onSearchCompleted(callback: (requestId: number) => void): Disposable {
    return Promise.reject('Not implemented');
  }

  // Subscribe to an event triggered whenever new matches are found in a file.
  onMatchesUpdate(
    callback: (
      requestId: number,
      fileResult: {
        filePath: NuclideUri;
        matches: Array<{
          lineText: string;
          lineTextOffset: number;
          matchText: string;
          range: Array<Array<number>>
        }>
      }
    ) => void
  ): Disposable {
    return Promise.reject('Not implemented');
  }
}

module.exports = FindInProjectService;
