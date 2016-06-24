var getServerLogAppenderConfig = _asyncToGenerator(function* () {
  // Skip config scribe_cat logger if
  // 1) running in test environment
  // 2) or running in Atom client
  // 3) or running in open sourced version of nuclide
  // 4) or the scribe_cat command is missing.
  if ((0, (_commonsNodeSystemInfo2 || _commonsNodeSystemInfo()).isRunningInTest)() || (0, (_commonsNodeSystemInfo2 || _commonsNodeSystemInfo()).isRunningInClient)() || !(yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.exists(scribeAppenderPath)) || !(yield (_commonsNodeScribeProcess2 || _commonsNodeScribeProcess()).default.isScribeCatOnPath())) {
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
}

/**
 * @return The absolute path to the log file for the specified date.
 */
);

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeScribeProcess2;

function _commonsNodeScribeProcess() {
  return _commonsNodeScribeProcess2 = _interopRequireDefault(require('../../commons-node/ScribeProcess'));
}

var _commonsNodeSystemInfo2;

function _commonsNodeSystemInfo() {
  return _commonsNodeSystemInfo2 = require('../../commons-node/system-info');
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _commonsNodeUserInfo2;

function _commonsNodeUserInfo() {
  return _commonsNodeUserInfo2 = _interopRequireDefault(require('../../commons-node/userInfo'));
}

var _os2;

function _os() {
  return _os2 = _interopRequireDefault(require('os'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var LOG_DIRECTORY = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join((_os2 || _os()).default.tmpdir(), '/nuclide-' + (0, (_commonsNodeUserInfo2 || _commonsNodeUserInfo()).default)().username + '-logs');
var LOG_FILE_PATH = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(LOG_DIRECTORY, 'nuclide.log');

var logDirectoryInitialized = false;
var scribeAppenderPath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, '../fb/scribeAppender.js');

var LOG4JS_DATE_FORMAT = '-yyyy-MM-dd';

function getPathToLogFileForDate(targetDate) {
  var log4jsFormatter = require('log4js/lib/date_format').asString;
  return LOG_FILE_PATH + log4jsFormatter(LOG4JS_DATE_FORMAT, targetDate);
}

/**
 * @return The absolute path to the log file for today.
 */
function getPathToLogFileForToday() {
  return getPathToLogFileForDate(new Date());
}

module.exports = {
  getDefaultConfig: _asyncToGenerator(function* () {

    if (!logDirectoryInitialized) {
      yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.mkdirp(LOG_DIRECTORY);
      logDirectoryInitialized = true;
    }

    var config = {
      appenders: [{
        type: 'logLevelFilter',
        level: 'INFO',
        appender: {
          type: (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, './consoleAppender')
        }
      }, {
        type: 'dateFile',
        alwaysIncludePattern: true,
        absolute: true,
        filename: LOG_FILE_PATH,
        pattern: LOG4JS_DATE_FORMAT,
        layout: {
          type: 'pattern',
          // Format log in following pattern:
          // yyyy-MM-dd HH:mm:ss.mil $Level (pid:$pid) $categroy - $message.
          pattern: '%d{ISO8601} %p (pid:' + process.pid + ') %c - %m'
        }
      }]
    };

    var serverLogAppenderConfig = yield getServerLogAppenderConfig();
    if (serverLogAppenderConfig) {
      config.appenders.push(serverLogAppenderConfig);
    }

    return config;
  }),
  getPathToLogFileForToday: getPathToLogFileForToday,
  LOG_FILE_PATH: LOG_FILE_PATH,
  __test__: {
    getPathToLogFileForDate: getPathToLogFileForDate
  }
};