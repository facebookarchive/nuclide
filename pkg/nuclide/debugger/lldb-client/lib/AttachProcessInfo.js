Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atom = require('../../atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _LldbDebuggerInstance = require('./LldbDebuggerInstance');

var AttachProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(AttachProcessInfo, _DebuggerProcessInfo);

  function AttachProcessInfo(targetUri, targetInfo) {
    _classCallCheck(this, AttachProcessInfo);

    _get(Object.getPrototypeOf(AttachProcessInfo.prototype), 'constructor', this).call(this, 'lldb', targetUri);
    this._targetInfo = targetInfo;
  }

  _createClass(AttachProcessInfo, [{
    key: 'debug',
    value: _asyncToGenerator(function* () {
      var rpcService = this._getRpcService();
      var connection = yield rpcService.attach(this._targetInfo.pid);
      rpcService.dispose();
      // Start websocket server with Chrome after attach completed.
      return new _LldbDebuggerInstance.LldbDebuggerInstance(this, connection);
    })
  }, {
    key: '_getRpcService',
    value: function _getRpcService() {
      var _require = require('../../../client');

      var getServiceByNuclideUri = _require.getServiceByNuclideUri;

      var service = getServiceByNuclideUri('LLDBDebuggerRpcService', this.getTargetUri());
      (0, _assert2['default'])(service);
      return new service.DebuggerRpcService();
    }
  }, {
    key: 'compareDetails',
    value: function compareDetails(other) {
      (0, _assert2['default'])(other instanceof AttachProcessInfo);
      return this.displayString() === other.displayString() ? this.pid - other.pid : this.displayString() < other.displayString() ? -1 : 1;
    }
  }, {
    key: 'displayString',
    value: function displayString() {
      return this._targetInfo.name + '(' + this._targetInfo.pid + ')';
    }
  }, {
    key: 'pid',
    get: function get() {
      return this._targetInfo.pid;
    }
  }]);

  return AttachProcessInfo;
})(_atom.DebuggerProcessInfo);

