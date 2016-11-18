'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowServiceState = undefined;

var _FlowRootContainer;

function _load_FlowRootContainer() {
  return _FlowRootContainer = require('./FlowRootContainer');
}

var _FlowExecInfoContainer;

function _load_FlowExecInfoContainer() {
  return _FlowExecInfoContainer = require('./FlowExecInfoContainer');
}

let FlowServiceState = exports.FlowServiceState = class FlowServiceState {

  getRootContainer() {
    if (this._rootContainer == null) {
      this._rootContainer = new (_FlowRootContainer || _load_FlowRootContainer()).FlowRootContainer(this.getExecInfoContainer());
    }
    return this._rootContainer;
  }

  getExecInfoContainer() {
    if (this._execInfoContainer == null) {
      this._execInfoContainer = new (_FlowExecInfoContainer || _load_FlowExecInfoContainer()).FlowExecInfoContainer();
    }
    return this._execInfoContainer;
  }

  dispose() {
    if (this._rootContainer != null) {
      this._rootContainer.dispose();
      this._rootContainer = null;
    }
    if (this._execInfoContainer != null) {
      this._execInfoContainer.dispose();
      this._execInfoContainer = null;
    }
  }
};