'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TypeHintProvider} from '../../type-hint-interfaces';

import invariant from 'assert';

import type TypeHintManagerType from './TypeHintManager';

const {Disposable} = require('atom');

let typeHintManager: ?TypeHintManagerType = null;

const PACKAGE_NAME = 'nuclide-type-hint';

module.exports = {

  activate(state: ?any): void {
    if (!typeHintManager) {
      const TypeHintManager = require('./TypeHintManager');
      typeHintManager = new TypeHintManager();
    }
  },

  consumeTypehintProvider(provider: TypeHintProvider): IDisposable {
    invariant(typeHintManager);
    typeHintManager.addProvider(provider);
    return new Disposable(() => {
      if (typeHintManager != null) {
        typeHintManager.removeProvider(provider);
      }
    });
  },

  createDatatipProvider(): Object {
    invariant(typeHintManager);
    const datatip = typeHintManager.datatip.bind(typeHintManager);
    return {
      validForScope: () => true, // TODO
      providerName: PACKAGE_NAME,
      inclusionPriority: 1,
      datatip,
    };
  },

  deactivate() {
    if (typeHintManager) {
      typeHintManager = null;
    }
  },

};
