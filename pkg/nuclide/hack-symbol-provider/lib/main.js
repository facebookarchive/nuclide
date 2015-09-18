'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  Provider,
} from 'nuclide-quick-open-interfaces';

var providerInstance: ?Provider;
function getProviderInstance(): Provider {
  if (providerInstance == null) {
    var HackSymbolProvider = require('./HackSymbolProvider');
    providerInstance = {...HackSymbolProvider};
  }
  return providerInstance;
}

module.exports = {

  registerProvider(): Provider {
    return getProviderInstance();
  },

  activate(state: ?Object) {

  },

  deactivate() {

  },
};
