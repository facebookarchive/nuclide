/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {BusySignalProvider} from '../../nuclide-busy-signal/lib/types';
import type {BusySignalProviderBase} from '../../nuclide-busy-signal';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {TaskRunnerServiceApi} from '../../nuclide-task-runner/lib/types';
import type {OutputService} from '../../nuclide-console/lib/types';
import type {DeepLinkService} from '../../nuclide-deep-link/lib/types';
import type {RemoteProjectsService} from '../../nuclide-remote-projects';

import {CompositeDisposable, Disposable} from 'atom';
import createPackage from '../../commons-atom/createPackage';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {DedupedBusySignalProviderBase} from '../../nuclide-busy-signal';
import {ArcanistDiagnosticsProvider} from './ArcanistDiagnosticsProvider';
import ArcBuildSystem from './ArcBuildSystem';
import {openArcDeepLink} from './openArcDeepLink';

class Activation {
  _disposables: CompositeDisposable;
  _busySignalProvider: BusySignalProviderBase;
  _buildSystem: ?ArcBuildSystem;
  _cwdApi: ?CwdApi;
  _remoteProjectsService: ?RemoteProjectsService;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable();
    this._busySignalProvider = new DedupedBusySignalProviderBase();
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

  consumeCwdApi(api: CwdApi): IDisposable {
    this._cwdApi = api;
    return new Disposable(() => {
      this._cwdApi = null;
    });
  }

  consumeTaskRunnerServiceApi(api: TaskRunnerServiceApi): void {
    this._disposables.add(api.register(this._getBuildSystem()));
  }

  consumeOutputService(api: OutputService): void {
    this._disposables.add(
      api.registerOutputProvider({
        id: 'Arc Build',
        messages: this._getBuildSystem().getOutputMessages(),
      }),
    );
  }

  /**
   * Files can be opened relative to Arcanist directories via
   *   atom://nuclide/open-arc?project=<project_id>&path=<relative_path>
   * `line` and `column` can also be optionally provided as 1-based integers.
   */
  consumeDeepLinkService(deepLink: DeepLinkService): void {
    this._disposables.add(
      deepLink.subscribeToPath('open-arc', params => {
        const maybeCwd = this._cwdApi ? this._cwdApi.getCwd() : null;
        const maybeCwdPath = maybeCwd ? maybeCwd.getPath() : null;
        openArcDeepLink(params, this._remoteProjectsService, maybeCwdPath);
      }),
    );
  }

  consumeRemoteProjectsService(service: RemoteProjectsService): IDisposable {
    this._remoteProjectsService = service;
    return new Disposable(() => {
      this._remoteProjectsService = null;
    });
  }

  _getBuildSystem(): ArcBuildSystem {
    if (this._buildSystem == null) {
      const buildSystem = new ArcBuildSystem();
      this._disposables.add(buildSystem);
      this._buildSystem = buildSystem;
    }
    return this._buildSystem;
  }
}

createPackage(module.exports, Activation);
