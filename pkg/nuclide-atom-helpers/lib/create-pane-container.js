

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var paneContainerClass = undefined;

module.exports = function createPaneContainer() {
  if (!paneContainerClass) {
    paneContainerClass = atom.views.providers.filter(function (provider) {
      return provider.modelConstructor.name === 'PaneContainer';
    })[0].modelConstructor;
  }
  return new paneContainerClass({});
};