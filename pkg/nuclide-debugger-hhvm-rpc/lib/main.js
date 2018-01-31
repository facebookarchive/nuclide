'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.HhvmDebuggerService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _serverPort;

function _load_serverPort() {
  return _serverPort = require('../../commons-node/serverPort');
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _os = _interopRequireDefault(require('os'));

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_HHVM_PATH = '/usr/local/bin/hhvm';

// The default path (relative to Hack Root) to use for the startup document,
// which is loaded by the dummy request thread in the debugger backend.

// eslint-disable-next-line rulesdir/no-unresolved
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

const DEFAULT_STARTUP_DOC_PATH = 'scripts/vsdebug_includes.php';

class HhvmDebuggerService extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerRpcServiceBase {

  constructor() {
    super('HHVM');
  }

  getOutputWindowObservable() {
    return super.getOutputWindowObservable();
  }

  getAtomNotificationObservable() {
    return super.getAtomNotificationObservable();
  }

  // TODO: Provided for interface compatibility with the old debugger, which is
  // needed in PhpDebuggerInstance on the client side. Remove once the old debugger
  // is removed.
  getNotificationObservable() {
    return super.getAtomNotificationObservable();
  }

  getServerMessageObservable() {
    return super.getServerMessageObservable();
  }

  debug(config) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const debuggerArgs = yield _this._getDebuggerArgs(config);
      _this._translator = new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsDebugSessionTranslator('hhvm', {
        command: _this._getNodePath(),
        args: [require.resolve('./hhvmWrapper.js')]
      }, config.action, debuggerArgs, _this.getClientCallback(), _this.getLogger());

      _this._subscriptions.add(_this._translator, _this._translator.observeSessionEnd().subscribe(_this.dispose.bind(_this)), function () {
        return _this._translator = null;
      });

      (0, (_nullthrows || _load_nullthrows()).default)(_this._translator).initilize();
      return `HHVM debugger ${config.action === 'launch' ? 'launched' : 'attached'}.`;
    })();
  }

  sendCommand(message) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this2._translator) {
        _this2._translator.processCommand(JSON.parse(message));
      }
    })();
  }

  _getDebuggerArgs(config) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      switch (config.action) {
        case 'launch':
          const launchConfig = config;
          return _this3.getLaunchArgs(launchConfig);
        case 'attach':
          const attachConfig = config;
          return _this3._getAttachArgs(attachConfig);
        default:
          throw new Error('Invalid launch/attach action');
      }
    })();
  }

  _expandPath(path, cwd) {
    // Expand a path to interpret ~/ as home and ./ as relative
    // to the current working directory.
    return path.startsWith('./') ? (_nuclideUri || _load_nuclideUri()).default.resolve(cwd != null ? (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(cwd) : '', path.substring(2)) : (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(path);
  }

  getLaunchArgs(config) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const cwd = (_nuclideUri || _load_nuclideUri()).default.dirname(config.targetUri);

      // Expand paths in the launch config from the front end.
      if (config.hhvmRuntimePath != null) {
        config.hhvmRuntimePath = _this4._expandPath(config.hhvmRuntimePath, cwd);
      }

      config.launchScriptPath = _this4._expandPath(config.launchScriptPath, cwd);

      if (config.launchWrapperCommand != null) {
        config.launchWrapperCommand = _this4._expandPath(config.launchWrapperCommand, cwd);
      }

      const deferArgs = [];
      let debugPort = null;
      if (config.deferLaunch) {
        debugPort = yield (0, (_serverPort || _load_serverPort()).getAvailableServerPort)();
        deferArgs.push('--vsDebugPort');
        deferArgs.push(debugPort);
      }

      const hhvmPath = yield _this4._getHhvmPath(config);
      const launchArgs = config.launchWrapperCommand != null && config.launchWrapperCommand.trim() !== '' ? [config.launchWrapperCommand, config.launchScriptPath] : [config.launchScriptPath];

      let hhvmRuntimeArgs = config.hhvmRuntimeArgs;
      try {
        // $FlowFB
        const fbConfig = require('./fbConfig');
        hhvmRuntimeArgs = fbConfig.getHHVMRuntimeArgs(config);
      } catch (_) {}

      const hhvmArgs = [...hhvmRuntimeArgs, '--mode', 'vsdebug', ...deferArgs, ...launchArgs, ...config.scriptArgs];

      const startupDocumentPath = yield _this4._getStartupDocumentPath(config);

      const logFilePath = _this4._getHHVMLogFilePath();

      return {
        hhvmPath,
        hhvmArgs,
        startupDocumentPath,
        logFilePath,
        debugPort,
        cwd: config.launchWrapperCommand != null ? (_nuclideUri || _load_nuclideUri()).default.dirname(config.launchWrapperCommand) : cwd
      };
    })();
  }

  _getHHVMLogFilePath() {
    return (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), `nuclide-${_os.default.userInfo().username}-logs`, 'hhvm-debugger.log');
  }

  createLogFilePaste() {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        // $FlowFB
        const fbPaste = require('../../fb-pastebin');
        return (_fsPromise || _load_fsPromise()).default.readFile(_this5._getHHVMLogFilePath(), 'utf8').then(function (contents) {
          return fbPaste.createPasteFromContents(contents, { title: 'HHVM-Debugger' });
        });
      } catch (error) {
        return '';
      }
    })();
  }

  _getAttachArgs(config) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const startupDocumentPath = yield _this6._getStartupDocumentPath(config);
      const logFilePath = _this6._getHHVMLogFilePath();
      return {
        debugPort: config.debugPort,
        startupDocumentPath,
        logFilePath
      };
    })();
  }

  _getStartupDocumentPath(config) {
    return (0, _asyncToGenerator.default)(function* () {
      if (config.startupDocumentPath != null) {
        const configPath = (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(config.startupDocumentPath);
        if (yield (_fsPromise || _load_fsPromise()).default.exists(configPath)) {
          return configPath;
        }
      }

      // Otherwise, fall back to the default path, relative to the current
      // hack root directory.
      const filePath = (_nuclideUri || _load_nuclideUri()).default.getPath(config.targetUri);
      const hackRoot = yield (_fsPromise || _load_fsPromise()).default.findNearestFile('.hhconfig', filePath);
      const startupDocPath = (_nuclideUri || _load_nuclideUri()).default.join(hackRoot != null ? hackRoot : '', DEFAULT_STARTUP_DOC_PATH);

      if (yield (_fsPromise || _load_fsPromise()).default.exists(startupDocPath)) {
        return startupDocPath;
      }

      return null;
    })();
  }

  _getNodePath() {
    try {
      // $FlowFB
      return require('nuclide-debugger-common/fb-constants').DEVSERVER_NODE_PATH;
    } catch (error) {
      return 'node';
    }
  }

  _getHhvmPath(config) {
    return (0, _asyncToGenerator.default)(function* () {
      // If the client specified an HHVM runtime path, and it exists, use that.
      if (config.hhvmRuntimePath != null && config.hhvmRuntimePath !== '') {
        const exists = yield (_fsPromise || _load_fsPromise()).default.exists(config.hhvmRuntimePath);
        if (exists) {
          return String(config.hhvmRuntimePath);
        }
      }

      // Otherwise try to fall back to a default path.
      try {
        // $FlowFB
        return require('nuclide-debugger-common/fb-constants').DEVSERVER_HHVM_PATH;
      } catch (error) {
        return DEFAULT_HHVM_PATH;
      }
    })();
  }

  getAttachTargetList() {
    return (0, _asyncToGenerator.default)(function* () {
      const commands = yield (0, (_process || _load_process()).runCommand)('ps', ['-e', '-o', 'pid,args'], {}).toPromise();
      return commands.toString().split('\n').filter(function (line) {
        return line.indexOf('vsDebugPort') > 0;
      }).map(function (line) {
        const words = line.trim().split(' ');
        const pid = Number(words[0]);
        const command = words.slice(1).join(' ');
        return {
          pid,
          command
        };
      });
    })();
  }

  dispose() {
    return super.dispose();
  }
}
exports.HhvmDebuggerService = HhvmDebuggerService;