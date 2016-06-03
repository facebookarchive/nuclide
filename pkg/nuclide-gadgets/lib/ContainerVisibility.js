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

// This module contains some utilities for dealing with "container" (pane or pane axis) visibility.

exports.isHidden = isHidden;
exports.hide = hide;
exports.show = show;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ExpandedFlexScale2;

function _ExpandedFlexScale() {
  return _ExpandedFlexScale2 = _interopRequireWildcard(require('./ExpandedFlexScale'));
}

function isHidden(container) {
  // TODO: Leave a little wiggle room here? Hard to know a good number for flex scale.
  return container.getFlexScale() === 0;
}

function hide(container) {
  if (isHidden(container)) {
    return;
  }

  var currentFlexScale = container.getFlexScale();
  container.setFlexScale(0);

  // Store the original flex scale so we can restore to it later.
  (_ExpandedFlexScale2 || _ExpandedFlexScale()).set(container, currentFlexScale);
}

function show(container) {
  if (!isHidden(container)) {
    return;
  }
  var expandedFlexScale = (_ExpandedFlexScale2 || _ExpandedFlexScale()).get(container);
  container.setFlexScale(expandedFlexScale);
}