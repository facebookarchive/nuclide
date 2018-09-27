"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowServiceState = void 0;

function _FlowExecInfoContainer() {
  const data = require("./FlowExecInfoContainer");

  _FlowExecInfoContainer = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
class FlowServiceState {
  getExecInfoContainer() {
    if (this._execInfoContainer == null) {
      this._execInfoContainer = new (_FlowExecInfoContainer().FlowExecInfoContainer)();
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

exports.FlowServiceState = FlowServiceState;