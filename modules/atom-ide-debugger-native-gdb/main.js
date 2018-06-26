'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../nuclide-commons-atom/createPackage'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../nuclide-debugger-common');
}

var _autogenUtils;

function _load_autogenUtils() {
  return _autogenUtils = require('../nuclide-debugger-common/autogen-utils');
}

var _AutoGenLaunchAttachProvider;

function _load_AutoGenLaunchAttachProvider() {
  return _AutoGenLaunchAttachProvider = require('../nuclide-debugger-common/AutoGenLaunchAttachProvider');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {
  constructor() {}
  dispose() {}

  createDebuggerProvider() {
    return {
      type: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NATIVE_GDB,
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).AutoGenLaunchAttachProvider((_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterNames.NATIVE_GDB, connection, (0, (_autogenUtils || _load_autogenUtils()).getNativeAutoGenConfig)((_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NATIVE_GDB), async () => {
          // GDB not available on Win32.
          return Promise.resolve(process.platform !== 'win32');
        });
      }
    };
  }
} /**
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

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);