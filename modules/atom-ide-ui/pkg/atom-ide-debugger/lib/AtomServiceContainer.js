'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.resolveDebugConfiguration = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));let resolveDebugConfiguration = exports.resolveDebugConfiguration = (() => {var _ref = (0, _asyncToGenerator.default)(






























































































































  function* (
  configuration)
  {
    const existingProvider = _configurationProviders.get(
    configuration.adapterType);

    return existingProvider != null ?
    existingProvider.resolveConfiguration(configuration) :
    configuration;
  });return function resolveDebugConfiguration(_x) {return _ref.apply(this, arguments);};})();exports.setConsoleService = setConsoleService;exports.getConsoleService = getConsoleService;exports.setConsoleRegisterExecutor = setConsoleRegisterExecutor;exports.getConsoleRegisterExecutor = getConsoleRegisterExecutor;exports.setDatatipService = setDatatipService;exports.getDatatipService = getDatatipService;exports.setNotificationService = setNotificationService;exports.getNotificationService = getNotificationService;exports.setTerminalService = setTerminalService;exports.getTerminalService = getTerminalService;exports.setRpcService = setRpcService;exports.isNuclideEnvironment = isNuclideEnvironment;exports.addDebugConfigurationProvider = addDebugConfigurationProvider;var _UniversalDisposable;function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../../nuclide-commons/UniversalDisposable'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}let _raiseNativeNotification = null; /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          */let _registerExecutor = null;let _datatipService = null;let _createConsole = null;let _terminalService = null;let _rpcService = null;const _configurationProviders = new Map();function setConsoleService(createConsole) {_createConsole = createConsole;return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {_createConsole = null;});}function getConsoleService() {return _createConsole;}function setConsoleRegisterExecutor(registerExecutor) {_registerExecutor = registerExecutor;return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {_registerExecutor = null;});}function getConsoleRegisterExecutor() {return _registerExecutor;}function setDatatipService(datatipService) {_datatipService = datatipService;return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {_datatipService = null;});}function getDatatipService() {return _datatipService;}function setNotificationService(raiseNativeNotification) {_raiseNativeNotification = raiseNativeNotification;}function getNotificationService() {return _raiseNativeNotification;}function setTerminalService(terminalService) {_terminalService = terminalService;return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {_terminalService = null;});}function getTerminalService() {return _terminalService;}function setRpcService(rpcService) {_rpcService = rpcService;return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {_rpcService = null;});}function isNuclideEnvironment() {return _rpcService != null;}function addDebugConfigurationProvider(provider) {const existingProvider = _configurationProviders.get(provider.adapterType);if (existingProvider != null) {throw new Error('Debug Configuration Provider already exists for adapter type: ' + provider.adapterType);}_configurationProviders.set(provider.adapterType, provider);return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {_configurationProviders.delete(provider.adapterType);});}