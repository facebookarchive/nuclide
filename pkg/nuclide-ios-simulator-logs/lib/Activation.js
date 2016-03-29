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

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    var message$ = _rx2['default'].Observable.defer(function () {
      return (0, _createMessageStream.createMessageStream)((0, _createProcessStream.createProcessStream)());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7MENBYXdCLHFDQUFxQzs7bUNBQzNCLHVCQUF1Qjs7bUNBQ3ZCLHVCQUF1Qjs7b0JBQ1gsTUFBTTs7a0JBQ3JDLElBQUk7Ozs7SUFFYixVQUFVO0FBSUgsV0FKUCxVQUFVLENBSUYsS0FBYyxFQUFFOzs7MEJBSnhCLFVBQVU7O0FBS1osUUFBTSxRQUFRLEdBQUcsZ0JBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQzthQUFNLDhDQUFvQiwrQ0FBcUIsQ0FBQztLQUFBLENBQUMsQ0FBQzs7QUFFdkYsUUFBSSxDQUFDLFVBQVUsR0FBRywwQ0FBYyxRQUFRLEVBQUU7QUFDeEMsV0FBSyxFQUFFLDBCQUEwQjtBQUNqQyxVQUFJLEVBQUUseUJBQXlCO0FBQy9CLGFBQU8sRUFBRSw0QkFBNEI7QUFDckMsV0FBSyxFQUFFLDBCQUEwQjtLQUNsQyxDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLFlBQVksR0FBRyw4QkFDbEIscUJBQWUsWUFBTTtBQUFFLFlBQUssVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQUUsQ0FBQyxFQUNqRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNsQyx3Q0FBa0MsRUFBRTtlQUFNLE1BQUssVUFBVSxDQUFDLEtBQUssRUFBRTtPQUFBO0FBQ2pFLHVDQUFpQyxFQUFFO2VBQU0sTUFBSyxVQUFVLENBQUMsSUFBSSxFQUFFO09BQUE7QUFDL0QsMENBQW9DLEVBQUU7ZUFBTSxNQUFLLFVBQVUsQ0FBQyxPQUFPLEVBQUU7T0FBQTtLQUN0RSxDQUFDLENBQ0gsQ0FBQztHQUNIOztlQXRCRyxVQUFVOztXQXdCTSw4QkFBQyxHQUFrQixFQUFlO0FBQ3BELGFBQU8sR0FBRyxDQUFDLHNCQUFzQixDQUFDO0FBQ2hDLGNBQU0sRUFBRSxvQkFBb0I7QUFDNUIsZ0JBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRTtPQUN4QyxDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7U0FqQ0csVUFBVTs7O0FBb0NoQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgT3V0cHV0U2VydmljZSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbnNvbGUvbGliL091dHB1dFNlcnZpY2UnO1xuXG5pbXBvcnQge0xvZ1RhaWxlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb25zb2xlL2xpYi9Mb2dUYWlsZXInO1xuaW1wb3J0IHtjcmVhdGVNZXNzYWdlU3RyZWFtfSBmcm9tICcuL2NyZWF0ZU1lc3NhZ2VTdHJlYW0nO1xuaW1wb3J0IHtjcmVhdGVQcm9jZXNzU3RyZWFtfSBmcm9tICcuL2NyZWF0ZVByb2Nlc3NTdHJlYW0nO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbmNsYXNzIEFjdGl2YXRpb24ge1xuICBfZGlzcG9zYWJsZXM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9sb2dUYWlsZXI6IExvZ1RhaWxlcjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP09iamVjdCkge1xuICAgIGNvbnN0IG1lc3NhZ2UkID0gUnguT2JzZXJ2YWJsZS5kZWZlcigoKSA9PiBjcmVhdGVNZXNzYWdlU3RyZWFtKGNyZWF0ZVByb2Nlc3NTdHJlYW0oKSkpO1xuXG4gICAgdGhpcy5fbG9nVGFpbGVyID0gbmV3IExvZ1RhaWxlcihtZXNzYWdlJCwge1xuICAgICAgc3RhcnQ6ICdpb3Mtc2ltdWxhdG9yLWxvZ3M6c3RhcnQnLFxuICAgICAgc3RvcDogJ2lvcy1zaW11bGF0b3ItbG9nczpzdG9wJyxcbiAgICAgIHJlc3RhcnQ6ICdpb3Mtc2ltdWxhdG9yLWxvZ3M6cmVzdGFydCcsXG4gICAgICBlcnJvcjogJ2lvcy1zaW11bGF0b3ItbG9nczplcnJvcicsXG4gICAgfSk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4geyB0aGlzLl9sb2dUYWlsZXIuc3RvcCgpOyB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtaW9zLXNpbXVsYXRvci1sb2dzOnN0YXJ0JzogKCkgPT4gdGhpcy5fbG9nVGFpbGVyLnN0YXJ0KCksXG4gICAgICAgICdudWNsaWRlLWlvcy1zaW11bGF0b3ItbG9nczpzdG9wJzogKCkgPT4gdGhpcy5fbG9nVGFpbGVyLnN0b3AoKSxcbiAgICAgICAgJ251Y2xpZGUtaW9zLXNpbXVsYXRvci1sb2dzOnJlc3RhcnQnOiAoKSA9PiB0aGlzLl9sb2dUYWlsZXIucmVzdGFydCgpLFxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN1bWVPdXRwdXRTZXJ2aWNlKGFwaTogT3V0cHV0U2VydmljZSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gYXBpLnJlZ2lzdGVyT3V0cHV0UHJvdmlkZXIoe1xuICAgICAgc291cmNlOiAnaU9TIFNpbXVsYXRvciBMb2dzJyxcbiAgICAgIG1lc3NhZ2VzOiB0aGlzLl9sb2dUYWlsZXIuZ2V0TWVzc2FnZXMoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQWN0aXZhdGlvbjtcbiJdfQ==