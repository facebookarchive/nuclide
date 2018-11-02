"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BreakpointState = void 0;

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
 * 
 * @format
 */
const BreakpointState = Object.freeze({
  ENABLED: 'enabled',
  ONCE: 'once',
  DISABLED: 'disabled'
});
exports.BreakpointState = BreakpointState;

class Breakpoint {
  // index is the name of the breakpoint we show externally in the UI
  // id is the attached breakpoint in the adapter (if the adapter supports it)
  // verified tracks if the breakpoint was successfully set by the adapter.
  // it may not be if the referenced code was not yet loaded
  // state: enabled, once, or disabled
  // condition: if the breakpoint is conditional, the condition expression
  // The source file of the breakpoint (which may be undefined if we have an
  // unresolved function breakpoint.)
  // The line number of the breakpoint (which may be undefined if we have an
  // unresolved function breakpoint.)
  // The function name of the breakpoint (only defined if the breakpoint is
  // a function breakpoint.)
  // If the breakpoint should support the 'once' state
  constructor(index, allowOnceState) {
    this._index = index;
    this._verified = false;
    this._state = BreakpointState.ENABLED;
    this._allowOnceState = allowOnceState;
  }

  enableSupportsOnce() {
    this._allowOnceState = true;
  }

  get index() {
    return this._index;
  }

  get id() {
    return this._id;
  }

  setId(id) {
    this._id = id;
  }

  setVerified(verified) {
    this._verified = verified;
  }

  get verified() {
    return this._verified;
  }

  setState(state) {
    if (state === BreakpointState.ONCE && !this._allowOnceState) {
      throw new Error('One-shot breakpoints are not supported.');
    }

    this._state = state;
  }

  toggleState() {
    switch (this._state) {
      case BreakpointState.DISABLED:
        this._state = BreakpointState.ENABLED;
        break;

      case BreakpointState.ENABLED:
        this._state = this._allowOnceState ? BreakpointState.ONCE : BreakpointState.DISABLED;
        break;

      case BreakpointState.ONCE:
        this._state = BreakpointState.ENABLED;
        break;
    }

    return this._state;
  }

  get state() {
    return this._state;
  }

  condition() {
    return this._condition;
  }

  setCondition(cond) {
    this._condition = cond;
  }

  isEnabled() {
    return this._state !== BreakpointState.DISABLED;
  }

  setPath(path) {
    this._path = path;
  }

  get path() {
    return this._path;
  }

  setLine(line) {
    this._line = line;
  }

  get line() {
    return this._line;
  }

  setFunc(func) {
    this._func = func;
  }

  get func() {
    return this._func;
  }

  toString() {
    const func = this._func;

    if (func != null) {
      if (this._path == null || this._line == null) {
        return `${func}()`;
      }

      return `${func}() [${this._path}:${this._line}]`;
    }

    try {
      return `${(0, _nullthrows().default)(this._path)}:${(0, _nullthrows().default)(this._line)}`;
    } catch (_) {
      throw new Error('Missing path or line in breakpoint description');
    }
  }

}

exports.default = Breakpoint;