'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractRange = extractRange;

var _atom = require('atom');

// Use `atom$Range | void` rather than `?atom$Range` to exclude `null`, so that the type is
// compatible with the `range` property, which is an optional property rather than a nullable
// property.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

function extractRange(message) {
  // It's unclear why the 1-based to 0-based indexing works the way that it
  // does, but this has the desired effect in the UI, in practice.
  const { rangeInFile } = message;
  if (rangeInFile == null) {
    return undefined;
  } else {
    return new _atom.Range([rangeInFile.range.start.row - 1, rangeInFile.range.start.column - 1], [rangeInFile.range.end.row - 1, rangeInFile.range.end.column]);
  }
}