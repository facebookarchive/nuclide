Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _ObjectId = require('./ObjectId');

var _properties = require('./properties');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _values = require('./values');

var _require = require('./DbgpSocket');

var STATUS_BREAK = _require.STATUS_BREAK;
var STATUS_STOPPING = _require.STATUS_STOPPING;
var STATUS_STOPPED = _require.STATUS_STOPPED;
var STATUS_RUNNING = _require.STATUS_RUNNING;
var STATUS_STARTING = _require.STATUS_STARTING;

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
        case STATUS_BREAK:
          this._enable();
          break;
        case STATUS_STARTING:
        case STATUS_STOPPING:
        case STATUS_STOPPED:
        case STATUS_RUNNING:
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
      var id = (0, _ObjectId.getWatchContextObjectId)(this._enableCount, frameIndex);
      (0, _assert2['default'])(evaluatedResult.result != null);
      // XDebug's eval returns xml without a `fullname` attribute.  When it returns paged or otherwise
      // heirarchical data, we need a fullname to reference this data (e.g. for accessing properties),
      // so we use the `newIdentifier` constructed above, which is the name of a variable that stores
      // the value returned from eval.
      evaluatedResult.result.$.fullname = newIdentifier;
      var result = (0, _values.convertValue)(id, evaluatedResult.result);
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
      var id = (0, _ObjectId.getWatchContextObjectId)(this._enableCount, frameIndex);
      (0, _assert2['default'])(evaluatedResult.result);
      var result = (0, _values.convertValue)(id, evaluatedResult.result);
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
        objectId: (0, _ObjectId.remoteObjectIdOfObjectId)(this._objectIdOfContext(frameIndex, context))
      };
    }
  }, {
    key: '_objectIdOfContext',
    value: function _objectIdOfContext(frameIndex, context) {
      return (0, _ObjectId.createContextObjectId)(this._enableCount, frameIndex, context.id);
    }
  }, {
    key: 'getProperties',
    value: _asyncToGenerator(function* (remoteId) {
      _utils2['default'].log('DataCache.getProperties call on ID: ' + remoteId);
      var id = JSON.parse(remoteId);
      if (id.enableCount !== this._enableCount) {
        _utils2['default'].logErrorAndThrow('Got request for stale RemoteObjectId ' + remoteId);
      }

      // context and single paged ids require getting children from the debuggee and converting
      // them from dbgp to chrome format.
      if ((0, _ObjectId.isContextObjectId)(id)) {
        return yield this._getContextProperties(id);
      } else if ((0, _ObjectId.isPagedObjectId)(id)) {
        // Paged id's children are constructed directly in chrome format from the contents of the
        // object id. Does not require going to the debuggee.
        return (0, _properties.getPagedProperties)(id);
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

      (0, _assert2['default'])(fullname != null);
      (0, _assert2['default'])(page != null);
      if ((0, _ObjectId.isWatchContextObjectId)(id)) {
        properties = yield this._socket.getPropertiesByFullnameAllConexts(id.frameIndex, fullname, page);
      } else {
        properties = yield this._socket.getPropertiesByFullname(id.frameIndex, id.contextId, fullname, page);
      }
      return (0, _properties.convertProperties)(id, properties);
    })
  }, {
    key: '_getContextProperties',
    value: _asyncToGenerator(function* (id) {
      var properties = yield this._socket.getContextProperties(id.frameIndex, id.contextId);
      // Some properties in the environment are created by us for internal use, so we filter them out.
      var filteredProperties = properties.filter(function (property) {
        (0, _assert2['default'])(property.$.fullname != null);
        return !property.$.fullname.startsWith(EVAL_IDENTIFIER);
      });
      return (0, _properties.convertProperties)(id, filteredProperties);
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
      _utils2['default'].log('Unexpected context name: ' + name);
      return 'closure';
  }
}
//# sourceMappingURL=data:application/json;base64,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anMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cbmltcG9ydCBsb2dnZXIgZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge1xuICByZW1vdGVPYmplY3RJZE9mT2JqZWN0SWQsXG4gIGNyZWF0ZUNvbnRleHRPYmplY3RJZCxcbiAgaXNDb250ZXh0T2JqZWN0SWQsXG4gIGlzUGFnZWRPYmplY3RJZCxcbiAgZ2V0V2F0Y2hDb250ZXh0T2JqZWN0SWQsXG4gIGlzV2F0Y2hDb250ZXh0T2JqZWN0SWQsXG59IGZyb20gJy4vT2JqZWN0SWQnO1xuaW1wb3J0IHtcbiAgY29udmVydFByb3BlcnRpZXMsXG4gIGdldFBhZ2VkUHJvcGVydGllcyxcbn0gZnJvbSAnLi9wcm9wZXJ0aWVzJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7Y29udmVydFZhbHVlfSBmcm9tICcuL3ZhbHVlcyc7XG5cbmltcG9ydCB0eXBlIHtEYmdwQ29udGV4dCwgRGJncFNvY2tldH0gZnJvbSAnLi9EYmdwU29ja2V0JztcbmltcG9ydCB0eXBlIHtPYmplY3RJZH0gZnJvbSAnLi9PYmplY3RJZCc7XG5cbmNvbnN0IHtcbiAgU1RBVFVTX0JSRUFLLFxuICBTVEFUVVNfU1RPUFBJTkcsXG4gIFNUQVRVU19TVE9QUEVELFxuICBTVEFUVVNfUlVOTklORyxcbiAgU1RBVFVTX1NUQVJUSU5HLFxufSA9IHJlcXVpcmUoJy4vRGJncFNvY2tldCcpO1xuXG5jb25zdCBFVkFMX0lERU5USUZJRVIgPSAnJF9fdW5pcXVlX3hkZWJ1Z192YXJpYWJsZV9uYW1lX18nO1xuXG4vKipcbiAqIEhhbmRsZXMgZGF0YSB2YWx1ZSB0cmFja2luZyBiZXR3ZWVuIENocm9tZSBhbmQgRGJncC5cbiAqXG4gKiBNYXBzIERiZ3AgcHJvcGVydGllcyB0by9mcm9tIENocm9tZSBSZW1vdGVPYmplY3RzLlxuICogUmVtb3RlT2JqZWN0cyBhcmUgb25seSB2YWxpZCB3aGlsZSB0aGUgZGVidWdnZWUgaXMgcGF1c2VkLlxuICogT25jZSB0aGUgZGVidWdnZWUgcmVzdW1lcywgYWxsIFJlbW90ZU9iamVjdHMgYmVjb21lIGludmFsaWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBEYXRhQ2FjaGUge1xuICBfc29ja2V0OiBEYmdwU29ja2V0O1xuICBfZW5hYmxlZDogYm9vbGVhbjtcbiAgX2VuYWJsZUNvdW50OiBudW1iZXI7XG4gIF9ldmFsSWRlbnRpZmllcklkOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc29ja2V0OiBEYmdwU29ja2V0KSB7XG4gICAgdGhpcy5fc29ja2V0ID0gc29ja2V0O1xuICAgIHRoaXMuX2VuYWJsZUNvdW50ID0gMDtcbiAgICB0aGlzLl9lbmFibGVkID0gZmFsc2U7XG4gICAgdGhpcy5fZXZhbElkZW50aWZpZXJJZCA9IDA7XG4gICAgc29ja2V0Lm9uU3RhdHVzKHRoaXMuX29uU3RhdHVzQ2hhbmdlZC5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIF9vblN0YXR1c0NoYW5nZWQoc3RhdHVzOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBzd2l0Y2ggKHN0YXR1cykge1xuICAgICAgY2FzZSBTVEFUVVNfQlJFQUs6XG4gICAgICAgIHRoaXMuX2VuYWJsZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgU1RBVFVTX1NUQVJUSU5HOlxuICAgICAgY2FzZSBTVEFUVVNfU1RPUFBJTkc6XG4gICAgICBjYXNlIFNUQVRVU19TVE9QUEVEOlxuICAgICAgY2FzZSBTVEFUVVNfUlVOTklORzpcbiAgICAgICAgdGhpcy5fZGlzYWJsZSgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfZGlzYWJsZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbmFibGVkID0gZmFsc2U7XG4gIH1cblxuICBpc0VuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VuYWJsZWQ7XG4gIH1cblxuICBfZW5hYmxlKCk6IHZvaWQge1xuICAgIHRoaXMuX2VuYWJsZUNvdW50ICs9IDE7XG4gICAgdGhpcy5fZW5hYmxlZCA9IHRydWU7XG4gIH1cblxuICBhc3luYyBnZXRTY29wZXNGb3JGcmFtZShmcmFtZUluZGV4OiBudW1iZXIpOiBQcm9taXNlPEFycmF5PERlYnVnZ2VyJFNjb3BlPj4ge1xuICAgIGlmICghdGhpcy5pc0VuYWJsZWQoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IGJlIGVuYWJsZWQgdG8gZ2V0IHNjb3Blcy4nKTtcbiAgICB9XG4gICAgY29uc3QgY29udGV4dHMgPSBhd2FpdCB0aGlzLl9zb2NrZXQuZ2V0Q29udGV4dHNGb3JGcmFtZShmcmFtZUluZGV4KTtcbiAgICByZXR1cm4gY29udGV4dHMubWFwKGNvbnRleHQgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb2JqZWN0OiB0aGlzLl9yZW1vdGVPYmplY3RPZkNvbnRleHQoZnJhbWVJbmRleCwgY29udGV4dCksXG4gICAgICAgIHR5cGU6IGNvbnRleHROYW1lVG9TY29wZVR5cGUoY29udGV4dC5uYW1lKSxcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBydW50aW1lRXZhbHVhdGUoZnJhbWVJbmRleDogbnVtYmVyLCBleHByZXNzaW9uOiBzdHJpbmcpOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIC8vIEV2ZXJ5IGV2YWx1YXRpb24gd2UgcGVyZm9ybSB3aXRoIHhkZWJ1ZydzIGV2YWwgY29tbWFuZCBpcyBzYXZlZCBpbiBhIHVuaXF1ZSB2YXJpYWJsZVxuICAgIC8vIGZvciBsYXRlciBsb29rdXAuXG4gICAgY29uc3QgbmV3SWRlbnRpZmllciA9IGAke0VWQUxfSURFTlRJRklFUn0keysrdGhpcy5fZXZhbElkZW50aWZpZXJJZH1gO1xuICAgIGNvbnN0IGV2YWx1YXRlZFJlc3VsdCA9IGF3YWl0IHRoaXMuX3NvY2tldC5ydW50aW1lRXZhbHVhdGUoYCR7bmV3SWRlbnRpZmllcn0gPSAke2V4cHJlc3Npb259YCk7XG4gICAgaWYgKGV2YWx1YXRlZFJlc3VsdC53YXNUaHJvd24pIHtcbiAgICAgIHJldHVybiBldmFsdWF0ZWRSZXN1bHQ7XG4gICAgfVxuICAgIGNvbnN0IGlkID0gZ2V0V2F0Y2hDb250ZXh0T2JqZWN0SWQodGhpcy5fZW5hYmxlQ291bnQsIGZyYW1lSW5kZXgpO1xuICAgIGludmFyaWFudChldmFsdWF0ZWRSZXN1bHQucmVzdWx0ICE9IG51bGwpO1xuICAgIC8vIFhEZWJ1ZydzIGV2YWwgcmV0dXJucyB4bWwgd2l0aG91dCBhIGBmdWxsbmFtZWAgYXR0cmlidXRlLiAgV2hlbiBpdCByZXR1cm5zIHBhZ2VkIG9yIG90aGVyd2lzZVxuICAgIC8vIGhlaXJhcmNoaWNhbCBkYXRhLCB3ZSBuZWVkIGEgZnVsbG5hbWUgdG8gcmVmZXJlbmNlIHRoaXMgZGF0YSAoZS5nLiBmb3IgYWNjZXNzaW5nIHByb3BlcnRpZXMpLFxuICAgIC8vIHNvIHdlIHVzZSB0aGUgYG5ld0lkZW50aWZpZXJgIGNvbnN0cnVjdGVkIGFib3ZlLCB3aGljaCBpcyB0aGUgbmFtZSBvZiBhIHZhcmlhYmxlIHRoYXQgc3RvcmVzXG4gICAgLy8gdGhlIHZhbHVlIHJldHVybmVkIGZyb20gZXZhbC5cbiAgICBldmFsdWF0ZWRSZXN1bHQucmVzdWx0LiQuZnVsbG5hbWUgPSBuZXdJZGVudGlmaWVyO1xuICAgIGNvbnN0IHJlc3VsdCA9IGNvbnZlcnRWYWx1ZShpZCwgZXZhbHVhdGVkUmVzdWx0LnJlc3VsdCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3VsdCxcbiAgICAgIHdhc1Rocm93bjogZmFsc2UsXG4gICAgfTtcbiAgfVxuXG4gIGFzeW5jIGV2YWx1YXRlT25DYWxsRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyLCBleHByZXNzaW9uOiBzdHJpbmcpOiBQcm9taXNlPE9iamVjdD4ge1xuICAgIGlmICghdGhpcy5pc0VuYWJsZWQoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IGJlIGVuYWJsZWQgdG8gZXZhbHVhdGUgZXhwcmVzc2lvbi4nKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPKGpvbmFsZGlzbGFycnkpOiBDdXJyZW50bHkgeGRlYnVnIHByb3ZpZGVzIG5vIHdheSB0byBldmFsIGF0IGFyYml0cmFyeSBzdGFjayBkZXB0aHMsXG4gICAgLy8gaXQgb25seSBzdXBwb3J0cyB0aGUgY3VycmVudCBzdGFjayBmcmFtZS4gIFRvIHdvcmsgYXJvdW5kIHRoaXMsIHdlIHNwZWNpYWwtY2FzZSBldmFsdWF0aW9uXG4gICAgLy8gYXQgdGhlIGN1cnJlbnQgc3RhY2sgZGVwdGguXG4gICAgaWYgKGZyYW1lSW5kZXggPT09IDApIHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLnJ1bnRpbWVFdmFsdWF0ZShmcmFtZUluZGV4LCBleHByZXNzaW9uKTtcbiAgICB9XG5cbiAgICBjb25zdCBldmFsdWF0ZWRSZXN1bHQgPSBhd2FpdCB0aGlzLl9zb2NrZXQuZXZhbHVhdGVPbkNhbGxGcmFtZShmcmFtZUluZGV4LCBleHByZXNzaW9uKTtcbiAgICBpZiAoZXZhbHVhdGVkUmVzdWx0Lndhc1Rocm93bikge1xuICAgICAgcmV0dXJuIGV2YWx1YXRlZFJlc3VsdDtcbiAgICB9XG4gICAgY29uc3QgaWQgPSBnZXRXYXRjaENvbnRleHRPYmplY3RJZCh0aGlzLl9lbmFibGVDb3VudCwgZnJhbWVJbmRleCk7XG4gICAgaW52YXJpYW50KGV2YWx1YXRlZFJlc3VsdC5yZXN1bHQpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGNvbnZlcnRWYWx1ZShpZCwgZXZhbHVhdGVkUmVzdWx0LnJlc3VsdCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3VsdCxcbiAgICAgIHdhc1Rocm93bjogZmFsc2UsXG4gICAgfTtcbiAgfVxuXG4gIF9yZW1vdGVPYmplY3RPZkNvbnRleHQoZnJhbWVJbmRleDogbnVtYmVyLCBjb250ZXh0OiBEYmdwQ29udGV4dCk6IFJ1bnRpbWUkUmVtb3RlT2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzY3JpcHRpb246IGNvbnRleHQubmFtZSxcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgb2JqZWN0SWQ6IHJlbW90ZU9iamVjdElkT2ZPYmplY3RJZCh0aGlzLl9vYmplY3RJZE9mQ29udGV4dChmcmFtZUluZGV4LCBjb250ZXh0KSksXG4gICAgfTtcbiAgfVxuXG4gIF9vYmplY3RJZE9mQ29udGV4dChmcmFtZUluZGV4OiBudW1iZXIsIGNvbnRleHQ6IERiZ3BDb250ZXh0KTogT2JqZWN0SWQge1xuICAgIHJldHVybiBjcmVhdGVDb250ZXh0T2JqZWN0SWQodGhpcy5fZW5hYmxlQ291bnQsIGZyYW1lSW5kZXgsIGNvbnRleHQuaWQpO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHJvcGVydGllcyhcbiAgICByZW1vdGVJZDogUnVudGltZSRSZW1vdGVPYmplY3RJZCxcbiAgKTogUHJvbWlzZTxBcnJheTxSdW50aW1lJFByb3BlcnR5RGVzY3JpcHRvcj4+IHtcbiAgICBsb2dnZXIubG9nKGBEYXRhQ2FjaGUuZ2V0UHJvcGVydGllcyBjYWxsIG9uIElEOiAke3JlbW90ZUlkfWApO1xuICAgIGNvbnN0IGlkID0gSlNPTi5wYXJzZShyZW1vdGVJZCk7XG4gICAgaWYgKGlkLmVuYWJsZUNvdW50ICE9PSB0aGlzLl9lbmFibGVDb3VudCkge1xuICAgICAgbG9nZ2VyLmxvZ0Vycm9yQW5kVGhyb3coYEdvdCByZXF1ZXN0IGZvciBzdGFsZSBSZW1vdGVPYmplY3RJZCAke3JlbW90ZUlkfWApO1xuICAgIH1cblxuICAgIC8vIGNvbnRleHQgYW5kIHNpbmdsZSBwYWdlZCBpZHMgcmVxdWlyZSBnZXR0aW5nIGNoaWxkcmVuIGZyb20gdGhlIGRlYnVnZ2VlIGFuZCBjb252ZXJ0aW5nXG4gICAgLy8gdGhlbSBmcm9tIGRiZ3AgdG8gY2hyb21lIGZvcm1hdC5cbiAgICBpZiAoaXNDb250ZXh0T2JqZWN0SWQoaWQpKSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5fZ2V0Q29udGV4dFByb3BlcnRpZXMoaWQpO1xuICAgIH0gZWxzZSBpZiAoaXNQYWdlZE9iamVjdElkKGlkKSkge1xuICAgICAgLy8gUGFnZWQgaWQncyBjaGlsZHJlbiBhcmUgY29uc3RydWN0ZWQgZGlyZWN0bHkgaW4gY2hyb21lIGZvcm1hdCBmcm9tIHRoZSBjb250ZW50cyBvZiB0aGVcbiAgICAgIC8vIG9iamVjdCBpZC4gRG9lcyBub3QgcmVxdWlyZSBnb2luZyB0byB0aGUgZGVidWdnZWUuXG4gICAgICByZXR1cm4gZ2V0UGFnZWRQcm9wZXJ0aWVzKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2dldFNpbmdsZVBhZ2VPZlByb3BlcnRpZXMoaWQpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9nZXRTaW5nbGVQYWdlT2ZQcm9wZXJ0aWVzKGlkOiBPYmplY3RJZCk6IFByb21pc2U8QXJyYXk8UnVudGltZSRQcm9wZXJ0eURlc2NyaXB0b3I+PiB7XG4gICAgbGV0IHByb3BlcnRpZXMgPSBudWxsO1xuICAgIGNvbnN0IHtmdWxsbmFtZSwgcGFnZX0gPSBpZDtcbiAgICBpbnZhcmlhbnQoZnVsbG5hbWUgIT0gbnVsbCk7XG4gICAgaW52YXJpYW50KHBhZ2UgIT0gbnVsbCk7XG4gICAgaWYgKGlzV2F0Y2hDb250ZXh0T2JqZWN0SWQoaWQpKSB7XG4gICAgICBwcm9wZXJ0aWVzID0gYXdhaXQgdGhpcy5fc29ja2V0LmdldFByb3BlcnRpZXNCeUZ1bGxuYW1lQWxsQ29uZXh0cyhcbiAgICAgICAgaWQuZnJhbWVJbmRleCxcbiAgICAgICAgZnVsbG5hbWUsXG4gICAgICAgIHBhZ2VcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByb3BlcnRpZXMgPSBhd2FpdCB0aGlzLl9zb2NrZXQuZ2V0UHJvcGVydGllc0J5RnVsbG5hbWUoXG4gICAgICAgIGlkLmZyYW1lSW5kZXgsXG4gICAgICAgIGlkLmNvbnRleHRJZCxcbiAgICAgICAgZnVsbG5hbWUsXG4gICAgICAgIHBhZ2VcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBjb252ZXJ0UHJvcGVydGllcyhpZCwgcHJvcGVydGllcyk7XG4gIH1cblxuICBhc3luYyBfZ2V0Q29udGV4dFByb3BlcnRpZXMoaWQ6IE9iamVjdElkKTogUHJvbWlzZTxBcnJheTxSdW50aW1lJFByb3BlcnR5RGVzY3JpcHRvcj4+IHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gYXdhaXQgdGhpcy5fc29ja2V0LmdldENvbnRleHRQcm9wZXJ0aWVzKGlkLmZyYW1lSW5kZXgsIGlkLmNvbnRleHRJZCk7XG4gICAgLy8gU29tZSBwcm9wZXJ0aWVzIGluIHRoZSBlbnZpcm9ubWVudCBhcmUgY3JlYXRlZCBieSB1cyBmb3IgaW50ZXJuYWwgdXNlLCBzbyB3ZSBmaWx0ZXIgdGhlbSBvdXQuXG4gICAgY29uc3QgZmlsdGVyZWRQcm9wZXJ0aWVzID0gcHJvcGVydGllcy5maWx0ZXIocHJvcGVydHkgPT4ge1xuICAgICAgaW52YXJpYW50KHByb3BlcnR5LiQuZnVsbG5hbWUgIT0gbnVsbCk7XG4gICAgICByZXR1cm4gIXByb3BlcnR5LiQuZnVsbG5hbWUuc3RhcnRzV2l0aChFVkFMX0lERU5USUZJRVIpO1xuICAgIH0pO1xuICAgIHJldHVybiBjb252ZXJ0UHJvcGVydGllcyhpZCwgZmlsdGVyZWRQcm9wZXJ0aWVzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb250ZXh0TmFtZVRvU2NvcGVUeXBlKG5hbWU6IHN0cmluZyk6IERlYnVnZ2VyJFNjb3BlVHlwZSB7XG4gIHN3aXRjaCAobmFtZSkge1xuICAgIGNhc2UgJ0xvY2Fscyc6XG4gICAgICByZXR1cm4gJ2xvY2FsJztcbiAgICBjYXNlICdTdXBlcmdsb2JhbHMnOlxuICAgICAgcmV0dXJuICdnbG9iYWwnO1xuICAgIGNhc2UgJ1VzZXIgZGVmaW5lZCBjb25zdGFudHMnOlxuICAgICAgcmV0dXJuICdnbG9iYWwnO1xuICAvLyBUT0RPOiBWZXJpZnkgdGhpcyAuLi5cbiAgICBkZWZhdWx0OlxuICAgICAgbG9nZ2VyLmxvZyhgVW5leHBlY3RlZCBjb250ZXh0IG5hbWU6ICR7bmFtZX1gKTtcbiAgICAgIHJldHVybiAnY2xvc3VyZSc7XG4gIH1cbn1cbiJdfQ==