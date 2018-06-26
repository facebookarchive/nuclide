'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDebuggerArgs = getDebuggerArgs;
exports.getLaunchArgs = getLaunchArgs;
exports.getHhvmStackTraces = getHhvmStackTraces;
exports.getDebugServerLog = getDebugServerLog;
exports.getAttachTargetList = getAttachTargetList;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _serverPort;

function _load_serverPort() {
  return _serverPort = require('../../../modules/nuclide-commons/serverPort');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _os = _interopRequireDefault(require('os'));

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _fs = _interopRequireDefault(require('fs'));

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

const DEFAULT_HHVM_PATH = '/usr/local/bin/hhvm';

// The default path (relative to Hack Root) to use for the startup document,
// which is loaded by the dummy request thread in the debugger backend.
const DEFAULT_STARTUP_DOC_PATH = 'scripts/vsdebug_includes.php';

async function getDebuggerArgs(config) {
  switch (config.action) {
    case 'launch':
      const launchConfig = config;
      return getLaunchArgs(launchConfig);
    case 'attach':
      const attachConfig = config;
      return _getAttachArgs(attachConfig);
    default:
      throw new Error('Invalid launch/attach action:' + JSON.stringify(config));
  }
}

function _expandPath(path, cwd) {
  // Expand a path to interpret ~/ as home and ./ as relative
  // to the current working directory.
  return path.startsWith('./') ? (_nuclideUri || _load_nuclideUri()).default.resolve(cwd != null ? (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(cwd) : '', path.substring(2)) : (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(path);
}

async function getLaunchArgs(config) {
  const launchWrapperCommand = config.launchWrapperCommand != null && config.launchWrapperCommand.trim() !== '' ? _expandPath(config.launchWrapperCommand, (_nuclideUri || _load_nuclideUri()).default.dirname(config.targetUri)) : null;

  const cwd = config.cwd != null && config.cwd.trim() !== '' ? config.cwd : (_nuclideUri || _load_nuclideUri()).default.dirname(config.targetUri);

  // Expand paths in the launch config from the front end.
  if (config.hhvmRuntimePath != null) {
    config.hhvmRuntimePath = _expandPath(config.hhvmRuntimePath, cwd);
  }

  config.launchScriptPath = _expandPath(config.launchScriptPath, cwd);

  const deferArgs = [];
  let debugPort = null;
  if (config.deferLaunch) {
    debugPort = await (0, (_serverPort || _load_serverPort()).getAvailableServerPort)();
    deferArgs.push('--vsDebugPort');
    deferArgs.push(debugPort);
  }

  const hhvmPath = await _getHhvmPath(config);
  const launchArgs = launchWrapperCommand != null ? [launchWrapperCommand, config.launchScriptPath] : [config.launchScriptPath];

  let hhvmRuntimeArgs = config.hhvmRuntimeArgs || [];
  try {
    // $FlowFB
    const fbConfig = require('./fbConfig');
    hhvmRuntimeArgs = fbConfig.getHHVMRuntimeArgs(config);
  } catch (_) {}

  const hhvmArgs = [...hhvmRuntimeArgs, '--mode', 'vsdebug', ...deferArgs, ...launchArgs, ...config.scriptArgs];

  const startupDocumentPath = await _getStartupDocumentPath(config);

  const logFilePath = await _getHHVMLogFilePath();

  const warnOnInterceptedFunctions = await (0, (_passesGK || _load_passesGK()).default)('nuclide_debugger_hhvm_warn_on_intercept');

  return {
    hhvmPath,
    hhvmArgs,
    startupDocumentPath,
    logFilePath,
    debugPort,
    cwd,
    warnOnInterceptedFunctions,
    notifyOnBpCalibration: true
  };
}

async function _getHHVMLogFilePath() {
  const path = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), `nuclide-${_os.default.userInfo().username}-logs`, 'hhvm-debugger.log');

  await _rotateHHVMLogs(path);
  await _createLogFile(path);
  return path;
}

async function _createLogFile(path) {
  // Ensure the log file exists, and is write-able by everyone so that
  // HHVM, which is running as a different user, can append to it.
  const mode = 0o666;
  try {
    const fd = await (_fsPromise || _load_fsPromise()).default.open(path, 'a+', mode);
    if (fd >= 0) {
      await (_fsPromise || _load_fsPromise()).default.chmod(path, mode);
    }
    _fs.default.close(fd, () => {});
  } catch (_) {}
}

async function _rotateHHVMLogs(path) {
  let fileStat;
  try {
    fileStat = await (_fsPromise || _load_fsPromise()).default.stat(path);
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
      const exists = await (_fsPromise || _load_fsPromise()).default.exists(toFile);
      if (exists) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await (_fsPromise || _load_fsPromise()).default.unlink(toFile).catch(() => {});
        } catch (_) {}
      }

      try {
        // eslint-disable-next-line no-await-in-loop
        await (_fsPromise || _load_fsPromise()).default.mv(fromFile, toFile).catch(() => {});
      } catch (_) {}
    }
  }
}

