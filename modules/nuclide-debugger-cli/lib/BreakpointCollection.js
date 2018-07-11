"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _collection() {
  const data = require("../../nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _Breakpoint() {
  const data = _interopRequireDefault(require("./Breakpoint"));

  _Breakpoint = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class BreakpointCollection {
  constructor() {
    this._breakpoints = new Map();
    this._nextIndex = 1;
  }

  addSourceBreakpoint(path, line) {
    this._breakpoints.forEach((breakpoint, index) => {
      if (breakpoint.path === path && breakpoint.line === line) {
        throw new Error(`There is already a breakpoint (#${index}) here.`);
      }
    });

    const index = this._allocateIndex();

    const breakpoint = new (_Breakpoint().default)(index);
    breakpoint.setPath(path);
    breakpoint.setLine(line);

    this._breakpoints.set(index, breakpoint);

    return index;
  }

  addFunctionBreakpoint(func) {
    this._breakpoints.forEach((breakpoint, index) => {
      if (breakpoint.func === func) {
        throw new Error(`There is already a breakpoint (#${index}) here.`);
      }
    });

    const index = this._allocateIndex();

    const breakpoint = new (_Breakpoint().default)(index);
    breakpoint.setFunc(func);

    this._breakpoints.set(index, breakpoint);

    return index;
  }

  getAllEnabledBreakpointsForSource(path) {
    return Array.from(this._breakpoints.values()).filter(x => x.path === path && x.line != null && x.func == null && x.enabled).map(_ => ({
      index: _.index,
      id: _.id,
      verified: _.verified,
      enabled: _.enabled,
      path: (0, _nullthrows().default)(_.path),
      line: (0, _nullthrows().default)(_.line)
    }));
  }

  getAllEnabledBreakpointsByPath() {
    const sources = new Set((0, _collection().arrayCompact)(Array.from(this._breakpoints.values()).map(_ => _.path)));
    return new Map(Array.from(sources).map(src => [src, this.getAllEnabledBreakpointsForSource(src)]));
  }

  getAllEnabledFunctionBreakpoints() {
    return Array.from(this._breakpoints.values()).filter(x => x.func != null && x.enabled).map(x => ({
      index: x.index,
      id: x.id,
      verified: x.verified,
      enabled: x.enabled,
      path: x.path,
      line: x.line,
      func: (0, _nullthrows().default)(x.func)
    }));
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

  setBreakpointId(index, id) {
    const bpt = this._breakpoints.get(index);

    if (bpt != null) {
      bpt.setId(id);
    }
  }

  setBreakpointVerified(index, verified) {
    const bpt = this._breakpoints.get(index);

    if (bpt != null) {
      bpt.setVerified(verified);
    }
  }

  setPathAndFile(index, path, line) {
    const bpt = this._breakpoints.get(index);

    if (bpt != null) {
      bpt.setPath(path);
      bpt.setLine(line);
    }
  }

  _allocateIndex() {
    return this._nextIndex++;
  }

}

exports.default = BreakpointCollection;