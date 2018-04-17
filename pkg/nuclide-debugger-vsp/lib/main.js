'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _AutoGenLaunchAttachProvider;

function _load_AutoGenLaunchAttachProvider() {
  return _AutoGenLaunchAttachProvider = _interopRequireDefault(require('nuclide-debugger-common/AutoGenLaunchAttachProvider'));
}

var _HhvmLaunchAttachProvider;

function _load_HhvmLaunchAttachProvider() {
  return _HhvmLaunchAttachProvider = _interopRequireDefault(require('./HhvmLaunchAttachProvider'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _path = _interopRequireDefault(require('path'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class Activation {

  constructor() {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();

    (_fsPromise || _load_fsPromise()).default.exists(_path.default.join(__dirname, 'fb-marker')).then(exists => {
      const isOpenSource = !exists;
      this._registerPrepackDebugProvider(isOpenSource);
      this._registerLLDBProvider();
      this._registerGDBProvider();
      this._registerHHVMDebugProvider();
    });
  }

  _registerDebugProvider(provider) {
    this._subscriptions.add(atom.packages.serviceHub.provide('debugger.provider', '0.0.0', provider));
  }

  _registerPrepackDebugProvider(isOpenSource) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if ((yield (0, (_passesGK || _load_passesGK()).default)('nuclide_debugger_prepack')) || isOpenSource) {
        _this._registerDebugProvider({
          name: 'Prepack',
          getLaunchAttachProvider: function (connection) {
            return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).default('Prepack', connection, (0, (_utils || _load_utils()).getPrepackAutoGenConfig)());
          }
        });
      }
    })();
  }

  _registerLLDBProvider() {
    this._registerDebugProvider({
      name: 'Native - LLDB (C/C++)',
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).default('Native - LLDB (C/C++)', connection, (0, (_utils || _load_utils()).getNativeAutoGenConfig)((_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NATIVE_LLDB));
      }
    });
  }

  _registerGDBProvider() {
    this._registerDebugProvider({
      name: 'Native - GDB (C/C++)',
      getLaunchAttachProvider: connection => {
        return new (_AutoGenLaunchAttachProvider || _load_AutoGenLaunchAttachProvider()).default('Native - GDB (C/C++)', connection, (0, (_utils || _load_utils()).getNativeAutoGenConfig)((_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NATIVE_GDB));
      }
    });
  }

  _registerHHVMDebugProvider() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this2._registerDebugProvider({
        name: 'Hack / PHP',
        getLaunchAttachProvider: function (connection) {
          return new (_HhvmLaunchAttachProvider || _load_HhvmLaunchAttachProvider()).default('Hack / PHP', connection);
        }
      });
    })();
  }

  createDebuggerConfigurator() {
    return {
      resolveConfiguration: (_utils || _load_utils()).resolveConfiguration
    };
  }

  dispose() {
    this._subscriptions.dispose();
  }
}
// eslint-disable-next-line rulesdir/prefer-nuclide-uri


(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);