"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function DebugProtocol() {
  const data = _interopRequireWildcard(require("vscode-debugprotocol"));

  DebugProtocol = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
class Thread {
  constructor(id, name) {
    this._stack = [];
    this._id = id;
    this._name = name;
    this._stopped = false;
    this.clearSelectedStackFrame();
  }

  id() {
    return this._id;
  }

  name() {
    return this._name;
  }

  setName(name) {
    this._name = name;
  }

  get isStopped() {
    return this._stopped;
  }

  clearSelectedStackFrame() {
    this._selectedStackFrame = 0;
  }

  selectedStackFrame() {
    return this._selectedStackFrame;
  }

  setSelectedStackFrame(frame) {
    this._selectedStackFrame = frame;
  }

  setRunning() {
    this._stack = [];
    this._stopped = false;
  }

  setStopped() {
    this._stopped = true;
  }

  getStackFrames() {
    return this._stack;
  }

  addStackFrames(frames) {
    this._stack = this._stack.concat(frames);
  }

}

exports.default = Thread;