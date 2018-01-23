'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setOutputService = setOutputService;
exports.getOutputService = getOutputService;
exports.setNotificationService = setNotificationService;
exports.getNotificationService = getNotificationService;
exports.registerConsoleLogging = registerConsoleLogging;

var _stripAnsi;

function _load_stripAnsi() {
  return _stripAnsi = _interopRequireDefault(require('strip-ansi'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
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

let _outputServiceApi = null;
let _raiseNativeNotification = null;

function setOutputService(api) {
  _outputServiceApi = api;
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    _outputServiceApi = null;
  });
}

function getOutputService() {
  return _outputServiceApi;
}

function setNotificationService(raiseNativeNotification) {
  _raiseNativeNotification = raiseNativeNotification;
}

function getNotificationService() {
  return _raiseNativeNotification;
}

function registerConsoleLogging(sourceId, userOutputStream) {
  const api = getOutputService();
  let outputDisposable = null;
  if (api != null) {
    outputDisposable = api.registerOutputProvider({
      id: sourceId,
      messages: userOutputStream.map(rawMessage => {
        const message = JSON.parse(rawMessage);
        message.text = (0, (_stripAnsi || _load_stripAnsi()).default)(message.text);
        return message;
      })
    });
  }
  return outputDisposable;
}