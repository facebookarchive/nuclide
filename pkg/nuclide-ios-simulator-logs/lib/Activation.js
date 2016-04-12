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

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var NOENT_ERROR_DESCRIPTION = '**Troubleshooting Tips**\n1. Make sure that syslog is installed\n2. If it is installed, update the "Path to syslog" setting in the "nuclide-ios-simulator-logs"\n   section of your Atom settings.';

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    var message$ = _rx2['default'].Observable.defer(function () {
      return (0, _createMessageStream.createMessageStream)((0, _createProcessStream.createProcessStream)());
    }).tapOnError(function (err) {
      if (err.code === 'ENOENT') {
        atom.notifications.addError("syslog wasn't found on your path!", {
          dismissable: true,
          description: NOENT_ERROR_DESCRIPTION
        });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7MENBYXdCLHFDQUFxQzs7bUNBQzNCLHVCQUF1Qjs7bUNBQ3ZCLHVCQUF1Qjs7b0JBQ1gsTUFBTTs7a0JBQ3JDLElBQUk7Ozs7QUFFbkIsSUFBTSx1QkFBdUIsdU1BR0ssQ0FBQzs7SUFFN0IsVUFBVTtBQUlILFdBSlAsVUFBVSxDQUlGLEtBQWMsRUFBRTs7OzBCQUp4QixVQUFVOztBQUtaLFFBQU0sUUFBUSxHQUFHLGdCQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7YUFBTSw4Q0FBb0IsK0NBQXFCLENBQUM7S0FBQSxDQUFDLENBQ25GLFVBQVUsQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUNqQixVQUFJLEdBQUcsQ0FBQyxJQUFJLEtBQUssUUFBUSxFQUFFO0FBQ3pCLFlBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUN6QixtQ0FBbUMsRUFDbkM7QUFDRSxxQkFBVyxFQUFFLElBQUk7QUFDakIscUJBQVcsRUFBRSx1QkFBdUI7U0FDckMsQ0FDRixDQUFDO09BQ0g7S0FDRixDQUFDLENBQUM7O0FBRUwsUUFBSSxDQUFDLFVBQVUsR0FBRywwQ0FBYyxRQUFRLEVBQUU7QUFDeEMsV0FBSyxFQUFFLDBCQUEwQjtBQUNqQyxVQUFJLEVBQUUseUJBQXlCO0FBQy9CLGFBQU8sRUFBRSw0QkFBNEI7QUFDckMsV0FBSyxFQUFFLDBCQUEwQjtLQUNsQyxDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLFlBQVksR0FBRyw4QkFDbEIscUJBQWUsWUFBTTtBQUFFLFlBQUssVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQUUsQ0FBQyxFQUNqRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNsQyx3Q0FBa0MsRUFBRTtlQUFNLE1BQUssVUFBVSxDQUFDLEtBQUssRUFBRTtPQUFBO0FBQ2pFLHVDQUFpQyxFQUFFO2VBQU0sTUFBSyxVQUFVLENBQUMsSUFBSSxFQUFFO09BQUE7QUFDL0QsMENBQW9DLEVBQUU7ZUFBTSxNQUFLLFVBQVUsQ0FBQyxPQUFPLEVBQUU7T0FBQTtLQUN0RSxDQUFDLENBQ0gsQ0FBQztHQUNIOztlQWpDRyxVQUFVOztXQW1DTSw4QkFBQyxHQUFrQixFQUFlO0FBQ3BELGFBQU8sR0FBRyxDQUFDLHNCQUFzQixDQUFDO0FBQ2hDLGNBQU0sRUFBRSxvQkFBb0I7QUFDNUIsZ0JBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRTtPQUN4QyxDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7U0E1Q0csVUFBVTs7O0FBK0NoQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgT3V0cHV0U2VydmljZSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbnNvbGUvbGliL091dHB1dFNlcnZpY2UnO1xuXG5pbXBvcnQge0xvZ1RhaWxlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb25zb2xlL2xpYi9Mb2dUYWlsZXInO1xuaW1wb3J0IHtjcmVhdGVNZXNzYWdlU3RyZWFtfSBmcm9tICcuL2NyZWF0ZU1lc3NhZ2VTdHJlYW0nO1xuaW1wb3J0IHtjcmVhdGVQcm9jZXNzU3RyZWFtfSBmcm9tICcuL2NyZWF0ZVByb2Nlc3NTdHJlYW0nO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbmNvbnN0IE5PRU5UX0VSUk9SX0RFU0NSSVBUSU9OID0gYCoqVHJvdWJsZXNob290aW5nIFRpcHMqKlxuMS4gTWFrZSBzdXJlIHRoYXQgc3lzbG9nIGlzIGluc3RhbGxlZFxuMi4gSWYgaXQgaXMgaW5zdGFsbGVkLCB1cGRhdGUgdGhlIFwiUGF0aCB0byBzeXNsb2dcIiBzZXR0aW5nIGluIHRoZSBcIm51Y2xpZGUtaW9zLXNpbXVsYXRvci1sb2dzXCJcbiAgIHNlY3Rpb24gb2YgeW91ciBBdG9tIHNldHRpbmdzLmA7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9sb2dUYWlsZXI6IExvZ1RhaWxlcjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP09iamVjdCkge1xuICAgIGNvbnN0IG1lc3NhZ2UkID0gUnguT2JzZXJ2YWJsZS5kZWZlcigoKSA9PiBjcmVhdGVNZXNzYWdlU3RyZWFtKGNyZWF0ZVByb2Nlc3NTdHJlYW0oKSkpXG4gICAgICAudGFwT25FcnJvcihlcnIgPT4ge1xuICAgICAgICBpZiAoZXJyLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgXCJzeXNsb2cgd2Fzbid0IGZvdW5kIG9uIHlvdXIgcGF0aCFcIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBOT0VOVF9FUlJPUl9ERVNDUklQVElPTixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICB0aGlzLl9sb2dUYWlsZXIgPSBuZXcgTG9nVGFpbGVyKG1lc3NhZ2UkLCB7XG4gICAgICBzdGFydDogJ2lvcy1zaW11bGF0b3ItbG9nczpzdGFydCcsXG4gICAgICBzdG9wOiAnaW9zLXNpbXVsYXRvci1sb2dzOnN0b3AnLFxuICAgICAgcmVzdGFydDogJ2lvcy1zaW11bGF0b3ItbG9nczpyZXN0YXJ0JyxcbiAgICAgIGVycm9yOiAnaW9zLXNpbXVsYXRvci1sb2dzOmVycm9yJyxcbiAgICB9KTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRoaXMuX2xvZ1RhaWxlci5zdG9wKCk7IH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1pb3Mtc2ltdWxhdG9yLWxvZ3M6c3RhcnQnOiAoKSA9PiB0aGlzLl9sb2dUYWlsZXIuc3RhcnQoKSxcbiAgICAgICAgJ251Y2xpZGUtaW9zLXNpbXVsYXRvci1sb2dzOnN0b3AnOiAoKSA9PiB0aGlzLl9sb2dUYWlsZXIuc3RvcCgpLFxuICAgICAgICAnbnVjbGlkZS1pb3Mtc2ltdWxhdG9yLWxvZ3M6cmVzdGFydCc6ICgpID0+IHRoaXMuX2xvZ1RhaWxlci5yZXN0YXJ0KCksXG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgY29uc3VtZU91dHB1dFNlcnZpY2UoYXBpOiBPdXRwdXRTZXJ2aWNlKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiBhcGkucmVnaXN0ZXJPdXRwdXRQcm92aWRlcih7XG4gICAgICBzb3VyY2U6ICdpT1MgU2ltdWxhdG9yIExvZ3MnLFxuICAgICAgbWVzc2FnZXM6IHRoaXMuX2xvZ1RhaWxlci5nZXRNZXNzYWdlcygpLFxuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBY3RpdmF0aW9uO1xuIl19