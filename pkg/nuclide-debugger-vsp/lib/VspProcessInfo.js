'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VSP_DEBUGGER_SERVICE_NAME = undefined;

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

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line rulesdir/no-cross-atom-imports
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

const VSP_DEBUGGER_SERVICE_NAME = exports.VSP_DEBUGGER_SERVICE_NAME = 'vscode-adapter';

class VspProcessInfo extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerProcessInfo {

  constructor(targetUri, debugMode, adapterType, adapterExecutable, showThreads, config) {
    super(VSP_DEBUGGER_SERVICE_NAME, targetUri);
    this._debugMode = debugMode;
    this._adapterType = adapterType;
    this._adapterExecutable = adapterExecutable;
    this._showThreads = showThreads;
    this._config = config;
  }

  clone() {
    return new VspProcessInfo(this._targetUri, this._debugMode, this._adapterType, Object.assign({}, this._adapterExecutable), this._showThreads, Object.assign({}, this._config));
  }

  getDebuggerCapabilities() {
    return Object.assign({}, super.getDebuggerCapabilities(), {
      conditionalBreakpoints: true,
      threads: this._showThreads,
      setVariable: true,
      completionsRequest: true
    });
  }

  getDebuggerProps() {
    return Object.assign({}, super.getDebuggerProps());
  }

  debug() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const rpcService = _this._getRpcService();
      const outputDisposable = (0, (_nuclideDebugger || _load_nuclideDebugger()).registerConsoleLogging)(_this._adapterType, rpcService.getOutputWindowObservable().refCount());
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-vscode-debugger-launch', {
        type: _this._adapterType,
        mode: _this._debugMode
      });

      if (!outputDisposable) {
        throw new Error('Debugger output service not available');
      }

      try {
        yield rpcService.debug(_this._adapterExecutable, _this._debugMode, _this._config);
        return new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerInstance(_this, rpcService, new (_UniversalDisposable || _load_UniversalDisposable()).default(outputDisposable));
      } catch (error) {
        outputDisposable.dispose();
        throw error;
      }
    })();
  }

  getAdapterType() {
    return this._adapterType;
  }

  getDebugMode() {
    return this._debugMode;
  }

  getConfig() {
    return this._config;
  }

  _getRpcService() {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getVSCodeDebuggerAdapterServiceByNuclideUri)(this.getTargetUri());
    return new service.VSCodeDebuggerAdapterService(this._adapterType);
  }
}
exports.default = VspProcessInfo;