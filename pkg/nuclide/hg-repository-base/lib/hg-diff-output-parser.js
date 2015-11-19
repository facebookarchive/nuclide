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
const HUNK_DIFF_REGEX = /@@ .* @@/g;
const HUNK_OLD_INFO_REGEX = /\-([0-9]+)((?:,[0-9]+)?)/;
const HUNK_NEW_INFO_REGEX = /\+([0-9]+)((?:,[0-9]+)?)/;

import type {DiffInfo} from './hg-constants';

/**
 * Parses the output of `hg diff --unified 0`.
 */
function parseHgDiffUnifiedOutput(output: string): DiffInfo {
  const diffInfo = {
    added: 0,
    deleted: 0,
    lineDiffs: [],
  };
  if (!output) {
    return diffInfo;
  }
  // $FlowFixMe match may return null
  const diffHunks = output.match(HUNK_DIFF_REGEX);
  diffHunks.forEach((hunk) => {
    // `hunk` will look like: "@@ -a(,b) +c(,d) @@"
    const hunkParts = hunk.split(' ');
    // $FlowFixMe match may return null
    const oldInfo = hunkParts[1].match(HUNK_OLD_INFO_REGEX);
    // $FlowFixMe match may return null
    const newInfo = hunkParts[2].match(HUNK_NEW_INFO_REGEX);

    // `oldInfo`/`newInfo` will look like: ["a,b", "a", ",b"], or ["a", "a", ""].
    const oldStart = parseInt(oldInfo[1], 10);
    const newStart = parseInt(newInfo[1], 10);
    // According to the spec, if the line length is 1, it may be omitted.
    const oldLines = oldInfo[2] ? parseInt(oldInfo[2].substring(1), 10) : 1;
    const newLines = newInfo[2] ? parseInt(newInfo[2].substring(1), 10) : 1;

    diffInfo.added += newLines;
    diffInfo.deleted += oldLines;
    diffInfo.lineDiffs.push({oldStart, oldLines, newStart, newLines});
  });

  return diffInfo;
}

module.exports = {
  parseHgDiffUnifiedOutput,
};
