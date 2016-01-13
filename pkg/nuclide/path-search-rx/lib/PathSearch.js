'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {QueryScore} from './QueryScore';

import LazyPathSet from './LazyPathSet';

type ResultSet = {
  query: string;
  results: Array<QueryScore>;
};

/**
 * Manages multiple simultaneous queries against a PathSet. The PathSearch is
 * responsible for deciding which queries to cancel based on newer queries.
 * TODO jxg revisit whether this ^ contract still stands. Presumably, the use of RX will provide
 * this behavior for free.
 */
export default class PathSearch {
  _pathSet: LazyPathSet;

  /**
   * @param pathSet that keeps itself in sync with whatever directory it
   *     represents.
   */
  constructor(pathSet: LazyPathSet) {
    this._pathSet = pathSet;
  }

  // TODO forward an actual RX stream instead of a Promise of the entire results array.
  doRXQuery(query: string): Promise<Array<Object>> {
    return this._pathSet.doQuery(query).toArray().toPromise();
  }

  /**
   * @param query Is expected to be what the user has typed in a path-matching
   *     typeahead UI.
   * @return Promise that resolves to an empty ResultSet if it is canceled.
   */
  async doQuery(query: string): Promise<ResultSet> {
    query = query.toLowerCase();
    if (query.length === 0) {
      return Promise.resolve({query: '', results: []});
    }
    const results = await this.doRXQuery(query);
    return {query, results};
  }

}