exports.AttachProcessInfo = AttachProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0dGFjaFByb2Nlc3NJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFrQmtDLFlBQVk7O3NCQUN4QixRQUFROzs7O29DQUNLLHdCQUF3Qjs7SUFFOUMsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFHakIsV0FIQSxpQkFBaUIsQ0FHaEIsU0FBcUIsRUFBRSxVQUE0QixFQUFFOzBCQUh0RCxpQkFBaUI7O0FBSTFCLCtCQUpTLGlCQUFpQiw2Q0FJcEIsTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUN6QixRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztHQUMvQjs7ZUFOVSxpQkFBaUI7OzZCQVFqQixhQUE4QjtBQUN2QyxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDekMsVUFBTSxVQUFVLEdBQUcsTUFBTSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakUsZ0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFckIsYUFBTywrQ0FBeUIsSUFBSSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ25EOzs7V0FFYSwwQkFBMkI7cUJBQ04sT0FBTyxDQUFDLGlCQUFpQixDQUFDOztVQUFwRCxzQkFBc0IsWUFBdEIsc0JBQXNCOztBQUM3QixVQUFNLE9BQU8sR0FDWCxzQkFBc0IsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUMsQ0FBQztBQUN4RSwrQkFBVSxPQUFPLENBQUMsQ0FBQztBQUNuQixhQUFPLElBQUksT0FBTyxDQUFDLGtCQUFrQixFQUFFLENBQUM7S0FDekM7OztXQU1hLHdCQUFDLEtBQTBCLEVBQVU7QUFDakQsK0JBQVUsS0FBSyxZQUFZLGlCQUFpQixDQUFDLENBQUM7QUFDOUMsYUFBTyxJQUFJLENBQUMsYUFBYSxFQUFFLEtBQUssS0FBSyxDQUFDLGFBQWEsRUFBRSxHQUNoRCxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLEdBQ3JCLEFBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDN0Q7OztXQUVZLHlCQUFXO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztLQUNqRTs7O1NBYk0sZUFBVztBQUNoQixhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDO0tBQzdCOzs7U0ExQlUsaUJBQWlCIiwiZmlsZSI6IkF0dGFjaFByb2Nlc3NJbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0RlYnVnZ2VySW5zdGFuY2V9IGZyb20gJy4uLy4uL2F0b20nO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1xuICBBdHRhY2hUYXJnZXRJbmZvLFxuICBEZWJ1Z2dlclJwY1NlcnZpY2UgYXMgRGVidWdnZXJScGNTZXJ2aWNlVHlwZSxcbn0gZnJvbSAnLi4vLi4vbGxkYi1zZXJ2ZXIvbGliL0RlYnVnZ2VyUnBjU2VydmljZUludGVyZmFjZSc7XG5cbmltcG9ydCB7RGVidWdnZXJQcm9jZXNzSW5mb30gZnJvbSAnLi4vLi4vYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0xsZGJEZWJ1Z2dlckluc3RhbmNlfSBmcm9tICcuL0xsZGJEZWJ1Z2dlckluc3RhbmNlJztcblxuZXhwb3J0IGNsYXNzIEF0dGFjaFByb2Nlc3NJbmZvIGV4dGVuZHMgRGVidWdnZXJQcm9jZXNzSW5mbyB7XG4gIF90YXJnZXRJbmZvOiBBdHRhY2hUYXJnZXRJbmZvO1xuXG4gIGNvbnN0cnVjdG9yKHRhcmdldFVyaTogTnVjbGlkZVVyaSwgdGFyZ2V0SW5mbzogQXR0YWNoVGFyZ2V0SW5mbykge1xuICAgIHN1cGVyKCdsbGRiJywgdGFyZ2V0VXJpKTtcbiAgICB0aGlzLl90YXJnZXRJbmZvID0gdGFyZ2V0SW5mbztcbiAgfVxuXG4gIGFzeW5jIGRlYnVnKCk6IFByb21pc2U8RGVidWdnZXJJbnN0YW5jZT4ge1xuICAgIGNvbnN0IHJwY1NlcnZpY2UgPSB0aGlzLl9nZXRScGNTZXJ2aWNlKCk7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IHJwY1NlcnZpY2UuYXR0YWNoKHRoaXMuX3RhcmdldEluZm8ucGlkKTtcbiAgICBycGNTZXJ2aWNlLmRpc3Bvc2UoKTtcbiAgICAvLyBTdGFydCB3ZWJzb2NrZXQgc2VydmVyIHdpdGggQ2hyb21lIGFmdGVyIGF0dGFjaCBjb21wbGV0ZWQuXG4gICAgcmV0dXJuIG5ldyBMbGRiRGVidWdnZXJJbnN0YW5jZSh0aGlzLCBjb25uZWN0aW9uKTtcbiAgfVxuXG4gIF9nZXRScGNTZXJ2aWNlKCk6IERlYnVnZ2VyUnBjU2VydmljZVR5cGUge1xuICAgIGNvbnN0IHtnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpfSA9IHJlcXVpcmUoJy4uLy4uLy4uL2NsaWVudCcpO1xuICAgIGNvbnN0IHNlcnZpY2UgPVxuICAgICAgZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnTExEQkRlYnVnZ2VyUnBjU2VydmljZScsIHRoaXMuZ2V0VGFyZ2V0VXJpKCkpO1xuICAgIGludmFyaWFudChzZXJ2aWNlKTtcbiAgICByZXR1cm4gbmV3IHNlcnZpY2UuRGVidWdnZXJScGNTZXJ2aWNlKCk7XG4gIH1cblxuICBnZXQgcGlkKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3RhcmdldEluZm8ucGlkO1xuICB9XG5cbiAgY29tcGFyZURldGFpbHMob3RoZXI6IERlYnVnZ2VyUHJvY2Vzc0luZm8pOiBudW1iZXIge1xuICAgIGludmFyaWFudChvdGhlciBpbnN0YW5jZW9mIEF0dGFjaFByb2Nlc3NJbmZvKTtcbiAgICByZXR1cm4gdGhpcy5kaXNwbGF5U3RyaW5nKCkgPT09IG90aGVyLmRpc3BsYXlTdHJpbmcoKVxuICAgICAgPyAodGhpcy5waWQgLSBvdGhlci5waWQpXG4gICAgICA6ICh0aGlzLmRpc3BsYXlTdHJpbmcoKSA8IG90aGVyLmRpc3BsYXlTdHJpbmcoKSkgPyAtMSA6IDE7XG4gIH1cblxuICBkaXNwbGF5U3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3RhcmdldEluZm8ubmFtZSArICcoJyArIHRoaXMuX3RhcmdldEluZm8ucGlkICsgJyknO1xuICB9XG59XG4iXX0=