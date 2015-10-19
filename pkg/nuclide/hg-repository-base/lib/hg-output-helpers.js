'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Matches a hunk summary line as specified in the unified diff format.
 * Explained here: http://www.gnu.org/software/diffutils/manual/html_node/Detailed-Unified.html
 * and here: http://www.artima.com/weblogs/viewpost.jsp?thread=164293.
 */
var HUNK_DIFF_REGEX = /@@ .* @@/g;
var HUNK_OLD_INFO_REGEX = /\-([0-9]+)((?:,[0-9]+)?)/;
var HUNK_NEW_INFO_REGEX = /\+([0-9]+)((?:,[0-9]+)?)/;

/**
 * We choose a length that should be long enough to uniquely identify a ChangeSet with an Hg repo,
 * while also being compact enough to display efficiently in a UI.
 */
var CHANGE_SET_ID_PREFIX_LENGTH = 8;

import type {DiffInfo} from './hg-constants';

/**
 * Parses the output of `hg diff --unified 0`.
 */
function parseHgDiffUnifiedOutput(output: string): DiffInfo {
  var diffInfo = {
    added: 0,
    deleted: 0,
    lineDiffs: [],
  };
  if (!output) {
    return diffInfo;
  }
  var diffHunks = output.match(HUNK_DIFF_REGEX);
  diffHunks.forEach((hunk) => {
    // `hunk` will look like: "@@ -a(,b) +c(,d) @@"
    var hunkParts = hunk.split(' ');
    var oldInfo = hunkParts[1].match(HUNK_OLD_INFO_REGEX);
    var newInfo = hunkParts[2].match(HUNK_NEW_INFO_REGEX);

    // `oldInfo`/`newInfo` will look like: ["a,b", "a", ",b"], or ["a", "a", ""].
    var oldStart = parseInt(oldInfo[1], 10);
    var newStart = parseInt(newInfo[1], 10);
    // According to the spec, if the line length is 1, it may be omitted.
    var oldLines = oldInfo[2] ? parseInt(oldInfo[2].substring(1), 10) : 1;
    var newLines = newInfo[2] ? parseInt(newInfo[2].substring(1), 10) : 1;

    diffInfo.added += newLines;
    diffInfo.deleted += oldLines;
    diffInfo.lineDiffs.push({oldStart, oldLines, newStart, newLines});
  });

  return diffInfo;
}


var HG_BLAME_ERROR_MESSAGE_START = '[abort: ';

/**
 * Parses the output of `hg blame -r "wdir()" -T json --changeset --user --line-number <filename>`.
 * @return A Map that maps line numbers (0-indexed) to the blame info for the line.
 *   The blame info is of the form: "Firstname Lastname <username@email.com> ChangeSetID".
 *   (The Firstname Lastname may not appear sometimes.)
 *   The ChangeSetID will not be the full 40 digit hexadecimal number, but a prefix whose length is
 *   determined by CHANGE_SET_ID_PREFIX_LENGTH.
 */
function parseHgBlameOutput(output: string): Map<string, string> {
  var results = new Map();

  if (output.startsWith(HG_BLAME_ERROR_MESSAGE_START)) {
    return results;
  }

  try {
    var arrayOfLineDescriptions = JSON.parse(output);
  } catch (e) {
    // The error message may change. An error will return non-JSON.
    return results;
  }
  arrayOfLineDescriptions.forEach((lineDescription, index) => {
    var changeSetId: ?string = lineDescription['node'];
    if (changeSetId != null) {
      changeSetId = changeSetId.substring(0, CHANGE_SET_ID_PREFIX_LENGTH);
    }
    results.set(index.toString(), `${lineDescription['user']} ${changeSetId}`);
  });

  return results;
}

module.exports = {
  parseHgBlameOutput,
  parseHgDiffUnifiedOutput,
};
