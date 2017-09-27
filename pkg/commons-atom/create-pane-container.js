'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createPaneContainer;
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function createPaneContainer() {
  const instance = typeof atom.workspace.getCenter === 'function' ? atom.workspace.getCenter().paneContainer : atom.workspace.paneContainer;
  const PaneContainer = instance.constructor;
  return new PaneContainer({
    viewRegistry: atom.views,
    config: atom.config,
    applicationDelegate: atom.applicationDelegate,
    notificationManager: atom.notifications,
    deserializerManager: atom.deserializers
  });
}