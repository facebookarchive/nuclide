'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TypeHintProvider} from 'nuclide-type-hint-interfaces';

import invariant from 'assert';

import type TypeHintManagerType from './TypeHintManager';

const {Disposable} = require('atom');

let typeHintManager: ?TypeHintManagerType = null;

module.exports = {

  activate(state: ?any): void {
    if (!typeHintManager) {
      const TypeHintManager = require('./TypeHintManager');
      typeHintManager = new TypeHintManager();
    }
  },

  consumeProvider(provider: TypeHintProvider): Disposable {
    invariant(typeHintManager);
    typeHintManager.addProvider(provider);
    return new Disposable(() => {
      if (typeHintManager != null) {
        typeHintManager.removeProvider(provider);
      }
    });
  },

  deactivate() {
    if (typeHintManager) {
      typeHintManager.dispose();
      typeHintManager = null;
    }
  },

};
