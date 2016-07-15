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

export class FlowServiceState {

  _rootContainer: ?FlowRootContainer;

  getRootContainer(): FlowRootContainer {
    if (this._rootContainer == null) {
      this._rootContainer = new FlowRootContainer();
    }
    return this._rootContainer;
  }

  dispose() {
    if (this._rootContainer != null) {
      this._rootContainer.dispose();
      this._rootContainer = null;
    }
  }
}
