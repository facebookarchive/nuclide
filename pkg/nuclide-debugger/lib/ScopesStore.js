'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _DebuggerDispatcher;

function _load_DebuggerDispatcher() {
  return _DebuggerDispatcher = require('./DebuggerDispatcher');
}

var _EventReporter;

function _load_EventReporter() {
  return _EventReporter = require('./Protocol/EventReporter');
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

class ScopesStore {

  constructor(dispatcher, bridge, debuggerStore) {
    this._handlePayload = payload => {
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
    };

    this._setVariable = (scopeNumber, expression, confirmedNewValue) => {
      const scopes = this._scopes.getValue();
      const selectedScope = (0, (_nullthrows || _load_nullthrows()).default)(scopes[scopeNumber]);
      const variableToChangeIndex = selectedScope.scopeVariables.findIndex(v => v.name === expression);
      const variableToChange = (0, (_nullthrows || _load_nullthrows()).default)(selectedScope.scopeVariables[variableToChangeIndex]);
      const newVariable = Object.assign({}, variableToChange, {
        value: Object.assign({}, variableToChange.value, {
          value: confirmedNewValue,
          description: confirmedNewValue
        })
      });
      selectedScope.scopeVariables.splice(variableToChangeIndex, 1, newVariable);
      this._handleUpdateScopes(scopes);
    };

    this._bridge = bridge;
    this._debuggerStore = debuggerStore;
    const dispatcherToken = dispatcher.register(this._handlePayload);
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      dispatcher.unregister(dispatcherToken);
    });
    this._scopes = new _rxjsBundlesRxMinJs.BehaviorSubject([]);
  }
  /**
   * Treat as immutable.
   */


  _handleClearInterface() {
    this._scopes.next([]);
  }

  _handleUpdateScopes(scopeSections) {
    this._scopes.next(scopeSections);
  }

  getScopes() {
    return this._scopes.asObservable();
  }

  getScopesNow() {
    return this._scopes.getValue();
  }

  supportsSetVariable() {
    return this._debuggerStore.supportsSetVariable();
  }

  // Returns a promise of the updated value after it has been set.
  sendSetVariableRequest(scopeNumber, scopeObjectId, expression, newValue) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return new Promise(function (resolve, reject) {
        function callback(error, response) {
          if (error != null) {
            const message = JSON.stringify(error);
            (0, (_EventReporter || _load_EventReporter()).reportError)(`setVariable failed with ${message}`);
            atom.notifications.addError(message);
            reject(error);
          } else {
            resolve(response.value);
          }
        }
        _this._bridge.sendSetVariableCommand(scopeObjectId, expression, newValue, callback);
      }).then(function (confirmedNewValue) {
        _this._setVariable(scopeNumber, expression, confirmedNewValue);
        return confirmedNewValue;
      });
    })();
  }

  dispose() {
    this._disposables.dispose();
  }
}
exports.default = ScopesStore;