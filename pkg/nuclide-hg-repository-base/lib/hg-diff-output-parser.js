

/**
 * Parses the output of `hg diff --unified 0`.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _os2;

function _os() {
  return _os2 = _interopRequireDefault(require('os'));
}

function parseHgDiffUnifiedOutput(output) {
  var diffInfo = {
    added: 0,
    deleted: 0,
    lineDiffs: []
  };
  if (!output) {
    return diffInfo;
  }
  // $FlowFixMe match may return null
  var diffHunks = output.match(HUNK_DIFF_REGEX);
  diffHunks.forEach(function (hunk) {
    // `hunk` will look like: "@@ -a(,b) +c(,d) @@"
    var hunkParts = hunk.split(' ');
    // $FlowFixMe match may return null
    var oldInfo = hunkParts[1].match(HUNK_OLD_INFO_REGEX);
    // $FlowFixMe match may return null
    var newInfo = hunkParts[2].match(HUNK_NEW_INFO_REGEX);

    // `oldInfo`/`newInfo` will look like: ["a,b", "a", ",b"], or ["a", "a", ""].
    var oldStart = parseInt(oldInfo[1], 10);
    var newStart = parseInt(newInfo[1], 10);
    // According to the spec, if the line length is 1, it may be omitted.
    var oldLines = oldInfo[2] ? parseInt(oldInfo[2].substring(1), 10) : 1;
    var newLines = newInfo[2] ? parseInt(newInfo[2].substring(1), 10) : 1;

    diffInfo.added += newLines;
    diffInfo.deleted += oldLines;
    diffInfo.lineDiffs.push({ oldStart: oldStart, oldLines: oldLines, newStart: newStart, newLines: newLines });
  });

  return diffInfo;
}

var SINGLE_UNIFIED_DIFF_BEGINNING_REGEX = /--- /;

/**
 * Parses the output of `hg diff --unified 0 --noprefix` from one or more files.
 * @return A map of each file path in the output (relative to the root of the
 *   repo) to its parsed DiffInfo.
 */
function parseMultiFileHgDiffUnifiedOutput(output) {
  var filePathToDiffInfo = new Map();
  // Split the output by the symbols '--- '. This is specified in the Unified diff format:
  // http://www.gnu.org/software/diffutils/manual/html_node/Detailed-Unified.html#Detailed-Unified.
  var diffOutputs = output.split(SINGLE_UNIFIED_DIFF_BEGINNING_REGEX);
  // Throw out the first chunk (anything before the first '--- ' sequence), because
  // it is not part of a complete diff.
  diffOutputs = diffOutputs.slice(1);

  for (var diffOutputForFile of diffOutputs) {
    // First, extract the file name. The first line of the string should be the file path.
    var newLineChar = (_os2 || _os()).default.EOL;
    var firstNewline = diffOutputForFile.indexOf(newLineChar);
    var filePath = diffOutputForFile.slice(0, firstNewline);
    filePath = filePath.trim();
    // Then, get the parsed diff info.
    var lineDiffs = parseHgDiffUnifiedOutput(diffOutputForFile);

    filePathToDiffInfo.set(filePath, lineDiffs);
  }
  return filePathToDiffInfo;
}

module.exports = {
  parseHgDiffUnifiedOutput: parseHgDiffUnifiedOutput,
  parseMultiFileHgDiffUnifiedOutput: parseMultiFileHgDiffUnifiedOutput
};