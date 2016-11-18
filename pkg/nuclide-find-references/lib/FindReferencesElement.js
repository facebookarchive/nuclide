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

var _FindReferencesView;

function _load_FindReferencesView() {
  return _FindReferencesView = _interopRequireDefault(require('./view/FindReferencesView'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let FindReferencesElement = class FindReferencesElement extends HTMLElement {

  initialize(model) {
    this._model = model;
    return this;
  }

  getTitle() {
    return 'Symbol References: ' + this._model.getSymbolName();
  }

  attachedCallback() {
    _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement((_FindReferencesView || _load_FindReferencesView()).default, { model: this._model }), this);
  }

  detachedCallback() {
    _reactForAtom.ReactDOM.unmountComponentAtNode(this);
  }
};
exports.default = document.registerElement('nuclide-find-references-view', {
  prototype: FindReferencesElement.prototype
});
module.exports = exports['default'];