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
var blameGutterClass;

module.exports = {

  activate(state: ?Object): void {
  },

  deactivate() {
    if (registeredProviders) {
      registeredProviders.clear();
    }
  },

  consumeBlameGutterClass(blameGutter: mixed): atom$IDisposable {
    // This package only expects one gutter UI. It will take the first one.
    if (!blameGutterClass) {
      blameGutterClass = blameGutter;
      return new Disposable(() => {
        blameGutterClass = null;
      });
    } else {
      return new Disposable(() => {});
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
