"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _nuclideDebuggerCommon() {
  const data = require("../../../modules/nuclide-debugger-common");

  _nuclideDebuggerCommon = function () {
    return data;
  };

  return data;
}

function _autogenUtils() {
  const data = require("../../../modules/nuclide-debugger-common/autogen-utils");

  _autogenUtils = function () {
    return data;
  };

  return data;
}

function _passesGK() {
  const data = _interopRequireDefault(require("../../commons-node/passesGK"));

  _passesGK = function () {
    return data;
  };

  return data;
}

function _AutoGenLaunchAttachProvider() {
  const data = require("../../../modules/nuclide-debugger-common/AutoGenLaunchAttachProvider");

  _AutoGenLaunchAttachProvider = function () {
    return data;
  };

  return data;
}

function _HhvmLaunchAttachProvider() {
  const data = _interopRequireDefault(require("./HhvmLaunchAttachProvider"));

  _HhvmLaunchAttachProvider = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
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

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
class Activation {
  constructor() {
    this._subscriptions = new (_UniversalDisposable().default)();

    _fsPromise().default.exists(_path.default.join(__dirname, 'fb-marker')).then(exists => {
      const isOpenSource = !exists;

      this._registerPrepackDebugProvider(isOpenSource);

      this._registerLLDBProvider();

      this._registerHHVMDebugProvider();
    });
  }

  _registerDebugProvider(provider) {
    this._subscriptions.add(atom.packages.serviceHub.provide('debugger.provider', '0.0.0', provider));
  }

  async _registerPrepackDebugProvider(isOpenSource) {
    if ((await (0, _passesGK().default)('nuclide_debugger_prepack')) || isOpenSource) {
      this._registerDebugProvider({
        type: _nuclideDebuggerCommon().VsAdapterTypes.PREPACK,
        getLaunchAttachProvider: connection => {
          return new (_AutoGenLaunchAttachProvider().AutoGenLaunchAttachProvider)(_nuclideDebuggerCommon().VsAdapterNames.PREPACK, connection, (0, _utils().getPrepackAutoGenConfig)());
        }
      });
    }
  }

  _registerLLDBProvider() {
    this._registerDebugProvider({
      type: _nuclideDebuggerCommon().VsAdapterTypes.NATIVE_LLDB,
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider().AutoGenLaunchAttachProvider)(_nuclideDebuggerCommon().VsAdapterNames.NATIVE_LLDB, connection, (0, _autogenUtils().getNativeAutoGenConfig)(_nuclideDebuggerCommon().VsAdapterTypes.NATIVE_LLDB));
      }
    });
  }

  async _registerHHVMDebugProvider() {
    this._registerDebugProvider({
      type: _nuclideDebuggerCommon().VsAdapterTypes.HHVM,
      getLaunchAttachProvider: connection => {
        return new (_HhvmLaunchAttachProvider().default)(_nuclideDebuggerCommon().VsAdapterNames.HHVM, connection);
      }
    });
  }

  dispose() {
    this._subscriptions.dispose();
  }

}

(0, _createPackage().default)(module.exports, Activation);