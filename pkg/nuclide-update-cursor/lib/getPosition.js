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
 * Figures out the row and column coordinates of a raw position within a source
 * string. This will undo the transform `getRawPosition` makes to position.
 */
function getPosition(
  source: string,
  rawPosition: number,
): {row: number, column: number} {
  let row = 0;
  let column = 0;
  for (let i = 0; i < rawPosition && i < source.length; i++) {
    const char = source.charAt(i);
    if (char === '\n') {
      row++;
      column = 0;
    } else {
      column++;
    }
  }
  return {row, column};
}

module.exports = getPosition;
