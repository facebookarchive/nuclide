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
import type {TaskRunnerServiceApi} from '../../nuclide-task-runner/lib/types';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {OutputService} from '../../nuclide-console/lib/types';

import {CompositeDisposable, Disposable} from 'atom';
import createPackage from '../../commons-atom/createPackage';
import registerGrammar from '../../commons-atom/register-grammar';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {DedupedBusySignalProviderBase} from '../../nuclide-busy-signal';
import {ArcanistDiagnosticsProvider} from './ArcanistDiagnosticsProvider';
import ArcBuildSystem from './ArcBuildSystem';

class Activation {
  _disposables: CompositeDisposable;
  _busySignalProvider: BusySignalProviderBase;
  _buildSystem: ?ArcBuildSystem;
  _cwdApi: ?CwdApi;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
    this._busySignalProvider = new DedupedBusySignalProviderBase();
    registerGrammar('source.json', '.arcconfig');
  }

  dispose(): void {
    this._disposables.dispose();
  }

  setCwdApi(cwdApi: ?CwdApi) {
    this._cwdApi = cwdApi;
    if (this._buildSystem != null) {
      this._buildSystem.setCwdApi(cwdApi);
    }
  }

  provideBusySignal(): BusySignalProvider {
    return this._busySignalProvider;
  }

  provideDiagnostics() {
    const provider = new ArcanistDiagnosticsProvider(this._busySignalProvider);
    this._disposables.add(provider);
    return provider;
  }

  consumeBuildSystemRegistry(registry: TaskRunnerServiceApi): void {
    this._disposables.add(registry.register(this._getBuildSystem()));
  }

  consumeOutputService(api: OutputService): void {
    this._disposables.add(
      api.registerOutputProvider({
        id: 'Arc Build',
        messages: this._getBuildSystem().getOutputMessages(),
      }),
    );
  }

  consumeCwdApi(api: CwdApi): IDisposable {
    this.setCwdApi(api);

    let pkg = this;
    this._disposables.add({
      dispose() { pkg = null; },
    });
    return new Disposable(() => {
      if (pkg != null) {
        pkg.setCwdApi(null);
      }
    });
  }

  _getBuildSystem(): ArcBuildSystem {
    if (this._buildSystem == null) {
      const buildSystem = new ArcBuildSystem();
      if (this._cwdApi != null) {
        buildSystem.setCwdApi(this._cwdApi);
      }
      this._disposables.add(buildSystem);
      this._buildSystem = buildSystem;
    }
    return this._buildSystem;
  }
}

export default createPackage(Activation);
