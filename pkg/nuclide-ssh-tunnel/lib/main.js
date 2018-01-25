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

import type {OutputService} from '../../../modules/atom-ide-ui/pkg/atom-ide-console/lib/types';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {
  AppState,
  OpenTunnel,
  SshTunnelService,
  Store,
  Tunnel,
  TunnelState,
} from './types';

import createPackage from 'nuclide-commons-atom/createPackage';
import {destroyItemWhere} from 'nuclide-commons-atom/destroyItemWhere';
import * as Immutable from 'immutable';
import {mapEqual} from 'nuclide-commons/collection';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {Observable} from 'rxjs';
import {getSocketServiceByNuclideUri} from '../../nuclide-remote-connection';
import {TunnelsPanel, WORKSPACE_VIEW_URI} from './ui/TunnelsPanel';
import * as Actions from './redux/Actions';
import * as Epics from './redux/Epics';
import * as Reducers from './redux/Reducers';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {
  combineEpics,
  createEpicMiddleware,
} from 'nuclide-commons/redux-observable';

class Activation {
  _disposables: UniversalDisposable;
  _store: Store;
  _tunnels: Observable<Immutable.Map<Tunnel, TunnelState>>;

  constructor(rawState: ?Object) {
    const epics = Object.keys(Epics)
      .map(k => Epics[k])
      .filter(epic => typeof epic === 'function');
    this._store = createStore(
      combineReducers(Reducers),
      applyMiddleware(createEpicMiddleware(combineEpics(...epics))),
    );

    this._disposables = new UniversalDisposable(
      this._closeAllTunnels.bind(this),
      this._registerCommandAndOpener(),
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  _registerCommandAndOpener(): UniversalDisposable {
    return new UniversalDisposable(
      atom.workspace.addOpener(uri => {
        if (uri === WORKSPACE_VIEW_URI) {
          return new TunnelsPanel(this._store);
        }
      }),
      () => destroyItemWhere(item => item instanceof TunnelsPanel),
      atom.commands.add(
        'atom-workspace',
        'nuclide-ssh-tunnels-panel:toggle',
        () => {
          atom.workspace.toggle(WORKSPACE_VIEW_URI);
        },
      ),
    );
  }

  provideSshTunnelService(): SshTunnelService {
    if (this._tunnels == null) {
      // $FlowFixMe: Teach flow about Symbol.observable
      const states: Observable<AppState> = Observable.from(this._store);
      this._tunnels = states
        .map(state => state.openTunnels)
        // $FlowFixMe teach mapEqual to accept Immutable.Map
        .distinctUntilChanged(mapEqual)
        .map((tunnelMap: Immutable.Map<Tunnel, OpenTunnel>) =>
          tunnelMap.map(openTunnel => openTunnel.state),
        )
        .publishReplay(1)
        .refCount();
    }

    return {
      openTunnel: (tunnel, onOpen, onClose) => {
        this._store.dispatch(Actions.openTunnel(tunnel, onOpen, onClose));
        return new UniversalDisposable(() =>
          this._store.dispatch(Actions.closeTunnel(tunnel)),
        );
      },
      getOpenTunnels: () => {
        return new Set(this._store.getState().openTunnels.keys());
      },
      observeTunnels: callback => {
        return new UniversalDisposable(
          this._tunnels.subscribe(tunnels => callback(tunnels)),
        );
      },
      getAvailableServerPort: async nuclideUri => {
        return getSocketServiceByNuclideUri(
          nuclideUri,
        ).getAvailableServerPort();
      },
    };
  }

  deserializeSshTunnelsPanel(): atom$PaneItem {
    return new TunnelsPanel(this._store);
  }

  _closeAllTunnels() {
    const tunnels = this._store.getState().openTunnels;
    tunnels.forEach((_, tunnel) =>
      this._store.dispatch(Actions.closeTunnel(tunnel)),
    );
  }

  consumeCurrentWorkingDirectory(api: CwdApi): void {
    this._disposables.add(
      api.observeCwd(directory => {
        this._store.dispatch(Actions.setCurrentWorkingDirectory(directory));
      }),
    );
  }

  consumeOutputService(api: OutputService): void {
    this._disposables.add(
      api.registerOutputProvider({
        id: 'SSH tunnels',
        messages: this._store.getState().consoleOutput,
      }),
    );
  }
}

createPackage(module.exports, Activation);
