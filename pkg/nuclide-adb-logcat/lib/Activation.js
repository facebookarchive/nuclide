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

var _nuclideOutputLibLogTailer = require('../../nuclide-output/lib/LogTailer');

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

    this._logTailer = new _nuclideOutputLibLogTailer.LogTailer(message$, {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7bUNBYWtDLHVCQUF1Qjs7bUNBQ3pCLHVCQUF1Qjs7Ozt5Q0FDL0Isb0NBQW9DOztvQkFDZCxNQUFNOztrQkFDckMsSUFBSTs7OztJQUViLFVBQVU7QUFJSCxXQUpQLFVBQVUsQ0FJRixLQUFjLEVBQUU7OzswQkFKeEIsVUFBVTs7QUFLWixRQUFNLFFBQVEsR0FBRyxnQkFBRyxVQUFVLENBQUMsS0FBSyxDQUFDO2FBQ25DLHNDQUNFLCtDQUFxQixDQUNsQixLQUFLLENBQUMsQ0FBQyxDQUFDLENBQ1IsVUFBVSxDQUFDLFlBQU07QUFDaEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQ3pCLGlDQUFpQyxHQUMvQiw2RUFBNkUsQ0FDaEYsQ0FBQztPQUNILENBQUMsQ0FDTDtLQUFBLENBQ0YsQ0FBQzs7QUFFRixRQUFJLENBQUMsVUFBVSxHQUFHLHlDQUFjLFFBQVEsRUFBRTtBQUN4QyxXQUFLLEVBQUUsa0JBQWtCO0FBQ3pCLFVBQUksRUFBRSxpQkFBaUI7QUFDdkIsYUFBTyxFQUFFLG9CQUFvQjtBQUM3QixXQUFLLEVBQUUsa0JBQWtCO0tBQzFCLENBQUMsQ0FBQzs7QUFFSCxRQUFJLENBQUMsWUFBWSxHQUFHLDhCQUNsQixxQkFBZSxZQUFNO0FBQUUsWUFBSyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUM7S0FBRSxDQUFDLEVBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFO0FBQ2xDLGdDQUEwQixFQUFFO2VBQU0sTUFBSyxVQUFVLENBQUMsS0FBSyxFQUFFO09BQUE7QUFDekQsK0JBQXlCLEVBQUU7ZUFBTSxNQUFLLFVBQVUsQ0FBQyxJQUFJLEVBQUU7T0FBQTtBQUN2RCxrQ0FBNEIsRUFBRTtlQUFNLE1BQUssVUFBVSxDQUFDLE9BQU8sRUFBRTtPQUFBO0tBQzlELENBQUMsQ0FDSCxDQUFDO0dBQ0g7O2VBakNHLFVBQVU7O1dBbUNNLDhCQUFDLEdBQWtCLEVBQWU7QUFDcEQsYUFBTyxHQUFHLENBQUMsc0JBQXNCLENBQUM7QUFDaEMsY0FBTSxFQUFFLFlBQVk7QUFDcEIsZ0JBQVEsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRTtPQUN4QyxDQUFDLENBQUM7S0FDSjs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7U0E1Q0csVUFBVTs7O0FBK0NoQixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsQ0FBQyIsImZpbGUiOiJBY3RpdmF0aW9uLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUgT3V0cHV0U2VydmljZSBmcm9tICcuLi8uLi9udWNsaWRlLW91dHB1dC9saWIvT3V0cHV0U2VydmljZSc7XG5cbmltcG9ydCB7Y3JlYXRlUHJvY2Vzc1N0cmVhbX0gZnJvbSAnLi9jcmVhdGVQcm9jZXNzU3RyZWFtJztcbmltcG9ydCBjcmVhdGVNZXNzYWdlU3RyZWFtIGZyb20gJy4vY3JlYXRlTWVzc2FnZVN0cmVhbSc7XG5pbXBvcnQge0xvZ1RhaWxlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1vdXRwdXQvbGliL0xvZ1RhaWxlcic7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFJ4IGZyb20gJ3J4JztcblxuY2xhc3MgQWN0aXZhdGlvbiB7XG4gIF9kaXNwb3NhYmxlczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX2xvZ1RhaWxlcjogTG9nVGFpbGVyO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/T2JqZWN0KSB7XG4gICAgY29uc3QgbWVzc2FnZSQgPSBSeC5PYnNlcnZhYmxlLmRlZmVyKCgpID0+XG4gICAgICBjcmVhdGVNZXNzYWdlU3RyZWFtKFxuICAgICAgICBjcmVhdGVQcm9jZXNzU3RyZWFtKClcbiAgICAgICAgICAucmV0cnkoMylcbiAgICAgICAgICAudGFwT25FcnJvcigoKSA9PiB7XG4gICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoXG4gICAgICAgICAgICAgICdhZGIgbG9nY2F0IGhhcyBjcmFzaGVkIDMgdGltZXMuJ1xuICAgICAgICAgICAgICArICcgWW91IGNhbiBtYW51YWxseSByZXN0YXJ0IGl0IHVzaW5nIHRoZSBcIk51Y2xpZGUgQWRiIExvZ2NhdDogU3RhcnRcIiBjb21tYW5kLidcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSlcbiAgICAgIClcbiAgICApO1xuXG4gICAgdGhpcy5fbG9nVGFpbGVyID0gbmV3IExvZ1RhaWxlcihtZXNzYWdlJCwge1xuICAgICAgc3RhcnQ6ICdhZGItbG9nY2F0OnN0YXJ0JyxcbiAgICAgIHN0b3A6ICdhZGItbG9nY2F0OnN0b3AnLFxuICAgICAgcmVzdGFydDogJ2FkYi1sb2djYXQ6cmVzdGFydCcsXG4gICAgICBlcnJvcjogJ2FkYi1sb2djYXQ6Y3Jhc2gnLFxuICAgIH0pO1xuXG4gICAgdGhpcy5fZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZShcbiAgICAgIG5ldyBEaXNwb3NhYmxlKCgpID0+IHsgdGhpcy5fbG9nVGFpbGVyLnN0b3AoKTsgfSksXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgICdudWNsaWRlLWFkYi1sb2djYXQ6c3RhcnQnOiAoKSA9PiB0aGlzLl9sb2dUYWlsZXIuc3RhcnQoKSxcbiAgICAgICAgJ251Y2xpZGUtYWRiLWxvZ2NhdDpzdG9wJzogKCkgPT4gdGhpcy5fbG9nVGFpbGVyLnN0b3AoKSxcbiAgICAgICAgJ251Y2xpZGUtYWRiLWxvZ2NhdDpyZXN0YXJ0JzogKCkgPT4gdGhpcy5fbG9nVGFpbGVyLnJlc3RhcnQoKSxcbiAgICAgIH0pLFxuICAgICk7XG4gIH1cblxuICBjb25zdW1lT3V0cHV0U2VydmljZShhcGk6IE91dHB1dFNlcnZpY2UpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIGFwaS5yZWdpc3Rlck91dHB1dFByb3ZpZGVyKHtcbiAgICAgIHNvdXJjZTogJ2FkYiBsb2djYXQnLFxuICAgICAgbWVzc2FnZXM6IHRoaXMuX2xvZ1RhaWxlci5nZXRNZXNzYWdlcygpLFxuICAgIH0pO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9kaXNwb3NhYmxlcy5kaXNwb3NlKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBY3RpdmF0aW9uO1xuIl19