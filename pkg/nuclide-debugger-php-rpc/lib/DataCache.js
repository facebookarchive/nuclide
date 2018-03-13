'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DataCache = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _ObjectId;

function _load_ObjectId() {
  return _ObjectId = require('./ObjectId');
}

var _properties;

function _load_properties() {
  return _properties = require('./properties');
}

var _values;

function _load_values() {
  return _values = require('./values');
}

var _DbgpSocket;

function _load_DbgpSocket() {
  return _DbgpSocket = require('./DbgpSocket');
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

const EVAL_IDENTIFIER = '$__unique_xdebug_variable_name__';

/**
 * Handles data value tracking between Chrome and Dbgp.
 *
 * Maps Dbgp properties to/from Chrome RemoteObjects.
 * RemoteObjects are only valid while the debuggee is paused.
 * Once the debuggee resumes, all RemoteObjects become invalid.
 */
class DataCache {

  constructor(socket) {
    this._socket = socket;
    this._enableCount = 0;
    this._enabled = false;
    this._evalIdentifierId = 0;
    socket.onStatus(this._onStatusChanged.bind(this));
  }

  _onStatusChanged(status) {
    switch (status) {
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Break:
        this._enable();
        break;
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Starting:
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Stopping:
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Stopped:
      case (_DbgpSocket || _load_DbgpSocket()).ConnectionStatus.Running:
        this._disable();
        break;
    }
  }

  _disable() {
    this._enabled = false;
  }

  isEnabled() {
    return this._enabled;
  }

  _enable() {
    this._enableCount += 1;
    this._enabled = true;
  }

  getScopesForFrame(frameIndex) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this.isEnabled()) {
        throw new Error('Must be enabled to get scopes.');
      }
      const contexts = yield _this._socket.getContextsForFrame(frameIndex);
      return contexts.map(function (context) {
        return {
          object: _this._remoteObjectOfContext(frameIndex, context),
          type: contextNameToScopeType(context.name)
        };
      });
    })();
  }

  runtimeEvaluate(frameIndex, expression) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Every evaluation we perform with xdebug's eval command is saved in a unique variable
      // for later lookup.
      const newIdentifier = `${EVAL_IDENTIFIER}${++_this2._evalIdentifierId}`;
      const evaluatedResult = yield _this2._socket.runtimeEvaluate(`${newIdentifier} = ${expression}`);
      if (evaluatedResult.wasThrown) {
        return evaluatedResult;
      }
      const id = (0, (_ObjectId || _load_ObjectId()).getWatchContextObjectId)(_this2._enableCount, frameIndex);

      if (!(evaluatedResult.result != null)) {
        throw new Error('Invariant violation: "evaluatedResult.result != null"');
      }
      // XDebug's eval returns xml without a `fullname` attribute.  When it returns paged or otherwise
      // heirarchical data, we need a fullname to reference this data (e.g. for accessing properties),
      // so we use the `newIdentifier` constructed above, which is the name of a variable that stores
      // the value returned from eval.


      evaluatedResult.result.$.fullname = newIdentifier;
      const result = (0, (_values || _load_values()).convertValue)(id, evaluatedResult.result);
      return {
        result,
        wasThrown: false
      };
    })();
  }

  evaluateOnCallFrame(frameIndex, expression) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this3.isEnabled()) {
        throw new Error('Must be enabled to evaluate expression.');
      }

      // TODO(jonaldislarry): Currently xdebug provides no way to eval at arbitrary stack depths,
      // it only supports the current stack frame.  To work around this, we special-case evaluation
      // at the current stack depth.
      if (frameIndex === 0) {
        return _this3.runtimeEvaluate(frameIndex, expression);
      }

      const evaluatedResult = yield _this3._socket.evaluateOnCallFrame(frameIndex, expression);
      if (evaluatedResult.wasThrown) {
        return evaluatedResult;
      }
      const id = (0, (_ObjectId || _load_ObjectId()).getWatchContextObjectId)(_this3._enableCount, frameIndex);

      if (!evaluatedResult.result) {
        throw new Error('Invariant violation: "evaluatedResult.result"');
      }

      const result = (0, (_values || _load_values()).convertValue)(id, evaluatedResult.result);
      return {
        result,
        wasThrown: false
      };
    })();
  }

  _remoteObjectOfContext(frameIndex, context) {
    return {
      description: context.name,
      type: 'object',
      objectId: (0, (_ObjectId || _load_ObjectId()).remoteObjectIdOfObjectId)(this._objectIdOfContext(frameIndex, context))
    };
  }

  _objectIdOfContext(frameIndex, context) {
    return (0, (_ObjectId || _load_ObjectId()).createContextObjectId)(this._enableCount, frameIndex, context.id);
  }

  getProperties(remoteId) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      (_utils || _load_utils()).default.debug(`DataCache.getProperties call on ID: ${remoteId}`);
      const id = JSON.parse(remoteId);
      if (id.enableCount !== _this4._enableCount) {
        const message = `Got request for stale RemoteObjectId ${remoteId}`;
        (_utils || _load_utils()).default.error(message);
        throw new Error(message);
      }

      // context and single paged ids require getting children from the debuggee and converting
      // them from dbgp to chrome format.
      if ((0, (_ObjectId || _load_ObjectId()).isContextObjectId)(id)) {
        return _this4._getContextProperties(id);
      } else if ((0, (_ObjectId || _load_ObjectId()).isPagedObjectId)(id)) {
        // Paged id's children are constructed directly in chrome format from the contents of the
        // object id. Does not require going to the debuggee.
        return (0, (_properties || _load_properties()).getPagedProperties)(id);
      } else {
        return _this4._getSinglePageOfProperties(id);
      }
    })();
  }

  _getSinglePageOfProperties(id) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      let properties = null;
      const { fullname, page } = id;

      if (!(fullname != null)) {
        throw new Error('Invariant violation: "fullname != null"');
      }

      if (!(page != null)) {
        throw new Error('Invariant violation: "page != null"');
      }

      if ((0, (_ObjectId || _load_ObjectId()).isWatchContextObjectId)(id)) {
        properties = yield _this5._socket.getPropertiesByFullnameAllConexts(id.frameIndex, fullname, page);
      } else {
        properties = yield _this5._socket.getPropertiesByFullname(id.frameIndex, id.contextId, fullname, page);
      }
      return (0, (_properties || _load_properties()).convertProperties)(id, properties);
    })();
  }

  _getContextProperties(id) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const properties = yield _this6._socket.getContextProperties(id.frameIndex, id.contextId);
      // Some properties in the environment are created by us for internal use, so we filter them out.
      const filteredProperties = properties.filter(function (property) {
        if (!(property.$.fullname != null)) {
          throw new Error('Invariant violation: "property.$.fullname != null"');
        }

        return !property.$.fullname.startsWith(EVAL_IDENTIFIER);
      });
      return (0, (_properties || _load_properties()).convertProperties)(id, filteredProperties);
    })();
  }
}

exports.DataCache = DataCache;
function contextNameToScopeType(name) {
  switch (name) {
    case 'Locals':
      return 'local';
    case 'Superglobals':
      return 'global';
    case 'User defined constants':
      return 'global';
    // TODO: Verify this ...
    default:
      (_utils || _load_utils()).default.debug(`Unexpected context name: ${name}`);
      return 'closure';
  }
}