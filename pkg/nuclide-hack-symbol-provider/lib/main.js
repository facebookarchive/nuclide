'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Provider} from '../../nuclide-quick-open-interfaces';

let providerInstance: ?Provider;
function getProviderInstance(): Provider {
  if (providerInstance == null) {
    const {HackSymbolProvider} = require('./HackSymbolProvider');
    providerInstance = {...HackSymbolProvider};
  }
  return providerInstance;
}

export function registerProvider(): Provider {
  return getProviderInstance();
}

export function activate(state: ?Object) {
}
