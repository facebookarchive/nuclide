'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderReactRoot = renderReactRoot;

var _reactForAtom = require('react-for-atom');

var _ReactMountRootElement;

function _load_ReactMountRootElement() {
  return _ReactMountRootElement = _interopRequireDefault(require('../nuclide-ui/ReactMountRootElement'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a DOM element and mount the React element in it. It will be unmounted when the node is
 * detached.
 */
function renderReactRoot(reactElement) {
  const element = new (_ReactMountRootElement || _load_ReactMountRootElement()).default();
  element.setReactElement(reactElement);
  return element;
}