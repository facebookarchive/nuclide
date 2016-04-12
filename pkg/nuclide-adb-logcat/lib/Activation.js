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

var _nuclideConsoleLibLogTailer = require('../../nuclide-console/lib/LogTailer');

var _atom = require('atom');

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var NOENT_ERROR_DESCRIPTION = '**Troubleshooting Tips**\n1. Make sure that adb is installed\n2. If it is installed, update the "Path to adb" setting in the "nuclide-adb-logcat" section of your\n   Atom settings.';

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    var message$ = _rx2['default'].Observable.defer(function () {
      return (0, _createMessageStream2['default'])((0, _createProcessStream.createProcessStream)()
      // Retry 3 times (unless we get a ENOENT)
      .retryWhen(function (errors) {
        return errors.scan(function (errCount, err) {
          if (isNoEntError(err) || errCount >= 2) {
            throw err;
          }
          return errCount + 1;
        }, 0);
      }).tapOnError(function (err) {
        if (isNoEntError(err)) {
          atom.notifications.addError("adb wasn't found on your path!", {
            dismissable: true,
            description: NOENT_ERROR_DESCRIPTION
          });
          return;
        }
        atom.notifications.addError('adb logcat has crashed 3 times.' + ' You can manually restart it using the "Nuclide Adb Logcat: Start" command.');
      }));
    });

    this._logTailer = new _nuclideConsoleLibLogTailer.LogTailer(message$, {
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

var isNoEntError = function isNoEntError(err) {
  return err.code === 'ENOENT';
};

module.exports = Activation;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7bUNBYWtDLHVCQUF1Qjs7bUNBQ3pCLHVCQUF1Qjs7OzswQ0FDL0IscUNBQXFDOztvQkFDZixNQUFNOztrQkFDckMsSUFBSTs7OztBQUVuQixJQUFNLHVCQUF1Qix5TEFHWCxDQUFDOztJQUViLFVBQVU7QUFJSCxXQUpQLFVBQVUsQ0FJRixLQUFjLEVBQUU7OzswQkFKeEIsVUFBVTs7QUFLWixRQUFNLFFBQVEsR0FBRyxnQkFBRyxVQUFVLENBQUMsS0FBSyxDQUFDO2FBQ25DLHNDQUNFLCtDQUFxQjs7T0FFbEIsU0FBUyxDQUFDLFVBQUEsTUFBTTtlQUNmLE1BQU0sQ0FBQyxJQUFJLENBQ1QsVUFBQyxRQUFRLEVBQUUsR0FBRyxFQUFLO0FBQ2pCLGNBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxJQUFJLFFBQVEsSUFBSSxDQUFDLEVBQUU7QUFDdEMsa0JBQU0sR0FBRyxDQUFDO1dBQ1g7QUFDRCxpQkFBTyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1NBQ3JCLEVBQ0QsQ0FBQyxDQUNGO09BQ0YsQ0FBQyxDQUNELFVBQVUsQ0FBQyxVQUFBLEdBQUcsRUFBSTtBQUNqQixZQUFJLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUNyQixjQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsZ0NBQWdDLEVBQ2hDO0FBQ0UsdUJBQVcsRUFBRSxJQUFJO0FBQ2pCLHVCQUFXLEVBQUUsdUJBQXVCO1dBQ3JDLENBQ0YsQ0FBQztBQUNGLGlCQUFPO1NBQ1I7QUFDRCxZQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsaUNBQWlDLEdBQy9CLDZFQUE2RSxDQUNoRixDQUFDO09BQ0gsQ0FBQyxDQUNMO0tBQUEsQ0FDRixDQUFDOztBQUVGLFFBQUksQ0FBQyxVQUFVLEdBQUcsMENBQWMsUUFBUSxFQUFFO0FBQ3hDLFdBQUssRUFBRSxrQkFBa0I7QUFDekIsVUFBSSxFQUFFLGlCQUFpQjtBQUN2QixhQUFPLEVBQUUsb0JBQW9CO0FBQzdCLFdBQUssRUFBRSxrQkFBa0I7S0FDMUIsQ0FBQyxDQUFDOztBQUVILFFBQUksQ0FBQyxZQUFZLEdBQUcsOEJBQ2xCLHFCQUFlLFlBQU07QUFBRSxZQUFLLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUFFLENBQUMsRUFDakQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDbEMsZ0NBQTBCLEVBQUU7ZUFBTSxNQUFLLFVBQVUsQ0FBQyxLQUFLLEVBQUU7T0FBQTtBQUN6RCwrQkFBeUIsRUFBRTtlQUFNLE1BQUssVUFBVSxDQUFDLElBQUksRUFBRTtPQUFBO0FBQ3ZELGtDQUE0QixFQUFFO2VBQU0sTUFBSyxVQUFVLENBQUMsT0FBTyxFQUFFO09BQUE7S0FDOUQsQ0FBQyxDQUNILENBQUM7R0FDSDs7ZUF0REcsVUFBVTs7V0F3RE0sOEJBQUMsR0FBa0IsRUFBZTtBQUNwRCxhQUFPLEdBQUcsQ0FBQyxzQkFBc0IsQ0FBQztBQUNoQyxjQUFNLEVBQUUsWUFBWTtBQUNwQixnQkFBUSxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFO09BQ3hDLENBQUMsQ0FBQztLQUNKOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztTQWpFRyxVQUFVOzs7QUFvRWhCLElBQU0sWUFBWSxHQUFHLFNBQWYsWUFBWSxDQUFHLEdBQUc7U0FBSSxBQUFDLEdBQUcsQ0FBTyxJQUFJLEtBQUssUUFBUTtDQUFBLENBQUM7O0FBRXpELE1BQU0sQ0FBQyxPQUFPLEdBQUcsVUFBVSxDQUFDIiwiZmlsZSI6IkFjdGl2YXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSBPdXRwdXRTZXJ2aWNlIGZyb20gJy4uLy4uL251Y2xpZGUtY29uc29sZS9saWIvT3V0cHV0U2VydmljZSc7XG5cbmltcG9ydCB7Y3JlYXRlUHJvY2Vzc1N0cmVhbX0gZnJvbSAnLi9jcmVhdGVQcm9jZXNzU3RyZWFtJztcbmltcG9ydCBjcmVhdGVNZXNzYWdlU3RyZWFtIGZyb20gJy4vY3JlYXRlTWVzc2FnZVN0cmVhbSc7XG5pbXBvcnQge0xvZ1RhaWxlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb25zb2xlL2xpYi9Mb2dUYWlsZXInO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBSeCBmcm9tICdyeCc7XG5cbmNvbnN0IE5PRU5UX0VSUk9SX0RFU0NSSVBUSU9OID0gYCoqVHJvdWJsZXNob290aW5nIFRpcHMqKlxuMS4gTWFrZSBzdXJlIHRoYXQgYWRiIGlzIGluc3RhbGxlZFxuMi4gSWYgaXQgaXMgaW5zdGFsbGVkLCB1cGRhdGUgdGhlIFwiUGF0aCB0byBhZGJcIiBzZXR0aW5nIGluIHRoZSBcIm51Y2xpZGUtYWRiLWxvZ2NhdFwiIHNlY3Rpb24gb2YgeW91clxuICAgQXRvbSBzZXR0aW5ncy5gO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfbG9nVGFpbGVyOiBMb2dUYWlsZXI7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9PYmplY3QpIHtcbiAgICBjb25zdCBtZXNzYWdlJCA9IFJ4Lk9ic2VydmFibGUuZGVmZXIoKCkgPT5cbiAgICAgIGNyZWF0ZU1lc3NhZ2VTdHJlYW0oXG4gICAgICAgIGNyZWF0ZVByb2Nlc3NTdHJlYW0oKVxuICAgICAgICAgIC8vIFJldHJ5IDMgdGltZXMgKHVubGVzcyB3ZSBnZXQgYSBFTk9FTlQpXG4gICAgICAgICAgLnJldHJ5V2hlbihlcnJvcnMgPT4gKFxuICAgICAgICAgICAgZXJyb3JzLnNjYW4oXG4gICAgICAgICAgICAgIChlcnJDb3VudCwgZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTm9FbnRFcnJvcihlcnIpIHx8IGVyckNvdW50ID49IDIpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVyckNvdW50ICsgMTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIClcbiAgICAgICAgICApKVxuICAgICAgICAgIC50YXBPbkVycm9yKGVyciA9PiB7XG4gICAgICAgICAgICBpZiAoaXNOb0VudEVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgICAgIFwiYWRiIHdhc24ndCBmb3VuZCBvbiB5b3VyIHBhdGghXCIsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogTk9FTlRfRVJST1JfREVTQ1JJUFRJT04sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgICAnYWRiIGxvZ2NhdCBoYXMgY3Jhc2hlZCAzIHRpbWVzLidcbiAgICAgICAgICAgICAgKyAnIFlvdSBjYW4gbWFudWFsbHkgcmVzdGFydCBpdCB1c2luZyB0aGUgXCJOdWNsaWRlIEFkYiBMb2djYXQ6IFN0YXJ0XCIgY29tbWFuZC4nXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pXG4gICAgICApXG4gICAgKTtcblxuICAgIHRoaXMuX2xvZ1RhaWxlciA9IG5ldyBMb2dUYWlsZXIobWVzc2FnZSQsIHtcbiAgICAgIHN0YXJ0OiAnYWRiLWxvZ2NhdDpzdGFydCcsXG4gICAgICBzdG9wOiAnYWRiLWxvZ2NhdDpzdG9wJyxcbiAgICAgIHJlc3RhcnQ6ICdhZGItbG9nY2F0OnJlc3RhcnQnLFxuICAgICAgZXJyb3I6ICdhZGItbG9nY2F0OmNyYXNoJyxcbiAgICB9KTtcblxuICAgIHRoaXMuX2Rpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7IHRoaXMuX2xvZ1RhaWxlci5zdG9wKCk7IH0pLFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAnbnVjbGlkZS1hZGItbG9nY2F0OnN0YXJ0JzogKCkgPT4gdGhpcy5fbG9nVGFpbGVyLnN0YXJ0KCksXG4gICAgICAgICdudWNsaWRlLWFkYi1sb2djYXQ6c3RvcCc6ICgpID0+IHRoaXMuX2xvZ1RhaWxlci5zdG9wKCksXG4gICAgICAgICdudWNsaWRlLWFkYi1sb2djYXQ6cmVzdGFydCc6ICgpID0+IHRoaXMuX2xvZ1RhaWxlci5yZXN0YXJ0KCksXG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgY29uc3VtZU91dHB1dFNlcnZpY2UoYXBpOiBPdXRwdXRTZXJ2aWNlKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiBhcGkucmVnaXN0ZXJPdXRwdXRQcm92aWRlcih7XG4gICAgICBzb3VyY2U6ICdhZGIgbG9nY2F0JyxcbiAgICAgIG1lc3NhZ2VzOiB0aGlzLl9sb2dUYWlsZXIuZ2V0TWVzc2FnZXMoKSxcbiAgICB9KTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fZGlzcG9zYWJsZXMuZGlzcG9zZSgpO1xuICB9XG59XG5cbmNvbnN0IGlzTm9FbnRFcnJvciA9IGVyciA9PiAoZXJyOiBhbnkpLmNvZGUgPT09ICdFTk9FTlQnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFjdGl2YXRpb247XG4iXX0=