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

var _createProcessStream = require('./createProcessStream');

var _createMessageStream = require('./createMessageStream');

var _createMessageStream2 = _interopRequireDefault(_createMessageStream);

var _outputLibLogTailer = require('../../output/lib/LogTailer');

var _atom = require('atom');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    var message$ = _rx2['default'].Observable.defer(function () {
      return (0, _createMessageStream2['default'])((0, _createProcessStream.createProcessStream)().retry(3).tapOnError(function () {
        atom.notifications.addError('adb logcat has crashed 3 times.' + ' You can manually restart it using the "Nuclide Adb Logcat: Start" command.');
      }));
    });

    this._logTailer = new _outputLibLogTailer.LogTailer(message$, {
      start: 'adb-logcat:start',
      stop: 'adb-logcat:stop',
      restart: 'adb-logcat:restart',
      error: 'adb-logcat:crash'
    });

    this._disposables = new _atom.CompositeDisposable(new _atom.Disposable(function () {
      _this._logTailer.stop();
    }), atom.commands.add('atom-workspace', {
      'nuclide-adb-logcat:start': function nuclideAdbLogcatStart() {
        return _this._logTailer.start();
      },
      'nuclide-adb-logcat:stop': function nuclideAdbLogcatStop() {
        return _this._logTailer.stop();
      },
      'nuclide-adb-logcat:restart': function nuclideAdbLogcatRestart() {
        return _this._logTailer.restart();
      }
    }));
  }

  _createClass(Activation, [{
    key: 'consumeOutputService',
    value: function consumeOutputService(api) {
      return api.registerOutputProvider({
        source: 'adb logcat',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7bUNBYWtDLHVCQUF1Qjs7bUNBQ3pCLHVCQUF1Qjs7OztrQ0FDL0IsNEJBQTRCOztvQkFDTixNQUFNOztrQkFDckMsSUFBSTs7OztJQUViLFVBQVU7QUFJSCxXQUpQLFVBQVUsQ0FJRixLQUFjLEVBQUU7OzswQkFKeEIsVUFBVTs7QUFLWixRQUFNLFFBQVEsR0FBRyxnQkFBRyxVQUFVLENBQUMsS0FBSyxDQUFDO2FBQ25DLHNDQUNFLCtDQUFxQixDQUNsQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQ1IsVUFBVSxDQUFDLFlBQU07QUFDaEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQ3pCLGlDQUFpQyxHQUMvQiw2RUFBNkUsQ0FDaEYsQ0FBQztPQUNILENBQUMsQ0FDTDtLQUFBLENBQ0YsQ0FBQzs7QUFFRixRQUFJLENBQUMsVUFBVSxHQUFHLGtDQUFjLFFBQVEsRUFBRTtBQUN4QyxXQUFLLEVBQUUsa0JBQWtCO0FBQ3pCLFVBQUksRUFBRSxpQkFBaUI7QUFDdkIsYUFBTyxFQUFFLG9CQUFvQjtBQUM3QixXQUFLLEVBQUUsa0JBQWtCO0tBQzFCLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsWUFBWSxHQUFHLDhCQUNsQixxQkFBZSxZQUFNO0FBQUUsWUFBSyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7S0FBRSxDQUFDLEVBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLGdDQUEwQixFQUFFO2VBQU0sTUFBSyxVQUFVLENBQUMsS0FBSyxFQUFFO09BQUE7QUFDekQsK0JBQXlCLEVBQUU7ZUFBTSxNQUFLLFVBQVUsQ0FBQyxJQUFJLEVBQUU7T0FBQTtBQUN2RCxrQ0FBNEIsRUFBRTtlQUFNLE1BQUssVUFBVSxDQUFDLE9BQU8sRUFBRTtPQUFBO0tBQzlELENBQUMsQ0FDSCxDQUFDO0dBQ0g7O2VBakNHLFVBQVU7O1dBbUNNLDhCQUFDLEdBQWtCLEVBQWU7QUFDcEQsYUFBTyxHQUFHLENBQUMsc0JBQXNCLENBQUM7QUFDaEMsY0FBTSxFQUFFLFlBQVk7QUFDcEIsZ0JBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRTtPQUN4QyxDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7U0E1Q0csVUFBVTs7O0FBK0NoQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgT3V0cHV0U2VydmljZSBmcm9tICcuLi8uLi9vdXRwdXQvbGliL091dHB1dFNlcnZpY2UnO1xuXG5pbXBvcnQge2NyZWF0ZVByb2Nlc3NTdHJlYW19IGZyb20gJy4vY3JlYXRlUHJvY2Vzc1N0cmVhbSc7XG5pbXBvcnQgY3JlYXRlTWVzc2FnZVN0cmVhbSBmcm9tICcuL2NyZWF0ZU1lc3NhZ2VTdHJlYW0nO1xuaW1wb3J0IHtMb2dUYWlsZXJ9IGZyb20gJy4uLy4uL291dHB1dC9saWIvTG9nVGFpbGVyJztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgUnggZnJvbSAncngnO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfbG9nVGFpbGVyOiBMb2dUYWlsZXI7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9PYmplY3QpIHtcbiAgICBjb25zdCBtZXNzYWdlJCA9IFJ4Lk9ic2VydmFibGUuZGVmZXIoKCkgPT5cbiAgICAgIGNyZWF0ZU1lc3NhZ2VTdHJlYW0oXG4gICAgICAgIGNyZWF0ZVByb2Nlc3NTdHJlYW0oKVxuICAgICAgICAgIC5yZXRyeSgzKVxuICAgICAgICAgIC50YXBPbkVycm9yKCgpID0+IHtcbiAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihcbiAgICAgICAgICAgICAgJ2FkYiBsb2djYXQgaGFzIGNyYXNoZWQgMyB0aW1lcy4nXG4gICAgICAgICAgICAgICsgJyBZb3UgY2FuIG1hbnVhbGx5IHJlc3RhcnQgaXQgdXNpbmcgdGhlIFwiTnVjbGlkZSBBZGIgTG9nY2F0OiBTdGFydFwiIGNvbW1hbmQuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KVxuICAgICAgKVxuICAgICk7XG5cbiAgICB0aGlzLl9sb2dUYWlsZXIgPSBuZXcgTG9nVGFpbGVyKG1lc3NhZ2UkLCB7XG4gICAgICBzdGFydDogJ2FkYi1sb2djYXQ6c3RhcnQnLFxuICAgICAgc3RvcDogJ2FkYi1sb2djYXQ6c3RvcCcsXG4gICAgICByZXN0YXJ0OiAnYWRiLWxvZ2NhdDpyZXN0YXJ0JyxcbiAgICAgIGVycm9yOiAnYWRiLWxvZ2NhdDpjcmFzaCcsXG4gICAgfSk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4geyB0aGlzLl9sb2dUYWlsZXIuc3RvcCgpOyB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtYWRiLWxvZ2NhdDpzdGFydCc6ICgpID0+IHRoaXMuX2xvZ1RhaWxlci5zdGFydCgpLFxuICAgICAgICAnbnVjbGlkZS1hZGItbG9nY2F0OnN0b3AnOiAoKSA9PiB0aGlzLl9sb2dUYWlsZXIuc3RvcCgpLFxuICAgICAgICAnbnVjbGlkZS1hZGItbG9nY2F0OnJlc3RhcnQnOiAoKSA9PiB0aGlzLl9sb2dUYWlsZXIucmVzdGFydCgpLFxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN1bWVPdXRwdXRTZXJ2aWNlKGFwaTogT3V0cHV0U2VydmljZSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gYXBpLnJlZ2lzdGVyT3V0cHV0UHJvdmlkZXIoe1xuICAgICAgc291cmNlOiAnYWRiIGxvZ2NhdCcsXG4gICAgICBtZXNzYWdlczogdGhpcy5fbG9nVGFpbGVyLmdldE1lc3NhZ2VzKCksXG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2YXRpb247XG4iXX0=