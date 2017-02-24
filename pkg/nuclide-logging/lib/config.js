/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {LoggingAppender} from './types';
import ScribeProcess from '../../commons-node/ScribeProcess';
import {isRunningInTest, isRunningInClient} from '../../commons-node/system-info';
import fsPromise from '../../commons-node/fsPromise';

import os from 'os';
import nuclideUri from '../../commons-node/nuclideUri';

const LOG_DIRECTORY = nuclideUri.join(os.tmpdir(), `/nuclide-${os.userInfo().username}-logs`);
export const LOG_FILE_PATH = nuclideUri.join(LOG_DIRECTORY, 'nuclide.log');

let logDirectoryInitialized = false;
const scribeAppenderPath = nuclideUri.join(__dirname, '../fb/scribeAppender.js');

export type AdditionalLogFile = {
    title: string,
    filename: string,
};

const additionalLogFiles: Array<AdditionalLogFile> = [];

const MAX_LOG_SIZE = 1024 * 1024;
const MAX_LOG_BACKUPS = 10;

export async function getServerLogAppenderConfig(): Promise<?Object> {
  // Skip config scribe_cat logger if
  // 1) or running in open sourced version of nuclide
  // 2) or the scribe_cat command is missing.
  if (!(await fsPromise.exists(scribeAppenderPath)) ||
      !(await ScribeProcess.isScribeCatOnPath())) {
    return null;
  }

  return {
    type: 'logLevelFilter',
    // Anything less than ERROR is ignored by the backend anyway.
    level: 'ERROR',
    appender: {
      type: scribeAppenderPath,
      scribeCategory: 'errorlog_arsenal',
    },
  };
}

export function getPathToLogFile(): string {
  return LOG_FILE_PATH;
}

export const FileAppender: Object = {
  type: 'file',
  filename: LOG_FILE_PATH,
  maxLogSize: MAX_LOG_SIZE,
  backups: MAX_LOG_BACKUPS,
  layout: {
    type: 'pattern',
    // Format log in following pattern:
    // yyyy-MM-dd HH:mm:ss.mil $Level (pid:$pid) $categroy - $message.
    pattern: `%d{ISO8601} %p (pid:${process.pid}) %c - %m`,
  },
};

export async function getDefaultConfig(): Promise<LoggingAppender> {
  if (!logDirectoryInitialized) {
    await fsPromise.mkdirp(LOG_DIRECTORY);
    logDirectoryInitialized = true;
  }

  const config = {
    appenders: [
      {
        type: 'logLevelFilter',
        level: 'ALL',
        appender: {
          type: nuclideUri.join(__dirname, './nuclideConsoleAppender'),
        },
      },
      FileAppender,
    ],
  };

  // Do not print server logs to stdout/stderr.
  // These are normally just piped to a .nohup.out file, so doing this just causes
  // the log files to be duplicated.
  if (isRunningInTest() || isRunningInClient()) {
    config.appenders.push({
      type: 'logLevelFilter',
      level: 'WARN',
      appender: {
        type: nuclideUri.join(__dirname, './consoleAppender'),
      },
    });
  } else {
    const serverLogAppenderConfig = await getServerLogAppenderConfig();
    if (serverLogAppenderConfig) {
      config.appenders.push(serverLogAppenderConfig);
    }
  }

  return config;
}

export function addAdditionalLogFile(title: string, filename: string) {
  const filePath = nuclideUri.join(LOG_DIRECTORY, filename);
  const logFile = {
    title,
    filename: filePath,
  };

  if (additionalLogFiles
        .filter(entry => entry.filename === filename && entry.title === title).length === 0) {
    additionalLogFiles.push(logFile);
  }
}

export function getAdditionalLogFiles(): Array<AdditionalLogFile> {
  return additionalLogFiles;
}
