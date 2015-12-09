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
} from '../../quick-open-interfaces';

const invariant = require('assert');

let providerInstance: ?Provider;
function getProviderInstance(): Provider {
  if (providerInstance == null) {
    const {RecentFilesProvider} = require('./RecentFilesProvider');
    providerInstance = {...RecentFilesProvider};
  }
  return providerInstance;
}

export default {

  registerProvider(): Provider {
    return getProviderInstance();
  },

  consumeRecentFilesService(service: mixed) {
    const instance = getProviderInstance();
    invariant(instance.setRecentFilesService != null);
    instance.setRecentFilesService(service);
  },

};
