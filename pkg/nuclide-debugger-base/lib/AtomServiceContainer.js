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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let _outputServiceApi = null; /**
                               * Copyright (c) 2015-present, Facebook, Inc.
                               * All rights reserved.
                               *
                               * This source code is licensed under the license found in the LICENSE file in
                               * the root directory of this source tree.
                               *
                               * 
                               * @format
                               */

let _raiseNativeNotification = null;

function setOutputService(api) {
  _outputServiceApi = api;
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