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
import {parseVcsGrepLine} from './parser';

export function search(
  directory: NuclideUri,
  regex: RegExp,
): Observable<CodeSearchResult> {
  const sharedArgs = (regex.ignoreCase ? ['-i'] : []).concat([
    // print line number
    '-n',
    '-E',
    regex.source,
    directory,
  ]);
  const parseGrepResults = (command, args) => {
    return observeProcess(command, args, {
      cwd: directory,
      // An exit code of 0 or 1 is perfectly normal for grep (1 = no results).
      // `hg grep` can sometimes have an exit code of 123, since it uses xargs.
      isExitError: ({exitCode, signal}) => {
        return (
          // flowlint-next-line sketchy-null-string:off
          !signal && (exitCode == null || (exitCode > 1 && exitCode !== 123))
        );
      },
    }).flatMap(event => parseVcsGrepLine(event, directory, regex));
  };
  // Try running search commands, falling through to the next if there is an error.
  return parseGrepResults('git', ['grep'].concat(sharedArgs)).catch(() =>
    parseGrepResults('hg', ['wgrep'].concat(sharedArgs)),
  );
}
