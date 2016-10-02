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
import createPackage from '../../commons-atom/createPackage';
import registerGrammar from '../../commons-atom/register-grammar';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {DedupedBusySignalProviderBase} from '../../nuclide-busy-signal';
import {ArcanistDiagnosticsProvider} from './ArcanistDiagnosticsProvider';

class Activation {
  _disposables: CompositeDisposable;
  _busySignalProvider: BusySignalProviderBase;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
    this._busySignalProvider = new DedupedBusySignalProviderBase();
    registerGrammar('source.json', '.arcconfig');
  }

  dispose(): void {
    this._disposables.dispose();
  }

  provideBusySignal(): BusySignalProvider {
    return this._busySignalProvider;
  }

  provideDiagnostics() {
    const provider = new ArcanistDiagnosticsProvider(this._busySignalProvider);
    this._disposables.add(provider);
    return provider;
  }
}

export default createPackage(Activation);
