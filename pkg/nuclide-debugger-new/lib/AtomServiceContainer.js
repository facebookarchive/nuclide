'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setConsoleService = setConsoleService;
exports.getConsoleService = getConsoleService;
exports.setConsoleRegisterExecutor = setConsoleRegisterExecutor;
exports.getConsoleRegisterExecutor = getConsoleRegisterExecutor;
exports.setDatatipService = setDatatipService;
exports.getDatatipService = getDatatipService;
exports.setNotificationService = setNotificationService;
exports.getNotificationService = getNotificationService;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let _raiseNativeNotification = null; /**
                                      * Copyright (c) 2015-present, Facebook, Inc.
                                      * All rights reserved.
                                      *
                                      * This source code is licensed under the license found in the LICENSE file in
                                      * the root directory of this source tree.
                                      *
                                      * 
                                      * @format
                                      */

let _registerExecutor = null;
let _datatipService = null;
let _createConsole = null;

function setConsoleService(createConsole) {
  _createConsole = createConsole;
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    _createConsole = null;
  });
}

function getConsoleService() {
  return _createConsole;
}

function setConsoleRegisterExecutor(registerExecutor) {
  _registerExecutor = registerExecutor;
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    _registerExecutor = null;
  });
}

function getConsoleRegisterExecutor() {
  return _registerExecutor;
}

function setDatatipService(datatipService) {
  _datatipService = datatipService;
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    _datatipService = null;
  });
}

function getDatatipService() {
  return _datatipService;
}

function setNotificationService(raiseNativeNotification) {
  _raiseNativeNotification = raiseNativeNotification;
}

function getNotificationService() {
  return _raiseNativeNotification;
}