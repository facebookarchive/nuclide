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

var _commonsAtomFormatEnoentNotification;

function _load_commonsAtomFormatEnoentNotification() {
  return _commonsAtomFormatEnoentNotification = _interopRequireDefault(require('../../commons-atom/format-enoent-notification'));
}

var _createProcessStream;

function _load_createProcessStream() {
  return _createProcessStream = require('./createProcessStream');
}

var _createMessageStream;

function _load_createMessageStream() {
  return _createMessageStream = _interopRequireDefault(require('./createMessageStream'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideConsoleLibLogTailer;

function _load_nuclideConsoleLibLogTailer() {
  return _nuclideConsoleLibLogTailer = require('../../nuclide-console/lib/LogTailer');
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    var message$ = (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.defer(function () {
      return (0, (_createMessageStream || _load_createMessageStream()).default)((0, (_createProcessStream || _load_createProcessStream()).createProcessStream)()
      // Retry 3 times (unless we get a ENOENT)
      .retryWhen(function (errors) {
        return errors.scan(function (errCount, err) {
          if (isNoEntError(err) || errCount >= 2) {
            throw err;
          }
          return errCount + 1;
        }, 0);
      }).catch(function (err) {
        if (isNoEntError(err)) {
          var _ref = (0, (_commonsAtomFormatEnoentNotification || _load_commonsAtomFormatEnoentNotification()).default)({
            feature: 'Tailing Android (adb) logs',
            toolName: 'adb',
            pathSetting: 'nuclide-adb-logcat.pathToAdb'
          });

          var message = _ref.message;
          var meta = _ref.meta;

          atom.notifications.addError(message, meta);
          return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
        }

        throw err;
      }));
    });

    this._logTailer = new (_nuclideConsoleLibLogTailer || _load_nuclideConsoleLibLogTailer()).LogTailer({
      name: 'adb Logcat',
      messages: message$,
      trackingEvents: {
        start: 'adb-logcat:start',
        stop: 'adb-logcat:stop',
        restart: 'adb-logcat:restart'
      }
    });

    this._disposables = new (_atom || _load_atom()).CompositeDisposable(new (_atom || _load_atom()).Disposable(function () {
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
      var _this2 = this;

      this._disposables.add(api.registerOutputProvider({
        id: 'adb logcat',
        messages: this._logTailer.getMessages(),
        observeStatus: function observeStatus(cb) {
          return _this2._logTailer.observeStatus(cb);
        },
        start: function start() {
          _this2._logTailer.start();
        },
        stop: function stop() {
          _this2._logTailer.stop();
        }
      }));
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