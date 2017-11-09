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

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _utils2;

function _load_utils2() {
  return _utils2 = require('./utils');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LaunchProcessInfo extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerProcessInfo {

  constructor(targetUri, launchTarget, launchWrapperCommand, useTerminal, scriptArguments) {
    super('hhvm', targetUri);
    this._launchTarget = launchTarget;
    this._launchWrapperCommand = launchWrapperCommand;
    this._useTerminal = useTerminal;
    this._scriptArguments = scriptArguments != null ? scriptArguments : '';
  }

  clone() {
    return new LaunchProcessInfo(this._targetUri, this._launchTarget, this._launchWrapperCommand, this._useTerminal);
  }

  getDebuggerCapabilities() {
    return Object.assign({}, super.getDebuggerCapabilities(), {
      conditionalBreakpoints: true,
      continueToLocation: true,
      setVariable: true,
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

      if (_this._scriptArguments !== '') {
        sessionConfig.scriptArguments = (0, (_string || _load_string()).shellParse)(_this._scriptArguments);
      }

      if (_this._launchWrapperCommand != null) {
        sessionConfig.launchWrapperCommand = _this._launchWrapperCommand;
      }

      const remoteService = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote');
      const deferLaunch = sessionConfig.deferLaunch = _this._useTerminal && remoteService.getTerminal() != null;

      (_utils || _load_utils()).default.info(`Connection session config: ${JSON.stringify(sessionConfig)}`);

      const result = yield rpcService.debug(sessionConfig);
      (_utils || _load_utils()).default.info(`Launch process result: ${result}`);

      if (deferLaunch) {
        const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostname(_this.getTargetUri());
        const launchUri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, _this._launchTarget);
        const runtimeArgs = (0, (_string || _load_string()).shellParse)(sessionConfig.phpRuntimeArgs);
        const scriptArgs = (0, (_string || _load_string()).shellParse)(_this._launchTarget);

        if (!(remoteService != null)) {
          throw new Error('Invariant violation: "remoteService != null"');
        }

        yield remoteService.launchDebugTargetInTerminal(launchUri, sessionConfig.launchWrapperCommand != null ? sessionConfig.launchWrapperCommand : sessionConfig.phpRuntimePath, [...runtimeArgs, ...scriptArgs, ...sessionConfig.scriptArguments], (_nuclideUri || _load_nuclideUri()).default.dirname(launchUri), new Map());
      }

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