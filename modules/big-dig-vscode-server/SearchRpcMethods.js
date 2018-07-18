"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SearchRpcMethods = exports.RESULT_AGGREGATION_DELAY_MS = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

/**
 * Collect results within this time window before sending them back. We use
 * this to reduce cluttering network traffic with many tiny messages.
 */
const RESULT_AGGREGATION_DELAY_MS = 100;
/** Methods for searching for files and text within files. */

exports.RESULT_AGGREGATION_DELAY_MS = RESULT_AGGREGATION_DELAY_MS;

class SearchRpcMethods {
  constructor(searcher) {
    this._searcher = searcher;
  }

  register(registrar) {
    registrar.registerFun('search/for-files', this._doFileSearch.bind(this));
    registrar.registerObservable('search/for-text', this._doTextSearch.bind(this));
  }

  dispose() {}

  getSearchProvider() {
    return this._searcher;
  }

  async _doFileSearch(params) {
    const {
      directory,
      query
    } = params;
    let results;

    if (query.trim().length !== 0) {
      results = await this._searcher.forFiles(directory, query);
    } else {
      results = [];
    }

    return {
      results
    };
  }
  /**
   * Searches each base path in parallel, merging the results in arbitrary order.
   */


  _doTextSearch(params) {
    const search = params.basePaths.map(({
      path,
      includes,
      excludes
    }) => {
      return this._searcher.forText(params.query, path, Object.assign({}, params.options, {
        includes,
        excludes
      }));
    });
    return _RxMin.Observable.merge(...search).map(match => {
      if (match.error === 'line-too-long') {
        // TODO(siegebell): we won't need this if vscode changes the api to
        // accept abbreviated leading/trailing/matching texts.
        const {
          path,
          line
        } = match;
        return {
          path,
          range: {
            start: {
              line,
              column: 0
            },
            end: {
              line,
              column: 0
            }
          },
          preview: {
            leading: '<LINE TOO LONG>',
            matching: '',
            trailing: ''
          }
        };
      } else {
        const {
          path,
          line,
          column,
          text,
          pre,
          post
        } = match;
        return {
          path,
          range: {
            start: {
              line,
              column
            },
            end: {
              line,
              column: column + text.length
            }
          },
          preview: {
            leading: pre,
            matching: text,
            trailing: post
          }
        };
      }
    }) // Don't send many frequent (small) messages
    .bufferTime(RESULT_AGGREGATION_DELAY_MS).filter(x => x.length > 0);
  }

}

exports.SearchRpcMethods = SearchRpcMethods;