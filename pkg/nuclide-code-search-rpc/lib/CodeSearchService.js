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

import type {search$FileResult, CodeSearchResult} from './types';
import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import {
  resolveTool,
  searchInDirectory,
  searchInDirectories,
} from './searchInDirectory';
import {
  isFuse,
  isNfs,
} from '../../nuclide-server/lib/services/FileSystemService';
import {ConnectableObservable, Observable} from 'rxjs';

// Limit the total result size to avoid overloading the Nuclide server + Atom.
const MATCH_BYTE_LIMIT = 2 * 1024 * 1024;

export async function isEligibleForDirectory(
  rootDirectory: NuclideUri,
): Promise<boolean> {
  const checks = await Promise.all([
    resolveTool(null).then(tool => tool == null),
    isNfs(rootDirectory),
    isFuse(rootDirectory),
  ]);
  if (checks.some(x => x)) {
    return false;
  }

  return true;
}

/**
 * @param directory - The directory in which to perform a search.
 * @param regex - The pattern to match.
 * @param useVcsSearch - Whether to try to use hg/git grep to find the pattern.
 * @param tool - Which tool to use from POSIX_TOOLS or WINDOWS_TOOLS,
 *   default to first one available.
 * @param maxResults - Maximum number of results to emit.
 * @returns An observable that emits results.
 */
export function codeSearch(
  directory: NuclideUri,
  regex: RegExp,
  useVcsSearch: boolean,
  tool: ?string,
  maxResults: number,
): ConnectableObservable<CodeSearchResult> {
  return searchInDirectory(directory, regex, tool, useVcsSearch)
    .take(maxResults)
    .publish();
}

/**
 * Searches for all instances of a pattern in subdirectories.
 * @param directory - The directory in which to perform a search.
 * @param regex - The pattern to match.
 * @param subdirs - An array of subdirectories to search within `directory`. If subdirs is an
 *   empty array, then simply search in directory.
 * @param useVcsSearch - Whether to try to use hg/git grep to find the pattern.
 * @param tool - Which tool to use from POSIX_TOOLS or WINDOWS_TOOLS,
 *   default to first one available.
 * @returns An observable that emits match events.
 */
export function remoteAtomSearch(
  directory: NuclideUri,
  regex: RegExp,
  subdirs: Array<string>,
  useVcsSearch: boolean,
  tool: ?string,
): ConnectableObservable<search$FileResult> {
  return mergeSearchResults(
    searchInDirectories(directory, regex, subdirs, useVcsSearch, tool),
    regex,
  ).publish();
}

// Convert CodeSearchResults into search$FileResult.
function mergeSearchResults(
  codeSearchResults: Observable<CodeSearchResult>,
  regex: RegExp,
): Observable<search$FileResult> {
  const results = codeSearchResults
    .flatMap((searchResult: CodeSearchResult) => {
      const {file, row, line} = searchResult;

      // Try to extract all actual "matched" texts on the same line.
      const result = [];
      // Loop through each matched text on a line
      let matchTextResult;
      // Note: Atom will auto-insert 'g' flag, so, we can loop through all matches.
      while ((matchTextResult = regex.exec(line)) != null) {
        const matchText = matchTextResult[0];
        const matchIndex = matchTextResult.index;
        // Some invalid regex (e.g. /||/g) will always match,
        // but with an empty match string, so the exec loop becomes infinite.
        // Check for this case and abort early.
        if (matchText.length === 0) {
          break;
        }
        result.push({
          filePath: file,
          match: {
            lineText: line,
            lineTextOffset: 0,
            matchText,
            range: [[row, matchIndex], [row, matchIndex + matchText.length]],
          },
        });

        // Handle corner case if 'g' flag is not provided
        if (!regex.global) {
          break;
        }
      }

      // IMPORTANT: reset the regex for the next search
      regex.lastIndex = 0;

      return result;
    })
    .share();

  return (
    results
      // Limit the total result size.
      .merge(
        results
          .scan(
            (size, {match}) =>
              size + match.lineText.length + match.matchText.length,
            0,
          )
          .filter(size => size > MATCH_BYTE_LIMIT)
          .switchMapTo(
            Observable.throw(
              Error(
                `Too many results, truncating to ${MATCH_BYTE_LIMIT} bytes`,
              ),
            ),
          )
          .ignoreElements(),
      )
      // Buffer results by file. Flush when the file changes, or on completion.
      .buffer(
        Observable.concat(
          results.distinct(result => result.filePath),
          Observable.of(null),
        ),
      )
      .filter(buffer => buffer.length > 0)
      .map(buffer => ({
        filePath: buffer[0].filePath,
        matches: buffer.map(x => x.match),
      }))
  );
}
