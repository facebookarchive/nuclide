'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Dispatcher} from 'flux';
import type DebuggerLaunchAttachProvider from './DebuggerLaunchAttachProvider';
import type {
  NuclideDebuggerProvider,
} from '../../interfaces/service';
import type DebuggerActions from './DebuggerActions';

import {CompositeDisposable, Disposable} from 'atom';
import Constants from './Constants';
import {EventEmitter} from 'events';

const CONNECTIONS_UPDATED_EVENT = 'CONNECTIONS_UPDATED_EVENT';

/**
 * Flux style store holding all data related to debugger provider.
 */
export class DebuggerProviderStore {
  _dispatcher: Dispatcher;
  _disposables: CompositeDisposable;
  _debuggerActions: DebuggerActions;
  _eventEmitter: EventEmitter;
  _debuggerProviders: Set<NuclideDebuggerProvider>;
  _connections: Array<string>;

  constructor(dispatcher: Dispatcher, debuggerActions: DebuggerActions) {
    this._dispatcher = dispatcher;
    this._disposables = new CompositeDisposable(
      this._registerDispatcherEvents(),
      this._listenForProjectChange(),
    );
    this._debuggerActions = debuggerActions;
    this._eventEmitter = new EventEmitter();
    this._debuggerProviders = new Set();
    this._connections = [];
  }

  _registerDispatcherEvents(): IDisposable {
    const dispatcherToken = this._dispatcher.register(this._handlePayload.bind(this));
    return new Disposable(() => this._dispatcher.unregister(dispatcherToken));
  }

  _listenForProjectChange(): IDisposable {
    return atom.project.onDidChangePaths(() => {
      this._debuggerActions.updateConnections();
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  /**
   * Subscribe to new connection updates from DebuggerActions.
   */
  onConnectionsUpdated(callback: () => void): IDisposable {
    const emitter = this._eventEmitter;
    this._eventEmitter.on(CONNECTIONS_UPDATED_EVENT, callback);
    return new Disposable(() => emitter.removeListener(CONNECTIONS_UPDATED_EVENT, callback));
  }

  getConnections(): Array<string> {
    return this._connections;
  }

  /**
   * Return available launch/attach provider for input connection.
   * Caller is responsible for disposing the results.
   */
  getLaunchAttachProvidersForConnection(connection: string): Array<DebuggerLaunchAttachProvider> {
    const availableLaunchAttachProviders = [];
    for (const provider of this._debuggerProviders) {
      const launchAttachProvider = provider.getLaunchAttachProvider(connection);
      if (launchAttachProvider != null) {
        availableLaunchAttachProviders.push(launchAttachProvider);
      }
    }
    return availableLaunchAttachProviders;
  }

  _handlePayload(payload: Object) {
    switch (payload.actionType) {
      case Constants.Actions.ADD_DEBUGGER_PROVIDER:
        if (this._debuggerProviders.has(payload.data)) {
          return;
        }
        this._debuggerProviders.add(payload.data);
        break;
      case Constants.Actions.REMOVE_DEBUGGER_PROVIDER:
        if (!this._debuggerProviders.has(payload.data)) {
          return;
        }
        this._debuggerProviders.delete(payload.data);
        break;
      case Constants.Actions.UPDATE_CONNECTIONS:
        this._connections = payload.data;
        this._eventEmitter.emit(CONNECTIONS_UPDATED_EVENT);
        break;
    }
  }
}
