'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Disposable} from 'atom';

const {Emitter} = require('event-kit');

let emitter = new Emitter();

module.exports = {
  dispose(): void {
    if (emitter === null) {
      throw new Error('Nuclide features emitter has been disposed');
    }

    emitter.dispose();
    emitter = null;
  },

  didLoadInitialFeatures(): void {
    if (emitter === null) {
      throw new Error('Nuclide features emitter has been disposed');
    }

    emitter.emit('did-load-initial-features');
  },

  didActivateInitialFeatures(): void {
    if (emitter === null) {
      throw new Error('Nuclide features emitter has been disposed');
    }

    emitter.emit('did-activate-initial-features');
  },

  onDidLoadInitialFeatures(callback: () => mixed): Disposable {
    if (emitter === null) {
      throw new Error('Nuclide features emitter has been disposed');
    }

    return emitter.on('did-load-initial-features', callback);
  },

  onDidActivateInitialFeatures(callback: () => mixed): Disposable {
    if (emitter === null) {
      throw new Error('Nuclide features emitter has been disposed');
    }

    return emitter.on('did-activate-initial-features', callback);
  },
};
