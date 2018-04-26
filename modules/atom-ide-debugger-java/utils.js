'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.resolveConfiguration = exports.NUCLIDE_DEBUGGER_DEV_GK = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));let resolveConfiguration = exports.resolveConfiguration = (() => {var _ref = (0, _asyncToGenerator.default)(




































































  function* (
  configuration)
  {
    const { adapterExecutable, targetUri, adapterType } = configuration;
    if (adapterExecutable == null) {
      throw new Error('Cannot resolve configuration for unset adapterExecutable');
    } else if (adapterType === (_constants || _load_constants()).VsAdapterTypes.JAVA) {
      const javaAdapterExecutable = yield getJavaDebuggerHelpersServiceByNuclideUri(
      targetUri).
      getJavaVSAdapterExecutableInfo(false);
      adapterExecutable.command = javaAdapterExecutable.command;
      adapterExecutable.args = javaAdapterExecutable.args;
    }
    return configuration;
  });return function resolveConfiguration(_x) {return _ref.apply(this, arguments);};})();exports.getJavaConfig = getJavaConfig;exports.

setRpcService = setRpcService;exports.






getJavaDebuggerHelpersServiceByNuclideUri = getJavaDebuggerHelpersServiceByNuclideUri;var _UniversalDisposable;function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));}var _constants;function _load_constants() {return _constants = require('nuclide-debugger-common/constants');}var _JavaDebuggerHelpersService;function _load_JavaDebuggerHelpersService() {return _JavaDebuggerHelpersService = _interopRequireWildcard(require('./JavaDebuggerHelpersService'));}function _interopRequireWildcard(obj) {if (obj && obj.__esModule) {return obj;} else {var newObj = {};if (obj != null) {for (var key in obj) {if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];}}newObj.default = obj;return newObj;}}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           * @format
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */let _rpcService = null;const NUCLIDE_DEBUGGER_DEV_GK = exports.NUCLIDE_DEBUGGER_DEV_GK = 'nuclide_debugger_dev';function getJavaConfig() {const entryPointClass = { name: 'entryPointClass', type: 'string', description: 'Input the Java entry point name you want to launch', required: true, visible: true };const classPath = { name: 'classPath', type: 'string', description: 'Java class path', required: true, visible: true };const javaJdwpPort = { name: 'javaJdwpPort', type: 'number', description: 'Java debugger port', required: true, visible: true };return { launch: { launch: true, vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.JAVA, threads: false, properties: [entryPointClass, classPath], cwdPropertyName: 'cwd', header: null }, attach: { launch: false, vsAdapterType: (_constants || _load_constants()).VsAdapterTypes.JAVA, threads: false, properties: [javaJdwpPort], header: null } };}function setRpcService(rpcService) {_rpcService = rpcService;return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {_rpcService = null;});}function getJavaDebuggerHelpersServiceByNuclideUri(uri) {if (_rpcService != null) {return _rpcService.getServiceByNuclideUri('JavaDebuggerHelpersService', uri);} else {return _JavaDebuggerHelpersService || _load_JavaDebuggerHelpersService();}
}