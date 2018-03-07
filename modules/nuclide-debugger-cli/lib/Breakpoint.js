'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _vscodeDebugprotocol;

function _load_vscodeDebugprotocol() {
  return _vscodeDebugprotocol = _interopRequireWildcard(require('vscode-debugprotocol'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class Breakpoint {

  // verified tracks if the breakpoint was successfully set by the adapter.
  // it may not be if the referenced code was not yet loaded

  // index is the name of the breakpoint we show externally in the UI
  constructor(index) {
    this._index = index;
    this._verified = false;
    this._enabled = true;
  }

  // enabled tracks if the breakpoint has been enabled or disabled by the user.


  // id is the attached breakpoint in the adapter (if the adapter supports it)


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

  get path() {
    return null;
  }

  get line() {
    return -1;
  }

  toString() {
    if (!false) {
      throw new Error('Breakpoint subclasses must implement toString()');
    }
  }

  toProtocolBreakpoint() {
    return {
      verified: this._verified,
      line: this.line
    };
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