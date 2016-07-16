'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Range} from 'atom';

export function wordAtPosition(
  editor: atom$TextEditor,
  position: atom$Point,
  wordRegex: ?RegExp,
): ?{wordMatch: Array<string>, range: atom$Range} {
  if (!wordRegex) {
    wordRegex = editor.getLastCursor().wordRegExp();
  }
  const buffer = editor.getBuffer();
  const {row, column} = position;
  const rowRange = buffer.rangeForRow(row);
  let matchData;
  // Extract the expression from the row text.
  buffer.scanInRange(wordRegex, rowRange, data => {
    const {range} = data;
    if (range.containsPoint(position)) {
      matchData = data;
    }
    // Stop the scan if the scanner has passed our position.
    if (range.end.column > column) {
      data.stop();
    }
  });
  if (matchData) {
    return {
      wordMatch: matchData.match,
      range: matchData.range,
    };
  } else {
    return null;
  }
}

/**
 * Gets the trimmed range from a given range, i.e. moves the start and end points
 * to the first and last non-whitespace characters (or specified regex)
 * within the range respectively.
 *
 * @param editor       the editor containing the range
 * @param rangeToTrim  the range to trim
 * @param stopRegex    stop trimming when the first match is found for this regex,
 *   defaults to first non-whitespace character
 * @return atom$Range  the trimmed range
 */
export function trimRange(
  editor: atom$TextEditor,
  rangeToTrim: atom$Range,
  stopRegex: RegExp = /\S/,
): atom$Range {
  const buffer = editor.getBuffer();
  let {start, end} = rangeToTrim;
  buffer.scanInRange(stopRegex, rangeToTrim, ({range, stop}) => {
    start = range.start;
    stop();
  });
  buffer.backwardsScanInRange(stopRegex, rangeToTrim, ({range, stop}) => {
    end = range.end;
    stop();
  });
  return new Range(start, end);
}
