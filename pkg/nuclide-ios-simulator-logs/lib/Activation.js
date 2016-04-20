var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideConsoleLibLogTailer = require('../../nuclide-console/lib/LogTailer');

var _createMessageStream = require('./createMessageStream');

var _createProcessStream = require('./createProcessStream');

var _atom = require('atom');

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

var NOENT_ERROR_DESCRIPTION = '**Troubleshooting Tips**\n1. Make sure that syslog is installed\n2. If it is installed, update the "Path to syslog" setting in the "nuclide-ios-simulator-logs"\n   section of your Atom settings.';

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    var message$ = _reactivexRxjs2['default'].Observable.defer(function () {
      return (0, _createMessageStream.createMessageStream)((0, _createProcessStream.createProcessStream)());
    })['do']({
      error: function error(err) {
        if (err.code === 'ENOENT') {
          atom.notifications.addError("syslog wasn't found on your path!", {
            dismissable: true,
            description: NOENT_ERROR_DESCRIPTION
          });
        }
      }
    });

    this._logTailer = new _nuclideConsoleLibLogTailer.LogTailer(message$, {
      start: 'ios-simulator-logs:start',
      stop: 'ios-simulator-logs:stop',
      restart: 'ios-simulator-logs:restart',
      error: 'ios-simulator-logs:error'
    });

    this._disposables = new _atom.CompositeDisposable(new _atom.Disposable(function () {
      _this._logTailer.stop();
    }), atom.commands.add('atom-workspace', {
      'nuclide-ios-simulator-logs:start': function nuclideIosSimulatorLogsStart() {
        return _this._logTailer.start();
      },
      'nuclide-ios-simulator-logs:stop': function nuclideIosSimulatorLogsStop() {
        return _this._logTailer.stop();
      },
      'nuclide-ios-simulator-logs:restart': function nuclideIosSimulatorLogsRestart() {
        return _this._logTailer.restart();
      }
    }));
  }

  _createClass(Activation, [{
    key: 'consumeOutputService',
    value: function consumeOutputService(api) {
      return api.registerOutputProvider({
        source: 'iOS Simulator Logs',
        messages: this._logTailer.getMessages()
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return Activation;
})();

module.exports = Activation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7MENBYXdCLHFDQUFxQzs7bUNBQzNCLHVCQUF1Qjs7bUNBQ3ZCLHVCQUF1Qjs7b0JBQ1gsTUFBTTs7NkJBQ3JDLGlCQUFpQjs7OztBQUVoQyxJQUFNLHVCQUF1Qix1TUFHSyxDQUFDOztJQUU3QixVQUFVO0FBSUgsV0FKUCxVQUFVLENBSUYsS0FBYyxFQUFFOzs7MEJBSnhCLFVBQVU7O0FBS1osUUFBTSxRQUFRLEdBQUcsMkJBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQzthQUFNLDhDQUFvQiwrQ0FBcUIsQ0FBQztLQUFBLENBQUMsTUFDakYsQ0FBQztBQUNGLFdBQUssRUFBQSxlQUFDLEdBQUcsRUFBRTtBQUNULFlBQUksR0FBRyxDQUFDLElBQUksS0FBSyxRQUFRLEVBQUU7QUFDekIsY0FBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQ3pCLG1DQUFtQyxFQUNuQztBQUNFLHVCQUFXLEVBQUUsSUFBSTtBQUNqQix1QkFBVyxFQUFFLHVCQUF1QjtXQUNyQyxDQUNGLENBQUM7U0FDSDtPQUNGO0tBQ0YsQ0FBQyxDQUFDOztBQUVMLFFBQUksQ0FBQyxVQUFVLEdBQUcsMENBQWMsUUFBUSxFQUFFO0FBQ3hDLFdBQUssRUFBRSwwQkFBMEI7QUFDakMsVUFBSSxFQUFFLHlCQUF5QjtBQUMvQixhQUFPLEVBQUUsNEJBQTRCO0FBQ3JDLFdBQUssRUFBRSwwQkFBMEI7S0FDbEMsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxZQUFZLEdBQUcsOEJBQ2xCLHFCQUFlLFlBQU07QUFBRSxZQUFLLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUFFLENBQUMsRUFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDbEMsd0NBQWtDLEVBQUU7ZUFBTSxNQUFLLFVBQVUsQ0FBQyxLQUFLLEVBQUU7T0FBQTtBQUNqRSx1Q0FBaUMsRUFBRTtlQUFNLE1BQUssVUFBVSxDQUFDLElBQUksRUFBRTtPQUFBO0FBQy9ELDBDQUFvQyxFQUFFO2VBQU0sTUFBSyxVQUFVLENBQUMsT0FBTyxFQUFFO09BQUE7S0FDdEUsQ0FBQyxDQUNILENBQUM7R0FDSDs7ZUFuQ0csVUFBVTs7V0FxQ00sOEJBQUMsR0FBa0IsRUFBZTtBQUNwRCxhQUFPLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQztBQUNoQyxjQUFNLEVBQUUsb0JBQW9CO0FBQzVCLGdCQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUU7T0FDeEMsQ0FBQyxDQUFDO0tBQ0o7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1NBOUNHLFVBQVU7OztBQWlEaEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoiQWN0aXZhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIE91dHB1dFNlcnZpY2UgZnJvbSAnLi4vLi4vbnVjbGlkZS1jb25zb2xlL2xpYi9PdXRwdXRTZXJ2aWNlJztcblxuaW1wb3J0IHtMb2dUYWlsZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtY29uc29sZS9saWIvTG9nVGFpbGVyJztcbmltcG9ydCB7Y3JlYXRlTWVzc2FnZVN0cmVhbX0gZnJvbSAnLi9jcmVhdGVNZXNzYWdlU3RyZWFtJztcbmltcG9ydCB7Y3JlYXRlUHJvY2Vzc1N0cmVhbX0gZnJvbSAnLi9jcmVhdGVQcm9jZXNzU3RyZWFtJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgUnggZnJvbSAnQHJlYWN0aXZleC9yeGpzJztcblxuY29uc3QgTk9FTlRfRVJST1JfREVTQ1JJUFRJT04gPSBgKipUcm91Ymxlc2hvb3RpbmcgVGlwcyoqXG4xLiBNYWtlIHN1cmUgdGhhdCBzeXNsb2cgaXMgaW5zdGFsbGVkXG4yLiBJZiBpdCBpcyBpbnN0YWxsZWQsIHVwZGF0ZSB0aGUgXCJQYXRoIHRvIHN5c2xvZ1wiIHNldHRpbmcgaW4gdGhlIFwibnVjbGlkZS1pb3Mtc2ltdWxhdG9yLWxvZ3NcIlxuICAgc2VjdGlvbiBvZiB5b3VyIEF0b20gc2V0dGluZ3MuYDtcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2xvZ1RhaWxlcjogTG9nVGFpbGVyO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgY29uc3QgbWVzc2FnZSQgPSBSeC5PYnNlcnZhYmxlLmRlZmVyKCgpID0+IGNyZWF0ZU1lc3NhZ2VTdHJlYW0oY3JlYXRlUHJvY2Vzc1N0cmVhbSgpKSlcbiAgICAgIC5kbyh7XG4gICAgICAgIGVycm9yKGVycikge1xuICAgICAgICAgIGlmIChlcnIuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgICAgICAgXCJzeXNsb2cgd2Fzbid0IGZvdW5kIG9uIHlvdXIgcGF0aCFcIixcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBOT0VOVF9FUlJPUl9ERVNDUklQVElPTixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICB0aGlzLl9sb2dUYWlsZXIgPSBuZXcgTG9nVGFpbGVyKG1lc3NhZ2UkLCB7XG4gICAgICBzdGFydDogJ2lvcy1zaW11bGF0b3ItbG9nczpzdGFydCcsXG4gICAgICBzdG9wOiAnaW9zLXNpbXVsYXRvci1sb2dzOnN0b3AnLFxuICAgICAgcmVzdGFydDogJ2lvcy1zaW11bGF0b3ItbG9nczpyZXN0YXJ0JyxcbiAgICAgIGVycm9yOiAnaW9zLXNpbXVsYXRvci1sb2dzOmVycm9yJyxcbiAgICB9KTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRoaXMuX2xvZ1RhaWxlci5zdG9wKCk7IH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1pb3Mtc2ltdWxhdG9yLWxvZ3M6c3RhcnQnOiAoKSA9PiB0aGlzLl9sb2dUYWlsZXIuc3RhcnQoKSxcbiAgICAgICAgJ251Y2xpZGUtaW9zLXNpbXVsYXRvci1sb2dzOnN0b3AnOiAoKSA9PiB0aGlzLl9sb2dUYWlsZXIuc3RvcCgpLFxuICAgICAgICAnbnVjbGlkZS1pb3Mtc2ltdWxhdG9yLWxvZ3M6cmVzdGFydCc6ICgpID0+IHRoaXMuX2xvZ1RhaWxlci5yZXN0YXJ0KCksXG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgY29uc3VtZU91dHB1dFNlcnZpY2UoYXBpOiBPdXRwdXRTZXJ2aWNlKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiBhcGkucmVnaXN0ZXJPdXRwdXRQcm92aWRlcih7XG4gICAgICBzb3VyY2U6ICdpT1MgU2ltdWxhdG9yIExvZ3MnLFxuICAgICAgbWVzc2FnZXM6IHRoaXMuX2xvZ1RhaWxlci5nZXRNZXNzYWdlcygpLFxuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBY3RpdmF0aW9uO1xuIl19