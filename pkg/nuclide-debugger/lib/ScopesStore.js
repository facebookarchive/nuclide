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

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

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
  /**
   * Treat as immutable.
   */
  constructor(dispatcher, bridge, debuggerStore) {
    this._handlePayload = payload => {
      switch (payload.actionType) {
        case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.CLEAR_INTERFACE:
        case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.SET_SELECTED_CALLFRAME_INDEX:
          this._handleClearInterface();
          break;
        case (_DebuggerDispatcher || _load_DebuggerDispatcher()).ActionTypes.UPDATE_SCOPES:
          this._handleUpdateScopesAsPayload(payload.data);
          break;
        default:
          return;
      }
    };

    this._convertScopeSectionPayloadToScopeSection = scopeSectionPayload => {
      const expandedState = this._expandedState.get(scopeSectionPayload.name);
      return Object.assign({}, scopeSectionPayload, {
        scopeVariables: [],
        loaded: false,
        expanded: expandedState != null ? expandedState : ScopesStore.isLocalScopeName(scopeSectionPayload.name)
      });
    };

    this._setVariable = (scopeName, expression, confirmedNewValue) => {
      const scopes = this._scopes.getValue();
      const selectedScope = (0, (_nullthrows || _load_nullthrows()).default)(scopes.get(scopeName));
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
    this._scopes = new _rxjsBundlesRxMinJs.BehaviorSubject(new Map());
    this._expandedState = new Map();
  }

  _handleClearInterface() {
    this._expandedState.clear();
    this.getScopesNow().forEach(scope => {
      this._expandedState.set(scope.name, scope.expanded);
    });
    this._scopes.next(new Map());
  }

  _handleUpdateScopesAsPayload(scopeSectionsPayload) {
    this._handleUpdateScopes(new Map(scopeSectionsPayload.map(this._convertScopeSectionPayloadToScopeSection).map(section => [section.name, section])));
  }

  _handleUpdateScopes(scopeSections) {
    this._scopes.next(scopeSections);
    scopeSections.forEach(scopeSection => {
      const { expanded, loaded, name } = scopeSection;
      if (expanded && !loaded) {
        this._loadScopeVariablesFor(name);
      }
    });
  }

  _loadScopeVariablesFor(scopeName) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const scopes = _this.getScopesNow();
      const selectedScope = (0, (_nullthrows || _load_nullthrows()).default)(scopes.get(scopeName));
      const expressionEvaluationManager = (0, (_nullthrows || _load_nullthrows()).default)(_this._bridge.getCommandDispatcher().getBridgeAdapter()).getExpressionEvaluationManager();
      selectedScope.scopeVariables = yield expressionEvaluationManager.getScopeVariablesFor((0, (_nullthrows || _load_nullthrows()).default)(expressionEvaluationManager.getRemoteObjectManager().getRemoteObjectFromId(selectedScope.scopeObjectId)));
      selectedScope.loaded = true;
      _this._handleUpdateScopes(scopes);
    })();
  }

  getScopes() {
    return this._scopes.asObservable();
  }

  getScopesNow() {
    return this._scopes.getValue();
  }

  setExpanded(scopeName, expanded) {
    const scopes = this.getScopesNow();
    const selectedScope = (0, (_nullthrows || _load_nullthrows()).default)(scopes.get(scopeName));
    selectedScope.expanded = expanded;
    if (expanded) {
      selectedScope.loaded = false;
    }
    this._handleUpdateScopes(scopes);
  }

  supportsSetVariable() {
    return this._debuggerStore.supportsSetVariable();
  }

  // Returns a promise of the updated value after it has been set.
  sendSetVariableRequest(scopeObjectId, scopeName, expression, newValue) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const debuggerInstance = _this2._debuggerStore.getDebuggerInstance();
      if (debuggerInstance == null) {
        const errorMsg = 'setVariable failed because debuggerInstance is null';
        (0, (_EventReporter || _load_EventReporter()).reportError)(errorMsg);
        return Promise.reject(new Error(errorMsg));
      }
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)((_constants || _load_constants()).AnalyticsEvents.DEBUGGER_EDIT_VARIABLE, {
        language: debuggerInstance.getProviderName()
      });
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
        _this2._bridge.sendSetVariableCommand(Number(scopeObjectId), expression, newValue, callback);
      }).then(function (confirmedNewValue) {
        _this2._setVariable(scopeName, expression, confirmedNewValue);
        return confirmedNewValue;
      });
    })();
  }

  dispose() {
    this._disposables.dispose();
  }

  static isLocalScopeName(scopeName) {
    return ['Local', 'Locals'].indexOf(scopeName) !== -1;
  }
}
exports.default = ScopesStore;