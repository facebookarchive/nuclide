var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomFormatEnoentNotification2;

function _commonsAtomFormatEnoentNotification() {
  return _commonsAtomFormatEnoentNotification2 = _interopRequireDefault(require('../../commons-atom/format-enoent-notification'));
}

var _createProcessStream2;

function _createProcessStream() {
  return _createProcessStream2 = require('./createProcessStream');
}

var _createMessageStream2;

function _createMessageStream() {
  return _createMessageStream2 = _interopRequireDefault(require('./createMessageStream'));
}

var _nuclideConsoleLibLogTailer2;

function _nuclideConsoleLibLogTailer() {
  return _nuclideConsoleLibLogTailer2 = require('../../nuclide-console/lib/LogTailer');
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    var message$ = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.defer(function () {
      return (0, (_createMessageStream2 || _createMessageStream()).default)((0, (_createProcessStream2 || _createProcessStream()).createProcessStream)()
      // Retry 3 times (unless we get a ENOENT)
      .retryWhen(function (errors) {
        return errors.scan(function (errCount, err) {
          if (isNoEntError(err) || errCount >= 2) {
            throw err;
          }
          return errCount + 1;
        }, 0);
      }).do({
        error: function error(err) {
          if (isNoEntError(err)) {
            var _ref = (0, (_commonsAtomFormatEnoentNotification2 || _commonsAtomFormatEnoentNotification()).default)({
              feature: 'Tailing Android (adb) logs',
              toolName: 'adb',
              pathSetting: 'nuclide-adb-logcat.pathToAdb'
            });

            var message = _ref.message;
            var meta = _ref.meta;

            atom.notifications.addError(message, meta);
            return;
          }
          atom.notifications.addError('adb logcat has crashed 3 times.' + ' You can manually restart it using the "Nuclide Adb Logcat: Start" command.');
        }
      }));
    });

    this._logTailer = new (_nuclideConsoleLibLogTailer2 || _nuclideConsoleLibLogTailer()).LogTailer(message$, {
      start: 'adb-logcat:start',
      stop: 'adb-logcat:stop',
      restart: 'adb-logcat:restart',
      error: 'adb-logcat:crash'
    });

    this._disposables = new (_atom2 || _atom()).CompositeDisposable(new (_atom2 || _atom()).Disposable(function () {
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
        id: 'adb logcat',
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