'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {GetToolBar} from '../../commons-atom/suda-tool-bar';
import type {WorkspaceViewsService} from '../../nuclide-workspace-views/lib/types';
import type {
  AppState,
  OutputProvider,
  OutputService,
  RegisterExecutorFunction,
  Store,
} from './types';

import createPackage from '../../commons-atom/createPackage';
import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import {combineEpics, createEpicMiddleware} from '../../commons-node/redux-observable';
import {CompositeDisposable, Disposable} from 'atom';
import featureConfig from '../../commons-atom/featureConfig';
import * as Actions from './redux/Actions';
import * as Epics from './redux/Epics';
import Reducers from './redux/Reducers';
import {ConsoleContainer} from './ui/ConsoleContainer';
import invariant from 'assert';
import {React} from 'react-for-atom';
import {applyMiddleware, createStore} from 'redux';

class Activation {
  _disposables: CompositeDisposable;
  _outputService: ?OutputService;
  _rawState: ?Object;
  _registerExecutorFunction: ?RegisterExecutorFunction;
  _store: Store;

  constructor(rawState: ?Object) {
    this._rawState = rawState;
    this._disposables = new CompositeDisposable(
      atom.contextMenu.add({
        '.nuclide-console-record': [
          {
            label: 'Copy Message',
            command: 'nuclide-console:copy-message',
          },
        ],
      }),
      atom.commands.add(
        '.nuclide-console-record',
        'nuclide-console:copy-message',
        event => {
          const el = event.target;
          if (el == null || el.innerText == null) {
            return;
          }
          atom.clipboard.write(el.innerText);
        },
      ),
      atom.commands.add(
        'atom-workspace',
        'nuclide-console:clear',
        () => this._getStore().dispatch(Actions.clearRecords()),
      ),
      featureConfig.observe(
        'nuclide-console.maximumMessageCount',
        maxMessageCount => this._getStore().dispatch(Actions.setMaxMessageCount(maxMessageCount)),
      ),
    );
  }

  _getStore(): Store {
    if (this._store == null) {
      const initialState = deserializeAppState(this._rawState);
      const epics = Object.keys(Epics)
        .map(k => Epics[k])
        .filter(epic => typeof epic === 'function');
      const rootEpic = combineEpics(...epics);
      this._store = createStore(
        Reducers,
        initialState,
        applyMiddleware(createEpicMiddleware(rootEpic)),
      );
    }
    return this._store;
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeToolBar(getToolBar: GetToolBar): void {
    const toolBar = getToolBar('nuclide-console');
    toolBar.addButton({
      icon: 'terminal',
      callback: 'nuclide-console:toggle',
      tooltip: 'Toggle Console',
      // Chosen to appear beneath the task runner button, given the priorities that are currently
      // used. /:
      priority: 499.75,
    });
    this._disposables.add(
      new Disposable(() => { toolBar.removeItems(); }),
    );
  }

  consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
    this._disposables.add(
      api.registerFactory({
        id: 'nuclide-console',
        name: 'Console',
        iconName: 'terminal',
        toggleCommand: 'nuclide-console:toggle',
        defaultLocation: 'bottom-panel',
        create: () => viewableFromReactElement(<ConsoleContainer store={this._getStore()} />),
        isInstance: item => item instanceof ConsoleContainer,
      }),
    );
  }

  provideOutputService(): OutputService {
    if (this._outputService == null) {
      // Create a local, nullable reference so that the service consumers don't keep the store
      // instance in memory.
      let store = this._getStore();
      this._disposables.add(new Disposable(() => { store = null; }));

      this._outputService = {
        registerOutputProvider(outputProvider: OutputProvider): IDisposable {
          invariant(store != null, 'Output service used after deactivation');
          store.dispatch(Actions.registerOutputProvider(outputProvider));
          return new Disposable(() => {
            if (store != null) {
              store.dispatch(Actions.unregisterOutputProvider(outputProvider));
            }
          });
        },
      };
    }
    return this._outputService;
  }

  provideRegisterExecutor(): RegisterExecutorFunction {
    if (this._registerExecutorFunction == null) {
      // Create a local, nullable reference so that the service consumers don't keep the store
      // instance in memory.
      let store = this._getStore();
      this._disposables.add(new Disposable(() => { store = null; }));

      this._registerExecutorFunction = executor => {
        invariant(store != null, 'Executor registration attempted after deactivation');
        store.dispatch(Actions.registerExecutor(executor));
        return new Disposable(() => {
          if (store != null) {
            store.dispatch(Actions.unregisterExecutor(executor));
          }
        });
      };
    }
    return this._registerExecutorFunction;
  }

  serialize(): Object {
    if (this._store == null) {
      return {};
    }
    return {
      records: this._store.getState().records,
    };
  }

}

function deserializeAppState(rawState: ?Object): AppState {
  return {
    executors: new Map(),
    currentExecutorId: null,
    // For performance reasons, we won't restore records until we've figured out windowing.
    records: [],
    providers: new Map(),
    providerStatuses: new Map(),

    // This value will be replaced with the value form the config. We just use `POSITIVE_INFINITY`
    // here to conform to the AppState type defintion.
    maxMessageCount: Number.POSITIVE_INFINITY,
  };
}

export default createPackage(Activation);
