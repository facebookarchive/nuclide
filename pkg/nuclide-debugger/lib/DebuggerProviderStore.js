'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerProviderStore = undefined;

var _atom = require('atom');

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = require('./DebuggerDispatcher');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const CONNECTIONS_UPDATED_EVENT = 'CONNECTIONS_UPDATED_EVENT';
const PROVIDERS_UPDATED_EVENT = 'PROVIDERS_UPDATED_EVENT';

/**
 * Flux style store holding all data related to debugger provider.
 */
class DebuggerProviderStore {

  constructor(dispatcher, debuggerActions) {
    this._dispatcher = dispatcher;
    this._disposables = new _atom.CompositeDisposable(this._registerDispatcherEvents(), this._listenForProjectChange());
    this._debuggerActions = debuggerActions;
    this._emitter = new _atom.Emitter();
    this._debuggerProviders = new Set();
    // There is always a local connection.
    this._connections = ['local'];
  }

  _registerDispatcherEvents() {
    const dispatcherToken = this._dispatcher.register(this._handlePayload.bind(this));
    return new _atom.Disposable(() => this._dispatcher.unregister(dispatcherToken));
  }

  _listenForProjectChange() {
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
  onConnectionsUpdated(callback) {
    return this._emitter.on(CONNECTIONS_UPDATED_EVENT, callback);
  }

  onProvidersUpdated(callback) {
    return this._emitter.on(PROVIDERS_UPDATED_EVENT, callback);
  }

  getConnections() {
    return this._connections;
  }

  /**
   * Return available launch/attach provider for input connection.
   * Caller is responsible for disposing the results.
   */
  getLaunchAttachProvidersForConnection(connection) {
    const availableLaunchAttachProviders = [];
    for (const provider of this._debuggerProviders) {
      const launchAttachProvider = provider.getLaunchAttachProvider(connection);
      if (launchAttachProvider != null) {
        availableLaunchAttachProviders.push(launchAttachProvider);
      }
    }
    return availableLaunchAttachProviders;
  }

  _handlePayload(payload) {
    switch (payload.actionType) {
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ADD_DEBUGGER_PROVIDER:
        if (this._debuggerProviders.has(payload.data)) {
          return;
        }
        this._debuggerProviders.add(payload.data);
        this._emitter.emit(PROVIDERS_UPDATED_EVENT);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.REMOVE_DEBUGGER_PROVIDER:
        if (!this._debuggerProviders.has(payload.data)) {
          return;
        }
        this._debuggerProviders.delete(payload.data);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_CONNECTIONS:
        this._connections = payload.data;
        this._emitter.emit(CONNECTIONS_UPDATED_EVENT);
        break;
    }
  }
}
exports.DebuggerProviderStore = DebuggerProviderStore;