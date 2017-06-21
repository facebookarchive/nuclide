'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _EventReporter;

function _load_EventReporter() {
  return _EventReporter = require('./EventReporter');
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

class RemoteObjectProxy {

  constructor(runtimeDispatcher, objectId) {
    this._runtimeDispatcher = runtimeDispatcher;
    this._objectId = objectId;
  }

  getProperties() {
    return new Promise((resolve, reject) => {
      function callback(error, response) {
        if (error != null) {
          (0, (_EventReporter || _load_EventReporter()).reportError)(`getProperties failed with ${JSON.stringify(error)}`);
          reject(error);
        }
        resolve(response);
      }
      this._runtimeDispatcher.getProperties(this._objectId, callback.bind(this));
    });
  }
}

class RemoteObjectManager {

  constructor(runtimeDispatcher) {
    this._runtimeDispatcher = runtimeDispatcher;
    this._remoteObjects = new Map();
  }

  addObject(objectId) {
    const remoteObject = new RemoteObjectProxy(this._runtimeDispatcher, objectId);
    this._remoteObjects.set(objectId, remoteObject);
    return remoteObject;
  }

  getRemoteObjectFromId(objectId) {
    return this._remoteObjects.get(objectId);
  }

  clear() {
    this._remoteObjects.clear();
  }
}

/**
 * Bridge between Nuclide IPC and RPC breakpoint protocols.
 */
class ExpressionEvaluationManager {

  constructor(debuggerDispatcher, runtimeDispatcher) {
    this._debuggerDispatcher = debuggerDispatcher;
    this._runtimeDispatcher = runtimeDispatcher;
    this._evalutionEvent$ = new _rxjsBundlesRxMinJs.Subject();
    this._remoteObjectManager = new RemoteObjectManager(runtimeDispatcher);
  }

  evaluateOnCallFrame(transactionId, callFrameId, expression, objectGroup) {
    function callback(error, response) {
      if (error != null) {
        (0, (_EventReporter || _load_EventReporter()).reportError)(`evaluateOnCallFrame failed with ${JSON.stringify(error)}`);
        return;
      }
      const { result, wasThrown, exceptionDetails } = response;
      if (result != null && result.objectId != null) {
        this._remoteObjectManager.addObject(result.objectId);
      }
      this._raiseIPCEvent('ExpressionEvaluationResponse', {
        result,
        error: wasThrown ? exceptionDetails : null,
        expression,
        id: transactionId
      });
    }
    this._debuggerDispatcher.evaluateOnCallFrame(callFrameId, expression, objectGroup, callback.bind(this));
  }

  runtimeEvaluate(transactionId, expression, objectGroup) {
    function callback(error, response) {
      if (error != null) {
        (0, (_EventReporter || _load_EventReporter()).reportError)(`runtimeEvaluate failed with ${JSON.stringify(error)}`);
        return;
      }
      const { result, wasThrown, exceptionDetails } = response;
      if (result.objectId != null) {
        this._remoteObjectManager.addObject(result.objectId);
      }
      this._raiseIPCEvent('ExpressionEvaluationResponse', {
        result,
        error: wasThrown ? exceptionDetails : null,
        expression,
        id: transactionId
      });
    }
    this._runtimeDispatcher.evaluate(expression, objectGroup, callback.bind(this));
  }

  getProperties(id, objectId) {
    const remoteObject = this._remoteObjectManager.getRemoteObjectFromId(objectId);
    if (remoteObject == null) {
      (0, (_EventReporter || _load_EventReporter()).reportError)(`Cannot find object id ${objectId} for getProperties()`);
      return;
    }
    remoteObject.getProperties().then(response => {
      // TODO: exceptionDetails
      const { result } = response;
      const expansionResult = this._propertiesToExpansionResult(result);
      this._raiseIPCEvent('GetPropertiesResponse', {
        result: expansionResult,
        // error, TODO
        objectId,
        id
      });
    });
  }

  _propertiesToExpansionResult(properties) {
    return properties.filter(({ name, value }) => value != null).map(({ name, value }) => {
      if (!(value != null)) {
        throw new Error('Invariant violation: "value != null"');
      }

      const { type, subtype, objectId, value: innerValue, description } = value;
      if (objectId != null) {
        this._remoteObjectManager.addObject(objectId);
      }
      return {
        name,
        value: {
          type,
          subtype,
          objectId,
          value: innerValue,
          description
        }
      };
    });
  }

  updateCurrentFrameScope(scopes) {
    var _this = this;

    const scopesPromises = scopes.map((() => {
      var _ref = (0, _asyncToGenerator.default)(function* (scope) {
        const scopeObjectId = scope.object.objectId;

        if (!(scopeObjectId != null)) {
          throw new Error('Engine returns a scope without objectId?');
        }

        const remoteObject = _this._remoteObjectManager.addObject(scopeObjectId);
        const response = yield remoteObject.getProperties();

        // TODO: deal with response.exceptionDetails.
        const scopeVariables = _this._propertiesToExpansionResult(response.result);
        return {
          name: scope.object.description,
          scopeVariables
        };
      });

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    })());

    Promise.all(scopesPromises).then(scopesData => {
      this._raiseIPCEvent('ScopesUpdate', scopesData);
    });
  }

  clearPauseStates() {
    this._remoteObjectManager.clear();
  }

  getEventObservable() {
    return this._evalutionEvent$.asObservable();
  }

  // Not a real IPC event, but simulate the chrome IPC events/responses
  // across bridge boundary.
  _raiseIPCEvent(...args) {
    this._evalutionEvent$.next(args);
  }
}
exports.default = ExpressionEvaluationManager;