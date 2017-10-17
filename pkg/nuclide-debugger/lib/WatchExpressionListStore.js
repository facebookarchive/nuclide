'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.WatchExpressionListStore = undefined;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = require('./DebuggerDispatcher');
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

  constructor(watchExpressionStore, dispatcher, initialWatchExpressions) {
    this._watchExpressionStore = watchExpressionStore;
    const dispatcherToken = dispatcher.register(this._handlePayload.bind(this));
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      dispatcher.unregister(dispatcherToken);
    });
    this._watchExpressions = new _rxjsBundlesRxMinJs.BehaviorSubject([]);
    if (initialWatchExpressions) {
      this._deserializeWatchExpressions(initialWatchExpressions);
    }
  }
  /**
   * Treat the underlying EvaluatedExpressionList as immutable.
   */


  _deserializeWatchExpressions(watchExpressions) {
    this._watchExpressions.next(watchExpressions.map(expression => this._getExpressionEvaluationFor(expression)));
  }

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

  getSerializedWatchExpressions() {
    return this._watchExpressions.getValue().map(evaluatedExpression => evaluatedExpression.expression);
  }

  _addWatchExpression(expression) {
    if (expression === '') {
      return;
    }
    this._watchExpressions.next([...this._watchExpressions.getValue(), this._getExpressionEvaluationFor(expression)]);
  }

  _removeWatchExpression(index) {
    const watchExpressions = this._watchExpressions.getValue().slice();
    watchExpressions.splice(index, 1);
    this._watchExpressions.next(watchExpressions);
  }

  _updateWatchExpression(index, newExpression) {
    if (newExpression === '') {
      return this._removeWatchExpression(index);
    }
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