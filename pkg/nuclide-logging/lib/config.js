'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {LoggingAppender} from './types';
import ScribeProcess from '../../commons-node/ScribeProcess';
import {isRunningInTest, isRunningInClient} from '../../commons-node/system-info';
import fsPromise from '../../commons-node/fsPromise';
import userInfo from '../../commons-node/userInfo';

import os from 'os';
import path from 'path';

const LOG_DIRECTORY = path.join(os.tmpdir(), `/nuclide-${userInfo().username}-logs`);
const LOG_FILE_PATH = path.join(LOG_DIRECTORY, 'nuclide.log');

let logDirectoryInitialized = false;
const scribeAppenderPath = path.join(__dirname, '../fb/scribeAppender.js');

const LOG4JS_DATE_FORMAT = '-yyyy-MM-dd';

async function getServerLogAppenderConfig(): Promise<?Object> {
  // Skip config scribe_cat logger if
  // 1) running in test environment
  // 2) or running in Atom client
  // 3) or running in open sourced version of nuclide
  // 4) or the scribe_cat command is missing.
  if (isRunningInTest() ||
      isRunningInClient() ||
      !(await fsPromise.exists(scribeAppenderPath)) ||
      !(await ScribeProcess.isScribeCatOnPath())) {
    return null;
  }

  return {
    type: 'logLevelFilter',
    level: 'DEBUG',
    appender: {
      type: scribeAppenderPath,
      scribeCategory: 'errorlog_arsenal',
    },
  };
}

/**
 * @return The absolute path to the log file for the specified date.
 */
function getPathToLogFileForDate(targetDate: Date): string {
  const log4jsFormatter = require('log4js/lib/date_format').asString;
  return LOG_FILE_PATH + log4jsFormatter(LOG4JS_DATE_FORMAT, targetDate);
}

/**
 * @return The absolute path to the log file for today.
 */
function getPathToLogFileForToday(): string {
  return getPathToLogFileForDate(new Date());
}

module.exports = {
  async getDefaultConfig(): Promise<LoggingAppender> {

    if (!logDirectoryInitialized) {
      await fsPromise.mkdirp(LOG_DIRECTORY);
      logDirectoryInitialized = true;
    }

    const config = {
      appenders: [
        {
          type: 'logLevelFilter',
          level: 'INFO',
          appender: {
            type: path.join(__dirname, './consoleAppender'),
          },
        },
        {
          type: 'dateFile',
          alwaysIncludePattern: true,
          absolute: true,
          filename: LOG_FILE_PATH,
          pattern: LOG4JS_DATE_FORMAT,
          layout: {
            type: 'pattern',
            // Format log in following pattern:
            // yyyy-MM-dd HH:mm:ss.mil $Level (pid:$pid) $categroy - $message.
            pattern: `%d{ISO8601} %p (pid:${process.pid}) %c - %m`,
          },
        },
      ],
    };

    const serverLogAppenderConfig = await getServerLogAppenderConfig();
    if (serverLogAppenderConfig) {
      config.appenders.push(serverLogAppenderConfig);
    }

    return config;
  },
  getPathToLogFileForToday,
  LOG_FILE_PATH,
  __test__: {
    getPathToLogFileForDate,
  },
};
