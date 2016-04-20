var getServerLogAppenderConfig = _asyncToGenerator(function* () {
  // Skip config scribe_cat logger if
  // 1) running in test environment
  // 2) or running in Atom client
  // 3) or running in open sourced version of nuclide
  // 4) or the scribe_cat command is missing.
  if (clientInfo.isRunningInTest() || clientInfo.isRunningInClient() || !(yield fsPromise.exists(scribeAppenderPath)) || !(yield ScribeProcess.isScribeCatOnPath())) {
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

var _require = require('../../nuclide-commons');

var clientInfo = _require.clientInfo;
var fsPromise = _require.fsPromise;
var systemInfo = _require.systemInfo;
var ScribeProcess = _require.ScribeProcess;

var os = require('os');
var path = require('path');

var USER = require('../../nuclide-commons').env.USER;

var LOG_FILE_PATH = undefined;

if (systemInfo.isRunningInWindows()) {
  LOG_FILE_PATH = path.join(os.tmpdir(), '/nuclide-' + USER + '-logs/nuclide.log');
} else {
  LOG_FILE_PATH = '/tmp/nuclide-' + USER + '-logs/nuclide.log';
}

var logDirectory = path.dirname(LOG_FILE_PATH);
var logDirectoryInitialized = false;
var scribeAppenderPath = path.join(__dirname, '../fb/scribeAppender.js');

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
      yield fsPromise.mkdirp(logDirectory);
      logDirectoryInitialized = true;
    }

    var config = {
      appenders: [{
        type: 'logLevelFilter',
        level: 'INFO',
        appender: {
          type: path.join(__dirname, './consoleAppender')
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
//# sourceMappingURL=data:application/json;base64,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LEVBQUUsU0FBUzs7O0FBR2YsaUJBQU8sMkJBQXlCLE9BQU8sQ0FBQyxHQUFHLGNBQVc7U0FDdkQ7T0FDRixDQUNGO0tBQ0YsQ0FBQzs7QUFFRixRQUFNLHVCQUF1QixHQUFHLE1BQU0sMEJBQTBCLEVBQUUsQ0FBQztBQUNuRSxRQUFJLHVCQUF1QixFQUFFO0FBQzNCLFlBQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLHVCQUF1QixDQUFDLENBQUM7S0FDaEQ7O0FBRUQsV0FBTyxNQUFNLENBQUM7R0FDZixDQUFBO0FBQ0QsMEJBQXdCLEVBQXhCLHdCQUF3QjtBQUN4QixlQUFhLEVBQWIsYUFBYTtBQUNiLFVBQVEsRUFBRTtBQUNSLDJCQUF1QixFQUF2Qix1QkFBdUI7R0FDeEI7Q0FDRixDQUFDIiwiZmlsZSI6ImNvbmZpZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtMb2dnaW5nQXBwZW5kZXJ9IGZyb20gJy4vdHlwZXMnO1xuY29uc3Qge2NsaWVudEluZm8sIGZzUHJvbWlzZSwgc3lzdGVtSW5mbywgU2NyaWJlUHJvY2Vzc30gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKTtcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB7VVNFUn0gPSByZXF1aXJlKCcuLi8uLi9udWNsaWRlLWNvbW1vbnMnKS5lbnY7XG5sZXQgTE9HX0ZJTEVfUEFUSDtcblxuaWYgKHN5c3RlbUluZm8uaXNSdW5uaW5nSW5XaW5kb3dzKCkpIHtcbiAgTE9HX0ZJTEVfUEFUSCA9IHBhdGguam9pbihvcy50bXBkaXIoKSwgYC9udWNsaWRlLSR7VVNFUn0tbG9ncy9udWNsaWRlLmxvZ2ApO1xufSBlbHNlIHtcbiAgTE9HX0ZJTEVfUEFUSCA9IGAvdG1wL251Y2xpZGUtJHtVU0VSfS1sb2dzL251Y2xpZGUubG9nYDtcbn1cblxuY29uc3QgbG9nRGlyZWN0b3J5ID0gcGF0aC5kaXJuYW1lKExPR19GSUxFX1BBVEgpO1xubGV0IGxvZ0RpcmVjdG9yeUluaXRpYWxpemVkID0gZmFsc2U7XG5jb25zdCBzY3JpYmVBcHBlbmRlclBhdGggPSBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4vZmIvc2NyaWJlQXBwZW5kZXIuanMnKTtcblxuY29uc3QgTE9HNEpTX0RBVEVfRk9STUFUID0gJy15eXl5LU1NLWRkJztcblxuYXN5bmMgZnVuY3Rpb24gZ2V0U2VydmVyTG9nQXBwZW5kZXJDb25maWcoKTogUHJvbWlzZTw/T2JqZWN0PiB7XG4gIC8vIFNraXAgY29uZmlnIHNjcmliZV9jYXQgbG9nZ2VyIGlmXG4gIC8vIDEpIHJ1bm5pbmcgaW4gdGVzdCBlbnZpcm9ubWVudFxuICAvLyAyKSBvciBydW5uaW5nIGluIEF0b20gY2xpZW50XG4gIC8vIDMpIG9yIHJ1bm5pbmcgaW4gb3BlbiBzb3VyY2VkIHZlcnNpb24gb2YgbnVjbGlkZVxuICAvLyA0KSBvciB0aGUgc2NyaWJlX2NhdCBjb21tYW5kIGlzIG1pc3NpbmcuXG4gIGlmIChjbGllbnRJbmZvLmlzUnVubmluZ0luVGVzdCgpIHx8XG4gICAgICBjbGllbnRJbmZvLmlzUnVubmluZ0luQ2xpZW50KCkgfHxcbiAgICAgICEoYXdhaXQgZnNQcm9taXNlLmV4aXN0cyhzY3JpYmVBcHBlbmRlclBhdGgpKSB8fFxuICAgICAgIShhd2FpdCBTY3JpYmVQcm9jZXNzLmlzU2NyaWJlQ2F0T25QYXRoKCkpKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHR5cGU6ICdsb2dMZXZlbEZpbHRlcicsXG4gICAgbGV2ZWw6ICdERUJVRycsXG4gICAgYXBwZW5kZXI6IHtcbiAgICAgIHR5cGU6IHNjcmliZUFwcGVuZGVyUGF0aCxcbiAgICAgIHNjcmliZUNhdGVnb3J5OiAnZXJyb3Jsb2dfYXJzZW5hbCcsXG4gICAgfSxcbiAgfTtcbn1cblxuLyoqXG4gKiBAcmV0dXJuIFRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBsb2cgZmlsZSBmb3IgdGhlIHNwZWNpZmllZCBkYXRlLlxuICovXG5mdW5jdGlvbiBnZXRQYXRoVG9Mb2dGaWxlRm9yRGF0ZSh0YXJnZXREYXRlOiBEYXRlKTogc3RyaW5nIHtcbiAgY29uc3QgbG9nNGpzRm9ybWF0dGVyID0gcmVxdWlyZSgnbG9nNGpzL2xpYi9kYXRlX2Zvcm1hdCcpLmFzU3RyaW5nO1xuICByZXR1cm4gTE9HX0ZJTEVfUEFUSCArIGxvZzRqc0Zvcm1hdHRlcihMT0c0SlNfREFURV9GT1JNQVQsIHRhcmdldERhdGUpO1xufVxuXG4vKipcbiAqIEByZXR1cm4gVGhlIGFic29sdXRlIHBhdGggdG8gdGhlIGxvZyBmaWxlIGZvciB0b2RheS5cbiAqL1xuZnVuY3Rpb24gZ2V0UGF0aFRvTG9nRmlsZUZvclRvZGF5KCk6IHN0cmluZyB7XG4gIHJldHVybiBnZXRQYXRoVG9Mb2dGaWxlRm9yRGF0ZShuZXcgRGF0ZSgpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGFzeW5jIGdldERlZmF1bHRDb25maWcoKTogUHJvbWlzZTxMb2dnaW5nQXBwZW5kZXI+IHtcblxuICAgIGlmICghbG9nRGlyZWN0b3J5SW5pdGlhbGl6ZWQpIHtcbiAgICAgIGF3YWl0IGZzUHJvbWlzZS5ta2RpcnAobG9nRGlyZWN0b3J5KTtcbiAgICAgIGxvZ0RpcmVjdG9yeUluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBjb25maWcgPSB7XG4gICAgICBhcHBlbmRlcnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdsb2dMZXZlbEZpbHRlcicsXG4gICAgICAgICAgbGV2ZWw6ICdJTkZPJyxcbiAgICAgICAgICBhcHBlbmRlcjoge1xuICAgICAgICAgICAgdHlwZTogcGF0aC5qb2luKF9fZGlybmFtZSwgJy4vY29uc29sZUFwcGVuZGVyJyksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHR5cGU6ICdkYXRlRmlsZScsXG4gICAgICAgICAgYWx3YXlzSW5jbHVkZVBhdHRlcm46IHRydWUsXG4gICAgICAgICAgYWJzb2x1dGU6IHRydWUsXG4gICAgICAgICAgZmlsZW5hbWU6IExPR19GSUxFX1BBVEgsXG4gICAgICAgICAgcGF0dGVybjogTE9HNEpTX0RBVEVfRk9STUFULFxuICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgdHlwZTogJ3BhdHRlcm4nLFxuICAgICAgICAgICAgLy8gRm9ybWF0IGxvZyBpbiBmb2xsb3dpbmcgcGF0dGVybjpcbiAgICAgICAgICAgIC8vIHl5eXktTU0tZGQgSEg6bW06c3MubWlsICRMZXZlbCAocGlkOiRwaWQpICRjYXRlZ3JveSAtICRtZXNzYWdlLlxuICAgICAgICAgICAgcGF0dGVybjogYCVke0lTTzg2MDF9ICVwIChwaWQ6JHtwcm9jZXNzLnBpZH0pICVjIC0gJW1gLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH07XG5cbiAgICBjb25zdCBzZXJ2ZXJMb2dBcHBlbmRlckNvbmZpZyA9IGF3YWl0IGdldFNlcnZlckxvZ0FwcGVuZGVyQ29uZmlnKCk7XG4gICAgaWYgKHNlcnZlckxvZ0FwcGVuZGVyQ29uZmlnKSB7XG4gICAgICBjb25maWcuYXBwZW5kZXJzLnB1c2goc2VydmVyTG9nQXBwZW5kZXJDb25maWcpO1xuICAgIH1cblxuICAgIHJldHVybiBjb25maWc7XG4gIH0sXG4gIGdldFBhdGhUb0xvZ0ZpbGVGb3JUb2RheSxcbiAgTE9HX0ZJTEVfUEFUSCxcbiAgX190ZXN0X186IHtcbiAgICBnZXRQYXRoVG9Mb2dGaWxlRm9yRGF0ZSxcbiAgfSxcbn07XG4iXX0=