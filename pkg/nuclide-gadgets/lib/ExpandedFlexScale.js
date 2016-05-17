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

exports.get = get;
exports.set = set;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _GadgetPlaceholder2;

function _GadgetPlaceholder() {
  return _GadgetPlaceholder2 = _interopRequireDefault(require('./GadgetPlaceholder'));
}

function get(container) {
  for (var item of container.getItems()) {
    if (item._expandedFlexScale) {
      return item._expandedFlexScale;
    }
  }
  return 1;
}

function set(container, value) {
  // Store the number on on every gadget item in the container just in case one gets moved or
  // destroyed. It would be nice to store the information on the container (Pane, PaneAxis) itself,
  // but Atom doesn't give us a way to persist metadata about those.
  container.getItems().forEach(function (item) {
    if (!('gadgetId' in item.constructor) && !(item instanceof (_GadgetPlaceholder2 || _GadgetPlaceholder()).default)) {
      // We don't control this item's serialization so no use in storing the size on it.
      return;
    }
    item._expandedFlexScale = value;
  });
}