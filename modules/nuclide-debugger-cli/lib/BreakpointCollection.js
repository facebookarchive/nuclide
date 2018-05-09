/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

import {arrayCompact} from 'nuclide-commons/collection';

import Breakpoint from './Breakpoint';
import nullthrows from 'nullthrows';

export type SourceBreakpoint = {
  index: number,
  id: ?number,
  verified: boolean,
  enabled: boolean,
  path: string,
  line: number,
};

export type FunctionBreakpoint = {
  index: number,
  id: ?number,
  verified: boolean,
  enabled: boolean,
  path: ?string,
  line: ?number,
  func: string,
};

export default class BreakpointCollection {
  _breakpoints: Map<number, Breakpoint> = new Map();
  _nextIndex: number = 1;

  addSourceBreakpoint(path: string, line: number): number {
    this._breakpoints.forEach((breakpoint, index) => {
      if (breakpoint.path === path && breakpoint.line === line) {
        throw new Error(`There is already a breakpoint (#${index}) here.`);
      }
    });

    const index = this._allocateIndex();
    const breakpoint = new Breakpoint(index);
    breakpoint.setPath(path);
    breakpoint.setLine(line);

    this._breakpoints.set(index, breakpoint);
    return index;
  }

  addFunctionBreakpoint(func: string): number {
    this._breakpoints.forEach((breakpoint, index) => {
      if (breakpoint.func === func) {
        throw new Error(`There is already a breakpoint (#${index}) here.`);
      }
    });

    const index = this._allocateIndex();
    const breakpoint = new Breakpoint(index);
    breakpoint.setFunc(func);
    this._breakpoints.set(index, breakpoint);
    return index;
  }

  getAllEnabledBreakpointsForSource(path: string): Array<SourceBreakpoint> {
    return Array.from(this._breakpoints.values())
      .filter(
        x => x.path === path && x.line != null && x.func == null && x.enabled,
      )
      .map(_ => ({
        index: _.index,
        id: _.id,
        verified: _.verified,
        enabled: _.enabled,
        path: nullthrows(_.path),
        line: nullthrows(_.line),
      }));
  }

  getAllEnabledBreakpointsByPath(): Map<string, Array<SourceBreakpoint>> {
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

  getAllEnabledFunctionBreakpoints(): Array<FunctionBreakpoint> {
    return Array.from(this._breakpoints.values())
      .filter(x => x.func != null && x.enabled)
      .map(x => ({
        index: x.index,
        id: x.id,
        verified: x.verified,
        enabled: x.enabled,
        path: x.path,
        line: x.line,
        func: nullthrows(x.func),
      }));
  }

  getBreakpointByIndex(index: number): Breakpoint {
    const breakpoint = this._breakpoints.get(index);

    if (breakpoint == null) {
      throw new Error(`There is no breakpoint #${index}`);
    }

    return breakpoint;
  }

  getBreakpointById(id: number): Breakpoint {
    const breakpoint: ?Breakpoint = Array.from(this._breakpoints.values()).find(
      _ => _.id === id,
    );

    if (breakpoint == null) {
      throw new Error(`There is no breakpoint with id ${id}`);
    }

    return breakpoint;
  }

  getAllBreakpoints(): Breakpoint[] {
    return Array.from(this._breakpoints.values());
  }

  deleteBreakpoint(index: number): void {
    this._breakpoints.delete(index);
  }

  setBreakpointId(index: number, id: number): void {
    const bpt = this._breakpoints.get(index);
    if (bpt != null) {
      bpt.setId(id);
    }
  }

  setBreakpointVerified(index: number, verified: boolean): void {
    const bpt = this._breakpoints.get(index);
    if (bpt != null) {
      bpt.setVerified(verified);
    }
  }

  setPathAndFile(index: number, path: string, line: number): void {
    const bpt = this._breakpoints.get(index);
    if (bpt != null) {
      bpt.setPath(path);
      bpt.setLine(line);
    }
  }

  _allocateIndex(): number {
    return this._nextIndex++;
  }
}
