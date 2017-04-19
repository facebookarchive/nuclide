/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import createPackage from '../../commons-atom/createPackage';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {DevicesPanelState, WORKSPACE_VIEW_URI} from './DevicesPanelState';
import {Disposable} from 'atom';
import invariant from 'invariant';

import type {WorkspaceViewsService} from '../../nuclide-workspace-views/lib/types';
import type {DeviceFetcher, DeviceInfoProvider, DevicePanelServiceApi} from './types';

class Activation {
  _disposables: UniversalDisposable;
  _fetchers: Set<DeviceFetcher>;
  _deviceInfoProviders: Set<DeviceInfoProvider>;

  constructor(state: ?Object) {
    this._disposables = new UniversalDisposable();
    this._fetchers = new Set();
    this._deviceInfoProviders = new Set();
  }

  dispose(): void {
    this._disposables.dispose();
  }

  consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
    this._disposables.add(
      api.addOpener(uri => {
        if (uri === WORKSPACE_VIEW_URI) {
          return new DevicesPanelState(this._fetchers, this._deviceInfoProviders);
        }
      }),
      () => api.destroyWhere(item => item instanceof DevicesPanelState),
      atom.commands.add(
        'atom-workspace',
        'nuclide-devices:toggle',
        event => { api.toggle(WORKSPACE_VIEW_URI, (event: any).detail); },
      ),
    );
  }

  deserializeDevicePanelState(): DevicesPanelState {
    return new DevicesPanelState(this._fetchers, this._deviceInfoProviders);
  }

  provideDevicePanelServiceApi(): DevicePanelServiceApi {
    let pkg = this;
    this._disposables.add(() => { pkg = null; });
    return {
      registerDeviceFetcher: (fetcher: DeviceFetcher) => {
        invariant(pkg != null, 'Device panel service API used after deactivation');
        pkg._fetchers.add(fetcher);
        return new Disposable(() => {
          if (pkg != null) {
            pkg._fetchers.delete(fetcher);
          }
        });
      },
      registerInfoProvider: (provider: DeviceInfoProvider) => {
        invariant(pkg != null, 'Device panel service API used after deactivation');
        pkg._deviceInfoProviders.add(provider);
        return new Disposable(() => {
          if (pkg != null) {
            pkg._deviceInfoProviders.delete(provider);
          }
        });
      },
    };
  }
}

createPackage(module.exports, Activation);
