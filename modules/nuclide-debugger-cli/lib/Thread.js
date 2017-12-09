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

export default class Thread {
  _id: number;
  _name: string;
  _selectedStackFrame: number;

  constructor(id: number, name: string) {
    this._id = id;
    this._name = name;
    this.clearSelectedStackFrame();
  }

  id(): number {
    return this._id;
  }

  name(): string {
    return this._name;
  }

  clearSelectedStackFrame(): void {
    this._selectedStackFrame = 0;
  }

  selectedStackFrame(): number {
    return this._selectedStackFrame;
  }

  setSelectedStackFrame(frame: number): void {
    this._selectedStackFrame = frame;
  }
}
