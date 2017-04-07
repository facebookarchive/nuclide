'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = _interopRequireDefault(require('react'));

var _reactDom = _interopRequireDefault(require('react-dom'));

var _FindReferencesView;

function _load_FindReferencesView() {
  return _FindReferencesView = _interopRequireDefault(require('./view/FindReferencesView'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

/* global HTMLElement */

class FindReferencesElement extends HTMLElement {

  initialize(model) {
    this._model = model;
    return this;
  }

  getTitle() {
    return 'Symbol References: ' + this._model.getSymbolName();
  }

  attachedCallback() {
    _reactDom.default.render(_react.default.createElement((_FindReferencesView || _load_FindReferencesView()).default, { model: this._model }), this);
  }

  detachedCallback() {
    _reactDom.default.unmountComponentAtNode(this);
  }
}

exports.default = document.registerElement('nuclide-find-references-view', {
  prototype: FindReferencesElement.prototype
});