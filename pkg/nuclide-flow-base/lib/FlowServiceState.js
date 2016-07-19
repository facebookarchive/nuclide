'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {FlowRootContainer} from './FlowRootContainer';
import {FlowExecInfoContainer} from './FlowExecInfoContainer';

export class FlowServiceState {

  _rootContainer: ?FlowRootContainer;
  _execInfoContainer: ?FlowExecInfoContainer;

  getRootContainer(): FlowRootContainer {
    if (this._rootContainer == null) {
      this._rootContainer = new FlowRootContainer(this.getExecInfoContainer());
    }
    return this._rootContainer;
  }

  getExecInfoContainer(): FlowExecInfoContainer {
    if (this._execInfoContainer == null) {
      this._execInfoContainer = new FlowExecInfoContainer();
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
}
