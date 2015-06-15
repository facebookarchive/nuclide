'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = {
  get hgConstants() {
    return require('./hg-constants');
  },

  get HgService() {
    return require('./HgService');
  },

  get LocalHgService() {
    return require('./LocalHgService');
  },

  // Exposed for testing
  get MockHgService() {
    return require('../spec/MockHgService');
  },

  get revisions() {
    return require('./hg-revision-expression-helpers');
  },
};
