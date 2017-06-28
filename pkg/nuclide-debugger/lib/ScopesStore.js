'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = require('./DebuggerDispatcher');
}

class ScopesStore {

  constructor(dispatcher) {
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new _atom.CompositeDisposable(new _atom.Disposable(() => {
      dispatcher.unregister(dispatcherToken);
    }));
    this._scopes = new _rxjsBundlesRxMinJs.BehaviorSubject([]);
  }
  /**
   * Treat as immutable.
   */


  _handlePayload(payload) {
    switch (payload.actionType) {
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.CLEAR_INTERFACE:
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_SELECTED_CALLFRAME_INDEX:
        this._handleClearInterface();
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_SCOPES:
        this._handleUpdateScopes(payload.data);
        break;
      default:
        return;
    }
  }

  _handleClearInterface() {
    this._scopes.next([]);
  }

  _handleUpdateScopes(scopeSections) {
    this._scopes.next(scopeSections);
  }

  getScopes() {
    return this._scopes.asObservable();
  }

  dispose() {
    this._disposables.dispose();
  }
}
exports.default = ScopesStore; /**
                                * Copyright (c) 2015-present, Facebook, Inc.
                                * All rights reserved.
                                *
                                * This source code is licensed under the license found in the LICENSE file in
                                * the root directory of this source tree.
                                *
                                * 
                                * @format
                                */