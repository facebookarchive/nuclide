'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Breakpoint;

function _load_Breakpoint() {
  return _Breakpoint = _interopRequireDefault(require('./Breakpoint'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class SourceBreakpoint extends (_Breakpoint || _load_Breakpoint()).default {

  constructor(index, path, line) {
    super(index);
    this._path = path;
    this._line = line;
  }

  get path() {
    return this._path;
  }

  get line() {
    return this._line;
  }

  toString() {
    return `${this._path}:${this._line}`;
  }
}
exports.default = SourceBreakpoint; /**
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