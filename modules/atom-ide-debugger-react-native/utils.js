'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.REACT_NATIVE_PACKAGER_DEFAULT_PORT = undefined;
exports.getReactNativeAttachProcessInfo = getReactNativeAttachProcessInfo;
exports.getReactNativeLaunchProcessInfo = getReactNativeLaunchProcessInfo;

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

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

const REACT_NATIVE_PACKAGER_DEFAULT_PORT = exports.REACT_NATIVE_PACKAGER_DEFAULT_PORT = 8081;

function getReactNativeAttachProcessInfo(args) {
  return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(args.program, 'attach', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.REACT_NATIVE, null, args, { threads: false });
}

function getReactNativeLaunchProcessInfo(args) {
  return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VspProcessInfo(args.program, 'launch', (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.REACT_NATIVE, null, args, { threads: false });
}