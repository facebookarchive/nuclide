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
  _uri: string;

  initialize(uri: string) {
    this._uri = uri;
    return this;
  }

  /**
   * Return the tab title for the opened diff view tab item.
   */
  getTitle(): string {
    return 'Diff View';
  }

  /**
   * Return the tab URI for the opened diff view tab item.
   * This guarantees only one diff view will be opened per URI.
   */
  getURI(): string {
    return this._uri;
  }

}

module.exports = DiffViewElement = document.registerElement('nuclide-diff-view', {
  prototype: DiffViewElement.prototype,
});
