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

import type {CodeSearchResult} from './types';
import type {ProcessMessage} from 'nuclide-commons/process';

import invariant from 'assert';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {Observable} from 'rxjs';

const ACK_PARSE_REGEX = /^(.+):(\d+):(\d+):(.*)$/;
const GREP_PARSE_REGEX = /^(.+):(\d+):(.*)$/;

export function parseAckRgLine(
  event: ProcessMessage,
): Observable<CodeSearchResult> {
  if (event.kind === 'stdout') {
    const matches = event.data.trim().match(ACK_PARSE_REGEX);
    if (matches != null && matches.length === 5) {
      const [file, row, column, line] = matches.slice(1);
      return Observable.of({
        file,
        row: parseInt(row, 10) - 1,
        column: parseInt(column, 10) - 1,
        line,
      });
    }
  }
  return Observable.empty();
}

export function parseGrepLine(
  event: ProcessMessage,
  regex: RegExp,
): Observable<CodeSearchResult> {
  if (event.kind === 'stdout') {
    const matches = event.data.trim().match(GREP_PARSE_REGEX);
    if (matches != null && matches.length === 4) {
      const [file, row, line] = matches.slice(1);
      // Grep does not have a --column option so we have to do our own.
      // Finding the first index is consistent with the other 'ack'-like tools.
      const match = regex.exec(line);
      // match cannot be null because grep used the regex to find this line.
      invariant(match != null);
      const column = match.index;
      // Then reset the regex for the next search.
      regex.lastIndex = 0;
      return Observable.of({
        file,
        row: parseInt(row, 10) - 1,
        column,
        line,
      });
    }
  }
  return Observable.empty();
}

export function parseVcsGrepLine(
  event: ProcessMessage,
  cwd: string,
  regex: RegExp,
): Observable<CodeSearchResult> {
  // Note: the vcs-grep searches return paths rooted from their cwd,
  // so join the paths to make them absolute.
  return parseGrepLine(event, regex).map(result => ({
    ...result,
    file: nuclideUri.isAbsolute(result.file)
      ? result.file
      : nuclideUri.join(cwd, result.file),
  }));
}
