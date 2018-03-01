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
import {parseAckRgLine} from './parser';

export function search(params: CodeSearchParams): Observable<CodeSearchResult> {
  const {regex, limit} = params;
  const searchSources = params.recursive ? [params.directory] : params.files;
  if (searchSources.length === 0) {
    return Observable.empty();
  }
  const baseArgs = [];
  if (regex.ignoreCase) {
    baseArgs.push('--ignore-case');
  }
  if (limit != null) {
    baseArgs.push('-m', String(limit));
  }
  return observeGrepLikeProcess(
    'ack',
    baseArgs
      .concat([
        // no colors, always show column of first match, one result per line,
        // always show filename, no smart case
        '--with-filename',
        '--nosmart-case',
        '--nocolor',
        '--nopager',
        '--column',
        '--nogroup',
        regex.source,
      ])
      .concat(searchSources),
  ).flatMap(event => parseAckRgLine(event, regex, 'ack'));
}
