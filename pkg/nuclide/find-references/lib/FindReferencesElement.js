'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type FindReferencesModel from './FindReferencesModel';

var React = require('react-for-atom');
var FindReferencesView = require('./view/FindReferencesView');

class FindReferencesElement extends HTMLElement {
  _model: FindReferencesModel;

  initialize(model: FindReferencesModel) {
    this._model = model;
    return this;
  }

  getTitle() {
    return 'Symbol References: ' + this._model.getSymbolName();
  }

  attachedCallback() {
    React.render(
      <FindReferencesView model={this._model} />,
      this
    );
  }

  detachedCallback() {
    React.unmountComponentAtNode(this);
  }
}

module.exports = FindReferencesElement = (document: any).registerElement('nuclide-find-references-view', {
  prototype: FindReferencesElement.prototype,
});
