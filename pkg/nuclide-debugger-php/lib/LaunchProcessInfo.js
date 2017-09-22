'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchProcessInfo = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _PhpDebuggerInstance;

function _load_PhpDebuggerInstance() {
  return _PhpDebuggerInstance = require('./PhpDebuggerInstance');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _utils2;

function _load_utils2() {
  return _utils2 = require('./utils');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LaunchProcessInfo extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerProcessInfo {

  constructor(targetUri, launchTarget, launchWrapperCommand) {
    super('hhvm', targetUri);
    this._launchTarget = launchTarget;
    this._launchWrapperCommand = launchWrapperCommand;
  }

  clone() {
    return new LaunchProcessInfo(this._targetUri, this._launchTarget, this._launchWrapperCommand);
  }

  getDebuggerCapabilities() {
    return Object.assign({}, super.getDebuggerCapabilities(), {
      conditionalBreakpoints: true,
      continueToLocation: true,
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
      const sessionConfig = (0, (_utils2 || _load_utils2()).getSessionConfig)((_nuclideUri || _load_nuclideUri()).default.getPath(_this.getTargetUri()), true);

      // Set config related to script launching.
      sessionConfig.endDebugWhenNoRequests = true;
      sessionConfig.launchScriptPath = _this._launchTarget;

      if (_this._launchWrapperCommand != null) {
        sessionConfig.launchWrapperCommand = _this._launchWrapperCommand;
      }

      (_utils || _load_utils()).default.info(`Connection session config: ${JSON.stringify(sessionConfig)}`);

      const result = yield rpcService.debug(sessionConfig);
      (_utils || _load_utils()).default.info(`Launch process result: ${result}`);
      return new (_PhpDebuggerInstance || _load_PhpDebuggerInstance()).PhpDebuggerInstance(_this, rpcService);
    })();
  }

  _getRpcService() {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getPhpDebuggerServiceByNuclideUri)(this.getTargetUri());
    return new service.PhpDebuggerService();
  }
}
exports.LaunchProcessInfo = LaunchProcessInfo; /**
                                                * Copyright (c) 2015-present, Facebook, Inc.
                                                * All rights reserved.
                                                *
                                                * This source code is licensed under the license found in the LICENSE file in
                                                * the root directory of this source tree.
                                                *
                                                * 
                                                * @format
                                                */