'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * A custom HTMLElement we render React elements into.
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

/* global HTMLElement */

class ReactMountRootElement extends HTMLElement {

  setReactElement(reactElement) {
    this._reactElement = reactElement;
  }

  attachedCallback() {
    if (this._reactElement == null) {
      return;
    }
    _reactDom.default.render(this._reactElement, this);
  }

  detachedCallback() {
    if (this._reactElement == null) {
      return;
    }
    _reactDom.default.unmountComponentAtNode(this);
  }
}

exports.default = document.registerElement('nuclide-react-mount-root', {
  prototype: ReactMountRootElement.prototype
});