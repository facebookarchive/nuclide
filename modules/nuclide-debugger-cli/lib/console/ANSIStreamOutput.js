"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ANSIStreamOutput = void 0;

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
class ANSIStreamOutput {
  constructor(output) {
    this._output = output;
  } // NB as with the ANSI sequences themselves, all cursor positions are
  // 1-based, not zero based


  queryCursorPosition() {
    this._output('\x1b[6n');
  }

  gotoXY(col, row) {
    this._output(`\x1b[${row};${col}H`);
  }

  clearEOL() {
    this._output('\x1b[K');
  }

}

exports.ANSIStreamOutput = ANSIStreamOutput;