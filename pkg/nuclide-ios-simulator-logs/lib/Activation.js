"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _formatEnoentNotification() {
  const data = _interopRequireDefault(require("../../commons-atom/format-enoent-notification"));

  _formatEnoentNotification = function () {
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

function _createMessageStream() {
  const data = require("./createMessageStream");

  _createMessageStream = function () {
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

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

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
    this._iosLogTailer = new (_LogTailer().LogTailer)({
      name: 'iOS Simulator Logs',
      messages: _rxjsCompatUmdMin.Observable.defer(() => (0, _createMessageStream().createMessageStream)((0, _createProcessStream().createProcessStream)())),

      handleError(err) {
        if (err.code === 'ENOENT') {
          const {
            message,
            meta
          } = (0, _formatEnoentNotification().default)({
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
    this._disposables = new (_UniversalDisposable().default)(() => {
      this._iosLogTailer.stop();
    }, atom.commands.add('atom-workspace', {
      'nuclide-ios-simulator-logs:start': () => this._iosLogTailer.start(),
      'nuclide-ios-simulator-logs:stop': () => this._iosLogTailer.stop(),
      'nuclide-ios-simulator-logs:restart': () => this._iosLogTailer.restart()
    }));
  }

  consumeConsole(consoleService) {
    let consoleApi = consoleService({
      id: 'iOS Simulator Logs',
      name: 'iOS Simulator Logs',
      start: () => this._iosLogTailer.start(),
      stop: () => this._iosLogTailer.stop()
    });
    const disposable = new (_UniversalDisposable().default)(() => {
      consoleApi != null && consoleApi.dispose();
      consoleApi = null;
    }, this._iosLogTailer.getMessages().subscribe(message => consoleApi != null && consoleApi.append(message)), this._iosLogTailer.observeStatus(status => {
      if (consoleApi != null) {
        consoleApi.setStatus(status);
      }
    }));

    this._disposables.add(disposable);

    return disposable;
  }

  dispose() {
    this._disposables.dispose();
  }

}

exports.default = Activation;