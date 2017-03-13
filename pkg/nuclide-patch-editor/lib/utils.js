/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import parse from 'diffparser';

// Export an Array of diffparser$FileDiff objects to a string utilizable by the
// Mercurial edrecord extension
export function patchToString(patch: Array<diffparser$FileDiff>): string {
  const lines: Array<string> = [];

  patch.forEach(fileDiff => {
    lines.push(`diff --git a/${fileDiff.from} b/${fileDiff.to}`);
    if (!isSpecialChange(fileDiff)) {
      lines.push(`--- a/${fileDiff.from}\n+++ b/${fileDiff.to}`);
      fileDiff.chunks.forEach(hunk => {
        lines.push(hunk.content);
        hunk.changes.forEach(change => lines.push(change.content));
      });
    }
  });

  return lines.join('\n') + '\n';
}

// Special changes only require the first line of the header be printed
// Examples of special changes: binary files, renaming files, deleting files, adding empty files
export function isSpecialChange(fileDiff: diffparser$FileDiff): boolean {
  return fileDiff.chunks.length === 0;
}

// Special changes come with annotations that will be useful to display on the FileChanges UI
export function parseWithAnnotations(diffContent: string): Array<diffparser$FileDiff> {
  const patch = parse(diffContent);

  const patchLines = diffContent.split('\n');
  let currentLine = 0;

  patch.forEach(fileDiff => {
    while (!patchLines[currentLine].startsWith('diff ')) {
      ++currentLine;
    }
    const annotationLines = [];
    while (patchLines[++currentLine].startsWith('# ')) {
      annotationLines.push(patchLines[currentLine].substr(2));
    }
    if (annotationLines.length > 0) {
      fileDiff.annotation = annotationLines.join('\n');
    }
  });
  return patch;
}
