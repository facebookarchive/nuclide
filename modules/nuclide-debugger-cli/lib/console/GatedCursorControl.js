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

export default class GatedCursorControl implements CursorControl {
  _enabled: boolean;
  _inner: CursorControl;

  constructor(inner: CursorControl) {
    this._inner = inner;
    this._enabled = false;
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  queryCursorPosition(): void {
    if (this._enabled) {
      this._inner.queryCursorPosition();
    }
  }

  gotoXY(col: number, row: number): void {
    if (this._enabled) {
      this._inner.gotoXY(col, row);
    }
  }

  clearEOL(): void {
    if (this._inner) {
      this._inner.clearEOL();
    }
  }
}
