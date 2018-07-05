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

import type {QueryResult} from '../TextSearch';
import type {SearchProvider} from '../SearchRpcMethods';

import * as proto from '../Protocol.js';
import invariant from 'assert';
import {Subject} from 'rxjs';
import {SearchRpcMethods} from '../SearchRpcMethods';

export class TextSearchHarness {
  static +defaultOptions = {
    isRegExp: false,
    isCaseSensitive: false,
    isWordMatch: false,
  };

  _isStarted = false;
  // Collects all of the results
  _search: Promise<proto.SearchForTextData>;
  // The mock search provider we give to `SearchRpcMethods`.
  searcher: SearchProvider;
  // Corresponding to each `basePath`, each `Subject` sends results to `_doTextSearch`.
  _matchResults: Array<Subject<QueryResult>> = [];
  // Collects results of `_doTextSearch`.
  +_currentResults: Array<proto.SearchForTextDatum> = [];
  +forText: Function = jest.fn();
  rpc: SearchRpcMethods;

  constructor() {
    this.searcher = {
      // We are not testing this:
      forFiles(...args) {
        throw new Error('forFiles should not be called');
      },
      // We are testing this:
      forText: this.forText,
    };
    this.rpc = new SearchRpcMethods(this.searcher);
  }

  start(
    query: string,
    basePaths: Array<string | proto.SearchBase>,
    options: $Rest<proto.SearchForTextQueryOptions, {}> = {},
  ): void {
    invariant(this._isStarted === false, 'Already started');
    this._isStarted = true;

    basePaths.forEach(() => {
      const newQuery = new Subject();
      this.forText.mockReturnValueOnce(newQuery);
      this._matchResults.push(newQuery);
    });

    const params = {
      query,
      basePaths: basePaths.map(
        x =>
          typeof x === 'string' ? {path: x, includes: [], excludes: []} : x,
      ),
      options: {...TextSearchHarness.defaultOptions, ...options},
    };

    this._search = this.rpc
      ._doTextSearch(params)
      .mergeAll()
      .do(x => this._currentResults.push(x))
      .toArray()
      .toPromise();
  }

  dispose(): void {
    this.rpc.dispose();
  }

  results(): Promise<proto.SearchForTextData> {
    invariant(this._isStarted === true, 'Must call `start()` first');
    return this._search;
  }

  currentResults(): proto.SearchForTextData {
    invariant(this._isStarted === true, 'Must call `start()` first');
    return this._currentResults;
  }

  nextMatch(basePathId: number, value: QueryResult): void {
    invariant(this._isStarted === true, 'Must call `start()` first');
    this._matchResults[basePathId].next(value);
  }

  completeMatch(basePathId: number): void {
    invariant(this._isStarted === true, 'Must call `start()` first');
    this._matchResults[basePathId].complete();
  }

  completeMatches(): void {
    invariant(this._isStarted === true, 'Must call `start()` first');
    this._matchResults.forEach(m => m.complete());
  }
}
