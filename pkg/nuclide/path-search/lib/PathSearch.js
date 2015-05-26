'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var QueryItem = require('./QueryItem');

type ResultSet = {
  query: string;
  results: Array<QueryScore>;
};

var PathSet;
var PATH_SEARCH_TIMEOUT_MS = 60 * 1000;

/**
 * Manages multiple simultaneous queries against a PathSet. The PathSearch is
 * responsible for deciding which queries to cancel based on newer queries.
 */
class PathSearch {
  _pathSet: PathSet;
  _activeQueries: {[key: string]: Promise<ResultSet>};
  _queryItemForPath: {[key: string]: QueryItem};

  /**
   * @param pathSet that keeps itself in sync with whatever directory it
   *     represents.
   */
  constructor(pathSet: PathSet) {
    this._pathSet = pathSet;
    this._activeQueries = {};
    this._queryItemForPath = {}; // It might be more efficient to store this in PathSet.
  }

  /**
   * @param query Is expected to be what the user has typed in a path-matching
   *     typeahead UI.
   * @return Promise that resolves to an empty ResultSet if it is canceled.
   */
  doQuery(query: string): Promise<ResultSet> {
    // Note that currently, if the query is the empty string, all of the files
    // in the underlying PathSet will be returned. This may not be desirable.

    // See if a request for this query is already in flight.
    var activeQuery = this._activeQueries[query];
    if (activeQuery) {
      return activeQuery;
    }

    // If any of the existing queries are a prefix of this new query, cancel
    // them. Here, we are assuming this is used to power a typeahead, so the
    // results of the old queries will no longer be of interest.
    var keysToRemove = [];
    for (var key in this._activeQueries) {
      if (query.startsWith(key)) {
        keysToRemove.push(key);
      }
    }

    // Because cancelJob() will call removePromise(), which will modify
    // this._activeQueries, we cannot call cancelJob() while iterating
    // this._activeQueries in the for/in loop above because that could interfere
    // with the iteration.
    if (keysToRemove.length) {
      keysToRemove.forEach(key => this._activeQueries[key].cancelJob());
    }

    // TODO(mbolin): It would be more complicated, but not completely insane,
    // for the new processor to start by filtering what the prefix query had
    // already found thus far.

    var TopScores = require('./TopScores');
    var topScores = new TopScores(/* capacity */ 50);

    var processor = (path: string) => {
      var queryItem = this._queryItemForPath[path];
      if (!queryItem) {
        queryItem = new QueryItem(path);
        // Currently, nothing is ever removed from _queryItemForPath. It's
        // unclear if the additional complexity in bookkeeping effort would
        // merit the memory savings.
        this._queryItemForPath[path] = queryItem;
      }
      var score = queryItem.score(query);
      if (score !== null) {
        topScores.insert(score);
      }
    };

    // This is helpful for debugging.
    processor.toString = () => query;

    var promise = this._pathSet.submit(processor);

    var promiseForQuery;
    var removePromise = () => {
      var entry = this._activeQueries[query];
      // Remove the entry only if it has not been replaced by a more recent one.
      if (entry === promiseForQuery) {
        delete this._activeQueries[query];
      }
    };

    promiseForQuery = promise.then(() => {
      var results = topScores.getTopScores();
      // Do the deletion in a timeout in case the user types backspace,
      // effectively asking for the previous results again.
      setTimeout(removePromise, PATH_SEARCH_TIMEOUT_MS);
      return {query, results};
    }, (error: Error) => {
      removePromise();
      PathSet = PathSet || require('./PathSet');
      if (error.errorCode === PathSet.ERROR_CODE_CANCELED) {
        // This request was canceled: resolve to an empty ResultSet.
        return {
          query,
          results: [],
        };
      } else {
        throw error;
      }
    });
    promiseForQuery.cancelJob = promise.cancelJob;
    this._activeQueries[query] = promiseForQuery;
    return promiseForQuery;
  }
}

module.exports = PathSearch;
