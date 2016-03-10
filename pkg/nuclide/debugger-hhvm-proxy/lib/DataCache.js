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
var STATUS_STOPPING = _require.STATUS_STOPPING;
var STATUS_STOPPED = _require.STATUS_STOPPED;
var STATUS_RUNNING = _require.STATUS_RUNNING;
var STATUS_STARTING = _require.STATUS_STARTING;

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
//# sourceMappingURL=data:application/json;base64,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blxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblxuaW1wb3J0IGxvZ2dlciBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7XG4gIHJlbW90ZU9iamVjdElkT2ZPYmplY3RJZCxcbiAgY3JlYXRlQ29udGV4dE9iamVjdElkLFxuICBpc0NvbnRleHRPYmplY3RJZCxcbiAgaXNQYWdlZE9iamVjdElkLFxuICBnZXRXYXRjaENvbnRleHRPYmplY3RJZCxcbiAgaXNXYXRjaENvbnRleHRPYmplY3RJZCxcbn0gZnJvbSAnLi9PYmplY3RJZCc7XG5pbXBvcnQge1xuICBjb252ZXJ0UHJvcGVydGllcyxcbiAgZ2V0UGFnZWRQcm9wZXJ0aWVzLFxufSBmcm9tICcuL3Byb3BlcnRpZXMuanMnO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtjb252ZXJ0VmFsdWV9IGZyb20gJy4vdmFsdWVzLmpzJztcblxuaW1wb3J0IHR5cGUge0RiZ3BDb250ZXh0fSBmcm9tICcuL0RiZ3BTb2NrZXQnO1xuaW1wb3J0IHR5cGUge09iamVjdElkfSBmcm9tICcuL09iamVjdElkJztcblxuLy8gVE9ETzogTW92ZSB0aGVzZSBDaHJvbWUgdHlwZXMgdG8gYSBzaGFyZWQgcGFja2FnZS5cbmV4cG9ydCB0eXBlIFJlbW90ZU9iamVjdElkID0gc3RyaW5nO1xuXG4vLyBkZXNjcmlwdGlvbiB3aW5zIG92ZXIgdmFsdWUgaW4gZGlzcGxheVxuZXhwb3J0IHR5cGUgUmVtb3RlT2JqZWN0ID0ge1xuICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICBvYmplY3RJZD86IFJlbW90ZU9iamVjdElkO1xuICBzdWJ0eXBlPzogc3RyaW5nOyAvLyBbIFwiYXJyYXlcIiAsIFwiZGF0ZVwiICwgXCJub2RlXCIgLCBcIm51bGxcIiAsIFwicmVnZXhwXCIgXVxuICB0eXBlOiBzdHJpbmc7IC8vIFsgXCJib29sZWFuXCIgLCBcImZ1bmN0aW9uXCIgLCBcIm51bWJlclwiICwgXCJvYmplY3RcIiAsIFwic3RyaW5nXCIgLCBcInVuZGVmaW5lZFwiIF1cbiAgdmFsdWU/OiBhbnk7XG59O1xuXG4vLyBzY29wZS5vYmplY3QuZGVzY3JpcHRpb24gc2hvd3Mgb24gUkhTXG5leHBvcnQgdHlwZSBTY29wZSA9IHtcbiAgb2JqZWN0OiBSZW1vdGVPYmplY3Q7XG4gIHR5cGU6IHN0cmluZzsgLy8gWyBcImNhdGNoXCIgLCBcImNsb3N1cmVcIiAsIFwiZ2xvYmFsXCIgLCBcImxvY2FsXCIgLCBcIndpdGhcIiBdXG59O1xuXG5leHBvcnQgdHlwZSBQcm9wZXJ0eURlc2NyaXB0b3IgPSB7XG4gIGNvbmZpZ3VyYWJsZTogYm9vbGVhbjtcbiAgZW51bWVyYWJsZTogYm9vbGVhbjtcbiAgZ2V0PzogUmVtb3RlT2JqZWN0O1xuICBuYW1lOiBzdHJpbmc7XG4gIHNldD86IFJlbW90ZU9iamVjdDtcbiAgdmFsdWU/OiBSZW1vdGVPYmplY3Q7XG4gIHdhc1Rocm93bj86IGJvb2xlYW47XG4gIHdyaXRhYmxlPzogYm9vbGVhbjtcbn07XG5cbmltcG9ydCB0eXBlIHtEYmdwU29ja2V0fSBmcm9tICcuL0RiZ3BTb2NrZXQnO1xuXG5jb25zdCB7XG4gIFNUQVRVU19CUkVBSyxcbiAgU1RBVFVTX1NUT1BQSU5HLFxuICBTVEFUVVNfU1RPUFBFRCxcbiAgU1RBVFVTX1JVTk5JTkcsXG4gIFNUQVRVU19TVEFSVElORyxcbn0gPSByZXF1aXJlKCcuL0RiZ3BTb2NrZXQnKTtcblxuLyoqXG4gKiBIYW5kbGVzIGRhdGEgdmFsdWUgdHJhY2tpbmcgYmV0d2VlbiBDaHJvbWUgYW5kIERiZ3AuXG4gKlxuICogTWFwcyBEYmdwIHByb3BlcnRpZXMgdG8vZnJvbSBDaHJvbWUgUmVtb3RlT2JqZWN0cy5cbiAqIFJlbW90ZU9iamVjdHMgYXJlIG9ubHkgdmFsaWQgd2hpbGUgdGhlIGRlYnVnZ2VlIGlzIHBhdXNlZC5cbiAqIE9uY2UgdGhlIGRlYnVnZ2VlIHJlc3VtZXMsIGFsbCBSZW1vdGVPYmplY3RzIGJlY29tZSBpbnZhbGlkLlxuICovXG5leHBvcnQgY2xhc3MgRGF0YUNhY2hlIHtcbiAgX3NvY2tldDogRGJncFNvY2tldDtcbiAgX2VuYWJsZWQ6IGJvb2xlYW47XG4gIF9lbmFibGVDb3VudDogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHNvY2tldDogRGJncFNvY2tldCkge1xuICAgIHRoaXMuX3NvY2tldCA9IHNvY2tldDtcbiAgICB0aGlzLl9lbmFibGVDb3VudCA9IDA7XG4gICAgdGhpcy5fZW5hYmxlZCA9IGZhbHNlO1xuICAgIHNvY2tldC5vblN0YXR1cyh0aGlzLl9vblN0YXR1c0NoYW5nZWQuYmluZCh0aGlzKSk7XG4gIH1cblxuICBfb25TdGF0dXNDaGFuZ2VkKHN0YXR1czogc3RyaW5nKTogdm9pZCB7XG4gICAgc3dpdGNoIChzdGF0dXMpIHtcbiAgICAgIGNhc2UgU1RBVFVTX0JSRUFLOlxuICAgICAgICB0aGlzLl9lbmFibGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFNUQVRVU19TVEFSVElORzpcbiAgICAgIGNhc2UgU1RBVFVTX1NUT1BQSU5HOlxuICAgICAgY2FzZSBTVEFUVVNfU1RPUFBFRDpcbiAgICAgIGNhc2UgU1RBVFVTX1JVTk5JTkc6XG4gICAgICAgIHRoaXMuX2Rpc2FibGUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgX2Rpc2FibGUoKTogdm9pZCB7XG4gICAgdGhpcy5fZW5hYmxlZCA9IGZhbHNlO1xuICB9XG5cbiAgaXNFbmFibGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9lbmFibGVkO1xuICB9XG5cbiAgX2VuYWJsZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9lbmFibGVDb3VudCArPSAxO1xuICAgIHRoaXMuX2VuYWJsZWQgPSB0cnVlO1xuICB9XG5cbiAgYXN5bmMgZ2V0U2NvcGVzRm9yRnJhbWUoZnJhbWVJbmRleDogbnVtYmVyKTogUHJvbWlzZTxBcnJheTxTY29wZT4+IHtcbiAgICBpZiAoIXRoaXMuaXNFbmFibGVkKCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTXVzdCBiZSBlbmFibGVkIHRvIGdldCBzY29wZXMuJyk7XG4gICAgfVxuICAgIGNvbnN0IGNvbnRleHRzID0gYXdhaXQgdGhpcy5fc29ja2V0LmdldENvbnRleHRzRm9yRnJhbWUoZnJhbWVJbmRleCk7XG4gICAgcmV0dXJuIGNvbnRleHRzLm1hcChjb250ZXh0ID0+IHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIG9iamVjdDogdGhpcy5fcmVtb3RlT2JqZWN0T2ZDb250ZXh0KGZyYW1lSW5kZXgsIGNvbnRleHQpLFxuICAgICAgICB0eXBlOiBjb250ZXh0TmFtZVRvU2NvcGVUeXBlKGNvbnRleHQubmFtZSksXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZXZhbHVhdGVPbkNhbGxGcmFtZShmcmFtZUluZGV4OiBudW1iZXIsIGV4cHJlc3Npb246IHN0cmluZyk6IFByb21pc2U8T2JqZWN0PiB7XG4gICAgaWYgKCF0aGlzLmlzRW5hYmxlZCgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ011c3QgYmUgZW5hYmxlZCB0byBldmFsdWF0ZSBleHByZXNzaW9uLicpO1xuICAgIH1cblxuICAgIGNvbnN0IGV2YWx1YXRlZFJlc3VsdCA9IGF3YWl0IHRoaXMuX3NvY2tldC5ldmFsdWF0ZU9uQ2FsbEZyYW1lKGZyYW1lSW5kZXgsIGV4cHJlc3Npb24pO1xuICAgIGlmIChldmFsdWF0ZWRSZXN1bHQud2FzVGhyb3duKSB7XG4gICAgICByZXR1cm4gZXZhbHVhdGVkUmVzdWx0O1xuICAgIH1cbiAgICBjb25zdCBpZCA9IGdldFdhdGNoQ29udGV4dE9iamVjdElkKHRoaXMuX2VuYWJsZUNvdW50LCBmcmFtZUluZGV4KTtcbiAgICBpbnZhcmlhbnQoZXZhbHVhdGVkUmVzdWx0LnJlc3VsdCk7XG4gICAgY29uc3QgcmVzdWx0ID0gY29udmVydFZhbHVlKGlkLCBldmFsdWF0ZWRSZXN1bHQucmVzdWx0KTtcbiAgICByZXR1cm4ge1xuICAgICAgcmVzdWx0LFxuICAgICAgd2FzVGhyb3duOiBmYWxzZSxcbiAgICB9O1xuICB9XG5cbiAgX3JlbW90ZU9iamVjdE9mQ29udGV4dChmcmFtZUluZGV4OiBudW1iZXIsIGNvbnRleHQ6IERiZ3BDb250ZXh0KTogUmVtb3RlT2JqZWN0IHtcbiAgICByZXR1cm4ge1xuICAgICAgZGVzY3JpcHRpb246IGNvbnRleHQubmFtZSxcbiAgICAgIHR5cGU6ICdvYmplY3QnLFxuICAgICAgb2JqZWN0SWQ6IHJlbW90ZU9iamVjdElkT2ZPYmplY3RJZCh0aGlzLl9vYmplY3RJZE9mQ29udGV4dChmcmFtZUluZGV4LCBjb250ZXh0KSksXG4gICAgfTtcbiAgfVxuXG4gIF9vYmplY3RJZE9mQ29udGV4dChmcmFtZUluZGV4OiBudW1iZXIsIGNvbnRleHQ6IERiZ3BDb250ZXh0KTogT2JqZWN0SWQge1xuICAgIHJldHVybiBjcmVhdGVDb250ZXh0T2JqZWN0SWQodGhpcy5fZW5hYmxlQ291bnQsIGZyYW1lSW5kZXgsIGNvbnRleHQuaWQpO1xuICB9XG5cbiAgYXN5bmMgZ2V0UHJvcGVydGllcyhyZW1vdGVJZDogUmVtb3RlT2JqZWN0SWQpOiBQcm9taXNlPEFycmF5PFByb3BlcnR5RGVzY3JpcHRvcj4+IHtcbiAgICBjb25zdCBpZCA9IEpTT04ucGFyc2UocmVtb3RlSWQpO1xuICAgIGlmIChpZC5lbmFibGVDb3VudCAhPT0gdGhpcy5fZW5hYmxlQ291bnQpIHtcbiAgICAgIGxvZ2dlci5sb2dFcnJvckFuZFRocm93KGBHb3QgcmVxdWVzdCBmb3Igc3RhbGUgUmVtb3RlT2JqZWN0SWQgJHtyZW1vdGVJZH1gKTtcbiAgICB9XG5cbiAgICAvLyBjb250ZXh0IGFuZCBzaW5nbGUgcGFnZWQgaWRzIHJlcXVpcmUgZ2V0dGluZyBjaGlsZHJlbiBmcm9tIHRoZSBkZWJ1Z2dlZSBhbmQgY29udmVydGluZ1xuICAgIC8vIHRoZW0gZnJvbSBkYmdwIHRvIGNocm9tZSBmb3JtYXQuXG4gICAgaWYgKGlzQ29udGV4dE9iamVjdElkKGlkKSkge1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2dldENvbnRleHRQcm9wZXJ0aWVzKGlkKTtcbiAgICB9IGVsc2UgaWYgKGlzUGFnZWRPYmplY3RJZChpZCkpIHtcbiAgICAgIC8vIFBhZ2VkIGlkJ3MgY2hpbGRyZW4gYXJlIGNvbnN0cnVjdGVkIGRpcmVjdGx5IGluIGNocm9tZSBmb3JtYXQgZnJvbSB0aGUgY29udGVudHMgb2YgdGhlXG4gICAgICAvLyBvYmplY3QgaWQuIERvZXMgbm90IHJlcXVpcmUgZ29pbmcgdG8gdGhlIGRlYnVnZ2VlLlxuICAgICAgcmV0dXJuIGdldFBhZ2VkUHJvcGVydGllcyhpZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9nZXRTaW5nbGVQYWdlT2ZQcm9wZXJ0aWVzKGlkKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBfZ2V0U2luZ2xlUGFnZU9mUHJvcGVydGllcyhpZDogT2JqZWN0SWQpOiBQcm9taXNlPEFycmF5PFByb3BlcnR5RGVzY3JpcHRvcj4+IHtcbiAgICBsZXQgcHJvcGVydGllcyA9IG51bGw7XG4gICAgY29uc3Qge2Z1bGxuYW1lLCBwYWdlfSA9IGlkO1xuICAgIGludmFyaWFudChmdWxsbmFtZSAhPSBudWxsKTtcbiAgICBpbnZhcmlhbnQocGFnZSAhPSBudWxsKTtcbiAgICBpZiAoaXNXYXRjaENvbnRleHRPYmplY3RJZChpZCkpIHtcbiAgICAgIHByb3BlcnRpZXMgPSBhd2FpdCB0aGlzLl9zb2NrZXQuZ2V0UHJvcGVydGllc0J5RnVsbG5hbWVBbGxDb25leHRzKFxuICAgICAgICBpZC5mcmFtZUluZGV4LFxuICAgICAgICBmdWxsbmFtZSxcbiAgICAgICAgcGFnZVxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvcGVydGllcyA9IGF3YWl0IHRoaXMuX3NvY2tldC5nZXRQcm9wZXJ0aWVzQnlGdWxsbmFtZShcbiAgICAgICAgaWQuZnJhbWVJbmRleCxcbiAgICAgICAgaWQuY29udGV4dElkLFxuICAgICAgICBmdWxsbmFtZSxcbiAgICAgICAgcGFnZVxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbnZlcnRQcm9wZXJ0aWVzKGlkLCBwcm9wZXJ0aWVzKTtcbiAgfVxuXG4gIGFzeW5jIF9nZXRDb250ZXh0UHJvcGVydGllcyhpZDogT2JqZWN0SWQpOiBQcm9taXNlPEFycmF5PFByb3BlcnR5RGVzY3JpcHRvcj4+IHtcbiAgICBjb25zdCBwcm9wZXJ0aWVzID0gYXdhaXQgdGhpcy5fc29ja2V0LmdldENvbnRleHRQcm9wZXJ0aWVzKGlkLmZyYW1lSW5kZXgsIGlkLmNvbnRleHRJZCk7XG4gICAgcmV0dXJuIGNvbnZlcnRQcm9wZXJ0aWVzKGlkLCBwcm9wZXJ0aWVzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb250ZXh0TmFtZVRvU2NvcGVUeXBlKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIHN3aXRjaCAobmFtZSkge1xuICAgIGNhc2UgJ0xvY2Fscyc6XG4gICAgICByZXR1cm4gJ2xvY2FsJztcbiAgICBjYXNlICdTdXBlcmdsb2JhbHMnOlxuICAgICAgcmV0dXJuICdnbG9iYWwnO1xuICAgIGNhc2UgJ1VzZXIgZGVmaW5lZCBjb25zdGFudHMnOlxuICAgICAgcmV0dXJuICdnbG9iYWwnO1xuICAvLyBUT0RPOiBWZXJpZnkgdGhpcyAuLi5cbiAgICBkZWZhdWx0OlxuICAgICAgbG9nZ2VyLmxvZyhgVW5leHBlY3RlZCBjb250ZXh0IG5hbWU6ICR7bmFtZX1gKTtcbiAgICAgIHJldHVybiAnY2xvc3VyZSc7XG4gIH1cbn1cbiJdfQ==