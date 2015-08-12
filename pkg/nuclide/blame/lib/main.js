'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Disposable} = require('atom');

import type {BlameProvider} from 'nuclide-blame-base/blame-types';

var registeredProviders: ?Set<BlameProvider>;

module.exports = {

  activate(state: ?Object): void {
  },

  deactivate() {
    if (registeredProviders) {
      registeredProviders.clear();
    }
  },

  consumeBlameProvider(provider: BlameProvider): atom$IDisposable {
    if (!registeredProviders) {
      registeredProviders = new Set();
    }
    registeredProviders.add(provider);
    return new Disposable(() => {
      if (registeredProviders) {
        registeredProviders.delete(provider);
      }
    });
  },
};
