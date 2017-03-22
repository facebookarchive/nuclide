'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.offsetToPoint = offsetToPoint;
exports.locToRange = locToRange;
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  containsPoint(point) {
    const withinRow = this.start.row <= point.row && this.end.row >= point.row;
    const withinColumn = this.start.column <= point.column && this.end.column >= point.column;
    return withinRow && withinColumn;
  }
}

exports.Range = Range; /**
                        * Copyright (c) 2015-present, Facebook, Inc.
                        * All rights reserved.
                        *
                        * This source code is licensed under the license found in the LICENSE file in
                        * the root directory of this source tree.
                        *
                        * 
                        */

class Point {
  constructor(row, column) {
    this.row = row;
    this.column = column;
  }

  lessThanOrEqualTo(point) {
    if (this.row < point.row || this.row === point.row && this.column <= point.column) {
      return true;
    }

    return false;
  }
}

exports.Point = Point;
function offsetToPoint(text, loc) {
  const EOL = '\n';
  const buf = text.slice(0, loc);
  const rows = buf.split(EOL).length - 1;
  const lastLineIndex = buf.lastIndexOf(EOL);
  return new Point(rows, loc - lastLineIndex - 1);
}

function locToRange(text, loc) {
  const start = offsetToPoint(text, loc.start);
  const end = offsetToPoint(text, loc.end);
  return new Range(start, end);
}