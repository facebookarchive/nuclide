"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _nuclideDebuggerCommon() {
  const data = require("../nuclide-debugger-common");

  _nuclideDebuggerCommon = function () {
    return data;
  };

  return data;
}

function _AutoGenLaunchAttachProvider() {
  const data = require("../nuclide-debugger-common/AutoGenLaunchAttachProvider");

  _AutoGenLaunchAttachProvider = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

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
class Activation {
  constructor() {}

  dispose() {}

  createDebuggerProvider() {
    return {
      type: _nuclideDebuggerCommon().VsAdapterTypes.JAVA_ANDROID,
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider().AutoGenLaunchAttachProvider)(_nuclideDebuggerCommon().VsAdapterNames.JAVA_ANDROID, connection, (0, _utils().getJavaAndroidConfig)());
      }
    };
  }

  createDebuggerConfigurator() {
    return [{
      resolveConfiguration: _utils().resolveConfiguration,
      adapterType: _nuclideDebuggerCommon().VsAdapterTypes.JAVA_ANDROID
    }];
  }

}

(0, _createPackage().default)(module.exports, Activation);