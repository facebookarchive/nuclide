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
exports.setTerminalService = setTerminalService;
exports.getTerminalService = getTerminalService;
exports.setRpcService = setRpcService;
exports.getVSCodeDebuggerAdapterServiceByNuclideUri = getVSCodeDebuggerAdapterServiceByNuclideUri;

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _VSCodeDebuggerAdapterService;

function _load_VSCodeDebuggerAdapterService() {
  return _VSCodeDebuggerAdapterService = _interopRequireWildcard(require('nuclide-debugger-vsps/VSCodeDebuggerAdapterService'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

let _raiseNativeNotification = null;
let _registerExecutor = null;
let _datatipService = null;
let _createConsole = null;
let _terminalService = null;
let _rpcService = null;

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

function setTerminalService(terminalService) {
  _terminalService = terminalService;
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    _terminalService = null;
  });
}

function getTerminalService() {
  return _terminalService;
}

function setRpcService(rpcService) {
  _rpcService = rpcService;
  return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
    _rpcService = null;
  });
}

function getVSCodeDebuggerAdapterServiceByNuclideUri(uri) {
  if (_rpcService != null) {
    return _rpcService.getServiceByNuclideUri('VSCodeDebuggerAdapterService', uri);
  } else {
    return _VSCodeDebuggerAdapterService || _load_VSCodeDebuggerAdapterService();
  }
}