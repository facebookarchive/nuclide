'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  search$FileResult,
  search$Match,
} from './types';

import {Observable} from 'rx';

import {
  fsPromise,
  safeSpawn,
} from 'nuclide-commons';
import path from 'path';
import split from 'split';

// This pattern is used for parsing the output of grep.
const GREP_PARSE_PATTERN = /(.*):(\d*):(.*)/;

/**
 * Searches for all instances of a pattern in a directory.
 * @param directory - The directory in which to perform a search.
 * @param regex - The pattern to match.
 * @param subdirs - An array of subdirectories to search within `directory`. If subdirs is an
    empty array, then simply search in directory.
 * @returns An observable that emits match events.
 */
export default function search(directory: string, regex: RegExp, subdirs: Array<string>):
    Observable<search$FileResult> {
  // Matches are stored in a Map of filename => Array<Match>.
  const matchesByFile: Map<string, Array<search$Match>> = new Map();

  if (!subdirs || subdirs.length === 0) {
    // Since no subdirs were specified, run search on the root directory.
    return searchInSubdir(matchesByFile, directory, '.', regex);
  } else {
    // Run the search on each subdirectory that exists.
    return Observable.from(subdirs).concatMap(async subdir => {
      try {
        const stat = await fsPromise.lstat(path.join(directory, subdir));
        if (stat.isDirectory()) {
          return searchInSubdir(matchesByFile, directory, subdir, regex);
        }
      } catch (e) {
        return Observable.empty();
      }
    }).mergeAll();
  }
}

// Helper function that runs the search command on the given directory
// `subdir`, relative to `directory`. The function returns an Observable that emits
// search$FileResult objects.
function searchInSubdir(
  matchesByFile: Map<string, Array<search$Match>>,
  directory: string,
  subdir: string,
  regex: RegExp
): Observable<search$FileResult> {
  // Try running search commands, falling through to the next if there is an error.
  const vcsargs = (regex.ignoreCase ? ['-i'] : []).concat(['-n', regex.source]);
  const grepargs = (regex.ignoreCase ? ['-i'] : []).concat(['-rHn', '-e', regex.source, '.']);
  const cmdDir = path.join(directory, subdir);
  const linesSource = Observable.catch(
    getLinesFromCommand('hg', ['wgrep'].concat(vcsargs), cmdDir),
    getLinesFromCommand('git', ['grep'].concat(vcsargs), cmdDir),
    getLinesFromCommand('grep', grepargs, cmdDir),
    Observable.throw(new Error('Failed to execute a grep search.'))
  );

  // Transform lines into file matches.
  return linesSource.map(line => {
    // Try to parse the output of grep.
    const grepMatchResult = line.match(GREP_PARSE_PATTERN);
    if (!grepMatchResult) {
      return;
    }

    // Extract the filename, line number, and line text from grep output.
    const lineText = grepMatchResult[3];
    const lineNo = parseInt(grepMatchResult[2], 10) - 1;
    const filePath = path.join(subdir, grepMatchResult[1]);

    // Try to extract the actual "matched" text.
    const matchTextResult = regex.exec(lineText);
    if (!matchTextResult) {
      return;
    }
    const matchText = matchTextResult[0];
    const matchIndex = matchTextResult.index;

    // Put this match into lists grouped by files.
    if (!matchesByFile.has(filePath)) {
      matchesByFile.set(filePath, []);
    }
    matchesByFile.get(filePath).push({
      lineText,
      lineTextOffset: 0,
      matchText,
      range: [[lineNo, matchIndex], [lineNo, matchIndex + matchText.length]],
    });

    // If a callback was provided, invoke it with the newest update.
    return {matches: matchesByFile.get(filePath), filePath};
  }).filter(Boolean); // Filters out the falsey events.
}


// Helper function that runs a command in a given directory, invoking a callback
// as each line is written to stdout.
function getLinesFromCommand(command: string, args: Array<string>, localDirectoryPath: string):
    Observable<string> {
  return Observable.create(observer => {
    let proc: ?child_process$ChildProcess = null;
    let exited = false;

    // Spawn the search command in the given directory.
    safeSpawn(command, args, {cwd: localDirectoryPath}).then(child => {
      proc = child;

      // Reject on error.
      proc.on('error', observer.onError.bind(observer));

      // Call the callback on each line.
      proc.stdout.pipe(split()).on('data', observer.onNext.bind(observer));

      // Keep a running string of stderr, in case we need to throw an error.
      let stderr = '';
      proc.stderr.on('data', data => {
        stderr += data;
      });

      // Resolve promise if error code is 0 (found matches) or 1 (found no matches). Otherwise
      // reject. However, if a process was killed with a signal, don't reject, since this was likely
      // to cancel the search.
      proc.on('close', (code, signal) => {
        exited = true;
        if (signal || code <= 1) {
          observer.onCompleted();
        } else {
          observer.onError(new Error(stderr));
        }
      });
    }).catch(error => {
      observer.onError(error);
    });

    // Kill the search process on dispose.
    return () => {
      if (!exited) {
        proc && proc.kill();
      }
    };
  });
}
