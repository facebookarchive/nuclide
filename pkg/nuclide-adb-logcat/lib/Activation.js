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

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _createProcessStream = require('./createProcessStream');

var _createMessageStream = require('./createMessageStream');

var _createMessageStream2 = _interopRequireDefault(_createMessageStream);

var _nuclideConsoleLibLogTailer = require('../../nuclide-console/lib/LogTailer');

var _atom = require('atom');

var _rxjs = require('rxjs');

var _rxjs2 = _interopRequireDefault(_rxjs);

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    var message$ = _rxjs2['default'].Observable.defer(function () {
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
            var _formatEnoentNotification = (0, _nuclideAtomHelpers.formatEnoentNotification)({
              feature: 'Tailing Android (adb) logs',
              toolName: 'adb',
              pathSetting: 'nuclide-adb-logcat.pathToAdb'
            });

            var message = _formatEnoentNotification.message;
            var meta = _formatEnoentNotification.meta;

            atom.notifications.addError(message, meta);
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