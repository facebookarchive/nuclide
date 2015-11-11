'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

let paneContainerClass: ?Function;

module.exports = function createPaneContainer(): Object {
  if (!paneContainerClass) {
    paneContainerClass = atom.views.providers.filter((provider: atom$ViewProvider) =>
      provider.modelConstructor.name === 'PaneContainer'
    )[0].modelConstructor;
  }
  return new paneContainerClass({});
};
