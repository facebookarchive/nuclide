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

exports.default = getContainerToHide;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _getResizableContainers2;

function _getResizableContainers() {
  return _getResizableContainers2 = _interopRequireDefault(require('./getResizableContainers'));
}

var containsTextEditor = function containsTextEditor(pane) {
  return pane.getItems().some(function (item) {
    return item instanceof (_atom2 || _atom()).TextEditor;
  });
};

/**
 * Gets the resizeable container (Pane or PaneAxis) which should be resized in order to hide the
 * provided pane.
 */

function getContainerToHide(pane) {
  var containerToHide = null;

  // The top-most container isn't resizable so exclude that immediately.
  var resizableContainers = Array.from((0, (_getResizableContainers2 || _getResizableContainers()).default)(pane)).slice(0, -1);

  // Find the highest resizable container that doesn't contain a text editor. If the very first
  // container has a text editor, use it anyway (we gotta hide something!)
  for (var i = 0, len = resizableContainers.length; i < len; i++) {
    var container = resizableContainers[i];
    var isLeaf = i === 0;

    if (!isLeaf && containsTextEditor(container)) {
      break;
    }

    containerToHide = container;
  }

  return containerToHide;
}

module.exports = exports.default;