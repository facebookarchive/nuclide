/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {GetToolBar} from '../../commons-atom/suda-tool-bar';
import type {Viewable, WorkspaceViewsService} from '../../nuclide-workspace-views/lib/types';
import type {
  AppState,
  OutputProvider,
  OutputService,
  Record,
  RegisterExecutorFunction,
  Store,
} from './types';

import createPackage from '../../commons-atom/createPackage';
import {viewableFromReactElement} from '../../commons-atom/viewableFromReactElement';
import {combineEpics, createEpicMiddleware} from '../../commons-node/redux-observable';
import featureConfig from '../../commons-atom/featureConfig';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import * as Actions from './redux/Actions';
import * as Epics from './redux/Epics';
import Reducers from './redux/Reducers';
import {ConsoleContainer, WORKSPACE_VIEW_URI} from './ui/ConsoleContainer';
import invariant from 'assert';
import React from 'react';
import {applyMiddleware, createStore} from 'redux';

class Activation {
  _disposables: UniversalDisposable;
  _rawState: ?Object;
  _store: Store;

  constructor(rawState: ?Object) {
    this._rawState = rawState;
    this._disposables = new UniversalDisposable(
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
          if (el == null || typeof el.innerText !== 'string') {
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
        (maxMessageCount: any) => {
          this._getStore().dispatch(Actions.setMaxMessageCount(maxMessageCount));
        },
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
      priority: 700,
    });
    this._disposables.add(
      () => { toolBar.removeItems(); },
    );
  }

  consumeWorkspaceViewsService(api: WorkspaceViewsService): void {
    this._disposables.add(
      api.addOpener(uri => {
        if (uri === WORKSPACE_VIEW_URI) {
          return viewableFromReactElement(<ConsoleContainer store={this._getStore()} />);
        }
      }),
      () => api.destroyWhere(item => item instanceof ConsoleContainer),
      atom.commands.add(
        'atom-workspace',
        'nuclide-console:toggle',
        event => { api.toggle(WORKSPACE_VIEW_URI, (event: any).detail); },
      ),
    );
  }

  deserializeConsoleContainer(): Viewable {
    return viewableFromReactElement(<ConsoleContainer store={this._getStore()} />);
  }

  provideOutputService(): OutputService {
    // Create a local, nullable reference so that the service consumers don't keep the Activation
    // instance in memory.
    let activation = this;
    this._disposables.add(() => { activation = null; });

    return {
      registerOutputProvider(outputProvider: OutputProvider): IDisposable {
        invariant(activation != null, 'Output service used after deactivation');
        activation._getStore().dispatch(Actions.registerOutputProvider(outputProvider));
        return new UniversalDisposable(() => {
          if (activation != null) {
            activation._getStore().dispatch(Actions.unregisterOutputProvider(outputProvider));
          }
        });
      },
    };
  }

  provideRegisterExecutor(): RegisterExecutorFunction {
    // Create a local, nullable reference so that the service consumers don't keep the Activation
    // instance in memory.
    let activation = this;
    this._disposables.add(() => { activation = null; });

    return executor => {
      invariant(activation != null, 'Executor registration attempted after deactivation');
      activation._getStore().dispatch(Actions.registerExecutor(executor));
      return new UniversalDisposable(() => {
        if (activation != null) {
          activation._getStore().dispatch(Actions.unregisterExecutor(executor));
        }
      });
    };
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
    records: rawState && rawState.records ? rawState.records.map(deserializeRecord) : [],
    history: [],
    providers: new Map(),
    providerStatuses: new Map(),

    // This value will be replaced with the value form the config. We just use `POSITIVE_INFINITY`
    // here to conform to the AppState type defintion.
    maxMessageCount: Number.POSITIVE_INFINITY,
  };
}

function deserializeRecord(record: Object): Record {
  return {
    ...record,
    timestamp: parseDate(record.timestamp) || new Date(0),
  };
}

function parseDate(raw: ?string): ?Date {
  if (raw == null) {
    return null;
  }
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
}

createPackage(module.exports, Activation);
