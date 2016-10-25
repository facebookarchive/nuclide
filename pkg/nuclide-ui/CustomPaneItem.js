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
exports.CustomPaneItem = undefined;

var _reactForAtom = require('react-for-atom');

let CustomPaneItem = exports.CustomPaneItem = class CustomPaneItem extends HTMLElement {

  initialize(options) {
    this._title = options.title;
    this._iconName = options.iconName;
    this._uri = options.uri;
    this._allowSplit = Boolean(options.allowSplit);

    this.__component = _reactForAtom.ReactDOM.render(this.__renderPaneItem(options), this);
  }

  /**
   * Subclasses should override this method to render the pane using options passed from above.
   * This method is invoked as part of initialize(), and so, it should be safe to invoke any of the
   * getter methods on this class in this method.
   *
   * @return A React component that this element call ReactDOM.render() on.
   */
  __renderPaneItem(options) {
    throw new Error('Subclass should implement this method.');
  }

  getTitle() {
    if (!this._title) {
      throw new Error('Invariant violation: "this._title"');
    }

    return this._title;
  }

  getIconName() {
    return this._iconName;
  }

  getURI() {
    return this._uri;
  }

  copy() {
    return this._allowSplit;
  }

  detachedCallback() {
    _reactForAtom.ReactDOM.unmountComponentAtNode(this);
  }
};