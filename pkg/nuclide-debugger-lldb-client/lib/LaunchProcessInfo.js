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

var _utils = require('./utils');

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
      rpcService.setSettings({ logLevel: (0, _utils.getConfig)().serverLogLevel });

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxhdW5jaFByb2Nlc3NJbmZvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFrQnNCLFFBQVE7Ozs7bUNBQ0ksNkJBQTZCOztvQ0FDNUIsd0JBQXdCOzs0REFDakIsd0RBQXdEOztxQkFDMUUsU0FBUzs7SUFFcEIsaUJBQWlCO1lBQWpCLGlCQUFpQjs7QUFHakIsV0FIQSxpQkFBaUIsQ0FHaEIsU0FBcUIsRUFBRSxnQkFBa0MsRUFBRTswQkFINUQsaUJBQWlCOztBQUkxQiwrQkFKUyxpQkFBaUIsNkNBSXBCLE1BQU0sRUFBRSxTQUFTLEVBQUU7QUFDekIsUUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO0dBQzNDOztlQU5VLGlCQUFpQjs7NkJBUWpCLGFBQThCO0FBQ3ZDLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUN6QyxVQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDakIsWUFBSSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDO09BQ2pEO0FBQ0QsZ0JBQVUsQ0FBQyxXQUFXLENBQUMsRUFBQyxRQUFRLEVBQUUsdUJBQVcsQ0FBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDOztBQUUvRCxVQUFJLFlBQVksR0FBRyxJQUFJLENBQUM7QUFDeEIsVUFBSSxnQkFBZ0IsR0FBRywrRUFBNEIsVUFBVSxDQUFDLHlCQUF5QixFQUFFLENBQUMsQ0FBQztBQUMzRixVQUFJO0FBQ0YsWUFBTSxVQUFVLEdBQUcsTUFBTSxVQUFVLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQ25FLGtCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRXJCLG9CQUFZLEdBQUcsK0NBQXlCLElBQUksRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztBQUM1RSx3QkFBZ0IsR0FBRyxJQUFJLENBQUM7T0FDekIsU0FBUztBQUNSLFlBQUksZ0JBQWdCLElBQUksSUFBSSxFQUFFO0FBQzVCLDBCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDO1NBQzVCO09BQ0Y7QUFDRCxhQUFPLFlBQVksQ0FBQztLQUNyQjs7O1dBRWEsMEJBQTJCO3FCQUNOLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQzs7VUFBekQsc0JBQXNCLFlBQXRCLHNCQUFzQjs7QUFDN0IsVUFBTSxPQUFPLEdBQUcsc0JBQXNCLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7QUFDdEYsK0JBQVUsT0FBTyxDQUFDLENBQUM7QUFDbkIsYUFBTyxJQUFJLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0tBQ3pDOzs7U0FwQ1UsaUJBQWlCIiwiZmlsZSI6IkxhdW5jaFByb2Nlc3NJbmZvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0RlYnVnZ2VySW5zdGFuY2V9IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItYXRvbSc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtcbiAgTGF1bmNoVGFyZ2V0SW5mbyxcbiAgRGVidWdnZXJScGNTZXJ2aWNlIGFzIERlYnVnZ2VyUnBjU2VydmljZVR5cGUsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItbGxkYi1zZXJ2ZXIvbGliL0RlYnVnZ2VyUnBjU2VydmljZUludGVyZmFjZSc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCB7RGVidWdnZXJQcm9jZXNzSW5mb30gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1hdG9tJztcbmltcG9ydCB7TGxkYkRlYnVnZ2VySW5zdGFuY2V9IGZyb20gJy4vTGxkYkRlYnVnZ2VySW5zdGFuY2UnO1xuaW1wb3J0IHtyZWdpc3Rlck91dHB1dFdpbmRvd0xvZ2dpbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtZGVidWdnZXItY29tbW9uL2xpYi9PdXRwdXRTZXJ2aWNlTWFuYWdlcic7XG5pbXBvcnQge2dldENvbmZpZ30gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCBjbGFzcyBMYXVuY2hQcm9jZXNzSW5mbyBleHRlbmRzIERlYnVnZ2VyUHJvY2Vzc0luZm8ge1xuICBfbGF1bmNoVGFyZ2V0SW5mbzogTGF1bmNoVGFyZ2V0SW5mbztcblxuICBjb25zdHJ1Y3Rvcih0YXJnZXRVcmk6IE51Y2xpZGVVcmksIGxhdW5jaFRhcmdldEluZm86IExhdW5jaFRhcmdldEluZm8pIHtcbiAgICBzdXBlcignbGxkYicsIHRhcmdldFVyaSk7XG4gICAgdGhpcy5fbGF1bmNoVGFyZ2V0SW5mbyA9IGxhdW5jaFRhcmdldEluZm87XG4gIH1cblxuICBhc3luYyBkZWJ1ZygpOiBQcm9taXNlPERlYnVnZ2VySW5zdGFuY2U+IHtcbiAgICBjb25zdCBycGNTZXJ2aWNlID0gdGhpcy5fZ2V0UnBjU2VydmljZSgpO1xuICAgIGlmICh0aGlzLmJhc2VwYXRoKSB7XG4gICAgICB0aGlzLl9sYXVuY2hUYXJnZXRJbmZvLmJhc2VwYXRoID0gdGhpcy5iYXNlcGF0aDtcbiAgICB9XG4gICAgcnBjU2VydmljZS5zZXRTZXR0aW5ncyh7bG9nTGV2ZWw6IGdldENvbmZpZygpLnNlcnZlckxvZ0xldmVsfSk7XG5cbiAgICBsZXQgZGVidWdTZXNzaW9uID0gbnVsbDtcbiAgICBsZXQgb3V0cHV0RGlzcG9zYWJsZSA9IHJlZ2lzdGVyT3V0cHV0V2luZG93TG9nZ2luZyhycGNTZXJ2aWNlLmdldE91dHB1dFdpbmRvd09ic2VydmFibGUoKSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBycGNTZXJ2aWNlLmxhdW5jaCh0aGlzLl9sYXVuY2hUYXJnZXRJbmZvKTtcbiAgICAgIHJwY1NlcnZpY2UuZGlzcG9zZSgpO1xuICAgICAgLy8gU3RhcnQgd2Vic29ja2V0IHNlcnZlciB3aXRoIENocm9tZSBhZnRlciBsYXVuY2ggY29tcGxldGVkLlxuICAgICAgZGVidWdTZXNzaW9uID0gbmV3IExsZGJEZWJ1Z2dlckluc3RhbmNlKHRoaXMsIGNvbm5lY3Rpb24sIG91dHB1dERpc3Bvc2FibGUpO1xuICAgICAgb3V0cHV0RGlzcG9zYWJsZSA9IG51bGw7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChvdXRwdXREaXNwb3NhYmxlICE9IG51bGwpIHtcbiAgICAgICAgb3V0cHV0RGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkZWJ1Z1Nlc3Npb247XG4gIH1cblxuICBfZ2V0UnBjU2VydmljZSgpOiBEZWJ1Z2dlclJwY1NlcnZpY2VUeXBlIHtcbiAgICBjb25zdCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNsaWVudCcpO1xuICAgIGNvbnN0IHNlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdMTERCRGVidWdnZXJScGNTZXJ2aWNlJywgdGhpcy5nZXRUYXJnZXRVcmkoKSk7XG4gICAgaW52YXJpYW50KHNlcnZpY2UpO1xuICAgIHJldHVybiBuZXcgc2VydmljZS5EZWJ1Z2dlclJwY1NlcnZpY2UoKTtcbiAgfVxufVxuIl19