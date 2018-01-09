'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _Breakpoint;

function _load_Breakpoint() {
  return _Breakpoint = _interopRequireDefault(require('./Breakpoint'));
}

var _SourceBreakpoint;

function _load_SourceBreakpoint() {
  return _SourceBreakpoint = _interopRequireDefault(require('./SourceBreakpoint'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class BreakpointCollection {
  constructor() {
    this._breakpoints = new Map();
    this._nextIndex = 1;
  }
  // $TODO function breakpoints when we have an adapter that supports them

  addSourceBreakpoint(path, line) {
    this._breakpoints.forEach((breakpoint, index) => {
      if (breakpoint.path === path && breakpoint.line === line) {
        throw new Error(`There is already a breakpoint (#${index}) here.`);
      }
    });

    const index = this._allocateIndex();
    this._breakpoints.set(index, new (_SourceBreakpoint || _load_SourceBreakpoint()).default(index, path, line));
    return index;
  }

  getAllEnabledBreakpointsForSource(path) {
    return Array.from(this._breakpoints.values()).filter(x => x.path === path && x.line != null && x.enabled);
  }

  getAllEnabledBreakpointsByPath() {
    const sources = new Set((0, (_collection || _load_collection()).arrayCompact)(Array.from(this._breakpoints.values()).map(_ => _.path)));
    return new Map(Array.from(sources).map(src => [src, this.getAllEnabledBreakpointsForSource(src)]));
  }

  getBreakpointByIndex(index) {
    const breakpoint = this._breakpoints.get(index);

    if (breakpoint == null) {
      throw new Error(`There is no breakpoint #${index}`);
    }

    return breakpoint;
  }

  getBreakpointById(id) {
    const breakpoint = Array.from(this._breakpoints.values()).find(_ => _.id === id);

    if (breakpoint == null) {
      throw new Error(`There is no breakpoint with id ${id}`);
    }

    return breakpoint;
  }

  getAllBreakpoints() {
    return Array.from(this._breakpoints.values());
  }

  deleteBreakpoint(index) {
    this._breakpoints.delete(index);
  }

  _allocateIndex() {
    return this._nextIndex++;
  }
}
exports.default = BreakpointCollection; /**
                                         * Copyright (c) 2017-present, Facebook, Inc.
                                         * All rights reserved.
                                         *
                                         * This source code is licensed under the BSD-style license found in the
                                         * LICENSE file in the root directory of this source tree. An additional grant
                                         * of patent rights can be found in the PATENTS file in the same directory.
                                         *
                                         * 
                                         * @format
                                         */