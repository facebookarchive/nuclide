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

var _reactForAtom = require('react-for-atom');

/**
 * A custom HTMLElement we render React elements into.
 */
let ReactMountRootElement = class ReactMountRootElement extends HTMLElement {

  setReactElement(reactElement) {
    this._reactElement = reactElement;
  }

  // $FlowIssue -- readonly props: t10620219
  attachedCallback() {
    if (this._reactElement == null) {
      return;
    }
    _reactForAtom.ReactDOM.render(this._reactElement, this);
  }

  // $FlowIssue -- readonly props: t10620219
  detachedCallback() {
    if (this._reactElement == null) {
      return;
    }
    _reactForAtom.ReactDOM.unmountComponentAtNode(this);
  }

};
exports.default = document.registerElement('nuclide-react-mount-root', {
  prototype: ReactMountRootElement.prototype
});
module.exports = exports['default'];