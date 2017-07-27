'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _formatEnoentNotification;

function _load_formatEnoentNotification() {
  return _formatEnoentNotification = _interopRequireDefault(require('../../commons-atom/format-enoent-notification'));
}

var _LogTailer;

function _load_LogTailer() {
  return _LogTailer = require('../../nuclide-console/lib/LogTailer');
}

var _createMessageStream;

function _load_createMessageStream() {
  return _createMessageStream = require('./createMessageStream');
}

var _createProcessStream;

function _load_createProcessStream() {
  return _createProcessStream = require('./createProcessStream');
}

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    this._iosLogTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'iOS Simulator Logs',
      messages: _rxjsBundlesRxMinJs.Observable.defer(() => (0, (_createMessageStream || _load_createMessageStream()).createMessageStream)((0, (_createProcessStream || _load_createProcessStream()).createProcessStream)())),
      handleError(err) {
        if (err.code === 'ENOENT') {
          const { message, meta } = (0, (_formatEnoentNotification || _load_formatEnoentNotification()).default)({
            feature: 'iOS Syslog tailing',
            toolName: 'syslog',
            pathSetting: 'nuclide-ios-simulator-logs.pathToSyslog'
          });
          atom.notifications.addError(message, meta);
          return;
        }
        throw err;
      },
      trackingEvents: {
        start: 'ios-simulator-logs:start',
        stop: 'ios-simulator-logs:stop',
        restart: 'ios-simulator-logs:restart'
      }
    });

    this._disposables = new _atom.CompositeDisposable(new _atom.Disposable(() => {
      this._iosLogTailer.stop();
    }), atom.commands.add('atom-workspace', {
      'nuclide-ios-simulator-logs:start': () => this._iosLogTailer.start(),
      'nuclide-ios-simulator-logs:stop': () => this._iosLogTailer.stop(),
      'nuclide-ios-simulator-logs:restart': () => this._iosLogTailer.restart()
    }));
  }

  consumeOutputService(api) {
    this._disposables.add(api.registerOutputProvider({
      id: 'iOS Simulator Logs',
      messages: this._iosLogTailer.getMessages(),
      observeStatus: cb => this._iosLogTailer.observeStatus(cb),
      start: () => {
        this._iosLogTailer.start();
      },
      stop: () => {
        this._iosLogTailer.stop();
      }
    }));
  }

  dispose() {
    this._disposables.dispose();
  }
}
exports.default = Activation;
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */