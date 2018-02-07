'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BootstrapInfo = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _nuclideDebugger;

function _load_nuclideDebugger() {
  return _nuclideDebugger = require('../../nuclide-debugger');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

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

class BootstrapInfo extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerProcessInfo {

  constructor(targetUri, bootstrapInfo) {
    super('lldb', targetUri);
    this._bootstrapInfo = bootstrapInfo;
  }

  clone() {
    return new BootstrapInfo(this._targetUri, this._bootstrapInfo);
  }

  getDebuggerCapabilities() {
    return Object.assign({}, super.getDebuggerCapabilities(), {
      singleThreadStepping: true,
      threads: true
    });
  }

  getDebuggerProps() {
    return super.getDebuggerProps();
  }

  debug() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const rpcService = _this._getRpcService();
      let debugSession = null;
      let outputDisposable = (0, (_nuclideDebugger || _load_nuclideDebugger()).registerConsoleLogging)('LLDB', rpcService.getOutputWindowObservable().refCount());
      try {
        yield rpcService.bootstrap(_this._bootstrapInfo).refCount().toPromise();
        // Start websocket server with Chrome after launch completed.

        if (!outputDisposable) {
          throw new Error('Invariant violation: "outputDisposable"');
        }

        debugSession = new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerInstance(_this, rpcService, new (_UniversalDisposable || _load_UniversalDisposable()).default(outputDisposable));
        outputDisposable = null;
      } finally {
        if (outputDisposable != null) {
          outputDisposable.dispose();
        }
      }
      return debugSession;
    })();
  }

  getDebuggerConfig() {
    return {
      logLevel: (0, (_utils || _load_utils()).getConfig)().serverLogLevel,
      pythonBinaryPath: (0, (_utils || _load_utils()).getConfig)().pythonBinaryPath,
      buckConfigRootFile: (0, (_utils || _load_utils()).getConfig)().buckConfigRootFile,
      lldbPythonPath:
      // flowlint-next-line sketchy-null-string:off
      this._bootstrapInfo.lldbPythonPath || (0, (_utils || _load_utils()).getConfig)().lldbPythonPath,
      envPythonPath: ''
    };
  }

  _getRpcService() {
    const debuggerConfig = this.getDebuggerConfig();
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('NativeDebuggerService', this.getTargetUri());

    if (!service) {
      throw new Error('Invariant violation: "service"');
    }

    return new service.NativeDebuggerService(debuggerConfig);
  }
}
exports.BootstrapInfo = BootstrapInfo;
// eslint-disable-next-line rulesdir/no-cross-atom-imports