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

var _nuclideOutputLibLogTailer = require('../../nuclide-output/lib/LogTailer');

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

    this._logTailer = new _nuclideOutputLibLogTailer.LogTailer(message$, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7eUNBYXdCLG9DQUFvQzs7bUNBQzFCLHVCQUF1Qjs7bUNBQ3ZCLHVCQUF1Qjs7b0JBQ1gsTUFBTTs7a0JBQ3JDLElBQUk7Ozs7SUFFYixVQUFVO0FBSUgsV0FKUCxVQUFVLENBSUYsS0FBYyxFQUFFOzs7MEJBSnhCLFVBQVU7O0FBS1osUUFBTSxRQUFRLEdBQUcsZ0JBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQzthQUFNLDhDQUFvQiwrQ0FBcUIsQ0FBQztLQUFBLENBQUMsQ0FBQzs7QUFFdkYsUUFBSSxDQUFDLFVBQVUsR0FBRyx5Q0FBYyxRQUFRLEVBQUU7QUFDeEMsV0FBSyxFQUFFLDBCQUEwQjtBQUNqQyxVQUFJLEVBQUUseUJBQXlCO0FBQy9CLGFBQU8sRUFBRSw0QkFBNEI7QUFDckMsV0FBSyxFQUFFLDBCQUEwQjtLQUNsQyxDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLFlBQVksR0FBRyw4QkFDbEIscUJBQWUsWUFBTTtBQUFFLFlBQUssVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQUUsQ0FBQyxFQUNqRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNsQyx3Q0FBa0MsRUFBRTtlQUFNLE1BQUssVUFBVSxDQUFDLEtBQUssRUFBRTtPQUFBO0FBQ2pFLHVDQUFpQyxFQUFFO2VBQU0sTUFBSyxVQUFVLENBQUMsSUFBSSxFQUFFO09BQUE7QUFDL0QsMENBQW9DLEVBQUU7ZUFBTSxNQUFLLFVBQVUsQ0FBQyxPQUFPLEVBQUU7T0FBQTtLQUN0RSxDQUFDLENBQ0gsQ0FBQztHQUNIOztlQXRCRyxVQUFVOztXQXdCTSw4QkFBQyxHQUFrQixFQUFlO0FBQ3BELGFBQU8sR0FBRyxDQUFDLHNCQUFzQixDQUFDO0FBQ2hDLGNBQU0sRUFBRSxvQkFBb0I7QUFDNUIsZ0JBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRTtPQUN4QyxDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7U0FqQ0csVUFBVTs7O0FBb0NoQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgT3V0cHV0U2VydmljZSBmcm9tICcuLi8uLi9udWNsaWRlLW91dHB1dC9saWIvT3V0cHV0U2VydmljZSc7XG5cbmltcG9ydCB7TG9nVGFpbGVyfSBmcm9tICcuLi8uLi9udWNsaWRlLW91dHB1dC9saWIvTG9nVGFpbGVyJztcbmltcG9ydCB7Y3JlYXRlTWVzc2FnZVN0cmVhbX0gZnJvbSAnLi9jcmVhdGVNZXNzYWdlU3RyZWFtJztcbmltcG9ydCB7Y3JlYXRlUHJvY2Vzc1N0cmVhbX0gZnJvbSAnLi9jcmVhdGVQcm9jZXNzU3RyZWFtJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfbG9nVGFpbGVyOiBMb2dUYWlsZXI7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9PYmplY3QpIHtcbiAgICBjb25zdCBtZXNzYWdlJCA9IFJ4Lk9ic2VydmFibGUuZGVmZXIoKCkgPT4gY3JlYXRlTWVzc2FnZVN0cmVhbShjcmVhdGVQcm9jZXNzU3RyZWFtKCkpKTtcblxuICAgIHRoaXMuX2xvZ1RhaWxlciA9IG5ldyBMb2dUYWlsZXIobWVzc2FnZSQsIHtcbiAgICAgIHN0YXJ0OiAnaW9zLXNpbXVsYXRvci1sb2dzOnN0YXJ0JyxcbiAgICAgIHN0b3A6ICdpb3Mtc2ltdWxhdG9yLWxvZ3M6c3RvcCcsXG4gICAgICByZXN0YXJ0OiAnaW9zLXNpbXVsYXRvci1sb2dzOnJlc3RhcnQnLFxuICAgICAgZXJyb3I6ICdpb3Mtc2ltdWxhdG9yLWxvZ3M6ZXJyb3InLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdGhpcy5fbG9nVGFpbGVyLnN0b3AoKTsgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWlvcy1zaW11bGF0b3ItbG9nczpzdGFydCc6ICgpID0+IHRoaXMuX2xvZ1RhaWxlci5zdGFydCgpLFxuICAgICAgICAnbnVjbGlkZS1pb3Mtc2ltdWxhdG9yLWxvZ3M6c3RvcCc6ICgpID0+IHRoaXMuX2xvZ1RhaWxlci5zdG9wKCksXG4gICAgICAgICdudWNsaWRlLWlvcy1zaW11bGF0b3ItbG9nczpyZXN0YXJ0JzogKCkgPT4gdGhpcy5fbG9nVGFpbGVyLnJlc3RhcnQoKSxcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBjb25zdW1lT3V0cHV0U2VydmljZShhcGk6IE91dHB1dFNlcnZpY2UpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIGFwaS5yZWdpc3Rlck91dHB1dFByb3ZpZGVyKHtcbiAgICAgIHNvdXJjZTogJ2lPUyBTaW11bGF0b3IgTG9ncycsXG4gICAgICBtZXNzYWdlczogdGhpcy5fbG9nVGFpbGVyLmdldE1lc3NhZ2VzKCksXG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2YXRpb247XG4iXX0=