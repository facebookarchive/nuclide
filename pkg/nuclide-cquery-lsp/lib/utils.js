"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.secondIfFirstIsNull = secondIfFirstIsNull;
exports.wordUnderPoint = wordUnderPoint;

function _range() {
  const data = require("../../../modules/nuclide-commons-atom/range");

  _range = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
async function secondIfFirstIsNull(first, second) {
  return first != null ? first : second();
}

function wordUnderPoint(editor, point) {
  const match = (0, _range().wordAtPosition)(editor, point);

  if (match != null && match.wordMatch.length > 0) {
    return match.wordMatch[0];
  }

  return null;
}