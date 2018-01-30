'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LaunchProcessInfo = undefined;

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

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line rulesdir/no-cross-atom-imports
class LaunchProcessInfo extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerProcessInfo {

  constructor(targetUri, launchTargetInfo) {
    super('lldb', targetUri);
    this._launchTargetInfo = launchTargetInfo;
    this._shouldFilterBreaks = false;
  }

  clone() {
    return new LaunchProcessInfo(this._targetUri, this._launchTargetInfo);
  }

  getDebuggerCapabilities() {
    return Object.assign({}, super.getDebuggerCapabilities(), {
      conditionalBreakpoints: true,
      continueToLocation: true,
      disassembly: true,
      readOnlyTarget: this._launchTargetInfo.coreDump != null && this._launchTargetInfo.coreDump !== '',
      registers: true,
      singleThreadStepping: true,
      threads: true
    });
  }

  getDebuggerProps() {
    return super.getDebuggerProps();
  }

  shouldFilterBreak(pausedEvent) {
    if (this._shouldFilterBreaks) {
      // When starting a process in the terminal, we expect a couple additional
      // startup breaks that should be filtered out and hidden from the user.
      // There will be a signal break for the exec system call, and often a
      // signal for the terminal resize event.
      const { reason } = pausedEvent;
      if (reason === 'exec' || reason === 'signal') {
        return true;
      }

      // Once a real breakpoint is seen, remaining breaks should be unfiltered.
      this._shouldFilterBreaks = false;
    }

    return false;
  }

  _launchInTerminal(rpcService, remoteService) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Enable filtering on the first few breaks, when lanuching in the terminal
      // we expect to see additional startup breaks due to signals sent by execing
      // the child process.
      _this._shouldFilterBreaks = true;

      // Build a map of environment variables specified in the launch target info.
      const environmentVariables = new Map();
      _this._launchTargetInfo.environmentVariables.forEach(function (variable) {
        const [key, value] = variable.split('=');
        environmentVariables.set(key, value);
      });

      // Instruct the native debugger backend to prepare to launch in the terminal.
      // It will return the command and args to launch in the remote terminal.
      const terminalLaunchInfo = yield rpcService.prepareForTerminalLaunch(_this._launchTargetInfo);

      const {
        targetExecutable,
        launchCwd,
        launchCommand,
        launchArgs
      } = terminalLaunchInfo;

      // In the terminal, launch the command with the arguments specified by the
      // debugger back end.
      // Note: this returns true on a successful launch, false otherwise.
      return remoteService.launchDebugTargetInTerminal(targetExecutable, launchCommand, launchArgs, launchCwd, environmentVariables);
    })();
  }

  debug() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const rpcService = _this2._getRpcService();
      const remoteService = (0, (_nullthrows || _load_nullthrows()).default)((yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote')));

      if (typeof _this2.basepath === 'string') {
        _this2._launchTargetInfo.basepath = _this2.basepath;
      }

      let debugSession = null;
      let outputDisposable = (0, (_nuclideDebugger || _load_nuclideDebugger()).registerConsoleLogging)('LLDB', rpcService.getOutputWindowObservable().refCount());
      try {
        // Attempt to launch into a terminal if it is supported.
        let launched = false;
        if (remoteService.canLaunchDebugTargetInTerminal(_this2._targetUri) && (0, (_utils || _load_utils()).getConfig)().useTerminal && (yield (0, (_passesGK || _load_passesGK()).default)('nuclide_debugger_launch_in_terminal'))) {
          launched = yield _this2._launchInTerminal(rpcService, remoteService);
        }

        // Otherwise, fall back to launching without a terminal.
        if (!launched) {
          yield rpcService.launch(_this2._launchTargetInfo).refCount().toPromise();
        }

        // Start websocket server with Chrome after launch completed.

        if (!outputDisposable) {
          throw new Error('Invariant violation: "outputDisposable"');
        }

        debugSession = new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerInstance(_this2, rpcService, new (_UniversalDisposable || _load_UniversalDisposable()).default(outputDisposable));
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
      this._launchTargetInfo.lldbPythonPath || (0, (_utils || _load_utils()).getConfig)().lldbPythonPath,
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