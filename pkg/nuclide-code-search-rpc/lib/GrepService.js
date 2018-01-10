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
import {parseGrepLine} from './parser';

export function search(
  directory: NuclideUri,
  query: string,
): Observable<CodeSearchResult> {
  const args = [
    // ignore case, recursive, always print filename, print line number
    '-i',
    '-rHn',
    query,
    directory,
  ];
  return observeProcess('grep', args, {
    cwd: directory,
    // An exit code of 0 or 1 is perfectly normal for grep (1 = no results).
    isExitError: ({exitCode, signal}) => {
      return (
        // flowlint-next-line sketchy-null-string:off
        !signal && (exitCode == null || exitCode > 1)
      );
    },
  }).flatMap(event => parseGrepLine(event, directory, query));
}
