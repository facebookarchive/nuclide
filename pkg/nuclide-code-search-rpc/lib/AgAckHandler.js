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
import {observeGrepLikeProcess} from './handlerCommon';
import {parseAgAckRgLine} from './parser';

export function search(
  directory: NuclideUri,
  regex: RegExp,
  tool: 'ag' | 'ack',
): Observable<CodeSearchResult> {
  const baseArgs = [];
  // ag does not search hidden files without --hidden flag.
  if (tool === 'ag') {
    baseArgs.push('--hidden');
  }
  if (regex.ignoreCase) {
    baseArgs.push('--ignore-case');
  }
  return observeGrepLikeProcess(
    tool,
    baseArgs.concat([
      // no colors, always show column of first match, one result per line
      '--nocolor',
      '--column',
      '--nogroup',
      regex.source,
      directory,
    ]),
  ).flatMap(event => parseAgAckRgLine(event));
}
