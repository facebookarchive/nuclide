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
  BusySignalProviderBase as BusySignalProviderBaseType,
} from 'nuclide-busy-signal-provider-base';

import type {
  BusySignalProvider,
} from 'nuclide-busy-signal-interfaces';

import {CompositeDisposable} from 'atom';
import invariant from 'assert';

let subscriptions: ?CompositeDisposable = null;

let busySignalProvider: ?BusySignalProviderBaseType = null;

function getBusySignalProvider(): BusySignalProviderBaseType {
  if (busySignalProvider == null) {
    const {DedupedBusySignalProviderBase} = require('nuclide-busy-signal-provider-base');
    busySignalProvider = new DedupedBusySignalProviderBase();
  }
  return busySignalProvider;
}

module.exports = {
  // $FlowIssue https://github.com/facebook/flow/issues/620
  config: require('../package.json').nuclide.config,

  activate(): void {
    if (subscriptions) {
      return;
    }

    const {registerGrammarForFileExtension} = require('nuclide-atom-helpers');
    subscriptions = new CompositeDisposable();
    subscriptions.add(registerGrammarForFileExtension('source.json', '.arcconfig'));
  },

  dactivate(): void {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
    busySignalProvider = null;
  },

  provideBusySignal(): BusySignalProvider {
    return getBusySignalProvider();
  },

  provideDiagnostics() {
    const {ArcanistDiagnosticsProvider} = require('./ArcanistDiagnosticsProvider');
    const provider = new ArcanistDiagnosticsProvider(getBusySignalProvider());
    invariant(subscriptions != null);
    subscriptions.add(provider);
    return provider;
  },
};
