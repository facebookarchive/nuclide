'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Context, Lines, Print} from '../../types/common';

import markers from '../../constants/markers';
import printComment from '../../printers/common/printComment';
import unwrapMarkers from '../../utils/unwrapMarkers';

function wrapWithComments(
  print: Print,
  node: any,
  context: Context,
  lines: Lines,
): Lines {
  const {invalidTrailingComments, invalidLeadingComments} = context;
  const {leadingComments} = node;
  let leadingLines = [];
  const last = context.path.last();
  if (last && last.type === 'ImportSpecifier') {
    // TODO: https://github.com/babel/babel/issues/2600
    // Leading comments are screwed up in ImportSpecifiers. Ignore them.
  } else if (Array.isArray(leadingComments)) {
    leadingLines = leadingComments.map((comment, i, arr) => {
      // Some leading comments may be invalid.
      if (invalidLeadingComments.has(comment.start)) {
        return [];
      }

      const parts = [printComment(comment)];
      const next = i === arr.length - 1 ? node : arr[i + 1];
      const min = comment.loc.end.line;
      const max = next.loc.start.line;

      for (let j = 0; j < max - min; j++) {
        parts.push(markers.multiHardBreak);
      }

      return parts;
    });
  }

  const {trailingComments} = node;
  let trailingLines = [];

  if (Array.isArray(trailingComments)) {
    trailingLines = trailingComments.map((comment, i, arr) => {
      // Some trailing comments may be invalid.
      if (invalidTrailingComments.has(comment.start)) {
        return [];
      }

      const prev = i === 0 ? node : arr[i - 1];
      const min = prev.loc.end.line;
      const max = comment.loc.start.line;
      const parts = [];

      for (let j = 0; j < max - min; j++) {
        parts.push(markers.multiHardBreak);
      }

      return parts.concat(printComment(comment));
    });
  }

  return unwrapMarkers(leadingLines, lines, trailingLines);
}

module.exports = wrapWithComments;
