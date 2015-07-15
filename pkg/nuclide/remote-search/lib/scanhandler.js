'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {search$FileResult, search$Match} from './types';

var {safeSpawn} = require('nuclide-commons');
var split = require('split');

// This pattern is used for parsing the output of grep.
var GREP_PARSE_PATTERN = /(.*):(\d*):(.*)/;

type UpdateFileMatchesCallback = (result: search$FileResult) => void;

/**
 * Searches for all instances of a pattern in a directory.
 * @param directory - The directory in which to perform a search.
 * @param regex - The pattern to match.
 * @param onFileMatchesUpdate - An optional callback, invoked whenever new matches are found.
 *  The results are cumulative, so each invokation also contains all the previous matches
 *  in the file.
 * @param caseSensitive - True if the grep search should be performed case sensitively.
 * @returns A promise resolving to an array of all matches, grouped by file.
 */
async function search(
  directory: string,
  regex: string,
  onFileMatchesUpdate: ?UpdateFileMatchesCallback,
  caseSensitive: boolean
  ): Promise<Array<search$FileResult>> {
  // Matches are stored in a Map of filename => Array<Match>.
  var matchesByFile: Map<string, Array<search$Match>> = new Map();

  // Callback invoked each output line from the grep process.
  var onLine = line => {
    // Try to parse the output of grep.
    var grepMatchResult = line.match(GREP_PARSE_PATTERN);
    if (!grepMatchResult) {
      return;
    }

    // Extract the filename, line number, and line text from grep output.
    var lineText = grepMatchResult[3];
    var lineNo = parseInt(grepMatchResult[2], 10) - 1;
    var filePath = grepMatchResult[1];

    // Try to extract the actual "matched" text.
    var matchTextResult = new RegExp(regex, caseSensitive ? '' : 'i').exec(lineText);
    if (!matchTextResult) {
      return;
    }
    var matchText = matchTextResult[0];
    var matchIndex = matchTextResult.index;

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
    if (onFileMatchesUpdate) {
      onFileMatchesUpdate({
        matches: matchesByFile.get(filePath),
        filePath,
      });
    }
  };

  // Try running search commands, falling through to the next if there is an error.
  var vcsargs = (caseSensitive ? [] : ['-i']).concat(['-n', regex]);
  var grepargs = (caseSensitive ? [] :  ['-i']).concat(['-rHn', '-e', regex, '.']);
  await getLinesFromCommand('hg', ['wgrep'].concat(vcsargs), directory, onLine)
    .catch(() => getLinesFromCommand('git', ['grep'].concat(vcsargs), directory, onLine))
    .catch(() => getLinesFromCommand('grep', grepargs, directory, onLine))
    .catch(() => { throw new Error('Failed to execute a grep search.') });

  // Return final results.
  var results = [];
  matchesByFile.forEach((matches, filePath) => { results.push({matches, filePath}) });
  return results;
}

function getLinesFromCommand(command: string,
  args: Array<string>,
  localDirectoryPath: string,
  onLine: ?(line: string) => void): Promise {

  return new Promise((resolve, reject) => {
    // Spawn the search command in the given directory.
    var proc = safeSpawn(command, args, { cwd: localDirectoryPath });

    proc.on('error', reject); // Reject on error.
    proc.stdout.pipe(split()).on('data', onLine); // Call the callback on each line.

    // Keep a running string of stderr, in case we need to throw an error.
    var stderr = '';
    proc.stderr.on('data', data => {
      stderr += data;
    });

    // Resolve promise if error code is 0 (found matches) or 1 (found no matches). Otherwise reject.
    proc.on('close', code => {
      if (code > 1) {
        reject(new Error(stderr));
      } else {
        resolve();
      }
    });
  });
}

module.exports = {
  search,
};
