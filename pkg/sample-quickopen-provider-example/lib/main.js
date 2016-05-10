'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Provider} from '../../nuclide-quick-open/lib/types';

let providerInstance: ?Provider;
function getProviderInstance(): Provider {
  if (providerInstance == null) {
    const ExampleProvider = require('./ExampleProvider');
    providerInstance = {...ExampleProvider};
  }
  return providerInstance;
}

export function registerProvider(): Provider {
  return getProviderInstance();
}

export function activate(state: ?Object) {

}

export function deactivate() {

}
