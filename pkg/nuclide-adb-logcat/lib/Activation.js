'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _formatEnoentNotification;

function _load_formatEnoentNotification() {
  return _formatEnoentNotification = _interopRequireDefault(require('../../commons-atom/format-enoent-notification'));
}

var _createProcessStream;

function _load_createProcessStream() {
  return _createProcessStream = require('./createProcessStream');
}

var _createMessageStream;

function _load_createMessageStream() {
  return _createMessageStream = _interopRequireDefault(require('./createMessageStream'));
}

var _LogTailer;

function _load_LogTailer() {
  return _LogTailer = require('../../nuclide-console/lib/LogTailer');
}

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    const message$ = _rxjsBundlesRxMinJs.Observable.defer(() => (0, (_createMessageStream || _load_createMessageStream()).default)((0, (_createProcessStream || _load_createProcessStream()).createProcessStream)()
    // Retry 3 times (unless we get a ENOENT)
    .retryWhen(errors => errors.scan((errCount, err) => {
      if (isNoEntError(err) || errCount >= 2) {
        throw err;
      }
      return errCount + 1;
    }, 0))));

    this._logTailer = new (_LogTailer || _load_LogTailer()).LogTailer({
      name: 'adb Logcat',
      messages: message$,
      trackingEvents: {
        start: 'adb-logcat:start',
        stop: 'adb-logcat:stop',
        restart: 'adb-logcat:restart'
      },
      handleError(err) {
        if (isNoEntError(err)) {
          const { message, meta } = (0, (_formatEnoentNotification || _load_formatEnoentNotification()).default)({
            feature: 'Tailing Android (adb) logs',
            toolName: 'adb',
            pathSetting: 'nuclide-adb-logcat.pathToAdb'
          });
          atom.notifications.addError(message, meta);
          return;
        }
        throw err;
      }
    });

    this._disposables = new _atom.CompositeDisposable(new _atom.Disposable(() => {
      this._logTailer.stop();
    }), atom.commands.add('atom-workspace', {
      'nuclide-adb-logcat:start': () => this._logTailer.start(),
      'nuclide-adb-logcat:stop': () => this._logTailer.stop(),
      'nuclide-adb-logcat:restart': () => this._logTailer.restart()
    }));
  }

  consumeOutputService(api) {
    this._disposables.add(api.registerOutputProvider({
      id: 'adb logcat',
      messages: this._logTailer.getMessages(),
      observeStatus: cb => this._logTailer.observeStatus(cb),
      start: () => {
        this._logTailer.start();
      },
      stop: () => {
        this._logTailer.stop();
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

const isNoEntError = err => err.code === 'ENOENT';