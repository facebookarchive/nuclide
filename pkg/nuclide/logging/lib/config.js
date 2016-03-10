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

var _require = require('../../commons');

var clientInfo = _require.clientInfo;
var fsPromise = _require.fsPromise;
var systemInfo = _require.systemInfo;
var ScribeProcess = _require.ScribeProcess;

var os = require('os');
var path = require('path');

var USER = require('../../commons').env.USER;

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
//# sourceMappingURL=data:application/json;base64,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RSxTQUFTOzs7QUFHZixpQkFBTywyQkFBeUIsT0FBTyxDQUFDLEdBQUcsY0FBVztTQUN2RDtPQUNGLENBQ0Y7S0FDRixDQUFDOztBQUVGLFFBQU0sdUJBQXVCLEdBQUcsTUFBTSwwQkFBMEIsRUFBRSxDQUFDO0FBQ25FLFFBQUksdUJBQXVCLEVBQUU7QUFDM0IsWUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQztLQUNoRDs7QUFFRCxXQUFPLE1BQU0sQ0FBQztHQUNmLENBQUE7QUFDRCwwQkFBd0IsRUFBeEIsd0JBQXdCO0FBQ3hCLGVBQWEsRUFBYixhQUFhO0FBQ2IsVUFBUSxFQUFFO0FBQ1IsMkJBQXVCLEVBQXZCLHVCQUF1QjtHQUN4QjtDQUNGLENBQUMiLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0xvZ2dpbmdBcHBlbmRlcn0gZnJvbSAnLi90eXBlcyc7XG5jb25zdCB7Y2xpZW50SW5mbywgZnNQcm9taXNlLCBzeXN0ZW1JbmZvLCBTY3JpYmVQcm9jZXNzfSA9IHJlcXVpcmUoJy4uLy4uL2NvbW1vbnMnKTtcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCB7VVNFUn0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJykuZW52O1xubGV0IExPR19GSUxFX1BBVEg7XG5cbmlmIChzeXN0ZW1JbmZvLmlzUnVubmluZ0luV2luZG93cygpKSB7XG4gIExPR19GSUxFX1BBVEggPSBwYXRoLmpvaW4ob3MudG1wZGlyKCksIGAvbnVjbGlkZS0ke1VTRVJ9LWxvZ3MvbnVjbGlkZS5sb2dgKTtcbn0gZWxzZSB7XG4gIExPR19GSUxFX1BBVEggPSBgL3RtcC9udWNsaWRlLSR7VVNFUn0tbG9ncy9udWNsaWRlLmxvZ2A7XG59XG5cbmNvbnN0IGxvZ0RpcmVjdG9yeSA9IHBhdGguZGlybmFtZShMT0dfRklMRV9QQVRIKTtcbmxldCBsb2dEaXJlY3RvcnlJbml0aWFsaXplZCA9IGZhbHNlO1xuY29uc3Qgc2NyaWJlQXBwZW5kZXJQYXRoID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJy4uL2ZiL3NjcmliZUFwcGVuZGVyLmpzJyk7XG5cbmNvbnN0IExPRzRKU19EQVRFX0ZPUk1BVCA9ICcteXl5eS1NTS1kZCc7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFNlcnZlckxvZ0FwcGVuZGVyQ29uZmlnKCk6IFByb21pc2U8P09iamVjdD4ge1xuICAvLyBTa2lwIGNvbmZpZyBzY3JpYmVfY2F0IGxvZ2dlciBpZlxuICAvLyAxKSBydW5uaW5nIGluIHRlc3QgZW52aXJvbm1lbnRcbiAgLy8gMikgb3IgcnVubmluZyBpbiBBdG9tIGNsaWVudFxuICAvLyAzKSBvciBydW5uaW5nIGluIG9wZW4gc291cmNlZCB2ZXJzaW9uIG9mIG51Y2xpZGVcbiAgLy8gNCkgb3IgdGhlIHNjcmliZV9jYXQgY29tbWFuZCBpcyBtaXNzaW5nLlxuICBpZiAoY2xpZW50SW5mby5pc1J1bm5pbmdJblRlc3QoKSB8fFxuICAgICAgY2xpZW50SW5mby5pc1J1bm5pbmdJbkNsaWVudCgpIHx8XG4gICAgICAhKGF3YWl0IGZzUHJvbWlzZS5leGlzdHMoc2NyaWJlQXBwZW5kZXJQYXRoKSkgfHxcbiAgICAgICEoYXdhaXQgU2NyaWJlUHJvY2Vzcy5pc1NjcmliZUNhdE9uUGF0aCgpKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnbG9nTGV2ZWxGaWx0ZXInLFxuICAgIGxldmVsOiAnREVCVUcnLFxuICAgIGFwcGVuZGVyOiB7XG4gICAgICB0eXBlOiBzY3JpYmVBcHBlbmRlclBhdGgsXG4gICAgICBzY3JpYmVDYXRlZ29yeTogJ2Vycm9ybG9nX2Fyc2VuYWwnLFxuICAgIH0sXG4gIH07XG59XG5cbi8qKlxuICogQHJldHVybiBUaGUgYWJzb2x1dGUgcGF0aCB0byB0aGUgbG9nIGZpbGUgZm9yIHRoZSBzcGVjaWZpZWQgZGF0ZS5cbiAqL1xuZnVuY3Rpb24gZ2V0UGF0aFRvTG9nRmlsZUZvckRhdGUodGFyZ2V0RGF0ZTogRGF0ZSk6IHN0cmluZyB7XG4gIGNvbnN0IGxvZzRqc0Zvcm1hdHRlciA9IHJlcXVpcmUoJ2xvZzRqcy9saWIvZGF0ZV9mb3JtYXQnKS5hc1N0cmluZztcbiAgcmV0dXJuIExPR19GSUxFX1BBVEggKyBsb2c0anNGb3JtYXR0ZXIoTE9HNEpTX0RBVEVfRk9STUFULCB0YXJnZXREYXRlKTtcbn1cblxuLyoqXG4gKiBAcmV0dXJuIFRoZSBhYnNvbHV0ZSBwYXRoIHRvIHRoZSBsb2cgZmlsZSBmb3IgdG9kYXkuXG4gKi9cbmZ1bmN0aW9uIGdldFBhdGhUb0xvZ0ZpbGVGb3JUb2RheSgpOiBzdHJpbmcge1xuICByZXR1cm4gZ2V0UGF0aFRvTG9nRmlsZUZvckRhdGUobmV3IERhdGUoKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBhc3luYyBnZXREZWZhdWx0Q29uZmlnKCk6IFByb21pc2U8TG9nZ2luZ0FwcGVuZGVyPiB7XG5cbiAgICBpZiAoIWxvZ0RpcmVjdG9yeUluaXRpYWxpemVkKSB7XG4gICAgICBhd2FpdCBmc1Byb21pc2UubWtkaXJwKGxvZ0RpcmVjdG9yeSk7XG4gICAgICBsb2dEaXJlY3RvcnlJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgY29uZmlnID0ge1xuICAgICAgYXBwZW5kZXJzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnbG9nTGV2ZWxGaWx0ZXInLFxuICAgICAgICAgIGxldmVsOiAnSU5GTycsXG4gICAgICAgICAgYXBwZW5kZXI6IHtcbiAgICAgICAgICAgIHR5cGU6IHBhdGguam9pbihfX2Rpcm5hbWUsICcuL2NvbnNvbGVBcHBlbmRlcicpLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0eXBlOiAnZGF0ZUZpbGUnLFxuICAgICAgICAgIGFsd2F5c0luY2x1ZGVQYXR0ZXJuOiB0cnVlLFxuICAgICAgICAgIGFic29sdXRlOiB0cnVlLFxuICAgICAgICAgIGZpbGVuYW1lOiBMT0dfRklMRV9QQVRILFxuICAgICAgICAgIHBhdHRlcm46IExPRzRKU19EQVRFX0ZPUk1BVCxcbiAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgIHR5cGU6ICdwYXR0ZXJuJyxcbiAgICAgICAgICAgIC8vIEZvcm1hdCBsb2cgaW4gZm9sbG93aW5nIHBhdHRlcm46XG4gICAgICAgICAgICAvLyB5eXl5LU1NLWRkIEhIOm1tOnNzLm1pbCAkTGV2ZWwgKHBpZDokcGlkKSAkY2F0ZWdyb3kgLSAkbWVzc2FnZS5cbiAgICAgICAgICAgIHBhdHRlcm46IGAlZHtJU084NjAxfSAlcCAocGlkOiR7cHJvY2Vzcy5waWR9KSAlYyAtICVtYCxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICB9O1xuXG4gICAgY29uc3Qgc2VydmVyTG9nQXBwZW5kZXJDb25maWcgPSBhd2FpdCBnZXRTZXJ2ZXJMb2dBcHBlbmRlckNvbmZpZygpO1xuICAgIGlmIChzZXJ2ZXJMb2dBcHBlbmRlckNvbmZpZykge1xuICAgICAgY29uZmlnLmFwcGVuZGVycy5wdXNoKHNlcnZlckxvZ0FwcGVuZGVyQ29uZmlnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29uZmlnO1xuICB9LFxuICBnZXRQYXRoVG9Mb2dGaWxlRm9yVG9kYXksXG4gIExPR19GSUxFX1BBVEgsXG4gIF9fdGVzdF9fOiB7XG4gICAgZ2V0UGF0aFRvTG9nRmlsZUZvckRhdGUsXG4gIH0sXG59O1xuIl19