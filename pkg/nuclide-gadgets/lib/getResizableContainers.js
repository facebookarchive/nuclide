Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.default = getResizableContainers;

var isResizable = function isResizable(pane) {
  return typeof pane.setFlexScale === 'function';
};
var getParent = function getParent(pane) {
  return pane.getParent && pane.getParent();
};

/**
 * Walk up the tree finding all resizable descendants.
 */

function* getResizableContainers(container) {
  while (container) {
    if (isResizable(container)) {
      yield container;
    }
    container = getParent(container);
  }
}

module.exports = exports.default;