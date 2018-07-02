"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

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
class Breakpoint {
  // index is the name of the breakpoint we show externally in the UI
  // id is the attached breakpoint in the adapter (if the adapter supports it)
  // verified tracks if the breakpoint was successfully set by the adapter.
  // it may not be if the referenced code was not yet loaded
  // enabled tracks if the breakpoint has been enabled or disabled by the user.
  // The source file of the breakpoint (which may be undefined if we have an
  // unresolved function breakpoint.)
  // The line number of the breakpoint (which may be undefined if we have an
  // unresolved function breakpoint.)
  // The function name of the breakpoint (only defined if the breakpoint is
  // a function breakpoint.)
  constructor(index) {
    this._index = index;
    this._verified = false;
    this._enabled = true;
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

  setEnabled(enabled) {
    this._enabled = enabled;
  }

  get enabled() {
    return this._enabled;
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

    return `${(0, _nullthrows().default)(this._path)}:${(0, _nullthrows().default)(this._line)}`;
  }

}

exports.default = Breakpoint;