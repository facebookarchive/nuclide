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
      regex.source,
      directory,
    ]),
  ).flatMap(event => parseAgAckRgLine(event));
}
