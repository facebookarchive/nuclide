"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isPending = isPending;
exports.observePendingStateEnd = observePendingStateEnd;
exports.isConsoleVisible = isConsoleVisible;

function _event() {
  const data = require("../nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

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
function isPending(paneItem) {
  const pane = atom.workspace.paneForItem(paneItem);
  return pane && pane.getPendingItem() === paneItem;
}

function observePendingStateEnd(paneItem) {
  if (!(typeof paneItem.onDidTerminatePendingState === 'function')) {
    throw new Error('paneItem must implement onDidTerminatePendingState method');
  }

  return (0, _event().observableFromSubscribeFunction)(paneItem.onDidTerminatePendingState.bind(paneItem));
}

const CONSOLE_VIEW_URI = 'atom://nuclide/console';

function isConsoleVisible() {
  const consolePane = atom.workspace.paneForURI(CONSOLE_VIEW_URI);
  const consoleItem = consolePane && consolePane.itemForURI(CONSOLE_VIEW_URI);
  const paneContainer = atom.workspace.paneContainerForItem(consoleItem); // This visibility check has been taken from
  // https://github.com/atom/atom/blob/v1.28.2/src/workspace.js#L1084

  return (paneContainer === atom.workspace.getCenter() || paneContainer != null && paneContainer.isVisible()) && consoleItem === consolePane.getActiveItem();
}