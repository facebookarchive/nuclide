

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = Object.defineProperties({}, {
  hgConstants: {
    get: function get() {
      return require('./hg-constants');
    },
    configurable: true,
    enumerable: true
  },
  HgService: {
    get: function get() {
      return require('./HgService');
    },
    configurable: true,
    enumerable: true
  },
  MockHgService: {

    // Exposed for testing

    get: function get() {
      return require('../spec/MockHgService');
    },
    configurable: true,
    enumerable: true
  },
  revisions: {
    get: function get() {
      return require('./hg-revision-expression-helpers');
    },
    configurable: true,
    enumerable: true
  }
});