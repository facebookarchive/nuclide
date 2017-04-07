'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefaultConfig = exports.FileAppender = exports.getServerLogAppenderConfig = exports.LOG_FILE_PATH = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getServerLogAppenderConfig = exports.getServerLogAppenderConfig = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    // Skip config scribe_cat logger if
    // 1) or running in open sourced version of nuclide
    // 2) or the scribe_cat command is missing.
    if (!(yield (_fsPromise || _load_fsPromise()).default.exists(scribeAppenderPath)) || !(yield (_ScribeProcess || _load_ScribeProcess()).default.isScribeCatOnPath())) {
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
  });

  return function getServerLogAppenderConfig() {
    return _ref.apply(this, arguments);
  };
})();

let getDefaultConfig = exports.getDefaultConfig = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    if (!logDirectoryInitialized) {
      yield (_fsPromise || _load_fsPromise()).default.mkdirp(LOG_DIRECTORY);
      logDirectoryInitialized = true;
    }

    const config = {
      appenders: [{
        type: 'logLevelFilter',
        level: 'ALL',
        appender: {
          type: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, './nuclideConsoleAppender')
        }
      }, FileAppender]
    };

    // Do not print server logs to stdout/stderr.
    // These are normally just piped to a .nohup.out file, so doing this just causes
    // the log files to be duplicated.
    if ((0, (_systemInfo || _load_systemInfo()).isRunningInTest)() || (0, (_systemInfo || _load_systemInfo()).isRunningInClient)()) {
      config.appenders.push({
        type: 'logLevelFilter',
        level: 'WARN',
        appender: {
          type: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, './consoleAppender')
        }
      });
    } else {
      const serverLogAppenderConfig = yield getServerLogAppenderConfig();
      if (serverLogAppenderConfig) {
        config.appenders.push(serverLogAppenderConfig);
      }
    }

    return config;
  });

  return function getDefaultConfig() {
    return _ref2.apply(this, arguments);
  };
})();

exports.getPathToLogFile = getPathToLogFile;
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

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _os = _interopRequireDefault(require('os'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
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
 */

const LOG_DIRECTORY = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), `/nuclide-${_os.default.userInfo().username}-logs`);
const LOG_FILE_PATH = exports.LOG_FILE_PATH = (_nuclideUri || _load_nuclideUri()).default.join(LOG_DIRECTORY, 'nuclide.log');

let logDirectoryInitialized = false;
const scribeAppenderPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../fb/scribeAppender.js');

const additionalLogFiles = [];

const MAX_LOG_SIZE = 1024 * 1024;
const MAX_LOG_BACKUPS = 10;

function getPathToLogFile() {
  return LOG_FILE_PATH;
}

const FileAppender = exports.FileAppender = {
  type: 'file',
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