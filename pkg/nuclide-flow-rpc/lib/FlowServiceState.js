'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowServiceState = undefined;

var _FlowExecInfoContainer;

function _load_FlowExecInfoContainer() {
  return _FlowExecInfoContainer = require('./FlowExecInfoContainer');
}

class FlowServiceState {

  getExecInfoContainer() {
    if (this._execInfoContainer == null) {
      this._execInfoContainer = new (_FlowExecInfoContainer || _load_FlowExecInfoContainer()).FlowExecInfoContainer();
    }
    return this._execInfoContainer;
  }

  dispose() {
    if (this._execInfoContainer != null) {
      this._execInfoContainer.dispose();
      this._execInfoContainer = null;
    }
  }
}
exports.FlowServiceState = FlowServiceState; /**
                                              * Copyright (c) 2015-present, Facebook, Inc.
                                              * All rights reserved.
                                              *
                                              * This source code is licensed under the license found in the LICENSE file in
                                              * the root directory of this source tree.
                                              *
                                              * 
                                              * @format
                                              */