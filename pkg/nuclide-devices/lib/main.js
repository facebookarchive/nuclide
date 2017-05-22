/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import createPackage from 'nuclide-commons-atom/createPackage';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {DevicesPanelState, WORKSPACE_VIEW_URI} from './DevicesPanelState';
import {Disposable} from 'atom';
import invariant from 'invariant';
import {
  ServerConnection,
} from '../../nuclide-remote-connection/lib/ServerConnection';
import {
  combineEpics,
  createEpicMiddleware,
} from '../../commons-node/redux-observable';
import {applyMiddleware, createStore} from 'redux';
import {createEmptyAppState} from './redux/createEmptyAppState';
import * as Reducers from './redux/Reducers';
import * as Actions from './redux/Actions';
import * as Epics from './redux/Epics';
import {
  getDeviceInfoProviders,
  getDeviceProcessesProviders,
  getDeviceListProviders,
  getDeviceTaskProviders,
} from './providers';
import nuclideUri from 'nuclide-commons/nuclideUri';

import type {
  WorkspaceViewsService,
} from '../../nuclide-workspace-views/lib/types';
import type {Store, DevicePanelServiceApi} from './types';

let activation = null;
class Activation {
  _disposables: UniversalDisposable;
  _store: Store;

  constructor(state: ?Object) {
    const epics = Object.keys(Epics)
      .map(k => Epics[k])
      .filter(epic => typeof epic === 'function');
    this._store = createStore(
      Reducers.app,
      createEmptyAppState(),
      applyMiddleware(createEpicMiddleware(combineEpics(...epics))),
    );
    this._disposables = new UniversalDisposable(
      ServerConnection.observeRemoteConnections().subscribe(conns => {
        const hosts = conns.map(conn =>
          nuclideUri.getHostname(conn.getUriOfRemotePath('/')),
        );
        this._store.dispatch(Actions.setHosts(['local'].concat(hosts)));
      }),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
    this._disposables.add(
      api.addOpener(uri => {
        if (uri === WORKSPACE_VIEW_URI) {
          return new DevicesPanelState(this._store);
        }
      }),
      () => api.destroyWhere(item => item instanceof DevicesPanelState),
      atom.commands.add(
        'atom-workspace',
        'nuclide-device-panel:toggle',
        event => {
          api.toggle(WORKSPACE_VIEW_URI, (event: any).detail);
        },
      ),
    );
  }

  deserializeDevicePanelState(): DevicesPanelState {
    return new DevicesPanelState(this._store);
  }

  _refreshDeviceTypes(): void {
    this._store.dispatch(
      Actions.setDeviceTypes(
        Array.from(getDeviceListProviders()).map(p => p.getType()),
      ),
    );
  }

  _createProviderRegistration<T>(
    providers: Set<T>,
    onDispose?: () => void,
  ): (provider: T) => Disposable {
    return (provider: T) => {
      invariant(
        activation != null,
        'Device panel service API used after deactivation',
      );
      providers.add(provider);
      if (onDispose != null) {
        onDispose();
      }
      return new Disposable(() => {
        if (activation != null) {
          providers.delete(provider);
        }
      });
    };
  }

  provideDevicePanelServiceApi(): DevicePanelServiceApi {
    activation = this;
    this._disposables.add(() => {
      activation = null;
    });
    return {
      registerListProvider: this._createProviderRegistration(
        getDeviceListProviders(),
        () => this._refreshDeviceTypes(),
      ),
      registerInfoProvider: this._createProviderRegistration(
        getDeviceInfoProviders(),
      ),
      registerProcessesProvider: this._createProviderRegistration(
        getDeviceProcessesProviders(),
      ),
      registerTaskProvider: this._createProviderRegistration(
        getDeviceTaskProviders(),
      ),
    };
  }
}

createPackage(module.exports, Activation);
