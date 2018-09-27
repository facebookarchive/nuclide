"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _formatEnoentNotification() {
  const data = _interopRequireDefault(require("../../commons-atom/format-enoent-notification"));

  _formatEnoentNotification = function () {
    return data;
  };

  return data;
}

function _createProcessStream() {
  const data = require("./createProcessStream");

  _createProcessStream = function () {
    return data;
  };

  return data;
}

function _createMessageStream() {
  const data = _interopRequireDefault(require("./createMessageStream"));

  _createMessageStream = function () {
    return data;
  };

  return data;
}

function _LogTailer() {
  const data = require("../../nuclide-console-base/lib/LogTailer");

  _LogTailer = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
class Activation {
  constructor(state) {
    const message$ = _RxMin.Observable.defer(() => (0, _createMessageStream().default)((0, _createProcessStream().createProcessStream)() // Retry 3 times (unless we get a ENOENT)
    .retryWhen(errors => errors.scan((errCount, err) => {
      if (isNoEntError(err) || errCount >= 2) {
        throw err;
      }

      return errCount + 1;
    }, 0))));

    this._logTailer = new (_LogTailer().LogTailer)({
      name: 'adb Logcat',
      messages: message$,
      trackingEvents: {
        start: 'adb-logcat:start',
        stop: 'adb-logcat:stop',
        restart: 'adb-logcat:restart'
      },

      handleError(err) {
        if (isNoEntError(err)) {
          const {
            message,
            meta
          } = (0, _formatEnoentNotification().default)({
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
    this._disposables = new (_UniversalDisposable().default)(() => {
      this._logTailer.stop();
    }, atom.commands.add('atom-workspace', {
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

const isNoEntError = err => err.code === 'ENOENT';