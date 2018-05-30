'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.secondIfFirstIsNull = secondIfFirstIsNull;
exports.wordUnderPoint = wordUnderPoint;

var _range;

function _load_range() {
  return _range = require('../../../modules/nuclide-commons-atom/range');
}

async function secondIfFirstIsNull(first, second) {
  return first != null ? first : second();
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */

function wordUnderPoint(editor, point) {
  const match = (0, (_range || _load_range()).wordAtPosition)(editor, point);
  if (match != null && match.wordMatch.length > 0) {
    return match.wordMatch[0];
  }
  return null;
}