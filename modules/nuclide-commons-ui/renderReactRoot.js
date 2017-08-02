'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.renderReactRoot = renderReactRoot;

var _react = _interopRequireDefault(require('react'));

var _ReactMountRootElement;

function _load_ReactMountRootElement() {
  return _ReactMountRootElement = _interopRequireDefault(require('./ReactMountRootElement'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a DOM element and mount the React element in it. It will be unmounted when the node is
 * detached.
 */
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

function renderReactRoot(reactElement) {
  const element = new (_ReactMountRootElement || _load_ReactMountRootElement()).default();
  element.setReactElement(reactElement);
  return element;
}