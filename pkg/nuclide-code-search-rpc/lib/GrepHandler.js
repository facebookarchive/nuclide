/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {CodeSearchResult, CodeSearchParams} from './types';

import {Observable} from 'rxjs';
import {observeGrepLikeProcess} from './handlerCommon';
import {parseGrepLine} from './parser';

export function search(params: CodeSearchParams): Observable<CodeSearchResult> {
  const {regex, limit} = params;
  const searchSources = params.recursive ? [params.directory] : params.files;
  if (searchSources.length === 0) {
    return Observable.empty();
  }
  const args = (regex.ignoreCase ? ['-i'] : [])
    .concat(limit != null ? ['-m', String(limit)] : [])
    .concat([
      // recursive, always print filename, print line number with null byte,
      // use extended regex
      '-rHn',
      '--null',
      '-E',
      '-e',
      regex.source,
    ])
    .concat(searchSources);
  return observeGrepLikeProcess('grep', args).flatMap(event =>
    parseGrepLine(event, regex, 'grep'),
  );
}
