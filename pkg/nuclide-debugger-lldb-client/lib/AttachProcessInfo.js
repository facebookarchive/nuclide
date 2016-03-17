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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkF0dGFjaFByb2Nlc3NJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0REFtQjBDLHdEQUF3RDs7bUNBQ2hFLDZCQUE2Qjs7c0JBQ3pDLFFBQVE7Ozs7b0NBQ0ssd0JBQXdCOztJQUU5QyxpQkFBaUI7WUFBakIsaUJBQWlCOztBQUdqQixXQUhBLGlCQUFpQixDQUdoQixTQUFxQixFQUFFLFVBQTRCLEVBQUU7MEJBSHRELGlCQUFpQjs7QUFJMUIsK0JBSlMsaUJBQWlCLDZDQUlwQixNQUFNLEVBQUUsU0FBUyxFQUFFO0FBQ3pCLFFBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO0dBQy9COztlQU5VLGlCQUFpQjs7NkJBUWpCLGFBQThCO0FBQ3ZDLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN6QyxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztPQUMzQzs7QUFFRCxVQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDeEIsVUFBSSxnQkFBZ0IsR0FBRywrRUFBNEIsVUFBVSxDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQztBQUMzRixVQUFJO0FBQ0YsWUFBTSxVQUFVLEdBQUcsTUFBTSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUM3RCxrQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVyQixvQkFBWSxHQUFHLCtDQUF5QixJQUFJLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixDQUFDLENBQUM7QUFDNUUsd0JBQWdCLEdBQUcsSUFBSSxDQUFDO09BQ3pCLFNBQVM7QUFDUixZQUFJLGdCQUFnQixJQUFJLElBQUksRUFBRTtBQUM1QiwwQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM1QjtPQUNGO0FBQ0QsYUFBTyxZQUFZLENBQUM7S0FDckI7OztXQUVhLDBCQUEyQjtxQkFDTixPQUFPLENBQUMsc0JBQXNCLENBQUM7O1VBQXpELHNCQUFzQixZQUF0QixzQkFBc0I7O0FBQzdCLFVBQU0sT0FBTyxHQUNYLHNCQUFzQixDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQ3hFLCtCQUFVLE9BQU8sQ0FBQyxDQUFDO0FBQ25CLGFBQU8sSUFBSSxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztLQUN6Qzs7O1dBTWEsd0JBQUMsS0FBMEIsRUFBVTtBQUNqRCwrQkFBVSxLQUFLLFlBQVksaUJBQWlCLENBQUMsQ0FBQztBQUM5QyxhQUFPLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxLQUFLLENBQUMsYUFBYSxFQUFFLEdBQ2hELElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsR0FDckIsQUFBQyxJQUFJLENBQUMsYUFBYSxFQUFFLEdBQUcsS0FBSyxDQUFDLGFBQWEsRUFBRSxHQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUM3RDs7O1dBRVkseUJBQVc7QUFDdEIsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO0tBQ2pFOzs7U0FiTSxlQUFXO0FBQ2hCLGFBQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7S0FDN0I7OztTQXhDVSxpQkFBaUIiLCJmaWxlIjoiQXR0YWNoUHJvY2Vzc0luZm8uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5cbmltcG9ydCB0eXBlIHtEZWJ1Z2dlckluc3RhbmNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWF0b20nO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7XG4gIEF0dGFjaFRhcmdldEluZm8sXG4gIERlYnVnZ2VyUnBjU2VydmljZSBhcyBEZWJ1Z2dlclJwY1NlcnZpY2VUeXBlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWxsZGItc2VydmVyL2xpYi9EZWJ1Z2dlclJwY1NlcnZpY2VJbnRlcmZhY2UnO1xuXG5pbXBvcnQge3JlZ2lzdGVyT3V0cHV0V2luZG93TG9nZ2luZ30gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1jb21tb24vbGliL091dHB1dFNlcnZpY2VNYW5hZ2VyJztcbmltcG9ydCB7RGVidWdnZXJQcm9jZXNzSW5mb30gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1hdG9tJztcbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7TGxkYkRlYnVnZ2VySW5zdGFuY2V9IGZyb20gJy4vTGxkYkRlYnVnZ2VySW5zdGFuY2UnO1xuXG5leHBvcnQgY2xhc3MgQXR0YWNoUHJvY2Vzc0luZm8gZXh0ZW5kcyBEZWJ1Z2dlclByb2Nlc3NJbmZvIHtcbiAgX3RhcmdldEluZm86IEF0dGFjaFRhcmdldEluZm87XG5cbiAgY29uc3RydWN0b3IodGFyZ2V0VXJpOiBOdWNsaWRlVXJpLCB0YXJnZXRJbmZvOiBBdHRhY2hUYXJnZXRJbmZvKSB7XG4gICAgc3VwZXIoJ2xsZGInLCB0YXJnZXRVcmkpO1xuICAgIHRoaXMuX3RhcmdldEluZm8gPSB0YXJnZXRJbmZvO1xuICB9XG5cbiAgYXN5bmMgZGVidWcoKTogUHJvbWlzZTxEZWJ1Z2dlckluc3RhbmNlPiB7XG4gICAgY29uc3QgcnBjU2VydmljZSA9IHRoaXMuX2dldFJwY1NlcnZpY2UoKTtcbiAgICBpZiAodGhpcy5iYXNlcGF0aCkge1xuICAgICAgdGhpcy5fdGFyZ2V0SW5mby5iYXNlcGF0aCA9IHRoaXMuYmFzZXBhdGg7XG4gICAgfVxuXG4gICAgbGV0IGRlYnVnU2Vzc2lvbiA9IG51bGw7XG4gICAgbGV0IG91dHB1dERpc3Bvc2FibGUgPSByZWdpc3Rlck91dHB1dFdpbmRvd0xvZ2dpbmcocnBjU2VydmljZS5nZXRPdXRwdXRXaW5kb3dPYnNlcnZhYmxlKCkpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgcnBjU2VydmljZS5hdHRhY2godGhpcy5fdGFyZ2V0SW5mbyk7XG4gICAgICBycGNTZXJ2aWNlLmRpc3Bvc2UoKTtcbiAgICAgIC8vIFN0YXJ0IHdlYnNvY2tldCBzZXJ2ZXIgd2l0aCBDaHJvbWUgYWZ0ZXIgYXR0YWNoIGNvbXBsZXRlZC5cbiAgICAgIGRlYnVnU2Vzc2lvbiA9IG5ldyBMbGRiRGVidWdnZXJJbnN0YW5jZSh0aGlzLCBjb25uZWN0aW9uLCBvdXRwdXREaXNwb3NhYmxlKTtcbiAgICAgIG91dHB1dERpc3Bvc2FibGUgPSBudWxsO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAob3V0cHV0RGlzcG9zYWJsZSAhPSBudWxsKSB7XG4gICAgICAgIG91dHB1dERpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVidWdTZXNzaW9uO1xuICB9XG5cbiAgX2dldFJwY1NlcnZpY2UoKTogRGVidWdnZXJScGNTZXJ2aWNlVHlwZSB7XG4gICAgY29uc3Qge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jbGllbnQnKTtcbiAgICBjb25zdCBzZXJ2aWNlID1cbiAgICAgIGdldFNlcnZpY2VCeU51Y2xpZGVVcmkoJ0xMREJEZWJ1Z2dlclJwY1NlcnZpY2UnLCB0aGlzLmdldFRhcmdldFVyaSgpKTtcbiAgICBpbnZhcmlhbnQoc2VydmljZSk7XG4gICAgcmV0dXJuIG5ldyBzZXJ2aWNlLkRlYnVnZ2VyUnBjU2VydmljZSgpO1xuICB9XG5cbiAgZ2V0IHBpZCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLl90YXJnZXRJbmZvLnBpZDtcbiAgfVxuXG4gIGNvbXBhcmVEZXRhaWxzKG90aGVyOiBEZWJ1Z2dlclByb2Nlc3NJbmZvKTogbnVtYmVyIHtcbiAgICBpbnZhcmlhbnQob3RoZXIgaW5zdGFuY2VvZiBBdHRhY2hQcm9jZXNzSW5mbyk7XG4gICAgcmV0dXJuIHRoaXMuZGlzcGxheVN0cmluZygpID09PSBvdGhlci5kaXNwbGF5U3RyaW5nKClcbiAgICAgID8gKHRoaXMucGlkIC0gb3RoZXIucGlkKVxuICAgICAgOiAodGhpcy5kaXNwbGF5U3RyaW5nKCkgPCBvdGhlci5kaXNwbGF5U3RyaW5nKCkpID8gLTEgOiAxO1xuICB9XG5cbiAgZGlzcGxheVN0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl90YXJnZXRJbmZvLm5hbWUgKyAnKCcgKyB0aGlzLl90YXJnZXRJbmZvLnBpZCArICcpJztcbiAgfVxufVxuIl19