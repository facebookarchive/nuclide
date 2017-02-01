'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setOutputService = setOutputService;
exports.getOutputService = getOutputService;
exports.setNotificationService = setNotificationService;
exports.getNotificationService = getNotificationService;
exports.registerConsoleLogging = registerConsoleLogging;


let _outputServiceApi = null; /**
                               * Copyright (c) 2015-present, Facebook, Inc.
                               * All rights reserved.
                               *
                               * This source code is licensed under the license found in the LICENSE file in
                               * the root directory of this source tree.
                               *
                               * 
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
      messages: userOutputStream.map(message => JSON.parse(message))
    });
  }
  return outputDisposable;
}