'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setOutputService = setOutputService;
exports.getOutputService = getOutputService;
exports.setNotificationService = setNotificationService;
exports.getNotificationService = getNotificationService;
exports.registerOutputWindowLogging = registerOutputWindowLogging;


let _outputServiceApi = null;
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

// TODO: refactor this function to work with other providers(like hhvm).
function registerOutputWindowLogging(userOutputStream) {
  const api = getOutputService();
  let outputDisposable = null;
  if (api != null) {
    outputDisposable = api.registerOutputProvider({
      id: 'lldb debugger',
      messages: userOutputStream.map(message => JSON.parse(message))
    });
  }
  return outputDisposable;
}