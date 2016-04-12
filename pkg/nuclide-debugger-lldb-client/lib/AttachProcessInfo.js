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

var _nuclideDebuggerCommonLibOutputServiceManager = require('../../nuclide-debugger-common/lib/OutputServiceManager');

var _nuclideDebuggerAtom = require('../../nuclide-debugger-atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _LldbDebuggerInstance = require('./LldbDebuggerInstance');

var _utils = require('./utils');

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
      if (this.basepath) {
        this._targetInfo.basepath = this.basepath;
      }
      rpcService.setSettings({ logLevel: (0, _utils.getConfig)().serverLogLevel });

      var debugSession = null;
      var outputDisposable = (0, _nuclideDebuggerCommonLibOutputServiceManager.registerOutputWindowLogging)(rpcService.getOutputWindowObservable());
      try {
        var connection = yield rpcService.attach(this._targetInfo);
        rpcService.dispose();
        // Start websocket server with Chrome after attach completed.
        debugSession = new _LldbDebuggerInstance.LldbDebuggerInstance(this, connection, outputDisposable);
        outputDisposable = null;
      } finally {
        if (outputDisposable != null) {
          outputDisposable.dispose();
        }
      }
      return debugSession;
    })
  }, {
    key: '_getRpcService',
    value: function _getRpcService() {
      var _require = require('../../nuclide-client');

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
})(_nuclideDebuggerAtom.DebuggerProcessInfo);

