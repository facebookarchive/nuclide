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
  const data = _interopRequireWildcard(require("./Breakpoint"));

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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
    this._allowOnceState = false;
    this._allowConditional = false;
  }

  enableOnceState() {
    this._allowOnceState = true;

    this._breakpoints.forEach(breakpoint => breakpoint.enableSupportsOnce());
  }

  enableConditional() {
    this._allowConditional = true;
  }

  supportsOnceState() {
    return this._allowOnceState;
  }

  supportsConditional() {
    return this._allowConditional;
  }

  addSourceBreakpoint(path, line, once, condition) {
    this._breakpoints.forEach((breakpoint, index) => {
      if (breakpoint.path === path && breakpoint.line === line) {
        throw new Error(`There is already a breakpoint (#${index}) here.`);
      }
    });

    const index = this._allocateIndex();

    const breakpoint = new (_Breakpoint().default)(index, this._allowOnceState);
    breakpoint.setPath(path);
    breakpoint.setLine(line);

    if (once) {
      breakpoint.setState(_Breakpoint().BreakpointState.ONCE);
    }

    breakpoint.setCondition(condition);

    this._breakpoints.set(index, breakpoint);

    return index;
  }

  addFunctionBreakpoint(func, once, condition) {
    this._breakpoints.forEach((breakpoint, index) => {
      if (breakpoint.func === func) {
        throw new Error(`There is already a breakpoint (#${index}) here.`);
      }
    });

    const index = this._allocateIndex();

    const breakpoint = new (_Breakpoint().default)(index, this._allowOnceState);
    breakpoint.setFunc(func);

    if (once) {
      breakpoint.setState(_Breakpoint().BreakpointState.ONCE);
    }

    breakpoint.setCondition(condition);

    this._breakpoints.set(index, breakpoint);

    return index;
  }

  getAllEnabledBreakpointsForSource(path) {
    try {
      return Array.from(this._breakpoints.values()).filter(x => x.path === path && x.line != null && x.func == null && x.isEnabled()).map(_ => ({
        index: _.index,
        id: _.id,
        verified: _.verified,
        enabled: true,
        path: (0, _nullthrows().default)(_.path),
        line: (0, _nullthrows().default)(_.line),
        condition: _.condition()
      }));
    } catch (_) {
      throw new Error('Path or line missing in getAllEnabledBreakpointsForSource');
    }
  }

  getAllEnabledBreakpointsByPath() {
    const sources = new Set((0, _collection().arrayCompact)(Array.from(this._breakpoints.values()).map(_ => _.path)));
    return new Map(Array.from(sources).map(src => [src, this.getAllEnabledBreakpointsForSource(src)]));
  }

  getAllEnabledFunctionBreakpoints() {
    try {
      return Array.from(this._breakpoints.values()).filter(x => x.func != null && x.isEnabled()).map(x => ({
        index: x.index,
        id: x.id,
        verified: x.verified,
        enabled: true,
        path: x.path,
        line: x.line,
        func: (0, _nullthrows().default)(x.func),
        condition: x.condition()
      }));
    } catch (_) {
      throw new Error('Missing function in function breakpoint');
    }
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

  getAllBreakpointPaths() {
    try {
      return Array.from(new Set(Array.from(this._breakpoints.values()).filter(bp => bp.path != null).map(bp => (0, _nullthrows().default)(bp.path))));
    } catch (_) {
      throw new Error('Missing breakpoint path in getAllBreakpointPaths');
    }
  }

  deleteBreakpoint(index) {
    this._breakpoints.delete(index);
  }

  deleteAllBreakpoints() {
    this._breakpoints = new Map();
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