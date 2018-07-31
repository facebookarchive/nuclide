/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

export class ANSIStreamOutput {
  _output: stream$Writable;

  constructor(output: stream$Writable) {
    this._output = output;
  }

  // NB as with the ANSI sequences themselves, all cursor positions are
  // 1-based, not zero based
  queryCursorPosition(): void {
    this._output.write('\x1b[6n');
  }

  gotoXY(col: number, row: number): void {
    this._output.write(`\x1b[${row};${col}H`);
  }

  clearEOL(): void {
    this._output.write('\x1b[K');
  }
}
