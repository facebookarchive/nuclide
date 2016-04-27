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

var _nuclideConsoleLibLogTailer = require('../../nuclide-console/lib/LogTailer');

var _createMessageStream = require('./createMessageStream');

var _createProcessStream = require('./createProcessStream');

var _atom = require('atom');

var _rxjs = require('rxjs');

var _rxjs2 = _interopRequireDefault(_rxjs);

var Activation = (function () {
  function Activation(state) {
    var _this = this;

    _classCallCheck(this, Activation);

    var message$ = _rxjs2['default'].Observable.defer(function () {
      return (0, _createMessageStream.createMessageStream)((0, _createProcessStream.createProcessStream)());
    })['do']({
      error: function error(err) {
        if (err.code === 'ENOENT') {
          var _formatEnoentNotification = (0, _nuclideAtomHelpers.formatEnoentNotification)({
            feature: 'iOS Syslog tailing',
            toolName: 'syslog',
            pathSetting: 'nuclide-ios-simulator-logs.pathToSyslog'
          });

          var message = _formatEnoentNotification.message;
          var meta = _formatEnoentNotification.meta;

          atom.notifications.addError(message, meta);
        }
      }
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