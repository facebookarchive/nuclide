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

import * as DebugProtocol from 'vscode-debugprotocol';
import invariant from 'assert';

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

  get path(): ?string {
    return null;
  }

  get line(): number {
    return -1;
  }

  toString(): string {
    invariant(false, 'Breakpoint subclasses must implement toString()');
  }

  toProtocolBreakpoint(): DebugProtocol.SourceBreakpoint {
    return {
      verified: this._verified,
      line: this.line,
    };
  }
}
