'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BusySignalProvider} from '../../nuclide-busy-signal/lib/types';
import type {BusySignalProviderBase} from '../../nuclide-busy-signal';

import {CompositeDisposable} from 'atom';
import invariant from 'assert';
import registerGrammar from '../../commons-atom/register-grammar';

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

  registerGrammar('source.json', '.arcconfig');
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
