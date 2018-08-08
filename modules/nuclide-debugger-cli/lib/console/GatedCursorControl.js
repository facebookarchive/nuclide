"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */
class GatedCursorControl {
  constructor(inner) {
    this._inner = inner;
    this._enabled = false;
  }

  setEnabled(enabled) {
    this._enabled = enabled;
  }

  queryCursorPosition() {
    if (this._enabled) {
      this._inner.queryCursorPosition();
    }
  }

  gotoXY(col, row) {
    if (this._enabled) {
      this._inner.gotoXY(col, row);
    }
  }

  clearEOL() {
    if (this._inner) {
      this._inner.clearEOL();
    }
  }

}

exports.default = GatedCursorControl;