'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FileAppender = exports.LOG_FILE_PATH = undefined;
exports.getServerLogAppenderConfig = getServerLogAppenderConfig;
exports.getPathToLogFile = getPathToLogFile;
exports.getDefaultConfig = getDefaultConfig;
exports.addAdditionalLogFile = addAdditionalLogFile;
exports.getAdditionalLogFiles = getAdditionalLogFiles;

var _ScribeProcess;

function _load_ScribeProcess() {
  return _ScribeProcess = _interopRequireDefault(require('../../commons-node/ScribeProcess'));
}

var _systemInfo;

function _load_systemInfo() {
  return _systemInfo = require('../../commons-node/system-info');
}

var _fs = _interopRequireDefault(require('fs'));

var _os = _interopRequireDefault(require('os'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LOG_DIRECTORY = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), `/nuclide-${_os.default.userInfo().username}-logs`); /**
                                                                                                                                                   * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                   * All rights reserved.
                                                                                                                                                   *
                                                                                                                                                   * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                   * the root directory of this source tree.
                                                                                                                                                   *
                                                                                                                                                   * 
                                                                                                                                                   * @format
                                                                                                                                                   */

const LOG_FILE_PATH = exports.LOG_FILE_PATH = (_nuclideUri || _load_nuclideUri()).default.join(LOG_DIRECTORY, 'nuclide.log');

const scribeAppenderPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../fb/scribeAppender.js');

const additionalLogFiles = [];

const MAX_LOG_SIZE = 1024 * 1024;
const MAX_LOG_BACKUPS = 10;

function getServerLogAppenderConfig() {
  // Skip config scribe_cat logger if
  // 1) or running in open sourced version of nuclide
  // 2) or the scribe_cat command is missing.
  if (!_fs.default.existsSync(scribeAppenderPath) || !(_ScribeProcess || _load_ScribeProcess()).default.isScribeCatOnPath()) {
    return null;
  }

  return {
    type: 'logLevelFilter',
    // Anything less than ERROR is ignored by the backend anyway.
    level: 'ERROR',
    appender: {
      type: scribeAppenderPath,
      scribeCategory: 'errorlog_arsenal'
    }
  };
}

function getPathToLogFile() {
  return LOG_FILE_PATH;
}

const FileAppender = exports.FileAppender = {
  type: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, './fileAppender'),
  filename: LOG_FILE_PATH,
  maxLogSize: MAX_LOG_SIZE,
  backups: MAX_LOG_BACKUPS,
  layout: {
    type: 'pattern',
    // Format log in following pattern:
    // yyyy-MM-dd HH:mm:ss.mil $Level (pid:$pid) $categroy - $message.
    pattern: `%d{ISO8601} %p (pid:${process.pid}) %c - %m`
  }
};

const baseConfig = {
  appenders: [{
    type: 'logLevelFilter',
    level: 'ALL',
    appender: {
      type: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, './nuclideConsoleAppender')
    }
  }, FileAppender]
};

function getDefaultConfigClient() {
  if (!((0, (_systemInfo || _load_systemInfo()).isRunningInTest)() || (0, (_systemInfo || _load_systemInfo()).isRunningInClient)())) {
    throw new Error('Invariant violation: "isRunningInTest() || isRunningInClient()"');
  }

  if (!baseConfig.appenders) {
    throw new Error('Invariant violation: "baseConfig.appenders"');
  }

  return Object.assign({}, baseConfig, {
    appenders: [...baseConfig.appenders, {
      type: 'logLevelFilter',
      level: 'WARN',
      appender: {
        type: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, './consoleAppender')
      }
    }]
  });
}

function getDefaultConfig() {
  if ((0, (_systemInfo || _load_systemInfo()).isRunningInClient)() || (0, (_systemInfo || _load_systemInfo()).isRunningInTest)()) {
    return getDefaultConfigClient();
  }

  // Do not print server logs to stdout/stderr.
  // These are normally just piped to a .nohup.out file, so doing this just causes
  // the log files to be duplicated.
  const serverLogAppenderConfig = getServerLogAppenderConfig();

  if (!baseConfig.appenders) {
    throw new Error('Invariant violation: "baseConfig.appenders"');
  }

  if (serverLogAppenderConfig) {
    return Object.assign({}, baseConfig, {
      appenders: [...baseConfig.appenders, serverLogAppenderConfig]
    });
  }

  return baseConfig;
}

function addAdditionalLogFile(title, filename) {
  const filePath = (_nuclideUri || _load_nuclideUri()).default.join(LOG_DIRECTORY, filename);
  const logFile = {
    title,
    filename: filePath
  };

  if (additionalLogFiles.filter(entry => entry.filename === filename && entry.title === title).length === 0) {
    additionalLogFiles.push(logFile);
  }
}

function getAdditionalLogFiles() {
  return additionalLogFiles;
}