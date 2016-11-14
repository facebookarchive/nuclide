'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = require('./DebuggerDispatcher');
}

let LocalsStore = class LocalsStore {

  constructor(dispatcher) {
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new _atom.CompositeDisposable(new _atom.Disposable(() => {
      dispatcher.unregister(dispatcherToken);
    }));
    this._locals = new _rxjsBundlesRxMinJs.BehaviorSubject([]);
  }
  /**
   * Treat as immutable.
   */


  _handlePayload(payload) {
    switch (payload.actionType) {
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.CLEAR_INTERFACE:
        this._handleClearInterface();
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_LOCALS:
        this._handleUpdateLocals(payload.data.locals);
        break;
      default:
        return;
    }
  }

  _handleClearInterface() {
    this._locals.next([]);
  }

  _handleUpdateLocals(locals) {
    this._locals.next(locals);
  }

  getLocals() {
    return this._locals.asObservable();
  }

  dispose() {
    this._disposables.dispose();
  }
};
exports.default = LocalsStore;
module.exports = exports['default'];