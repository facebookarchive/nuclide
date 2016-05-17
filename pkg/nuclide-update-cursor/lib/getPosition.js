

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
function getPosition(source, rawPosition) {
  var row = 0;
  var column = 0;
  for (var i = 0; i < rawPosition && i < source.length; i++) {
    var char = source.charAt(i);
    if (char === '\n') {
      row++;
      column = 0;
    } else {
      column++;
    }
  }
  return { row: row, column: column };
}

module.exports = getPosition;