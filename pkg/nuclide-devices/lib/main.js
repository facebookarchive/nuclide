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
import {AndroidFetcher} from './fetchers/AndroidFetcher';
import {TizenFetcher} from './fetchers/TizenFetcher';

import type {WorkspaceViewsService} from '../../nuclide-workspace-views/lib/types';
import type {DeviceFetcher} from './types';

class Activation {
  _disposables: UniversalDisposable;
  _fetchers: Set<DeviceFetcher>;

  constructor(state: ?Object) {
    this._disposables = new UniversalDisposable();
    this._fetchers = new Set();

    this.registerDeviceFetcher(new AndroidFetcher());
    this.registerDeviceFetcher(new TizenFetcher());
  }

  dispose(): void {
    this._disposables.dispose();
  }

  consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
    this._disposables.add(
      api.addOpener(uri => {
        if (uri === WORKSPACE_VIEW_URI) {
          return new DevicesPanelState(this._fetchers);
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

  registerDeviceFetcher(fetcher: DeviceFetcher): void {
    this._fetchers.add(fetcher);
  }
}

createPackage(module.exports, Activation);
