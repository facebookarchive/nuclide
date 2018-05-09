'use strict';var _createPackage;
















function _load_createPackage() {return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));}var _nuclideDebuggerCommon;
function _load_nuclideDebuggerCommon() {return _nuclideDebuggerCommon = require('nuclide-debugger-common');}var _AutoGenLaunchAttachProvider;
function _load_AutoGenLaunchAttachProvider() {return _AutoGenLaunchAttachProvider = _interopRequireDefault(require('nuclide-debugger-common/AutoGenLaunchAttachProvider'));}var _utils;
function _load_utils() {return _utils = require('./utils');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class Activation {
  constructor() {}
  dispose() {}

  createDebuggerProvider() {
    return {
      name: 'Java - Desktop',
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).default(
        'Java - Desktop',
        connection,
        (0, (_utils || _load_utils()).getJavaConfig)());

      } };

  }

  createDebuggerConfigurator() {
    return {
      resolveConfiguration: (_utils || _load_utils()).resolveConfiguration,
      adapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.JAVA };

  }

  consumeRpcService(rpcService) {
    return (0, (_utils || _load_utils()).setRpcService)(rpcService);
  }} /**
      * Copyright (c) 2017-present, Facebook, Inc.
      * All rights reserved.
      *
      * This source code is licensed under the BSD-style license found in the
      * LICENSE file in the root directory of this source tree. An additional grant
      * of patent rights can be found in the PATENTS file in the same directory.
      *
      * 
      * @format
      */(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);