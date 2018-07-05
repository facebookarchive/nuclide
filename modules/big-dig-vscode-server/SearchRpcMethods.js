/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import type {RpcRegistrar} from './rpc-types';
import type {
  SearchForFilesParams,
  SearchForFilesResult,
  SearchForTextParams,
  SearchForTextData,
} from './Protocol';
import type {QueryOptions, QueryResult} from './TextSearch';

import {Observable} from 'rxjs';

/** Provides and implementation for each operation provided by the RPC. */
export type SearchProvider = {
  forFiles(basePath: string, query: string): Promise<Array<string>>,
  forText(
    query: string,
    basePath: string,
    options: QueryOptions,
  ): Observable<QueryResult>,
};

/**
 * Collect results within this time window before sending them back. We use
 * this to reduce cluttering network traffic with many tiny messages.
 */
export const RESULT_AGGREGATION_DELAY_MS = 100;

/** Methods for searching for files and text within files. */
export class SearchRpcMethods {
  _searcher: SearchProvider;

  constructor(searcher: SearchProvider) {
    this._searcher = searcher;
  }

  register(registrar: RpcRegistrar) {
    registrar.registerFun('search/for-files', this._doFileSearch.bind(this));
    registrar.registerObservable(
      'search/for-text',
      this._doTextSearch.bind(this),
    );
  }

  dispose(): void {}

  getSearchProvider(): SearchProvider {
    return this._searcher;
  }

  async _doFileSearch(
    params: SearchForFilesParams,
  ): Promise<SearchForFilesResult> {
    const {directory, query} = params;
    let results;
    if (query.trim().length !== 0) {
      results = await this._searcher.forFiles(directory, query);
    } else {
      results = [];
    }

    return {results};
  }

  /**
   * Searches each base path in parallel, merging the results in arbitrary order.
   */
  _doTextSearch(params: SearchForTextParams): Observable<SearchForTextData> {
    const search = params.basePaths.map(({path, includes, excludes}) => {
      return this._searcher.forText(params.query, path, {
        ...params.options,
        includes,
        excludes,
      });
    });
    return (
      Observable.merge(...search)
        .map(match => {
          if (match.error === 'line-too-long') {
            // TODO(siegebell): we won't need this if vscode changes the api to
            // accept abbreviated leading/trailing/matching texts.
            const {path, line} = match;
            return {
              path,
              range: {start: {line, column: 0}, end: {line, column: 0}},
              preview: {
                leading: '<LINE TOO LONG>',
                matching: '',
                trailing: '',
              },
            };
          } else {
            const {path, line, column, text, pre, post} = match;
            return {
              path,
              range: {
                start: {line, column},
                end: {line, column: column + text.length},
              },
              preview: {
                leading: pre,
                matching: text,
                trailing: post,
              },
            };
          }
        })
        // Don't send many frequent (small) messages
        .bufferTime(RESULT_AGGREGATION_DELAY_MS)
        .filter(x => x.length > 0)
    );
  }
}
