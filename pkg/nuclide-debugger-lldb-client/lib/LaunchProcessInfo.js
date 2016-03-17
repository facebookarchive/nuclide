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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideDebuggerAtom = require('../../nuclide-debugger-atom');

var _LldbDebuggerInstance = require('./LldbDebuggerInstance');

var _nuclideDebuggerCommonLibOutputServiceManager = require('../../nuclide-debugger-common/lib/OutputServiceManager');

var LaunchProcessInfo = (function (_DebuggerProcessInfo) {
  _inherits(LaunchProcessInfo, _DebuggerProcessInfo);

  function LaunchProcessInfo(targetUri, launchTargetInfo) {
    _classCallCheck(this, LaunchProcessInfo);

    _get(Object.getPrototypeOf(LaunchProcessInfo.prototype), 'constructor', this).call(this, 'lldb', targetUri);
    this._launchTargetInfo = launchTargetInfo;
  }

  _createClass(LaunchProcessInfo, [{
    key: 'debug',
    value: _asyncToGenerator(function* () {
      var rpcService = this._getRpcService();
      if (this.basepath) {
        this._launchTargetInfo.basepath = this.basepath;
      }

      var debugSession = null;
      var outputDisposable = (0, _nuclideDebuggerCommonLibOutputServiceManager.registerOutputWindowLogging)(rpcService.getOutputWindowObservable());
      try {
        var connection = yield rpcService.launch(this._launchTargetInfo);
        rpcService.dispose();
        // Start websocket server with Chrome after launch completed.
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
  }]);

  return LaunchProcessInfo;
})(_nuclideDebuggerAtom.DebuggerProcessInfo);

exports.LaunchProcessInfo = LaunchProcessInfo;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxhdW5jaFByb2Nlc3NJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFrQnNCLFFBQVE7Ozs7bUNBQ0ksNkJBQTZCOztvQ0FDNUIsd0JBQXdCOzs0REFDakIsd0RBQXdEOztJQUVyRixpQkFBaUI7WUFBakIsaUJBQWlCOztBQUdqQixXQUhBLGlCQUFpQixDQUdoQixTQUFxQixFQUFFLGdCQUFrQyxFQUFFOzBCQUg1RCxpQkFBaUI7O0FBSTFCLCtCQUpTLGlCQUFpQiw2Q0FJcEIsTUFBTSxFQUFFLFNBQVMsRUFBRTtBQUN6QixRQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7R0FDM0M7O2VBTlUsaUJBQWlCOzs2QkFRakIsYUFBOEI7QUFDdkMsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3pDLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7T0FDakQ7O0FBRUQsVUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFVBQUksZ0JBQWdCLEdBQUcsK0VBQTRCLFVBQVUsQ0FBQyx5QkFBeUIsRUFBRSxDQUFDLENBQUM7QUFDM0YsVUFBSTtBQUNGLFlBQU0sVUFBVSxHQUFHLE1BQU0sVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUNuRSxrQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDOztBQUVyQixvQkFBWSxHQUFHLCtDQUF5QixJQUFJLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixDQUFDLENBQUM7QUFDNUUsd0JBQWdCLEdBQUcsSUFBSSxDQUFDO09BQ3pCLFNBQVM7QUFDUixZQUFJLGdCQUFnQixJQUFJLElBQUksRUFBRTtBQUM1QiwwQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM1QjtPQUNGO0FBQ0QsYUFBTyxZQUFZLENBQUM7S0FDckI7OztXQUVhLDBCQUEyQjtxQkFDTixPQUFPLENBQUMsc0JBQXNCLENBQUM7O1VBQXpELHNCQUFzQixZQUF0QixzQkFBc0I7O0FBQzdCLFVBQU0sT0FBTyxHQUFHLHNCQUFzQixDQUFDLHdCQUF3QixFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO0FBQ3RGLCtCQUFVLE9BQU8sQ0FBQyxDQUFDO0FBQ25CLGFBQU8sSUFBSSxPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztLQUN6Qzs7O1NBbkNVLGlCQUFpQiIsImZpbGUiOiJMYXVuY2hQcm9jZXNzSW5mby5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEZWJ1Z2dlckluc3RhbmNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWF0b20nO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7XG4gIExhdW5jaFRhcmdldEluZm8sXG4gIERlYnVnZ2VyUnBjU2VydmljZSBhcyBEZWJ1Z2dlclJwY1NlcnZpY2VUeXBlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWxsZGItc2VydmVyL2xpYi9EZWJ1Z2dlclJwY1NlcnZpY2VJbnRlcmZhY2UnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQge0RlYnVnZ2VyUHJvY2Vzc0luZm99IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItYXRvbSc7XG5pbXBvcnQge0xsZGJEZWJ1Z2dlckluc3RhbmNlfSBmcm9tICcuL0xsZGJEZWJ1Z2dlckluc3RhbmNlJztcbmltcG9ydCB7cmVnaXN0ZXJPdXRwdXRXaW5kb3dMb2dnaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWNvbW1vbi9saWIvT3V0cHV0U2VydmljZU1hbmFnZXInO1xuXG5leHBvcnQgY2xhc3MgTGF1bmNoUHJvY2Vzc0luZm8gZXh0ZW5kcyBEZWJ1Z2dlclByb2Nlc3NJbmZvIHtcbiAgX2xhdW5jaFRhcmdldEluZm86IExhdW5jaFRhcmdldEluZm87XG5cbiAgY29uc3RydWN0b3IodGFyZ2V0VXJpOiBOdWNsaWRlVXJpLCBsYXVuY2hUYXJnZXRJbmZvOiBMYXVuY2hUYXJnZXRJbmZvKSB7XG4gICAgc3VwZXIoJ2xsZGInLCB0YXJnZXRVcmkpO1xuICAgIHRoaXMuX2xhdW5jaFRhcmdldEluZm8gPSBsYXVuY2hUYXJnZXRJbmZvO1xuICB9XG5cbiAgYXN5bmMgZGVidWcoKTogUHJvbWlzZTxEZWJ1Z2dlckluc3RhbmNlPiB7XG4gICAgY29uc3QgcnBjU2VydmljZSA9IHRoaXMuX2dldFJwY1NlcnZpY2UoKTtcbiAgICBpZiAodGhpcy5iYXNlcGF0aCkge1xuICAgICAgdGhpcy5fbGF1bmNoVGFyZ2V0SW5mby5iYXNlcGF0aCA9IHRoaXMuYmFzZXBhdGg7XG4gICAgfVxuXG4gICAgbGV0IGRlYnVnU2Vzc2lvbiA9IG51bGw7XG4gICAgbGV0IG91dHB1dERpc3Bvc2FibGUgPSByZWdpc3Rlck91dHB1dFdpbmRvd0xvZ2dpbmcocnBjU2VydmljZS5nZXRPdXRwdXRXaW5kb3dPYnNlcnZhYmxlKCkpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgcnBjU2VydmljZS5sYXVuY2godGhpcy5fbGF1bmNoVGFyZ2V0SW5mbyk7XG4gICAgICBycGNTZXJ2aWNlLmRpc3Bvc2UoKTtcbiAgICAgIC8vIFN0YXJ0IHdlYnNvY2tldCBzZXJ2ZXIgd2l0aCBDaHJvbWUgYWZ0ZXIgbGF1bmNoIGNvbXBsZXRlZC5cbiAgICAgIGRlYnVnU2Vzc2lvbiA9IG5ldyBMbGRiRGVidWdnZXJJbnN0YW5jZSh0aGlzLCBjb25uZWN0aW9uLCBvdXRwdXREaXNwb3NhYmxlKTtcbiAgICAgIG91dHB1dERpc3Bvc2FibGUgPSBudWxsO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpZiAob3V0cHV0RGlzcG9zYWJsZSAhPSBudWxsKSB7XG4gICAgICAgIG91dHB1dERpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVidWdTZXNzaW9uO1xuICB9XG5cbiAgX2dldFJwY1NlcnZpY2UoKTogRGVidWdnZXJScGNTZXJ2aWNlVHlwZSB7XG4gICAgY29uc3Qge2dldFNlcnZpY2VCeU51Y2xpZGVVcml9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jbGllbnQnKTtcbiAgICBjb25zdCBzZXJ2aWNlID0gZ2V0U2VydmljZUJ5TnVjbGlkZVVyaSgnTExEQkRlYnVnZ2VyUnBjU2VydmljZScsIHRoaXMuZ2V0VGFyZ2V0VXJpKCkpO1xuICAgIGludmFyaWFudChzZXJ2aWNlKTtcbiAgICByZXR1cm4gbmV3IHNlcnZpY2UuRGVidWdnZXJScGNTZXJ2aWNlKCk7XG4gIH1cbn1cbiJdfQ==