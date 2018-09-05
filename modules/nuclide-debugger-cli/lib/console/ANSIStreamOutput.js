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

import type {CursorControl} from './types';

export class ANSIStreamOutput implements CursorControl {
  _output: (s: string) => void;

  constructor(output: string => void) {
    this._output = output;
  }

  // NB as with the ANSI sequences themselves, all cursor positions are
  // 1-based, not zero based
  queryCursorPosition(): void {
    this._output('\x1b[6n');
  }

  gotoXY(col: number, row: number): void {
    this._output(`\x1b[${row};${col}H`);
  }

  cursorLeft(cols: ?number): void {
    this._output(`\x1b[${cols == null ? '' : cols}G`);
  }

  cursorRight(cols: ?number): void {
    this._output(`\x1b[${cols == null ? '' : cols}C`);
  }

  clearEOL(): void {
    this._output('\x1b[K');
  }

  boldVideo(): void {
    this._output('\x1b[1m');
  }

  normalVideo(): void {
    this._output('\x1b[0m');
  }
}
