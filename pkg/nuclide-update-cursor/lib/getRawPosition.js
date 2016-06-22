

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * Converts a position given as {row, column} to a single number which is the
 * index the cursor appears in the source string.
 *
 * index is given such that source.slice(0, index) is the precise  string that
 * occurs before the cursor, and source.slice(index) is the string that occurs
 * after the cursor.
 */
function getRawPosition(source, position) {
  return source.split('\n').reduce(function (curr, line, i) {
    if (i < position.row) {
      return curr + line.length + 1;
    } else if (i === position.row) {
      return curr + position.column;
    } else {
      return curr;
    }
  }, 0);
}

module.exports = getRawPosition;