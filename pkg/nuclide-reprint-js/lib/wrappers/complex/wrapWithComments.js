

var markers = require('../../constants/markers');

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var printComment = require('../../printers/common/printComment');
var unwrapMarkers = require('../../utils/unwrapMarkers');

function wrapWithComments(print, node, context, lines) {
  var invalidTrailingComments = context.invalidTrailingComments;
  var invalidLeadingComments = context.invalidLeadingComments;
  var leadingComments = node.leadingComments;

  var leadingLines = [];
  var last = context.path.last();
  if (last && last.type === 'ImportSpecifier') {
    // TODO: https://github.com/babel/babel/issues/2600
    // Leading comments are screwed up in ImportSpecifiers. Ignore them.
  } else if (Array.isArray(leadingComments)) {
      leadingLines = leadingComments.map(function (comment, i, arr) {
        // Some leading comments may be invalid.
        if (invalidLeadingComments.has(comment.start)) {
          return [];
        }

        var parts = [printComment(comment)];
        var next = i === arr.length - 1 ? node : arr[i + 1];
        var min = comment.loc.end.line;
        var max = next.loc.start.line;

        for (var j = 0; j < max - min; j++) {
          parts.push(markers.multiHardBreak);
        }

        return parts;
      });
    }

  var trailingComments = node.trailingComments;

  var trailingLines = [];

  if (Array.isArray(trailingComments)) {
    trailingLines = trailingComments.map(function (comment, i, arr) {
      // Some trailing comments may be invalid.
      if (invalidTrailingComments.has(comment.start)) {
        return [];
      }

      var prev = i === 0 ? node : arr[i - 1];
      var min = prev.loc.end.line;
      var max = comment.loc.start.line;
      var parts = [];

      for (var j = 0; j < max - min; j++) {
        parts.push(markers.multiHardBreak);
      }

      return parts.concat(printComment(comment));
    });
  }

  return unwrapMarkers(leadingLines, lines, trailingLines);
}

module.exports = wrapWithComments;