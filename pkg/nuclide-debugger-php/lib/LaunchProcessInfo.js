'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchProcessInfo = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
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

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
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

class LaunchProcessInfo extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerProcessInfo {

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
      completionsRequest: true,
      conditionalBreakpoints: true,
      continueToLocation: true,
      setVariable: true,
      threads: true
    });
  }

  getDebuggerProps() {
    return super.getDebuggerProps();
  }

  _hhvmDebug() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getHhvmDebuggerServiceByNuclideUri)(_this.getTargetUri());
      const hhvmDebuggerService = new service.HhvmDebuggerService();
      const remoteService = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote');
      const deferLaunch = _this._useTerminal && remoteService.getTerminal() != null;

      // Honor any PHP configuration the user has in Nuclide settings.
      const userConfig = (_featureConfig || _load_featureConfig()).default.get('nuclide-debugger-php');
      const phpRuntimePath = userConfig.hhvmRuntimePath != null ? String(userConfig.hhvmRuntimePath) : null;
      const hhvmRuntimeArgs = (0, (_string || _load_string()).shellParse)(userConfig.hhvmRuntimeArgs != null ? String(userConfig.hhvmRuntimeArgs) : '');

      const config = {
        targetUri: (_nuclideUri || _load_nuclideUri()).default.getPath(_this.getTargetUri()),
        action: 'launch',
        launchScriptPath: _this._launchTarget,
        scriptArgs: (0, (_string || _load_string()).shellParse)(_this._scriptArguments),
        hhvmRuntimeArgs,
        deferLaunch
      };

      if (phpRuntimePath != null) {
        config.hhvmRuntimePath = phpRuntimePath;
      }

      if (_this._launchWrapperCommand != null) {
        config.launchWrapperCommand = _this._launchWrapperCommand;
      }

      (_utils || _load_utils()).default.info(`Connection session config: ${JSON.stringify(config)}`);

      let result;
      if (deferLaunch) {
        const startupArgs = yield hhvmDebuggerService.getLaunchArgs(config);

        // Launch the script and then convert this to an attach operation.
        const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostname(_this.getTargetUri());
        const launchUri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, _this._launchTarget);

        if (!(remoteService != null)) {
          throw new Error('Invariant violation: "remoteService != null"');
        }

        // Terminal args require everything to be a string, but debug port
        // is typed as a number.


        const terminalArgs = [];
        for (const arg of startupArgs.hhvmArgs) {
          terminalArgs.push(String(arg));
        }

        yield remoteService.launchDebugTargetInTerminal(launchUri, startupArgs.hhvmPath, terminalArgs, (_nuclideUri || _load_nuclideUri()).default.dirname(launchUri), new Map());

        const attachConfig = {
          targetUri: (_nuclideUri || _load_nuclideUri()).default.getPath(_this.getTargetUri()),
          action: 'attach',
          debugPort: startupArgs.debugPort
        };

        result = yield hhvmDebuggerService.debug(attachConfig);
      } else {
        result = yield hhvmDebuggerService.debug(config);
      }

      (_utils || _load_utils()).default.info(`Launch process result: ${result}`);
      return new (_PhpDebuggerInstance || _load_PhpDebuggerInstance()).PhpDebuggerInstance(_this, hhvmDebuggerService);
    })();
  }

  debug() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const useNewDebugger = yield (0, (_passesGK || _load_passesGK()).default)('nuclide_hhvm_debugger_vscode');
      if (useNewDebugger) {
        // TODO: Ericblue - this will be cleaned up when the old debugger
        // is removed. For now we need to leave both in place until the new
        // one is ready.
        return _this2._hhvmDebug();
      }

      const rpcService = _this2._getRpcService();
      const sessionConfig = (0, (_utils2 || _load_utils2()).getSessionConfig)((_nuclideUri || _load_nuclideUri()).default.getPath(_this2.getTargetUri()), true);

      // Set config related to script launching.
      sessionConfig.endDebugWhenNoRequests = true;
      sessionConfig.launchScriptPath = _this2._launchTarget;

      if (_this2._scriptArguments !== '') {
        sessionConfig.scriptArguments = (0, (_string || _load_string()).shellParse)(_this2._scriptArguments);
      }

      if (_this2._launchWrapperCommand != null) {
        sessionConfig.launchWrapperCommand = _this2._launchWrapperCommand;
      }

      const remoteService = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote');
      const deferLaunch = sessionConfig.deferLaunch = _this2._useTerminal && remoteService.getTerminal() != null;

      (_utils || _load_utils()).default.info(`Connection session config: ${JSON.stringify(sessionConfig)}`);

      const result = yield rpcService.debug(sessionConfig);
      (_utils || _load_utils()).default.info(`Launch process result: ${result}`);

      if (deferLaunch) {
        const hostname = (_nuclideUri || _load_nuclideUri()).default.getHostname(_this2.getTargetUri());
        const launchUri = (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(hostname, _this2._launchTarget);
        const runtimeArgs = (0, (_string || _load_string()).shellParse)(sessionConfig.phpRuntimeArgs);
        const scriptArgs = (0, (_string || _load_string()).shellParse)(_this2._launchTarget);

        if (!(remoteService != null)) {
          throw new Error('Invariant violation: "remoteService != null"');
        }

        yield remoteService.launchDebugTargetInTerminal(launchUri, sessionConfig.launchWrapperCommand != null ? sessionConfig.launchWrapperCommand : sessionConfig.phpRuntimePath, [...runtimeArgs, ...scriptArgs, ...sessionConfig.scriptArguments], (_nuclideUri || _load_nuclideUri()).default.dirname(launchUri), new Map());
      }

      return new (_PhpDebuggerInstance || _load_PhpDebuggerInstance()).PhpDebuggerInstance(_this2, rpcService);
    })();
  }

  _getRpcService() {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getPhpDebuggerServiceByNuclideUri)(this.getTargetUri());
    return new service.PhpDebuggerService();
  }
}
exports.LaunchProcessInfo = LaunchProcessInfo;