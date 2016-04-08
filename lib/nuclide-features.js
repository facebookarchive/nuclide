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

import {Emitter} from 'event-kit';

let emitter = new Emitter();

export const nuclideFeatures = {
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

  /**
   * Returns `true` if the feature with the given name is disabled either directly or because the
   *   'nuclide' package itself is disabled.
   */
  isFeatureDisabled(name: string): boolean {
    return atom.packages.isPackageDisabled('nuclide') || !atom.config.get(`nuclide.use.${name}`);
  },
};
