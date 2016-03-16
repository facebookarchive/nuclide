'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {DebuggerProviderStore} from './DebuggerProviderStore';
const BreakpointManager = require('./BreakpointManager');
const BreakpointStore = require('./BreakpointStore');
const DebuggerActions = require('./DebuggerActions');
const DebuggerStore = require('./DebuggerStore');
const Bridge = require('./Bridge');
const {CompositeDisposable} = require('atom');
const {Dispatcher} = require('flux');

import type {SerializedState} from '..';

/**
 * Atom ViewProvider compatible model object.
 */
class DebuggerModel {
  _disposables: CompositeDisposable;
  _actions: DebuggerActions;
  _breakpointManager: BreakpointManager;
  _breakpointStore: BreakpointStore;
  _dispatcher: Dispatcher;
  _store: DebuggerStore;
  _debuggerProviderStore: DebuggerProviderStore;
  _bridge: Bridge;

  constructor(state: ?SerializedState) {
    this._dispatcher = new Dispatcher();
    this._store = new DebuggerStore(this._dispatcher);
    this._actions = new DebuggerActions(this._dispatcher, this._store);
    this._breakpointStore = new BreakpointStore(state ? state.breakpoints : null);
    this._breakpointManager = new BreakpointManager(this._breakpointStore);
    this._bridge = new Bridge(this);
    this._debuggerProviderStore = new DebuggerProviderStore(this._dispatcher, this._actions);

    this._disposables = new CompositeDisposable(
      this._store,
      this._actions,
      this._breakpointStore,
      this._breakpointManager,
      this._bridge,
      this._debuggerProviderStore,
    );
  }

  dispose() {
    this._disposables.dispose();
  }

  getActions(): DebuggerActions {
    return this._actions;
  }

  getStore(): DebuggerStore {
    return this._store;
  }

  getDebuggerProviderStore(): DebuggerProviderStore {
    return this._debuggerProviderStore;
  }

  getBreakpointStore(): BreakpointStore {
    return this._breakpointStore;
  }

  getBridge(): Bridge {
    return this._bridge;
  }
}

module.exports = DebuggerModel;
