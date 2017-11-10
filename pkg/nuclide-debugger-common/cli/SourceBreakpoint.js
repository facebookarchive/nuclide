/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import Breakpoint from './Breakpoint';

export default class SourceBreakpoint extends Breakpoint {
  _path: string;
  _line: number;

  constructor(index: number, path: string, line: number) {
    super(index);
    this._path = path;
    this._line = line;
  }

  get path(): string {
    return this._path;
  }

  get line(): number {
    return this._line;
  }

  toString(): string {
    return `${this._path}:${this._line}`;
  }
}
