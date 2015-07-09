'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var hyperclick: ?Hyperclick = null;
var {Disposable} = require('atom');

module.exports = {
  activate() {
    var Hyperclick = require('./Hyperclick');
    hyperclick = new Hyperclick();
  },

  deactivate() {
    if (hyperclick) {
      hyperclick.dispose();
      hyperclick = null;
    }
  },

  consumeProvider(provider: HyperclickProvider | Array<HyperclickProvider>): ?Disposable {
    if (hyperclick) {
      hyperclick.consumeProvider(provider);
      return new Disposable(() => {
        if (hyperclick) {
          hyperclick.removeProvider(provider);
        }
      });
    }
  },
};
