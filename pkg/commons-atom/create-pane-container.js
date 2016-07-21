Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = createPaneContainer;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function createPaneContainer() {
  var PaneContainer = atom.workspace.paneContainer.constructor;
  return new PaneContainer({});
}

module.exports = exports.default;