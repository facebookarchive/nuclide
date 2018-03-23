'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAttachTargetList = exports.createLogFilePaste = exports.getLaunchArgs = exports.getDebuggerArgs = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getDebuggerArgs = exports.getDebuggerArgs = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (config) {
    switch (config.action) {
      case 'launch':
        const launchConfig = config;
        return getLaunchArgs(launchConfig);
      case 'attach':
        const attachConfig = config;
        return _getAttachArgs(attachConfig);
      default:
        throw new Error('Invalid launch/attach action');
    }
  });

  return function getDebuggerArgs(_x) {
    return _ref.apply(this, arguments);
  };
})();

let getLaunchArgs = exports.getLaunchArgs = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (config) {
    const launchWrapperCommand = config.launchWrapperCommand != null && config.launchWrapperCommand.trim() !== '' ? _expandPath(config.launchWrapperCommand, (_nuclideUri || _load_nuclideUri()).default.dirname(config.targetUri)) : null;

    // Launch the script with cwd set to the directory the launch wrapper
    // command is in, if a wrapper is specified. Otherwise try to use the
    // cwd provided by the front-end, and finally fall back to the directory
    // of the target uri.
    const cwd = launchWrapperCommand != null ? (_nuclideUri || _load_nuclideUri()).default.dirname(launchWrapperCommand) : config.cwd != null && config.cwd.trim() !== '' ? config.cwd : (_nuclideUri || _load_nuclideUri()).default.dirname(config.targetUri);

    // Expand paths in the launch config from the front end.
    if (config.hhvmRuntimePath != null) {
      config.hhvmRuntimePath = _expandPath(config.hhvmRuntimePath, cwd);
    }

    config.launchScriptPath = _expandPath(config.launchScriptPath, cwd);

    const deferArgs = [];
    let debugPort = null;
    if (config.deferLaunch) {
      debugPort = yield (0, (_serverPort || _load_serverPort()).getAvailableServerPort)();
      deferArgs.push('--vsDebugPort');
      deferArgs.push(debugPort);
    }

    const hhvmPath = yield _getHhvmPath(config);
    const launchArgs = launchWrapperCommand != null ? [launchWrapperCommand, config.launchScriptPath] : [config.launchScriptPath];

    let hhvmRuntimeArgs = config.hhvmRuntimeArgs;
    try {
      // $FlowFB
      const fbConfig = require('./fbConfig');
      hhvmRuntimeArgs = fbConfig.getHHVMRuntimeArgs(config);
    } catch (_) {}

    const hhvmArgs = [...hhvmRuntimeArgs, '--mode', 'vsdebug', ...deferArgs, ...launchArgs, ...config.scriptArgs];

    const startupDocumentPath = yield _getStartupDocumentPath(config);

    const logFilePath = yield _getHHVMLogFilePath();

    return {
      hhvmPath,
      hhvmArgs,
      startupDocumentPath,
      logFilePath,
      debugPort,
      cwd
    };
  });

  return function getLaunchArgs(_x2) {
    return _ref2.apply(this, arguments);
  };
})();

let _getHHVMLogFilePath = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* () {
    const path = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), `nuclide-${_os.default.userInfo().username}-logs`, 'hhvm-debugger.log');

    yield _rotateHHVMLogs(path);
    yield _createLogFile(path);
    return path;
  });

  return function _getHHVMLogFilePath() {
    return _ref3.apply(this, arguments);
  };
})();

let _createLogFile = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (path) {
    // Ensure the log file exists, and is write-able by everyone so that
    // HHVM, which is running as a different user, can append to it.
    const mode = 0o666;
    try {
      const fd = yield (_fsPromise || _load_fsPromise()).default.open(path, 'a+', mode);
      if (fd >= 0) {
        yield (_fsPromise || _load_fsPromise()).default.chmod(path, mode);
      }
      _fs.default.close(fd, function () {});
    } catch (_) {}
  });

  return function _createLogFile(_x3) {
    return _ref4.apply(this, arguments);
  };
})();

