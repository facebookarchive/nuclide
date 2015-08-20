'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

class DiffViewElement extends HTMLElement {

  initialize(model) {
    this._model = model;
    return this;
  }

  /**
   * Return the tab title for the opened diff view tab item.
   */
  getTitle() {
    return 'Diff View';
  }

  /**
   * Return the tab URI for the opened diff view tab item.
   * This guarantees only one diff view will be opened per URI.
   */
  getURI() {
    return this._model.getURI();
  }

}

module.exports = DiffViewElement = document.registerElement('nuclide-diff-view', {
  prototype: DiffViewElement.prototype,
});
