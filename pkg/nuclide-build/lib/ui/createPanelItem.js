Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createPanelItem = createPanelItem;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _reactForAtom2;

function _reactForAtom() {
  return _reactForAtom2 = require('react-for-atom');
}

function createPanelItem(reactElement) {
  var element = document.createElement('div');
  var mounted = (_reactForAtom2 || _reactForAtom()).ReactDOM.render(reactElement, element);
  // Add the DOM element as the "element" property of the instance. (Atom looks for this.)
  mounted.element = element;
  return mounted;
}