async function getHhvmStackTraces() {
  try {
    // $FlowFB
    const fbConfig = require('./fbConfig');
    return fbConfig.getHhvmStackTraces();
  } catch (_) {}
  return [];
}

async function getDebugServerLog() {
  try {
    return (_fsPromise || _load_fsPromise()).default.readFile((await _getHHVMLogFilePath()), 'utf8');
  } catch (error) {
    return '';
  }
}

async function _getAttachArgs(config) {
  const startupDocumentPath = await _getStartupDocumentPath(config);
  const logFilePath = await _getHHVMLogFilePath();

  let debugPort = config.debugPort;
  if (debugPort == null) {
    try {
      // $FlowFB
      const fetch = require('../../commons-node/fb-sitevar').fetchSitevarOnce;
      const siteVar = await fetch('NUCLIDE_VSP_DEBUGGER_CONFIG');
      if (siteVar != null && siteVar.hhvm_attach_port != null) {
        debugPort = siteVar.hhvm_attach_port;
      }
    } catch (e) {}

    if (debugPort != null) {
      config.debugPort = debugPort;
    }
  }

  const warnOnInterceptedFunctions = await (0, (_passesGK || _load_passesGK()).default)('nuclide_debugger_hhvm_warn_on_intercept');

  return {
    debugPort,
    startupDocumentPath,
    logFilePath,
    warnOnInterceptedFunctions,
    notifyOnBpCalibration: true
  };
}

async function _getStartupDocumentPath(config) {
  if (config.startupDocumentPath != null) {
    const configPath = (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(config.startupDocumentPath);
    if (await (_fsPromise || _load_fsPromise()).default.exists(configPath)) {
      return configPath;
    }
  }

  // Otherwise, fall back to the default path, relative to the current
  // hack root directory.
  const filePath = (_nuclideUri || _load_nuclideUri()).default.getPath(config.targetUri);
  const hackRoot = await (_fsPromise || _load_fsPromise()).default.findNearestFile('.hhconfig', filePath);
  const startupDocPath = (_nuclideUri || _load_nuclideUri()).default.join(hackRoot != null ? hackRoot : '', DEFAULT_STARTUP_DOC_PATH);

  if (await (_fsPromise || _load_fsPromise()).default.exists(startupDocPath)) {
    return startupDocPath;
  }

  return null;
}

async function _getHhvmPath(config) {
  // If the client specified an HHVM runtime path, and it exists, use that.
  if (config.hhvmRuntimePath != null && config.hhvmRuntimePath !== '') {
    const exists = await (_fsPromise || _load_fsPromise()).default.exists(config.hhvmRuntimePath);
    if (exists) {
      return String(config.hhvmRuntimePath);
    }
  }

  // Otherwise try to fall back to a default path.
  try {
    // $FlowFB
    return require('./fbConfig').DEVSERVER_HHVM_PATH;
  } catch (error) {
    return DEFAULT_HHVM_PATH;
  }
}

async function getAttachTargetList() {
  const commands = await (0, (_process || _load_process()).runCommand)('ps', ['-e', '-o', 'pid,args'], {}).toPromise();
  return commands.toString().split('\n').filter(line => line.indexOf('vsDebugPort') > 0).map(line => {
    const words = line.trim().split(' ');
    const pid = Number(words[0]);
    const command = words.slice(1).join(' ');
    return {
      pid,
      command
    };
  });
}