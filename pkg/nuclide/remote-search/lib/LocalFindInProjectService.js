'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {search$FileResult, search$Match} from "./types";

var {EventEmitter} = require("events");
var scanhandler = require('./scanhandler');
var path = require('path');

const ON_MATCHES_UPDATE = 'update';
const ON_SEARCH_COMPLETED = 'completed';

type FindInProject$Request = {
  resultsPromise: Promise<Array<search$FileResult>>;
  id: number;
};

class LocalFindInProjectService {
  // Store a current request id counter.
  _requests: number;

  // A gobal emitter used by clients receive streaming results.
  _emitter: EventEmitter;

  constructor() {
    this._requests = 1;
    this._emitter = new EventEmitter();
  }

  search(directory: NuclideUri, regex: string): Promise<number> {
    var requestId = this._requests++; // Get a unique number to represent this request.

    // Start the search asynchronously.
    process.nextTick(() => {
      scanhandler.search(directory, regex, update => {
        // On update, normalize the paths, and try to pass the update to clients.
        this._emitter.emit(ON_MATCHES_UPDATE, requestId, {
          filePath: path.join(directory, update.filePath),
          matches: update.matches,
        });
      }).then(results => {
        // Upon completion of search, emit event.
        this._emitter.emit(ON_SEARCH_COMPLETED, requestId);
      });
    });

    // Return the request id to the client, without blocking on the search's completion.
    return Promise.resolve(requestId);
  }

  // Subscribe to the completion of searches.
  onSearchCompleted(callback: (requestId: number) => void): Disposable {
    // Add this callback to a listener for completions.
    this._emitter.addListener(ON_SEARCH_COMPLETED, callback);

    // Return a disposable that lets the client unsubscribe.
    return {
      dispose: () => this._emitter.removeListener(ON_SEARCH_COMPLETED, callback),
    };
  }


  // Subscribe to an event triggered whenever new matches are found in a file.
  onMatchesUpdate(
    callback: (
      requestId: number,
      fileResult: search$FileResult
    ) => void
  ): Disposable {
    // Add this callback to a listener for results.
    this._emitter.addListener(ON_MATCHES_UPDATE, callback);

    // Return a disposable that lets the client unsubscribe.
    return {
      dispose: () => this._emitter.removeListener(ON_MATCHES_UPDATE, callback),
    };
  }
}

module.exports = LocalFindInProjectService;
