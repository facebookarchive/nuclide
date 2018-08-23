"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPathToLogDir = getPathToLogDir;
exports.getPathToLogFile = getPathToLogFile;
exports.getDefaultConfig = getDefaultConfig;
exports.LOG_FILE_PATH = void 0;

function _systemInfo() {
  const data = require("../../commons-node/system-info");

  _systemInfo = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
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
const LOG_DIRECTORY = _nuclideUri().default.join(_os.default.tmpdir(), `/nuclide-${_os.default.userInfo().username}-logs`);

const LOG_FILE_PATH = _nuclideUri().default.join(LOG_DIRECTORY, 'nuclide.log');

exports.LOG_FILE_PATH = LOG_FILE_PATH;
const MAX_LOG_SIZE = 1024 * 1024;
const MAX_LOG_BACKUPS = 10;

function getPathToLogDir() {
  return LOG_DIRECTORY;
}

function getPathToLogFile() {
  return LOG_FILE_PATH;
}

function getDefaultConfig() {
  const appenders = [{
    type: require.resolve("../VendorLib/fileAppender"),
    filename: LOG_FILE_PATH,
    maxLogSize: MAX_LOG_SIZE,
    backups: MAX_LOG_BACKUPS,
    layout: {
      type: 'pattern',
      // Format log in following pattern:
      // yyyy-MM-dd HH:mm:ss.mil $Level (pid:$pid) $categroy - $message.
      pattern: `%d{ISO8601} %p (pid:${process.pid}) %c - %m`
    }
  }]; // Anything not in Atom doesn't have a visible console.

  if (typeof atom === 'object') {
    appenders.push({
      type: 'logLevelFilter',
      level: 'WARN',
      appender: {
        type: require.resolve("./consoleAppender")
      }
    });
    appenders.push({
      type: 'logLevelFilter',
      level: 'ALL',
      appender: {
        type: require.resolve("./nuclideConsoleAppender")
      }
    });
  } else {
    // Make sure FATAL errors make it to stderr.
    appenders.push({
      type: 'logLevelFilter',
      level: 'FATAL',
      appender: {
        type: require.resolve("./consoleAppender"),
        stderr: true
      }
    });
  }

  if (!(0, _systemInfo().isRunningInTest)()) {
    appenders.push({
      type: require.resolve("./processTrackingAppender"),
      category: _process().LOG_CATEGORY
    });

    try {
      const scribeAppenderPath = require.resolve("../fb/scribeAppender");

      appenders.push({
        type: 'logLevelFilter',
        // Anything less than ERROR is ignored by the backend anyway.
        level: 'ERROR',
        appender: {
          type: scribeAppenderPath,
          scribeCategory: 'errorlog_arsenal'
        }
      });
    } catch (err) {// We're running in open-source: ignore.
    }
  }

  return {
    appenders
  };
}