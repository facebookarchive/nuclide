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

var _reactivexRxjs = require('@reactivex/rxjs');

var _reactivexRxjs2 = _interopRequireDefault(_reactivexRxjs);

var NOENT_ERROR_DESCRIPTION = '**Troubleshooting Tips**\n1. Make sure that adb is installed\n2. If it is installed, update the "Path to adb" setting in the "nuclide-adb-logcat" section of your\n   Atom settings.';

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    var message$ = _reactivexRxjs2['default'].Observable.defer(function () {
      return (0, _createMessageStream2['default'])((0, _createProcessStream.createProcessStream)()
      // Retry 3 times (unless we get a ENOENT)
      .retryWhen(function (errors) {
        return errors.scan(function (errCount, err) {
          if (isNoEntError(err) || errCount >= 2) {
            throw err;
          }
          return errCount + 1;
        }, 0);
      })['do']({
        error: function error(err) {
          if (isNoEntError(err)) {
            atom.notifications.addError("adb wasn't found on your path!", {
              dismissable: true,
              description: NOENT_ERROR_DESCRIPTION
            });
            return;
          }
          atom.notifications.addError('adb logcat has crashed 3 times.' + ' You can manually restart it using the "Nuclide Adb Logcat: Start" command.');
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkFjdGl2YXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7bUNBYWtDLHVCQUF1Qjs7bUNBQ3pCLHVCQUF1Qjs7OzswQ0FDL0IscUNBQXFDOztvQkFDZixNQUFNOzs2QkFDckMsaUJBQWlCOzs7O0FBRWhDLElBQU0sdUJBQXVCLHlMQUdYLENBQUM7O0lBRWIsVUFBVTtBQUlILFdBSlAsVUFBVSxDQUlGLEtBQWMsRUFBRTs7OzBCQUp4QixVQUFVOztBQUtaLFFBQU0sUUFBUSxHQUFHLDJCQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7YUFDbkMsc0NBQ0UsK0NBQXFCOztPQUVsQixTQUFTLENBQUMsVUFBQSxNQUFNO2VBQ2YsTUFBTSxDQUFDLElBQUksQ0FDVCxVQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUs7QUFDakIsY0FBSSxZQUFZLENBQUMsR0FBRyxDQUFDLElBQUksUUFBUSxJQUFJLENBQUMsRUFBRTtBQUN0QyxrQkFBTSxHQUFHLENBQUM7V0FDWDtBQUNELGlCQUFPLFFBQVEsR0FBRyxDQUFDLENBQUM7U0FDckIsRUFDRCxDQUFDLENBQ0Y7T0FDRixDQUFDLE1BQ0MsQ0FBQztBQUNGLGFBQUssRUFBQSxlQUFDLEdBQUcsRUFBRTtBQUNULGNBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ3JCLGdCQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsZ0NBQWdDLEVBQ2hDO0FBQ0UseUJBQVcsRUFBRSxJQUFJO0FBQ2pCLHlCQUFXLEVBQUUsdUJBQXVCO2FBQ3JDLENBQ0YsQ0FBQztBQUNGLG1CQUFPO1dBQ1I7QUFDRCxjQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FDekIsaUNBQWlDLEdBQy9CLDZFQUE2RSxDQUNoRixDQUFDO1NBQ0g7T0FDRixDQUFDLENBQ0w7S0FBQSxDQUNGLENBQUM7O0FBRUYsUUFBSSxDQUFDLFVBQVUsR0FBRywwQ0FBYyxRQUFRLEVBQUU7QUFDeEMsV0FBSyxFQUFFLGtCQUFrQjtBQUN6QixVQUFJLEVBQUUsaUJBQWlCO0FBQ3ZCLGFBQU8sRUFBRSxvQkFBb0I7QUFDN0IsV0FBSyxFQUFFLGtCQUFrQjtLQUMxQixDQUFDLENBQUM7O0FBRUgsUUFBSSxDQUFDLFlBQVksR0FBRyw4QkFDbEIscUJBQWUsWUFBTTtBQUFFLFlBQUssVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDO0tBQUUsQ0FBQyxFQUNqRCxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTtBQUNsQyxnQ0FBMEIsRUFBRTtlQUFNLE1BQUssVUFBVSxDQUFDLEtBQUssRUFBRTtPQUFBO0FBQ3pELCtCQUF5QixFQUFFO2VBQU0sTUFBSyxVQUFVLENBQUMsSUFBSSxFQUFFO09BQUE7QUFDdkQsa0NBQTRCLEVBQUU7ZUFBTSxNQUFLLFVBQVUsQ0FBQyxPQUFPLEVBQUU7T0FBQTtLQUM5RCxDQUFDLENBQ0gsQ0FBQztHQUNIOztlQXhERyxVQUFVOztXQTBETSw4QkFBQyxHQUFrQixFQUFlO0FBQ3BELGFBQU8sR0FBRyxDQUFDLHNCQUFzQixDQUFDO0FBQ2hDLGNBQU0sRUFBRSxZQUFZO0FBQ3BCLGdCQUFRLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUU7T0FDeEMsQ0FBQyxDQUFDO0tBQ0o7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1NBbkVHLFVBQVU7OztBQXNFaEIsSUFBTSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQUcsR0FBRztTQUFJLEFBQUMsR0FBRyxDQUFPLElBQUksS0FBSyxRQUFRO0NBQUEsQ0FBQzs7QUFFekQsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMiLCJmaWxlIjoiQWN0aXZhdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIE91dHB1dFNlcnZpY2UgZnJvbSAnLi4vLi4vbnVjbGlkZS1jb25zb2xlL2xpYi9PdXRwdXRTZXJ2aWNlJztcblxuaW1wb3J0IHtjcmVhdGVQcm9jZXNzU3RyZWFtfSBmcm9tICcuL2NyZWF0ZVByb2Nlc3NTdHJlYW0nO1xuaW1wb3J0IGNyZWF0ZU1lc3NhZ2VTdHJlYW0gZnJvbSAnLi9jcmVhdGVNZXNzYWdlU3RyZWFtJztcbmltcG9ydCB7TG9nVGFpbGVyfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbnNvbGUvbGliL0xvZ1RhaWxlcic7XG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IFJ4IGZyb20gJ0ByZWFjdGl2ZXgvcnhqcyc7XG5cbmNvbnN0IE5PRU5UX0VSUk9SX0RFU0NSSVBUSU9OID0gYCoqVHJvdWJsZXNob290aW5nIFRpcHMqKlxuMS4gTWFrZSBzdXJlIHRoYXQgYWRiIGlzIGluc3RhbGxlZFxuMi4gSWYgaXQgaXMgaW5zdGFsbGVkLCB1cGRhdGUgdGhlIFwiUGF0aCB0byBhZGJcIiBzZXR0aW5nIGluIHRoZSBcIm51Y2xpZGUtYWRiLWxvZ2NhdFwiIHNlY3Rpb24gb2YgeW91clxuICAgQXRvbSBzZXR0aW5ncy5gO1xuXG5jbGFzcyBBY3RpdmF0aW9uIHtcbiAgX2Rpc3Bvc2FibGVzOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfbG9nVGFpbGVyOiBMb2dUYWlsZXI7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9PYmplY3QpIHtcbiAgICBjb25zdCBtZXNzYWdlJCA9IFJ4Lk9ic2VydmFibGUuZGVmZXIoKCkgPT5cbiAgICAgIGNyZWF0ZU1lc3NhZ2VTdHJlYW0oXG4gICAgICAgIGNyZWF0ZVByb2Nlc3NTdHJlYW0oKVxuICAgICAgICAgIC8vIFJldHJ5IDMgdGltZXMgKHVubGVzcyB3ZSBnZXQgYSBFTk9FTlQpXG4gICAgICAgICAgLnJldHJ5V2hlbihlcnJvcnMgPT4gKFxuICAgICAgICAgICAgZXJyb3JzLnNjYW4oXG4gICAgICAgICAgICAgIChlcnJDb3VudCwgZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTm9FbnRFcnJvcihlcnIpIHx8IGVyckNvdW50ID49IDIpIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVyckNvdW50ICsgMTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIClcbiAgICAgICAgICApKVxuICAgICAgICAgIC5kbyh7XG4gICAgICAgICAgICBlcnJvcihlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGlzTm9FbnRFcnJvcihlcnIpKSB7XG4gICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgICAgICAgXCJhZGIgd2Fzbid0IGZvdW5kIG9uIHlvdXIgcGF0aCFcIixcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzbWlzc2FibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBOT0VOVF9FUlJPUl9ERVNDUklQVElPTixcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgICAgICdhZGIgbG9nY2F0IGhhcyBjcmFzaGVkIDMgdGltZXMuJ1xuICAgICAgICAgICAgICAgICsgJyBZb3UgY2FuIG1hbnVhbGx5IHJlc3RhcnQgaXQgdXNpbmcgdGhlIFwiTnVjbGlkZSBBZGIgTG9nY2F0OiBTdGFydFwiIGNvbW1hbmQuJ1xuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KVxuICAgICAgKVxuICAgICk7XG5cbiAgICB0aGlzLl9sb2dUYWlsZXIgPSBuZXcgTG9nVGFpbGVyKG1lc3NhZ2UkLCB7XG4gICAgICBzdGFydDogJ2FkYi1sb2djYXQ6c3RhcnQnLFxuICAgICAgc3RvcDogJ2FkYi1sb2djYXQ6c3RvcCcsXG4gICAgICByZXN0YXJ0OiAnYWRiLWxvZ2NhdDpyZXN0YXJ0JyxcbiAgICAgIGVycm9yOiAnYWRiLWxvZ2NhdDpjcmFzaCcsXG4gICAgfSk7XG5cbiAgICB0aGlzLl9kaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4geyB0aGlzLl9sb2dUYWlsZXIuc3RvcCgpOyB9KSxcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgJ251Y2xpZGUtYWRiLWxvZ2NhdDpzdGFydCc6ICgpID0+IHRoaXMuX2xvZ1RhaWxlci5zdGFydCgpLFxuICAgICAgICAnbnVjbGlkZS1hZGItbG9nY2F0OnN0b3AnOiAoKSA9PiB0aGlzLl9sb2dUYWlsZXIuc3RvcCgpLFxuICAgICAgICAnbnVjbGlkZS1hZGItbG9nY2F0OnJlc3RhcnQnOiAoKSA9PiB0aGlzLl9sb2dUYWlsZXIucmVzdGFydCgpLFxuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIGNvbnN1bWVPdXRwdXRTZXJ2aWNlKGFwaTogT3V0cHV0U2VydmljZSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gYXBpLnJlZ2lzdGVyT3V0cHV0UHJvdmlkZXIoe1xuICAgICAgc291cmNlOiAnYWRiIGxvZ2NhdCcsXG4gICAgICBtZXNzYWdlczogdGhpcy5fbG9nVGFpbGVyLmdldE1lc3NhZ2VzKCksXG4gICAgfSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2Rpc3Bvc2FibGVzLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5jb25zdCBpc05vRW50RXJyb3IgPSBlcnIgPT4gKGVycjogYW55KS5jb2RlID09PSAnRU5PRU5UJztcblxubW9kdWxlLmV4cG9ydHMgPSBBY3RpdmF0aW9uO1xuIl19