Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.renderReactRoot = renderReactRoot;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

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

var _nuclideUiReactMountRootElement2;

function _nuclideUiReactMountRootElement() {
  return _nuclideUiReactMountRootElement2 = _interopRequireDefault(require('../nuclide-ui/ReactMountRootElement'));
}

/**
 * Create a DOM element and mount the React element in it. It will be unmounted when the node is
 * detached.
 */

function renderReactRoot(reactElement) {
  var element = new (_nuclideUiReactMountRootElement2 || _nuclideUiReactMountRootElement()).default();
  element.setReactElement(reactElement);
  return element;
}