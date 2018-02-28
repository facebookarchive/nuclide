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
  // Javascript escapes the slash when constructing the regexp,
  // but Rust's regex library is picky about extra escapes:
  // see https://github.com/rust-lang/regex/issues/93#issuecomment-196022003
  const source = regex.source.split('\\/').join('/');
  const output = observeGrepLikeProcess(
    'rg',
    (regex.ignoreCase ? ['--ignore-case'] : [])
      .concat([
        // no colors, show line number, search hidden files,
        // show column number, one result per line, show filename
        '--color',
        'never',
        '--line-number',
        '--hidden',
        '--column',
        '--no-heading',
        '-H',
        '-e',
        source,
      ])
      .concat(searchSources),
  ).flatMap(event => parseAckRgLine(event));
  return limit != null ? output.take(limit) : output;
}
