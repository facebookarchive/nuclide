"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Breakpoint = void 0;

function _HandleMap() {
  const data = _interopRequireDefault(require("./HandleMap"));

  _HandleMap = function () {
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
  constructor(id, source, line, condition, verified) {
    this._id = id;
    this._source = source;
    this._line = line;
    this._condition = condition;
    this._verified = verified;
  }

  get id() {
    return this._id;
  }

  setId(n) {
    this._id = n;
  }

  get source() {
    return this._source;
  }

  get line() {
    return this._line;
  }

  get condition() {
    return this._condition;
  }

  get verified() {
    return this._verified;
  }

  setVerified() {
    this._verified = true;
  }

}

exports.Breakpoint = Breakpoint;

class Breakpoints {
  constructor() {
    this._breakpoints = new (_HandleMap().default)();
  }

  addBreakpoint(bkpt) {
    return this._breakpoints.put(bkpt);
  }

  removeBreakpoint(bkpt) {
    this._breakpoints.removeObject(bkpt);
  }

  handleForBreakpoint(bkpt) {
    return this._breakpoints.getHandleByObject(bkpt);
  }

  breakpointByHandle(handle) {
    return this._breakpoints.getObjectByHandle(handle);
  }

  breakpointByDebuggerId(id) {
    return this._breakpoints.allObjects.find(_ => id === _.id);
  }

  breakpointsWithNoDebuggerId() {
    return this._breakpoints.allObjects.filter(_ => _.id == null);
  }

}

exports.default = Breakpoints;