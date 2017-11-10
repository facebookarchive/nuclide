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
import SourceBreakpoint from './SourceBreakpoint';

export default class BreakpointCollection {
  // $TODO function breakpoints when we have an adapter that supports them

  _breakpoints: Map<number, Breakpoint> = new Map();
  _nextIndex: number = 0;

  addSourceBreakpoint(path: string, line: number): number {
    this._breakpoints.forEach((breakpoint, index) => {
      if (breakpoint.path === path && breakpoint.line === line) {
        throw new Error(`There is already a breakpoint (#${index}) here.`);
      }
    });

    const index = this._allocateIndex();
    this._breakpoints.set(index, new SourceBreakpoint(index, path, line));
    return index;
  }

  getAllBreakpointsForSource(path: string): Breakpoint[] {
    return Array.from(this._breakpoints.values()).filter(
      x => x.path === path && x.line != null,
    );
  }

  getBreakpointByIndex(index: number): Breakpoint {
    const breakpoint = this._breakpoints.get(index);

    if (breakpoint == null) {
      throw new Error(`Could not find breakpoint #${index}`);
    }

    return breakpoint;
  }

  _allocateIndex(): number {
    return this._nextIndex++;
  }
}
