'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var typeHintManager: ?TypeHintManager = null;

var {Disposable} = require('atom');

module.exports = {

  activate(state: ?any): void {
    if (!typeHintManager) {
      var TypeHintManager = require('./TypeHintManager');
      typeHintManager = new TypeHintManager();
    }
  },

  consumeProvider(provider: TypeHintProvider): Disposable {
    typeHintManager.addProvider(provider);
    return new Disposable(() => typeHintManager.removeProvider(provider));
  },

  deactivate() {
    if (typeHintManager) {
      typeHintManager.dispose();
      typeHintManager = null;
    }
  }

};
