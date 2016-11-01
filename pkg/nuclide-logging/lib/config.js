'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefaultConfig = exports.CurrentDateFileAppender = exports.getServerLogAppenderConfig = exports.LOG_FILE_PATH = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getServerLogAppenderConfig = exports.getServerLogAppenderConfig = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    // Skip config scribe_cat logger if
    // 1) running in test environment
    // 2) or running in Atom client
    // 3) or running in open sourced version of nuclide
    // 4) or the scribe_cat command is missing.
    if ((0, (_systemInfo || _load_systemInfo()).isRunningInTest)() || (0, (_systemInfo || _load_systemInfo()).isRunningInClient)() || !(yield (_fsPromise || _load_fsPromise()).default.exists(scribeAppenderPath)) || !(yield (_ScribeProcess || _load_ScribeProcess()).default.isScribeCatOnPath())) {
      return null;
    }

    return {
      type: 'logLevelFilter',
      level: 'DEBUG',
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

/**
 * @return The absolute path to the log file for the specified date.
 */


let getDefaultConfig = exports.getDefaultConfig = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {

    if (!logDirectoryInitialized) {
      yield (_fsPromise || _load_fsPromise()).default.mkdirp(LOG_DIRECTORY);
      logDirectoryInitialized = true;
    }

    const config = {
      appenders: [{
        type: 'logLevelFilter',
        level: 'WARN',
        appender: {
          type: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, './consoleAppender')
        }
      }, {
        type: 'logLevelFilter',
        level: 'ALL',
        appender: {
          type: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, './nuclideConsoleAppender')
        }
      }, CurrentDateFileAppender]
    };

    const serverLogAppenderConfig = yield getServerLogAppenderConfig();
    if (serverLogAppenderConfig) {
      config.appenders.push(serverLogAppenderConfig);
    }

    return config;
  });

  return function getDefaultConfig() {
    return _ref2.apply(this, arguments);
  };
})();

exports.getPathToLogFileForDate = getPathToLogFileForDate;
exports.getPathToLogFileForToday = getPathToLogFileForToday;

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

var _userInfo;

function _load_userInfo() {
  return _userInfo = _interopRequireDefault(require('../../commons-node/userInfo'));
}

var _os = _interopRequireDefault(require('os'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _date_format;

function _load_date_format() {
  return _date_format = require('log4js/lib/date_format');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const LOG_DIRECTORY = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), `/nuclide-${ (0, (_userInfo || _load_userInfo()).default)().username }-logs`);
const LOG_FILE_PATH = exports.LOG_FILE_PATH = (_nuclideUri || _load_nuclideUri()).default.join(LOG_DIRECTORY, 'nuclide.log');

let logDirectoryInitialized = false;
const scribeAppenderPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../fb/scribeAppender.js');

const LOG4JS_DATE_FORMAT = '-yyyy-MM-dd';

function getPathToLogFileForDate(targetDate) {
  return LOG_FILE_PATH + (0, (_date_format || _load_date_format()).asString)(LOG4JS_DATE_FORMAT, targetDate);
}

/**
 * @return The absolute path to the log file for today.
 */
function getPathToLogFileForToday() {
  return getPathToLogFileForDate(new Date());
}

const CurrentDateFileAppender = exports.CurrentDateFileAppender = {
  type: 'dateFile',
  alwaysIncludePattern: true,
  absolute: true,
  filename: LOG_FILE_PATH,
  pattern: LOG4JS_DATE_FORMAT,
  layout: {
    type: 'pattern',
    // Format log in following pattern:
    // yyyy-MM-dd HH:mm:ss.mil $Level (pid:$pid) $categroy - $message.
    pattern: `%d{ISO8601} %p (pid:${ process.pid }) %c - %m`
  }
};