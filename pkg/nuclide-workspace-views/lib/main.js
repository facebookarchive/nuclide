'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {SerializedAppState, Store, ViewableFactory, WorkspaceViewsService} from './types';

import createPackage from '../../commons-atom/createPackage';
import syncAtomCommands from '../../commons-atom/sync-atom-commands';
import {combineEpics, createEpicMiddleware} from '../../commons-node/redux-observable';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {getLogger} from '../../nuclide-logging';
import * as AppSerialization from './AppSerialization';
import * as Actions from './redux/Actions';
import * as Epics from './redux/Epics';
import * as Reducers from './redux/Reducers';
import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';
import {applyMiddleware, combineReducers, createStore} from 'redux';
import {Observable} from 'rxjs';

class Activation {
  _disposables: CompositeDisposable;
  _store: Store;
  _rawState: ?Object;

  constructor(rawState: ?Object) {
    this._disposables = new CompositeDisposable();
    this._rawState = rawState;
  }

  dispose(): void {
    this._disposables.dispose();
  }

  _getStore(): Store {
    if (this._store == null) {
      const {store, disposables} = createPackageStore(this._rawState || {});
      this._rawState = null;
      this._store = store;
      this._disposables.add(disposables);
    }
    return this._store;
  }

  serialize(): SerializedAppState {
    return AppSerialization.serialize(this._store.getState());
  }

  provideWorkspaceViewsService(): WorkspaceViewsService {
    let pkg = this; // eslint-disable-line consistent-this
    this._disposables.add(new Disposable(() => { pkg = null; }));

    return {
      registerFactory: viewableFactory => {
        invariant(pkg != null, 'Viewables API used after deactivation');
        pkg._getStore().dispatch(Actions.registerViewableFactory(viewableFactory));
        return new Disposable(() => {
          if (pkg != null) {
            pkg._getStore().dispatch(Actions.unregisterViewableFactory(viewableFactory.id));
          }
        });
      },
      registerLocation: locationFactory => {
        invariant(pkg != null, 'Viewables API used after deactivation');
        pkg._getStore().dispatch(Actions.registerLocationFactory(locationFactory));
        return new Disposable(() => {
          if (pkg != null) {
            pkg._getStore().dispatch(Actions.unregisterLocation(locationFactory.id));
          }
        });
      },
      getViewableFactories(location: string): Array<ViewableFactory> {
        invariant(pkg != null, 'Viewables API used after deactivation');
        return Array.from(pkg._getStore().getState().viewableFactories.values());
      },
      observeViewableFactories(
        location: string,
        cb: (factories: Set<ViewableFactory>) => void,
      ): IDisposable {
        invariant(pkg != null, 'Viewables API used after deactivation');
        return new UniversalDisposable(
          // $FlowFixMe: Teach flow about Symbol.observable
          Observable.from(pkg._getStore())
            .map(state => state.viewableFactories)
            .distinctUntilChanged()
            .map(viewableFactories => new Set(viewableFactories.values()))
            .subscribe(cb),
        );
      },
    };
  }

}

function createPackageStore(rawState: Object): {store: Store, disposables: IDisposable} {
  const initialState = AppSerialization.deserialize(rawState);
  const epics = Object.keys(Epics)
    .map(k => Epics[k])
    .filter(epic => typeof epic === 'function');
  const rootEpic = (actions, store) => (
    combineEpics(...epics)(actions, store)
      // Log errors and continue.
      .catch((err, stream) => {
        getLogger().error(err);
        return stream;
      })
  );
  const store = createStore(
    combineReducers(Reducers),
    initialState,
    applyMiddleware(createEpicMiddleware(rootEpic)),
  );

  const states = Observable.from(store);

  // Add a toggle command for every viewable provider. We avoid debouncing here so that commands
  // will immediately be available to packages after they register themselves.
  const disposables = new CompositeDisposable(
    syncAtomCommands(
      states
        .map(state => state.viewableFactories)
        .distinctUntilChanged()
        .map(viewableFactories =>
          new Set(
            Array.from(viewableFactories.values())
              .filter(viewableFactory => viewableFactory.toggleCommand != null),
          ),
        ),
      viewableFactory => ({
        'atom-workspace': {
          [viewableFactory.toggleCommand]: event => {
            const visible = event.detail == null ? undefined : event.detail.visible;
            store.dispatch(Actions.toggleItemVisibility(viewableFactory.id, visible));
          },
        },
      }),
    ),
  );

  return {store, disposables};
}

export default createPackage(Activation);
