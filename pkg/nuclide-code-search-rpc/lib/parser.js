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

import nuclideUri from 'nuclide-commons/nuclideUri';
import {Observable} from 'rxjs';

export const PARSE_REGEXES = Object.freeze({
  rg: /^(.+)\0(\d+):(\d+):(.*)$/,
  ack: /^(.+):(\d+):(\d+):(.*)$/,
  grep: /^(.+)\0(\d+):(.*)$/,
  vcsGrep: /^(.+):(\d+):(.*)$/,
});

export function parseAckRgLine(
  event: ProcessMessage,
  regex: RegExp,
  tool: 'rg' | 'ack',
): Observable<CodeSearchResult> {
  const parseRegex = PARSE_REGEXES[tool];
  if (event.kind === 'stdout') {
    const matches = event.data.trim().match(parseRegex);
    if (matches != null && matches.length === 5) {
      const [file, row, column, line] = matches.slice(1);
      const columnNumber = parseInt(column, 10) - 1;
      const match = regex.exec(line.slice(columnNumber));
      // match should not be null, but in some edge cases it might be.
      if (match == null) {
        return Observable.empty();
      }
      const matchLength = match[0].length;
      // Remember to reset the regex!
      regex.lastIndex = 0;
      return Observable.of({
        file,
        row: parseInt(row, 10) - 1,
        column: columnNumber,
        line,
        matchLength,
      });
    }
  }
  return Observable.empty();
}

export function parseGrepLine(
  event: ProcessMessage,
  regex: RegExp,
  tool: 'grep' | 'vcsGrep',
): Observable<CodeSearchResult> {
  const parseRegex = PARSE_REGEXES[tool];
  if (event.kind === 'stdout') {
    const matches = event.data.trim().match(parseRegex);
    if (matches != null && matches.length === 4) {
      const [file, row, line] = matches.slice(1);
      // Grep does not have a --column option so we have to do our own.
      // Finding the first index is consistent with the other 'ack'-like tools.
      const match = regex.exec(line);
      // match should not be null, but in some edge cases it might be.
      if (match == null) {
        return Observable.empty();
      }
      const column = match.index;
      const matchLength = match[0].length;
      // Then reset the regex for the next search.
      regex.lastIndex = 0;
      return Observable.of({
        file,
        row: parseInt(row, 10) - 1,
        column,
        line,
        matchLength,
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
  return parseGrepLine(event, regex, 'vcsGrep').map(result => ({
    ...result,
    file: nuclideUri.isAbsolute(result.file)
      ? result.file
      : nuclideUri.join(cwd, result.file),
  }));
}
