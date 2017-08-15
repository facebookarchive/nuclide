'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WatchExpressionListStore = undefined;

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = require('./DebuggerDispatcher');
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
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

class WatchExpressionListStore {

  constructor(watchExpressionStore, dispatcher) {
    this._watchExpressionStore = watchExpressionStore;
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new _atom.CompositeDisposable(new _atom.Disposable(() => {
      dispatcher.unregister(dispatcherToken);
    }));
    this._watchExpressions = new _rxjsBundlesRxMinJs.BehaviorSubject([]);
  }
  /**
   * Treat the underlying EvaluatedExpressionList as immutable.
   */


  _handlePayload(payload) {
    switch (payload.actionType) {
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.ADD_WATCH_EXPRESSION:
        this._addWatchExpression(payload.data.expression);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.REMOVE_WATCH_EXPRESSION:
        this._removeWatchExpression(payload.data.index);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_WATCH_EXPRESSION:
        this._updateWatchExpression(payload.data.index, payload.data.newExpression);
        break;
      case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.DEBUGGER_MODE_CHANGE:
        if (payload.data === (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.STARTING) {
          this._refetchWatchSubscriptions();
        }
        break;
      default:
        return;
    }
  }

  _getExpressionEvaluationFor(expression) {
    return {
      expression,
      value: this._watchExpressionStore.evaluateWatchExpression(expression)
    };
  }

  getWatchExpressions() {
    return this._watchExpressions.asObservable();
  }

  _addWatchExpression(expression) {
    this._watchExpressions.next([...this._watchExpressions.getValue(), this._getExpressionEvaluationFor(expression)]);
  }

  _removeWatchExpression(index) {
    const watchExpressions = this._watchExpressions.getValue().slice();
    watchExpressions.splice(index, 1);
    this._watchExpressions.next(watchExpressions);
  }

  _updateWatchExpression(index, newExpression) {
    const watchExpressions = this._watchExpressions.getValue().slice();
    watchExpressions[index] = this._getExpressionEvaluationFor(newExpression);
    this._watchExpressions.next(watchExpressions);
  }

  _refetchWatchSubscriptions() {
    const watchExpressions = this._watchExpressions.getValue().slice();
    const refetchedWatchExpressions = watchExpressions.map(({ expression }) => {
      return this._getExpressionEvaluationFor(expression);
    });
    this._watchExpressions.next(refetchedWatchExpressions);
  }

  dispose() {
    this._disposables.dispose();
  }
}
exports.WatchExpressionListStore = WatchExpressionListStore;