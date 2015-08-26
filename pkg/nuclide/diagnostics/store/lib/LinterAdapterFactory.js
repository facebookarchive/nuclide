'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LinterProvider} from './LinterAdapter';
// Flow didn't like it when I tried import type here. This shouldn't affect
// performance though, since LinterAdapter requires this anyway.
var {DiagnosticsProviderBase} = require('nuclide-diagnostics-provider-base');
var LinterAdapter = require('./LinterAdapter');

function createSingleAdapter(provider: LinterProvider, ProviderBase?: typeof DiagnosticsProviderBase): ?LinterAdapter {
  if (provider.disabledForNuclide) {
    return;
  }
  return new LinterAdapter(provider, ProviderBase);
}

function addSingleAdapter(adapters: Set<LinterAdapter>, provider: LinterProvider, ProviderBase?: typeof DiagnosticsProviderBase): void {
  var adapter: ?LinterAdapter = createSingleAdapter(provider);
  if (adapter) {
    adapters.add(adapter);
  }
}

function createAdapters(providers: LinterProvider | Array<LinterProvider>, ProviderBase?: typeof DiagnosticsProviderBase): Set<LinterAdapter> {
  var adapters = new Set();
  if (Array.isArray(providers)) {
    for (var provider of providers) {
      addSingleAdapter(adapters, provider);
    }
  } else {
    addSingleAdapter(adapters, providers);
  }
  return adapters;
}

module.exports = { createAdapters };
