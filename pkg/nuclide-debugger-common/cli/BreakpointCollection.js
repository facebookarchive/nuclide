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

import {arrayCompact} from 'nuclide-commons/collection';
import Breakpoint from './Breakpoint';
import SourceBreakpoint from './SourceBreakpoint';

export default class BreakpointCollection {
  // $TODO function breakpoints when we have an adapter that supports them

  _breakpoints: Map<number, Breakpoint> = new Map();
  _nextIndex: number = 1;

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

  getAllEnabledBreakpointsForSource(path: string): Breakpoint[] {
    return Array.from(this._breakpoints.values()).filter(
      x => x.path === path && x.line != null && x.enabled,
    );
  }

  getAllEnabledBreakpointsByPath(): Map<string, Breakpoint[]> {
    const sources = new Set(
      arrayCompact(Array.from(this._breakpoints.values()).map(_ => _.path)),
    );
    return new Map(
      Array.from(sources).map(src => [
        src,
        this.getAllEnabledBreakpointsForSource(src),
      ]),
    );
  }

  getBreakpointByIndex(index: number): Breakpoint {
    const breakpoint = this._breakpoints.get(index);

    if (breakpoint == null) {
      throw new Error(`There is no breakpoint #${index}`);
    }

    return breakpoint;
  }

  getAllBreakpoints(): Breakpoint[] {
    return Array.from(this._breakpoints.values());
  }

  deleteBreakpoint(index: number): void {
    this._breakpoints.delete(index);
  }

  _allocateIndex(): number {
    return this._nextIndex++;
  }
}
