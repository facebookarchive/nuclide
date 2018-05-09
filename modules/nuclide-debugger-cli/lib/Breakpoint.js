/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import nullthrows from 'nullthrows';

export default class Breakpoint {
  // index is the name of the breakpoint we show externally in the UI
  _index: number;

  // id is the attached breakpoint in the adapter (if the adapter supports it)
  _id: ?number;

  // verified tracks if the breakpoint was successfully set by the adapter.
  // it may not be if the referenced code was not yet loaded
  _verified: boolean;

  // enabled tracks if the breakpoint has been enabled or disabled by the user.
  _enabled: boolean;

  // The source file of the breakpoint (which may be undefined if we have an
  // unresolved function breakpoint.)
  _path: ?string;

  // The line number of the breakpoint (which may be undefined if we have an
  // unresolved function breakpoint.)
  _line: ?number;

  // The function name of the breakpoint (only defined if the breakpoint is
  // a function breakpoint.)
  _func: ?string;

  constructor(index: number) {
    this._index = index;
    this._verified = false;
    this._enabled = true;
  }

  get index(): number {
    return this._index;
  }

  get id(): ?number {
    return this._id;
  }

  setId(id: number): void {
    this._id = id;
  }

  setVerified(verified: boolean): void {
    this._verified = verified;
  }

  get verified(): boolean {
    return this._verified;
  }

  setEnabled(enabled: boolean): void {
    this._enabled = enabled;
  }

  get enabled(): boolean {
    return this._enabled;
  }

  setPath(path: string) {
    this._path = path;
  }

  get path(): ?string {
    return this._path;
  }

  setLine(line: number) {
    this._line = line;
  }

  get line(): ?number {
    return this._line;
  }

  setFunc(func: string) {
    this._func = func;
  }

  get func(): ?string {
    return this._func;
  }

  toString(): string {
    const func = this._func;

    if (func != null) {
      if (this._path == null || this._line == null) {
        return `${func}()`;
      }
      return `${func}() [${this._path}:${this._line}]`;
    }

    return `${nullthrows(this._path)}:${nullthrows(this._line)}`;
  }
}
