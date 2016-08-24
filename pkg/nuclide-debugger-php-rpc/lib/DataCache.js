Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var _ObjectId2;

function _ObjectId() {
  return _ObjectId2 = require('./ObjectId');
}

var _properties2;

function _properties() {
  return _properties2 = require('./properties');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _values2;

function _values() {
  return _values2 = require('./values');
}

var _DbgpSocket2;

function _DbgpSocket() {
  return _DbgpSocket2 = require('./DbgpSocket');
}

var EVAL_IDENTIFIER = '$__unique_xdebug_variable_name__';

/**
 * Handles data value tracking between Chrome and Dbgp.
 *
 * Maps Dbgp properties to/from Chrome RemoteObjects.
 * RemoteObjects are only valid while the debuggee is paused.
 * Once the debuggee resumes, all RemoteObjects become invalid.
 */

var DataCache = (function () {
  function DataCache(socket) {
    _classCallCheck(this, DataCache);

    this._socket = socket;
    this._enableCount = 0;
    this._enabled = false;
    this._evalIdentifierId = 0;
    socket.onStatus(this._onStatusChanged.bind(this));
  }

  _createClass(DataCache, [{
    key: '_onStatusChanged',
    value: function _onStatusChanged(status) {
      switch (status) {
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_BREAK:
          this._enable();
          break;
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_STARTING:
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_STOPPING:
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_STOPPED:
        case (_DbgpSocket2 || _DbgpSocket()).STATUS_RUNNING:
          this._disable();
          break;
      }
    }
  }, {
    key: '_disable',
    value: function _disable() {
      this._enabled = false;
    }
  }, {
    key: 'isEnabled',
    value: function isEnabled() {
      return this._enabled;
    }
  }, {
    key: '_enable',
    value: function _enable() {
      this._enableCount += 1;
      this._enabled = true;
    }
  }, {
    key: 'getScopesForFrame',
    value: _asyncToGenerator(function* (frameIndex) {
      var _this = this;

      if (!this.isEnabled()) {
        throw new Error('Must be enabled to get scopes.');
      }
      var contexts = yield this._socket.getContextsForFrame(frameIndex);
      return contexts.map(function (context) {
        return {
          object: _this._remoteObjectOfContext(frameIndex, context),
          type: contextNameToScopeType(context.name)
        };
      });
    })
  }, {
    key: 'runtimeEvaluate',
    value: _asyncToGenerator(function* (frameIndex, expression) {
      // Every evaluation we perform with xdebug's eval command is saved in a unique variable
      // for later lookup.
      var newIdentifier = '' + EVAL_IDENTIFIER + ++this._evalIdentifierId;
      var evaluatedResult = yield this._socket.runtimeEvaluate(newIdentifier + ' = ' + expression);
      if (evaluatedResult.wasThrown) {
        return evaluatedResult;
      }
      var id = (0, (_ObjectId2 || _ObjectId()).getWatchContextObjectId)(this._enableCount, frameIndex);
      (0, (_assert2 || _assert()).default)(evaluatedResult.result != null);
      // XDebug's eval returns xml without a `fullname` attribute.  When it returns paged or otherwise
      // heirarchical data, we need a fullname to reference this data (e.g. for accessing properties),
      // so we use the `newIdentifier` constructed above, which is the name of a variable that stores
      // the value returned from eval.
      evaluatedResult.result.$.fullname = newIdentifier;
      var result = (0, (_values2 || _values()).convertValue)(id, evaluatedResult.result);
      return {
        result: result,
        wasThrown: false
      };
    })
  }, {
    key: 'evaluateOnCallFrame',
    value: _asyncToGenerator(function* (frameIndex, expression) {
      if (!this.isEnabled()) {
        throw new Error('Must be enabled to evaluate expression.');
      }

      // TODO(jonaldislarry): Currently xdebug provides no way to eval at arbitrary stack depths,
      // it only supports the current stack frame.  To work around this, we special-case evaluation
      // at the current stack depth.
      if (frameIndex === 0) {
        return yield this.runtimeEvaluate(frameIndex, expression);
      }

      var evaluatedResult = yield this._socket.evaluateOnCallFrame(frameIndex, expression);
      if (evaluatedResult.wasThrown) {
        return evaluatedResult;
      }
      var id = (0, (_ObjectId2 || _ObjectId()).getWatchContextObjectId)(this._enableCount, frameIndex);
      (0, (_assert2 || _assert()).default)(evaluatedResult.result);
      var result = (0, (_values2 || _values()).convertValue)(id, evaluatedResult.result);
      return {
        result: result,
        wasThrown: false
      };
    })
  }, {
    key: '_remoteObjectOfContext',
    value: function _remoteObjectOfContext(frameIndex, context) {
      return {
        description: context.name,
        type: 'object',
        objectId: (0, (_ObjectId2 || _ObjectId()).remoteObjectIdOfObjectId)(this._objectIdOfContext(frameIndex, context))
      };
    }
  }, {
    key: '_objectIdOfContext',
    value: function _objectIdOfContext(frameIndex, context) {
      return (0, (_ObjectId2 || _ObjectId()).createContextObjectId)(this._enableCount, frameIndex, context.id);
    }
  }, {
    key: 'getProperties',
    value: _asyncToGenerator(function* (remoteId) {
      (_utils2 || _utils()).default.log('DataCache.getProperties call on ID: ' + remoteId);
      var id = JSON.parse(remoteId);
      if (id.enableCount !== this._enableCount) {
        (_utils2 || _utils()).default.logErrorAndThrow('Got request for stale RemoteObjectId ' + remoteId);
      }

      // context and single paged ids require getting children from the debuggee and converting
      // them from dbgp to chrome format.
      if ((0, (_ObjectId2 || _ObjectId()).isContextObjectId)(id)) {
        return yield this._getContextProperties(id);
      } else if ((0, (_ObjectId2 || _ObjectId()).isPagedObjectId)(id)) {
        // Paged id's children are constructed directly in chrome format from the contents of the
        // object id. Does not require going to the debuggee.
        return (0, (_properties2 || _properties()).getPagedProperties)(id);
      } else {
        return yield this._getSinglePageOfProperties(id);
      }
    })
  }, {
    key: '_getSinglePageOfProperties',
    value: _asyncToGenerator(function* (id) {
      var properties = null;
      var fullname = id.fullname;
      var page = id.page;

      (0, (_assert2 || _assert()).default)(fullname != null);
      (0, (_assert2 || _assert()).default)(page != null);
      if ((0, (_ObjectId2 || _ObjectId()).isWatchContextObjectId)(id)) {
        properties = yield this._socket.getPropertiesByFullnameAllConexts(id.frameIndex, fullname, page);
      } else {
        properties = yield this._socket.getPropertiesByFullname(id.frameIndex, id.contextId, fullname, page);
      }
      return (0, (_properties2 || _properties()).convertProperties)(id, properties);
    })
  }, {
    key: '_getContextProperties',
    value: _asyncToGenerator(function* (id) {
      var properties = yield this._socket.getContextProperties(id.frameIndex, id.contextId);
      // Some properties in the environment are created by us for internal use, so we filter them out.
      var filteredProperties = properties.filter(function (property) {
        (0, (_assert2 || _assert()).default)(property.$.fullname != null);
        return !property.$.fullname.startsWith(EVAL_IDENTIFIER);
      });
      return (0, (_properties2 || _properties()).convertProperties)(id, filteredProperties);
    })
  }]);

  return DataCache;
})();

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
      (_utils2 || _utils()).default.log('Unexpected context name: ' + name);
      return 'closure';
  }
}