'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var codeFormatManager: ?CodeFormatManager = null;

module.exports = {

  activate(state: ?any): void {
    var CodeFormatManager = require('./CodeFormatManager');
    codeFormatManager = new CodeFormatManager();
  },

  consumeProvider(provider: CodeFormatProvider) {
    codeFormatManager.addProvider(provider);
  },

  deactivate() {
    if (codeFormatManager) {
      codeFormatManager.dispose();
      codeFormatManager = null;
    }
  }

};
