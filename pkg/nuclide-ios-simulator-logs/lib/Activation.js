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

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideConsoleLibLogTailer;

function _load_nuclideConsoleLibLogTailer() {
  return _nuclideConsoleLibLogTailer = require('../../nuclide-console/lib/LogTailer');
}

var _createMessageStream;

function _load_createMessageStream() {
  return _createMessageStream = require('./createMessageStream');
}

var _createProcessStream;

function _load_createProcessStream() {
  return _createProcessStream = require('./createProcessStream');
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

    this._iosLogTailer = new (_nuclideConsoleLibLogTailer || _load_nuclideConsoleLibLogTailer()).LogTailer({
      name: 'iOS Simulator Logs',
      messages: (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.defer(function () {
        return (0, (_createMessageStream || _load_createMessageStream()).createMessageStream)((0, (_createProcessStream || _load_createProcessStream()).createProcessStream)());
      }).catch(function (err) {
        if (err.code === 'ENOENT') {
          var _ref = (0, (_commonsAtomFormatEnoentNotification || _load_commonsAtomFormatEnoentNotification()).default)({
            feature: 'iOS Syslog tailing',
            toolName: 'syslog',
            pathSetting: 'nuclide-ios-simulator-logs.pathToSyslog'
          });

          var message = _ref.message;
          var meta = _ref.meta;

          atom.notifications.addError(message, meta);
          return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.empty();
        }
        throw err;
      }),
      trackingEvents: {
        start: 'ios-simulator-logs:start',
        stop: 'ios-simulator-logs:stop',
        restart: 'ios-simulator-logs:restart'
      }
    });

    this._disposables = new (_atom || _load_atom()).CompositeDisposable(new (_atom || _load_atom()).Disposable(function () {
      _this._iosLogTailer.stop();
    }), atom.commands.add('atom-workspace', {
      'nuclide-ios-simulator-logs:start': function nuclideIosSimulatorLogsStart() {
        return _this._iosLogTailer.start();
      },
      'nuclide-ios-simulator-logs:stop': function nuclideIosSimulatorLogsStop() {
        return _this._iosLogTailer.stop();
      },
      'nuclide-ios-simulator-logs:restart': function nuclideIosSimulatorLogsRestart() {
        return _this._iosLogTailer.restart();
      }
    }));
  }

  _createClass(Activation, [{
    key: 'consumeOutputService',
    value: function consumeOutputService(api) {
      var _this2 = this;

      this._disposables.add(api.registerOutputProvider({
        id: 'iOS Simulator Logs',
        messages: this._iosLogTailer.getMessages(),
        observeStatus: function observeStatus(cb) {
          return _this2._iosLogTailer.observeStatus(cb);
        },
        start: function start() {
          _this2._iosLogTailer.start();
        },
        stop: function stop() {
          _this2._iosLogTailer.stop();
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

module.exports = Activation;