let _rotateHHVMLogs = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (path) {
    let fileStat;
    try {
      fileStat = yield (_fsPromise || _load_fsPromise()).default.stat(path);
    } catch (_) {
      return;
    }

    // Cap the size of the log file so it can't grow forever.
    const MAX_LOG_FILE_SIZE_BYTES = 512 * 1024; // 0.5 MB
    const MAX_LOGS_TO_KEEP = 5;
    if (fileStat.size >= MAX_LOG_FILE_SIZE_BYTES) {
      // Rotate the logs.
      for (let i = MAX_LOGS_TO_KEEP - 1; i >= 0; i--) {
        const fromFile = i > 0 ? path + i : path;
        const toFile = path + (i + 1);

        // eslint-disable-next-line no-await-in-loop
        const exists = yield (_fsPromise || _load_fsPromise()).default.exists(toFile);
        if (exists) {
          try {
            // eslint-disable-next-line no-await-in-loop
            yield (_fsPromise || _load_fsPromise()).default.unlink(toFile).catch(function () {});
          } catch (_) {}
        }

        try {
          // eslint-disable-next-line no-await-in-loop
          yield (_fsPromise || _load_fsPromise()).default.mv(fromFile, toFile).catch(function () {});
        } catch (_) {}
      }
    }
  });

  return function _rotateHHVMLogs(_x4) {
    return _ref5.apply(this, arguments);
  };
})();

let createLogFilePaste = exports.createLogFilePaste = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* () {
    try {
      // $FlowFB
      const fbPaste = require('../../fb-pastebin');
      return (_fsPromise || _load_fsPromise()).default.readFile((yield _getHHVMLogFilePath()), 'utf8').then(function (contents) {
        return fbPaste.createPasteFromContents(contents, { title: 'HHVM-Debugger' });
      });
    } catch (error) {
      return '';
    }
  });

  return function createLogFilePaste() {
    return _ref6.apply(this, arguments);
  };
})();

let _getAttachArgs = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (config) {
    const startupDocumentPath = yield _getStartupDocumentPath(config);
    const logFilePath = yield _getHHVMLogFilePath();

    let debugPort = config.debugPort;
    if (debugPort == null) {
      try {
        // $FlowFB
        const fetch = require('../../commons-node/fb-sitevar').fetchSitevarOnce;
        const siteVar = yield fetch('NUCLIDE_VSP_DEBUGGER_CONFIG');
        if (siteVar != null && siteVar.hhvm_attach_port != null) {
          debugPort = siteVar.hhvm_attach_port;
        }
      } catch (e) {}

      if (debugPort != null) {
        config.debugPort = debugPort;
      }
    }

    return {
      debugPort,
      startupDocumentPath,
      logFilePath
    };
  });

  return function _getAttachArgs(_x5) {
    return _ref7.apply(this, arguments);
  };
})();

let _getStartupDocumentPath = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (config) {
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
  });

  return function _getStartupDocumentPath(_x6) {
    return _ref8.apply(this, arguments);
  };
})();

let _getHhvmPath = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (config) {
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
  });

  return function _getHhvmPath(_x7) {
    return _ref9.apply(this, arguments);
  };
})();

let getAttachTargetList = exports.getAttachTargetList = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* () {
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
  });

  return function getAttachTargetList() {
    return _ref10.apply(this, arguments);
  };
})();

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _serverPort;

function _load_serverPort() {
  return _serverPort = require('../../commons-node/serverPort');
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

var _fs = _interopRequireDefault(require('fs'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_HHVM_PATH = '/usr/local/bin/hhvm';

// The default path (relative to Hack Root) to use for the startup document,
// which is loaded by the dummy request thread in the debugger backend.
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

function _expandPath(path, cwd) {
  // Expand a path to interpret ~/ as home and ./ as relative
  // to the current working directory.
  return path.startsWith('./') ? (_nuclideUri || _load_nuclideUri()).default.resolve(cwd != null ? (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(cwd) : '', path.substring(2)) : (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(path);
}