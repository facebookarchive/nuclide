'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {search$FileResult, search$Match} from "./types";

var {asyncExecute} = require("nuclide-commons");
var split = require("split");
var path = require("path");

// This pattern is used for parsing the output of grep.
var GREP_PARSE_PATTERN = /(.*):(\d*):(.*)/;

async function search(directory: string, regex: string): Promise<Array<search$FileResult>> {
  var opts = {cwd: directory};

  // Sort matches in a Map of filename => Array<Match>.
  var matchesByFile = new Map();
  var output = await asyncExecute('hg', ['wgrep', '-in', regex], opts)
    .catch(() => asyncExecute('git', ['grep', '-in', regex], opts))
    .catch(() => asyncExecute('find', ['.', '-type', 'f', '-exec', 'grep', '-Hn', regex, "{}", ";"], opts))
    .catch(() => { throw new Error(`Failed to execute a grep search.`) });

  output.stdout.split(/\n/).forEach((line) => {
    var grepMatchResult = line.match(GREP_PARSE_PATTERN);
    if (grepMatchResult) {
      // Parse the filename, line number, and line text from grep output.
      var lineText = grepMatchResult[3];
      var lineNo = parseInt(grepMatchResult[2], 10) - 1;
      var filePath = grepMatchResult[1];

      // Extract the actual "matched" text.
      var matchTextResult = new RegExp(regex, 'i').exec(lineText);
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
        range: [[lineNo, matchIndex], [lineNo, matchIndex + matchText.length]]
      });
    }
  });

  var results = [];
  matchesByFile.forEach((matches, filePath) => results.push({matches, filePath}));
  return results;
}

module.exports = {
  search,
}
