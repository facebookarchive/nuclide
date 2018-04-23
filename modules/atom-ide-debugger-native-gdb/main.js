'use strict';var _createPackage;













function _load_createPackage() {return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));}var _autogenUtils;
function _load_autogenUtils() {return _autogenUtils = require('nuclide-debugger-common/autogen-utils');}var _constants;
function _load_constants() {return _constants = require('nuclide-debugger-common/constants');}var _AutoGenLaunchAttachProvider;
function _load_AutoGenLaunchAttachProvider() {return _AutoGenLaunchAttachProvider = _interopRequireDefault(require('nuclide-debugger-common/AutoGenLaunchAttachProvider'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}

class Activation {
  constructor() {}
  dispose() {}

  createDebuggerProvider() {
    return {
      name: 'Native - GDB (C/C++)',
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).default(
        'Native - GDB (C/C++)',
        connection,
        (0, (_autogenUtils || _load_autogenUtils()).getNativeAutoGenConfig)((_constants || _load_constants()).VsAdapterTypes.NATIVE_GDB));

      } };

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