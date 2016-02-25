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

var _propertiesJs = require('./properties.js');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _valuesJs = require('./values.js');

// TODO: Move these Chrome types to a shared package.

// description wins over value in display

// scope.object.description shows on RHS
// [ "catch" , "closure" , "global" , "local" , "with" ]

var _require = require('./DbgpSocket');

var STATUS_BREAK = _require.STATUS_BREAK;

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
    socket.onStatus(this._onStatusChanged.bind(this));
  }

  _createClass(DataCache, [{
    key: '_onStatusChanged',
    value: function _onStatusChanged(status) {
      switch (status) {
        case STATUS_BREAK:
          this._enable();
          break;
        default:
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
    key: 'evaluateOnCallFrame',
    value: _asyncToGenerator(function* (frameIndex, expression) {
      if (!this.isEnabled()) {
        throw new Error('Must be enabled to evaluate expression.');
      }

      var evaluatedResult = yield this._socket.evaluateOnCallFrame(frameIndex, expression);
      if (evaluatedResult.wasThrown) {
        return evaluatedResult;
      }
      var id = (0, _ObjectId.getWatchContextObjectId)(this._enableCount, frameIndex);
      (0, _assert2['default'])(evaluatedResult.result);
      var result = (0, _valuesJs.convertValue)(id, evaluatedResult.result);
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
        return (0, _propertiesJs.getPagedProperties)(id);
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
      return (0, _propertiesJs.convertProperties)(id, properties);
    })
  }, {
    key: '_getContextProperties',
    value: _asyncToGenerator(function* (id) {
      var properties = yield this._socket.getContextProperties(id.frameIndex, id.contextId);
      return (0, _propertiesJs.convertProperties)(id, properties);
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
// [ "array" , "date" , "node" , "null" , "regexp" ]
// [ "boolean" , "function" , "number" , "object" , "string" , "undefined" ]
//# sourceMappingURL=data:application/json;base64,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RUFBRSxDQUFDLFVBQVUsRUFDYixRQUFRLEVBQ1IsSUFBSSxDQUNMLENBQUM7T0FDSCxNQUFNO0FBQ0wsa0JBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsdUJBQXVCLENBQ3JELEVBQUUsQ0FBQyxVQUFVLEVBQ2IsRUFBRSxDQUFDLFNBQVMsRUFDWixRQUFRLEVBQ1IsSUFBSSxDQUNMLENBQUM7T0FDSDtBQUNELGFBQU8scUNBQWtCLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUMxQzs7OzZCQUUwQixXQUFDLEVBQVksRUFBc0M7QUFDNUUsVUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3hGLGFBQU8scUNBQWtCLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztLQUMxQzs7O1NBM0hVLFNBQVM7Ozs7O0FBOEh0QixTQUFTLHNCQUFzQixDQUFDLElBQVksRUFBVTtBQUNwRCxVQUFRLElBQUk7QUFDVixTQUFLLFFBQVE7QUFDWCxhQUFPLE9BQU8sQ0FBQztBQUFBLEFBQ2pCLFNBQUssY0FBYztBQUNqQixhQUFPLFFBQVEsQ0FBQztBQUFBLEFBQ2xCLFNBQUssd0JBQXdCO0FBQzNCLGFBQU8sUUFBUSxDQUFDO0FBQUE7QUFFbEI7QUFDRSx5QkFBTyxHQUFHLCtCQUE2QixJQUFJLENBQUcsQ0FBQztBQUMvQyxhQUFPLFNBQVMsQ0FBQztBQUFBLEdBQ3BCO0NBQ0YiLCJmaWxlIjoiRGF0YUNhY2hlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuXG5pbXBvcnQgbG9nZ2VyIGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtcbiAgcmVtb3RlT2JqZWN0SWRPZk9iamVjdElkLFxuICBjcmVhdGVDb250ZXh0T2JqZWN0SWQsXG4gIGlzQ29udGV4dE9iamVjdElkLFxuICBpc1BhZ2VkT2JqZWN0SWQsXG4gIGdldFdhdGNoQ29udGV4dE9iamVjdElkLFxuICBpc1dhdGNoQ29udGV4dE9iamVjdElkLFxufSBmcm9tICcuL09iamVjdElkJztcbmltcG9ydCB7XG4gIGNvbnZlcnRQcm9wZXJ0aWVzLFxuICBnZXRQYWdlZFByb3BlcnRpZXMsXG59IGZyb20gJy4vcHJvcGVydGllcy5qcyc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge2NvbnZlcnRWYWx1ZX0gZnJvbSAnLi92YWx1ZXMuanMnO1xuXG5pbXBvcnQgdHlwZSB7RGJncENvbnRleHR9IGZyb20gJy4vRGJncFNvY2tldCc7XG5pbXBvcnQgdHlwZSB7T2JqZWN0SWR9IGZyb20gJy4vT2JqZWN0SWQnO1xuXG4vLyBUT0RPOiBNb3ZlIHRoZXNlIENocm9tZSB0eXBlcyB0byBhIHNoYXJlZCBwYWNrYWdlLlxuZXhwb3J0IHR5cGUgUmVtb3RlT2JqZWN0SWQgPSBzdHJpbmc7XG5cbi8vIGRlc2NyaXB0aW9uIHdpbnMgb3ZlciB2YWx1ZSBpbiBkaXNwbGF5XG5leHBvcnQgdHlwZSBSZW1vdGVPYmplY3QgPSB7XG4gIGNsYXNzTmFtZT86IHN0cmluZztcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmc7XG4gIG9iamVjdElkPzogUmVtb3RlT2JqZWN0SWQ7XG4gIHN1YnR5cGU/OiBzdHJpbmc7IC8vIFsgXCJhcnJheVwiICwgXCJkYXRlXCIgLCBcIm5vZGVcIiAsIFwibnVsbFwiICwgXCJyZWdleHBcIiBdXG4gIHR5cGU6IHN0cmluZzsgLy8gWyBcImJvb2xlYW5cIiAsIFwiZnVuY3Rpb25cIiAsIFwibnVtYmVyXCIgLCBcIm9iamVjdFwiICwgXCJzdHJpbmdcIiAsIFwidW5kZWZpbmVkXCIgXVxuICB2YWx1ZT86IGFueTtcbn07XG5cbi8vIHNjb3BlLm9iamVjdC5kZXNjcmlwdGlvbiBzaG93cyBvbiBSSFNcbmV4cG9ydCB0eXBlIFNjb3BlID0ge1xuICBvYmplY3Q6IFJlbW90ZU9iamVjdDtcbiAgdHlwZTogc3RyaW5nOyAvLyBbIFwiY2F0Y2hcIiAsIFwiY2xvc3VyZVwiICwgXCJnbG9iYWxcIiAsIFwibG9jYWxcIiAsIFwid2l0aFwiIF1cbn07XG5cbmV4cG9ydCB0eXBlIFByb3BlcnR5RGVzY3JpcHRvciA9IHtcbiAgY29uZmlndXJhYmxlOiBib29sZWFuO1xuICBlbnVtZXJhYmxlOiBib29sZWFuO1xuICBnZXQ/OiBSZW1vdGVPYmplY3Q7XG4gIG5hbWU6IHN0cmluZztcbiAgc2V0PzogUmVtb3RlT2JqZWN0O1xuICB2YWx1ZT86IFJlbW90ZU9iamVjdDtcbiAgd2FzVGhyb3duPzogYm9vbGVhbjtcbiAgd3JpdGFibGU/OiBib29sZWFuO1xufTtcblxuaW1wb3J0IHR5cGUge0RiZ3BTb2NrZXR9IGZyb20gJy4vRGJncFNvY2tldCc7XG5cbmNvbnN0IHtTVEFUVVNfQlJFQUt9ID0gcmVxdWlyZSgnLi9EYmdwU29ja2V0Jyk7XG5cbi8qKlxuICogSGFuZGxlcyBkYXRhIHZhbHVlIHRyYWNraW5nIGJldHdlZW4gQ2hyb21lIGFuZCBEYmdwLlxuICpcbiAqIE1hcHMgRGJncCBwcm9wZXJ0aWVzIHRvL2Zyb20gQ2hyb21lIFJlbW90ZU9iamVjdHMuXG4gKiBSZW1vdGVPYmplY3RzIGFyZSBvbmx5IHZhbGlkIHdoaWxlIHRoZSBkZWJ1Z2dlZSBpcyBwYXVzZWQuXG4gKiBPbmNlIHRoZSBkZWJ1Z2dlZSByZXN1bWVzLCBhbGwgUmVtb3RlT2JqZWN0cyBiZWNvbWUgaW52YWxpZC5cbiAqL1xuZXhwb3J0IGNsYXNzIERhdGFDYWNoZSB7XG4gIF9zb2NrZXQ6IERiZ3BTb2NrZXQ7XG4gIF9lbmFibGVkOiBib29sZWFuO1xuICBfZW5hYmxlQ291bnQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3Rvcihzb2NrZXQ6IERiZ3BTb2NrZXQpIHtcbiAgICB0aGlzLl9zb2NrZXQgPSBzb2NrZXQ7XG4gICAgdGhpcy5fZW5hYmxlQ291bnQgPSAwO1xuICAgIHRoaXMuX2VuYWJsZWQgPSBmYWxzZTtcbiAgICBzb2NrZXQub25TdGF0dXModGhpcy5fb25TdGF0dXNDaGFuZ2VkLmJpbmQodGhpcykpO1xuICB9XG5cbiAgX29uU3RhdHVzQ2hhbmdlZChzdGF0dXM6IHN0cmluZyk6IHZvaWQge1xuICAgIHN3aXRjaCAoc3RhdHVzKSB7XG4gICAgICBjYXNlIFNUQVRVU19CUkVBSzpcbiAgICAgICAgdGhpcy5fZW5hYmxlKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5fZGlzYWJsZSgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBfZGlzYWJsZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbmFibGVkID0gZmFsc2U7XG4gIH1cblxuICBpc0VuYWJsZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2VuYWJsZWQ7XG4gIH1cblxuICBfZW5hYmxlKCk6IHZvaWQge1xuICAgIHRoaXMuX2VuYWJsZUNvdW50ICs9IDE7XG4gICAgdGhpcy5fZW5hYmxlZCA9IHRydWU7XG4gIH1cblxuICBhc3luYyBnZXRTY29wZXNGb3JGcmFtZShmcmFtZUluZGV4OiBudW1iZXIpOiBQcm9taXNlPEFycmF5PFNjb3BlPj4ge1xuICAgIGlmICghdGhpcy5pc0VuYWJsZWQoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IGJlIGVuYWJsZWQgdG8gZ2V0IHNjb3Blcy4nKTtcbiAgICB9XG4gICAgY29uc3QgY29udGV4dHMgPSBhd2FpdCB0aGlzLl9zb2NrZXQuZ2V0Q29udGV4dHNGb3JGcmFtZShmcmFtZUluZGV4KTtcbiAgICByZXR1cm4gY29udGV4dHMubWFwKGNvbnRleHQgPT4ge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgb2JqZWN0OiB0aGlzLl9yZW1vdGVPYmplY3RPZkNvbnRleHQoZnJhbWVJbmRleCwgY29udGV4dCksXG4gICAgICAgIHR5cGU6IGNvbnRleHROYW1lVG9TY29wZVR5cGUoY29udGV4dC5uYW1lKSxcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBldmFsdWF0ZU9uQ2FsbEZyYW1lKGZyYW1lSW5kZXg6IG51bWJlciwgZXhwcmVzc2lvbjogc3RyaW5nKTogUHJvbWlzZTxPYmplY3Q+IHtcbiAgICBpZiAoIXRoaXMuaXNFbmFibGVkKCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTXVzdCBiZSBlbmFibGVkIHRvIGV2YWx1YXRlIGV4cHJlc3Npb24uJyk7XG4gICAgfVxuXG4gICAgY29uc3QgZXZhbHVhdGVkUmVzdWx0ID0gYXdhaXQgdGhpcy5fc29ja2V0LmV2YWx1YXRlT25DYWxsRnJhbWUoZnJhbWVJbmRleCwgZXhwcmVzc2lvbik7XG4gICAgaWYgKGV2YWx1YXRlZFJlc3VsdC53YXNUaHJvd24pIHtcbiAgICAgIHJldHVybiBldmFsdWF0ZWRSZXN1bHQ7XG4gICAgfVxuICAgIGNvbnN0IGlkID0gZ2V0V2F0Y2hDb250ZXh0T2JqZWN0SWQodGhpcy5fZW5hYmxlQ291bnQsIGZyYW1lSW5kZXgpO1xuICAgIGludmFyaWFudChldmFsdWF0ZWRSZXN1bHQucmVzdWx0KTtcbiAgICBjb25zdCByZXN1bHQgPSBjb252ZXJ0VmFsdWUoaWQsIGV2YWx1YXRlZFJlc3VsdC5yZXN1bHQpO1xuICAgIHJldHVybiB7XG4gICAgICByZXN1bHQsXG4gICAgICB3YXNUaHJvd246IGZhbHNlLFxuICAgIH07XG4gIH1cblxuICBfcmVtb3RlT2JqZWN0T2ZDb250ZXh0KGZyYW1lSW5kZXg6IG51bWJlciwgY29udGV4dDogRGJncENvbnRleHQpOiBSZW1vdGVPYmplY3Qge1xuICAgIHJldHVybiB7XG4gICAgICBkZXNjcmlwdGlvbjogY29udGV4dC5uYW1lLFxuICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICBvYmplY3RJZDogcmVtb3RlT2JqZWN0SWRPZk9iamVjdElkKHRoaXMuX29iamVjdElkT2ZDb250ZXh0KGZyYW1lSW5kZXgsIGNvbnRleHQpKSxcbiAgICB9O1xuICB9XG5cbiAgX29iamVjdElkT2ZDb250ZXh0KGZyYW1lSW5kZXg6IG51bWJlciwgY29udGV4dDogRGJncENvbnRleHQpOiBPYmplY3RJZCB7XG4gICAgcmV0dXJuIGNyZWF0ZUNvbnRleHRPYmplY3RJZCh0aGlzLl9lbmFibGVDb3VudCwgZnJhbWVJbmRleCwgY29udGV4dC5pZCk7XG4gIH1cblxuICBhc3luYyBnZXRQcm9wZXJ0aWVzKHJlbW90ZUlkOiBSZW1vdGVPYmplY3RJZCk6IFByb21pc2U8QXJyYXk8UHJvcGVydHlEZXNjcmlwdG9yPj4ge1xuICAgIGNvbnN0IGlkID0gSlNPTi5wYXJzZShyZW1vdGVJZCk7XG4gICAgaWYgKGlkLmVuYWJsZUNvdW50ICE9PSB0aGlzLl9lbmFibGVDb3VudCkge1xuICAgICAgbG9nZ2VyLmxvZ0Vycm9yQW5kVGhyb3coYEdvdCByZXF1ZXN0IGZvciBzdGFsZSBSZW1vdGVPYmplY3RJZCAke3JlbW90ZUlkfWApO1xuICAgIH1cblxuICAgIC8vIGNvbnRleHQgYW5kIHNpbmdsZSBwYWdlZCBpZHMgcmVxdWlyZSBnZXR0aW5nIGNoaWxkcmVuIGZyb20gdGhlIGRlYnVnZ2VlIGFuZCBjb252ZXJ0aW5nXG4gICAgLy8gdGhlbSBmcm9tIGRiZ3AgdG8gY2hyb21lIGZvcm1hdC5cbiAgICBpZiAoaXNDb250ZXh0T2JqZWN0SWQoaWQpKSB7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5fZ2V0Q29udGV4dFByb3BlcnRpZXMoaWQpO1xuICAgIH0gZWxzZSBpZiAoaXNQYWdlZE9iamVjdElkKGlkKSkge1xuICAgICAgLy8gUGFnZWQgaWQncyBjaGlsZHJlbiBhcmUgY29uc3RydWN0ZWQgZGlyZWN0bHkgaW4gY2hyb21lIGZvcm1hdCBmcm9tIHRoZSBjb250ZW50cyBvZiB0aGVcbiAgICAgIC8vIG9iamVjdCBpZC4gRG9lcyBub3QgcmVxdWlyZSBnb2luZyB0byB0aGUgZGVidWdnZWUuXG4gICAgICByZXR1cm4gZ2V0UGFnZWRQcm9wZXJ0aWVzKGlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2dldFNpbmdsZVBhZ2VPZlByb3BlcnRpZXMoaWQpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIF9nZXRTaW5nbGVQYWdlT2ZQcm9wZXJ0aWVzKGlkOiBPYmplY3RJZCk6IFByb21pc2U8QXJyYXk8UHJvcGVydHlEZXNjcmlwdG9yPj4ge1xuICAgIGxldCBwcm9wZXJ0aWVzID0gbnVsbDtcbiAgICBjb25zdCB7ZnVsbG5hbWUsIHBhZ2V9ID0gaWQ7XG4gICAgaW52YXJpYW50KGZ1bGxuYW1lICE9IG51bGwpO1xuICAgIGludmFyaWFudChwYWdlICE9IG51bGwpO1xuICAgIGlmIChpc1dhdGNoQ29udGV4dE9iamVjdElkKGlkKSkge1xuICAgICAgcHJvcGVydGllcyA9IGF3YWl0IHRoaXMuX3NvY2tldC5nZXRQcm9wZXJ0aWVzQnlGdWxsbmFtZUFsbENvbmV4dHMoXG4gICAgICAgIGlkLmZyYW1lSW5kZXgsXG4gICAgICAgIGZ1bGxuYW1lLFxuICAgICAgICBwYWdlXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9wZXJ0aWVzID0gYXdhaXQgdGhpcy5fc29ja2V0LmdldFByb3BlcnRpZXNCeUZ1bGxuYW1lKFxuICAgICAgICBpZC5mcmFtZUluZGV4LFxuICAgICAgICBpZC5jb250ZXh0SWQsXG4gICAgICAgIGZ1bGxuYW1lLFxuICAgICAgICBwYWdlXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gY29udmVydFByb3BlcnRpZXMoaWQsIHByb3BlcnRpZXMpO1xuICB9XG5cbiAgYXN5bmMgX2dldENvbnRleHRQcm9wZXJ0aWVzKGlkOiBPYmplY3RJZCk6IFByb21pc2U8QXJyYXk8UHJvcGVydHlEZXNjcmlwdG9yPj4ge1xuICAgIGNvbnN0IHByb3BlcnRpZXMgPSBhd2FpdCB0aGlzLl9zb2NrZXQuZ2V0Q29udGV4dFByb3BlcnRpZXMoaWQuZnJhbWVJbmRleCwgaWQuY29udGV4dElkKTtcbiAgICByZXR1cm4gY29udmVydFByb3BlcnRpZXMoaWQsIHByb3BlcnRpZXMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbnRleHROYW1lVG9TY29wZVR5cGUobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgc3dpdGNoIChuYW1lKSB7XG4gICAgY2FzZSAnTG9jYWxzJzpcbiAgICAgIHJldHVybiAnbG9jYWwnO1xuICAgIGNhc2UgJ1N1cGVyZ2xvYmFscyc6XG4gICAgICByZXR1cm4gJ2dsb2JhbCc7XG4gICAgY2FzZSAnVXNlciBkZWZpbmVkIGNvbnN0YW50cyc6XG4gICAgICByZXR1cm4gJ2dsb2JhbCc7XG4gIC8vIFRPRE86IFZlcmlmeSB0aGlzIC4uLlxuICAgIGRlZmF1bHQ6XG4gICAgICBsb2dnZXIubG9nKGBVbmV4cGVjdGVkIGNvbnRleHQgbmFtZTogJHtuYW1lfWApO1xuICAgICAgcmV0dXJuICdjbG9zdXJlJztcbiAgfVxufVxuIl19