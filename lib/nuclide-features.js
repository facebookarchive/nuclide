Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var emitter = new (_eventKit2 || _eventKit()).Emitter();

var nuclideFeatures = {
  dispose: function dispose() {
    if (emitter === null) {
      throw new Error('Nuclide features emitter has been disposed');
    }

    emitter.dispose();
    emitter = null;
  },

  didLoadInitialFeatures: function didLoadInitialFeatures() {
    if (emitter === null) {
      throw new Error('Nuclide features emitter has been disposed');
    }

    emitter.emit('did-load-initial-features');
  },

  didActivateInitialFeatures: function didActivateInitialFeatures() {
    if (emitter === null) {
      throw new Error('Nuclide features emitter has been disposed');
    }

    emitter.emit('did-activate-initial-features');
  },

  onDidLoadInitialFeatures: function onDidLoadInitialFeatures(callback) {
    if (emitter === null) {
      throw new Error('Nuclide features emitter has been disposed');
    }

    return emitter.on('did-load-initial-features', callback);
  },

  onDidActivateInitialFeatures: function onDidActivateInitialFeatures(callback) {
    if (emitter === null) {
      throw new Error('Nuclide features emitter has been disposed');
    }

    return emitter.on('did-activate-initial-features', callback);
  },

  /**
   * Returns `true` if the feature with the given name is disabled either directly or because the
   *   'nuclide' package itself is disabled.
   */
  isFeatureDisabled: function isFeatureDisabled(name) {
    return atom.packages.isPackageDisabled('nuclide') || !atom.config.get('nuclide.use.' + name);
  }
};
exports.nuclideFeatures = nuclideFeatures;