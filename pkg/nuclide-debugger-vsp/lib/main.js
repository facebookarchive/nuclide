'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../../modules/nuclide-debugger-common');
}

var _autogenUtils;

function _load_autogenUtils() {
  return _autogenUtils = require('../../../modules/nuclide-debugger-common/autogen-utils');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _AutoGenLaunchAttachProvider;

function _load_AutoGenLaunchAttachProvider() {
  return _AutoGenLaunchAttachProvider = require('../../../modules/nuclide-debugger-common/AutoGenLaunchAttachProvider');
}

var _HhvmLaunchAttachProvider;

function _load_HhvmLaunchAttachProvider() {
  return _HhvmLaunchAttachProvider = _interopRequireDefault(require('./HhvmLaunchAttachProvider'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _path = _interopRequireDefault(require('path'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor() {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    (_fsPromise || _load_fsPromise()).default.exists(_path.default.join(__dirname, 'fb-marker')).then(exists => {
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
    if ((await (0, (_passesGK || _load_passesGK()).default)('nuclide_debugger_prepack')) || isOpenSource) {
      this._registerDebugProvider({
        type: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.PREPACK,
        getLaunchAttachProvider: connection => {
          return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).AutoGenLaunchAttachProvider((_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterNames.PREPACK, connection, (0, (_utils || _load_utils()).getPrepackAutoGenConfig)());
        }
      });
    }
  }

  _registerLLDBProvider() {
    this._registerDebugProvider({
      type: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NATIVE_LLDB,
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).AutoGenLaunchAttachProvider((_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterNames.NATIVE_LLDB, connection, (0, (_autogenUtils || _load_autogenUtils()).getNativeAutoGenConfig)((_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NATIVE_LLDB));
      }
    });
  }

  async _registerHHVMDebugProvider() {
    this._registerDebugProvider({
      type: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.HHVM,
      getLaunchAttachProvider: connection => {
        return new (_HhvmLaunchAttachProvider || _load_HhvmLaunchAttachProvider()).default((_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterNames.HHVM, connection);
      }
    });
  }

  createDebuggerConfigurator() {
    return {
      resolveConfiguration: (_utils || _load_utils()).resolveConfiguration,
      adapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NATIVE_LLDB
    };
  }

  consumeDebuggerSourcePaths(sourcePathService) {
    (0, (_utils || _load_utils()).setSourcePathsService)(sourcePathService);
  }

  dispose() {
    this._subscriptions.dispose();
  }
}
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
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

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);