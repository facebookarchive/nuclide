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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {CodeSearchResult} from './types';

import {Observable} from 'rxjs';
import {observeProcess} from 'nuclide-commons/process';
import {parseAgAckRgLine} from './parser';

export function search(
  directory: NuclideUri,
  regex: RegExp,
): Observable<CodeSearchResult> {
  // Javascript escapes the slash when constructing the regexp,
  // but Rust's regex library is picky about extra escapes:
  // see https://github.com/rust-lang/regex/issues/93#issuecomment-196022003
  const source = regex.source.replace('\\/', '/');
  return observeProcess(
    'rg',
    (regex.ignoreCase ? ['--ignore-case'] : []).concat([
      // no colors, show line number, search hidden files,
      // show column number, one result per line
      '--color',
      'never',
      '--line-number',
      '--hidden',
      '--column',
      '--no-heading',
      '-e',
      source,
      directory,
    ]),
  ).flatMap(event => parseAgAckRgLine(event));
}