exports.AttachProcessInfo = AttachProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0dGFjaFByb2Nlc3NJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0REFtQjBDLHdEQUF3RDs7bUNBQ2hFLDZCQUE2Qjs7c0JBQ3pDLFFBQVE7Ozs7b0NBQ0ssd0JBQXdCOztxQkFDbkMsU0FBUzs7SUFFcEIsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFHakIsV0FIQSxpQkFBaUIsQ0FHaEIsU0FBcUIsRUFBRSxVQUE0QixFQUFFOzBCQUh0RCxpQkFBaUI7O0FBSTFCLCtCQUpTLGlCQUFpQiw2Q0FJcEIsTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUN6QixRQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztHQUMvQjs7ZUFOVSxpQkFBaUI7OzZCQVFqQixhQUE4QjtBQUN2QyxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDekMsVUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2pCLFlBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7T0FDM0M7QUFDRCxnQkFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFDLFFBQVEsRUFBRSx1QkFBVyxDQUFDLGNBQWMsRUFBQyxDQUFDLENBQUM7O0FBRS9ELFVBQUksWUFBWSxHQUFHLElBQUksQ0FBQztBQUN4QixVQUFJLGdCQUFnQixHQUFHLCtFQUE0QixVQUFVLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxDQUFDO0FBQzNGLFVBQUk7QUFDRixZQUFNLFVBQVUsR0FBRyxNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzdELGtCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRXJCLG9CQUFZLEdBQUcsK0NBQXlCLElBQUksRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUM1RSx3QkFBZ0IsR0FBRyxJQUFJLENBQUM7T0FDekIsU0FBUztBQUNSLFlBQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO0FBQzVCLDBCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQzVCO09BQ0Y7QUFDRCxhQUFPLFlBQVksQ0FBQztLQUNyQjs7O1dBRWEsMEJBQTJCO3FCQUNOLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQzs7VUFBekQsc0JBQXNCLFlBQXRCLHNCQUFzQjs7QUFDN0IsVUFBTSxPQUFPLEdBQ1gsc0JBQXNCLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDeEUsK0JBQVUsT0FBTyxDQUFDLENBQUM7QUFDbkIsYUFBTyxJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0tBQ3pDOzs7V0FNYSx3QkFBQyxLQUEwQixFQUFVO0FBQ2pELCtCQUFVLEtBQUssWUFBWSxpQkFBaUIsQ0FBQyxDQUFDO0FBQzlDLGFBQU8sSUFBSSxDQUFDLGFBQWEsRUFBRSxLQUFLLEtBQUssQ0FBQyxhQUFhLEVBQUUsR0FDaEQsSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUNyQixBQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLEdBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQzdEOzs7V0FFWSx5QkFBVztBQUN0QixhQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7S0FDakU7OztTQWJNLGVBQVc7QUFDaEIsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQztLQUM3Qjs7O1NBekNVLGlCQUFpQiIsImZpbGUiOiJBdHRhY2hQcm9jZXNzSW5mby5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cblxuaW1wb3J0IHR5cGUge0RlYnVnZ2VySW5zdGFuY2V9IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItYXRvbSc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtcbiAgQXR0YWNoVGFyZ2V0SW5mbyxcbiAgRGVidWdnZXJScGNTZXJ2aWNlIGFzIERlYnVnZ2VyUnBjU2VydmljZVR5cGUsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItbGxkYi1zZXJ2ZXIvbGliL0RlYnVnZ2VyUnBjU2VydmljZUludGVyZmFjZSc7XG5cbmltcG9ydCB7cmVnaXN0ZXJPdXRwdXRXaW5kb3dMb2dnaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWNvbW1vbi9saWIvT3V0cHV0U2VydmljZU1hbmFnZXInO1xuaW1wb3J0IHtEZWJ1Z2dlclByb2Nlc3NJbmZvfSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWF0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHtMbGRiRGVidWdnZXJJbnN0YW5jZX0gZnJvbSAnLi9MbGRiRGVidWdnZXJJbnN0YW5jZSc7XG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCBjbGFzcyBBdHRhY2hQcm9jZXNzSW5mbyBleHRlbmRzIERlYnVnZ2VyUHJvY2Vzc0luZm8ge1xuICBfdGFyZ2V0SW5mbzogQXR0YWNoVGFyZ2V0SW5mbztcblxuICBjb25zdHJ1Y3Rvcih0YXJnZXRVcmk6IE51Y2xpZGVVcmksIHRhcmdldEluZm86IEF0dGFjaFRhcmdldEluZm8pIHtcbiAgICBzdXBlcignbGxkYicsIHRhcmdldFVyaSk7XG4gICAgdGhpcy5fdGFyZ2V0SW5mbyA9IHRhcmdldEluZm87XG4gIH1cblxuICBhc3luYyBkZWJ1ZygpOiBQcm9taXNlPERlYnVnZ2VySW5zdGFuY2U+IHtcbiAgICBjb25zdCBycGNTZXJ2aWNlID0gdGhpcy5fZ2V0UnBjU2VydmljZSgpO1xuICAgIGlmICh0aGlzLmJhc2VwYXRoKSB7XG4gICAgICB0aGlzLl90YXJnZXRJbmZvLmJhc2VwYXRoID0gdGhpcy5iYXNlcGF0aDtcbiAgICB9XG4gICAgcnBjU2VydmljZS5zZXRTZXR0aW5ncyh7bG9nTGV2ZWw6IGdldENvbmZpZygpLnNlcnZlckxvZ0xldmVsfSk7XG5cbiAgICBsZXQgZGVidWdTZXNzaW9uID0gbnVsbDtcbiAgICBsZXQgb3V0cHV0RGlzcG9zYWJsZSA9IHJlZ2lzdGVyT3V0cHV0V2luZG93TG9nZ2luZyhycGNTZXJ2aWNlLmdldE91dHB1dFdpbmRvd09ic2VydmFibGUoKSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBycGNTZXJ2aWNlLmF0dGFjaCh0aGlzLl90YXJnZXRJbmZvKTtcbiAgICAgIHJwY1NlcnZpY2UuZGlzcG9zZSgpO1xuICAgICAgLy8gU3RhcnQgd2Vic29ja2V0IHNlcnZlciB3aXRoIENocm9tZSBhZnRlciBhdHRhY2ggY29tcGxldGVkLlxuICAgICAgZGVidWdTZXNzaW9uID0gbmV3IExsZGJEZWJ1Z2dlckluc3RhbmNlKHRoaXMsIGNvbm5lY3Rpb24sIG91dHB1dERpc3Bvc2FibGUpO1xuICAgICAgb3V0cHV0RGlzcG9zYWJsZSA9IG51bGw7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChvdXRwdXREaXNwb3NhYmxlICE9IG51bGwpIHtcbiAgICAgICAgb3V0cHV0RGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZWJ1Z1Nlc3Npb247XG4gIH1cblxuICBfZ2V0UnBjU2VydmljZSgpOiBEZWJ1Z2dlclJwY1NlcnZpY2VUeXBlIHtcbiAgICBjb25zdCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNsaWVudCcpO1xuICAgIGNvbnN0IHNlcnZpY2UgPVxuICAgICAgZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnTExEQkRlYnVnZ2VyUnBjU2VydmljZScsIHRoaXMuZ2V0VGFyZ2V0VXJpKCkpO1xuICAgIGludmFyaWFudChzZXJ2aWNlKTtcbiAgICByZXR1cm4gbmV3IHNlcnZpY2UuRGVidWdnZXJScGNTZXJ2aWNlKCk7XG4gIH1cblxuICBnZXQgcGlkKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3RhcmdldEluZm8ucGlkO1xuICB9XG5cbiAgY29tcGFyZURldGFpbHMob3RoZXI6IERlYnVnZ2VyUHJvY2Vzc0luZm8pOiBudW1iZXIge1xuICAgIGludmFyaWFudChvdGhlciBpbnN0YW5jZW9mIEF0dGFjaFByb2Nlc3NJbmZvKTtcbiAgICByZXR1cm4gdGhpcy5kaXNwbGF5U3RyaW5nKCkgPT09IG90aGVyLmRpc3BsYXlTdHJpbmcoKVxuICAgICAgPyAodGhpcy5waWQgLSBvdGhlci5waWQpXG4gICAgICA6ICh0aGlzLmRpc3BsYXlTdHJpbmcoKSA8IG90aGVyLmRpc3BsYXlTdHJpbmcoKSkgPyAtMSA6IDE7XG4gIH1cblxuICBkaXNwbGF5U3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3RhcmdldEluZm8ubmFtZSArICcoJyArIHRoaXMuX3RhcmdldEluZm8ucGlkICsgJyknO1xuICB9XG59XG4iXX0=