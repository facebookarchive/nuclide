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
  BusySignalProvider,
  BusySignalProviderBase,
} from '../../nuclide-busy-signal';

import {CompositeDisposable} from 'atom';
import invariant from 'assert';

let subscriptions: ?CompositeDisposable = null;

let busySignalProvider: ?BusySignalProviderBase = null;

function getBusySignalProvider(): BusySignalProviderBase {
  if (busySignalProvider == null) {
    const {DedupedBusySignalProviderBase} = require('../../nuclide-busy-signal');
    busySignalProvider = new DedupedBusySignalProviderBase();
  }
  return busySignalProvider;
}

export function activate(): void {
  if (subscriptions) {
    return;
  }

  subscriptions = new CompositeDisposable();

  const {registerGrammarForFileExtension} = require('../../nuclide-atom-helpers');
  registerGrammarForFileExtension('source.json', '.arcconfig');
}

export function dactivate(): void {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }
  busySignalProvider = null;
}

export function provideBusySignal(): BusySignalProvider {
  return getBusySignalProvider();
}

export function provideDiagnostics() {
  const {ArcanistDiagnosticsProvider} = require('./ArcanistDiagnosticsProvider');
  const provider = new ArcanistDiagnosticsProvider(getBusySignalProvider());
  invariant(subscriptions != null);
  subscriptions.add(provider);
  return provider;
}
