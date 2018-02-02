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
import {parseGrepLine} from './parser';

export function search(
  directory: NuclideUri,
  regex: RegExp,
): Observable<CodeSearchResult> {
  const args = (regex.ignoreCase ? ['-i'] : []).concat([
    // recursive, always print filename, print line number, use regex
    '-rHn',
    '-E',
    '-e',
    regex.source,
    directory,
  ]);
  return observeGrepLikeProcess('grep', args, directory).flatMap(event =>
    parseGrepLine(event, directory, regex),
  );
}
