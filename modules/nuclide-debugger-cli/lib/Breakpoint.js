'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Breakpoint {

  // The line number of the breakpoint (which may be undefined if we have an
  // unresolved function breakpoint.)


  // enabled tracks if the breakpoint has been enabled or disabled by the user.


  // id is the attached breakpoint in the adapter (if the adapter supports it)
  constructor(index) {
    this._index = index;
    this._verified = false;
    this._enabled = true;
  }

  // The function name of the breakpoint (only defined if the breakpoint is
  // a function breakpoint.)


  // The source file of the breakpoint (which may be undefined if we have an
  // unresolved function breakpoint.)


  // verified tracks if the breakpoint was successfully set by the adapter.
  // it may not be if the referenced code was not yet loaded

  // index is the name of the breakpoint we show externally in the UI


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

    return `${(0, (_nullthrows || _load_nullthrows()).default)(this._path)}:${(0, (_nullthrows || _load_nullthrows()).default)(this._line)}`;
  }
}
exports.default = Breakpoint; /**
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