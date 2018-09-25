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
class Activation {
  constructor() {
    this._subscriptions = new (_UniversalDisposable().default)();

    this._registerLLDBProvider();

    this._registerHHVMDebugProvider();
  }

  _javaCheck(_gkService) {
    if (_gkService != null) {
      _gkService.passesGK('nuclide_extrafeatures_debugging').then(passes => {
        if (passes) {
          try {
            this._subscriptions.add( // $FlowFB
            require("./fb-JavaCheck").javaCheck());
          } catch (_) {}
        }
      });
    }
  }

  _registerDebugProvider(provider) {
    this._subscriptions.add(atom.packages.serviceHub.provide('debugger.provider', '0.0.0', provider));
  }

  _registerLLDBProvider() {
    this._registerDebugProvider({
      type: _nuclideDebuggerCommon().VsAdapterTypes.NATIVE_LLDB,
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider().AutoGenLaunchAttachProvider)(_nuclideDebuggerCommon().VsAdapterNames.NATIVE_LLDB, connection, (0, _autogenUtils().getNativeAutoGenConfig)(_nuclideDebuggerCommon().VsAdapterTypes.NATIVE_LLDB));
      }
    });
  }

  _registerHHVMDebugProvider() {
    this._registerDebugProvider({
      type: _nuclideDebuggerCommon().VsAdapterTypes.HHVM,
      getLaunchAttachProvider: connection => {
        return new (_HhvmLaunchAttachProvider().default)(_nuclideDebuggerCommon().VsAdapterNames.HHVM, connection);
      }
    });
  }

  consumeGatekeeperService(service) {
    let _gkService = service;

    this._javaCheck(_gkService);

    return new (_UniversalDisposable().default)(() => _gkService = null);
  }

  dispose() {
    this._subscriptions.dispose();
  }

}

(0, _createPackage().default)(module.exports, Activation);