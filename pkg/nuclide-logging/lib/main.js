'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This designed for logging on both Nuclide client and Nuclide server. It is based on [log4js]
 * (https://www.npmjs.com/package/log4js) with the ability to lazy initialize and update config
 * after initialized.
 * To make sure we only have one instance of log4js logger initialized globally, we save the logger
 * to `global` object.
 */
import addPrepareStackTraceHook from './stacktrace';
import invariant from 'assert';
import singleton from '../../commons-node/singleton';

import type {LogLevel} from './rpc-types';
import type {Logger} from './types';

/* Listed in order of severity. */
type Level = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const DEFAULT_LOGGER_CATEGORY = 'nuclide';
const INITIAL_UPDATE_CONFIG_KEY = '_initial_update_config_key_';

function getCategory(category: ?string): string {
  return category ? category : DEFAULT_LOGGER_CATEGORY;
}

export function flushLogsAndExit(exitCode: number): void {
  const log4js = require('log4js');
  log4js.shutdown(() => process.exit(exitCode));
}

export function flushLogsAndAbort(): void {
  const log4js = require('log4js');
  log4js.shutdown(() => process.abort());
}

/**
 * Get log4js logger instance which is also singleton per category.
 * log4js.getLogger() API internally should already provide singleton per category guarantee
 * see https://github.com/nomiddlename/log4js-node/blob/master/lib/log4js.js#L120 for details.
 */
function getLog4jsLogger(category: string): Object {
  const log4js = require('log4js');
  return log4js.getLogger(category);
}

export function updateConfig(config: any, options: any): void {
  // update config takes affect global to all existing and future loggers.
  const log4js = require('log4js');
  log4js.configure(config, options);
}

// Create a lazy logger that will not initialize the underlying log4js logger until
// `lazyLogger.$level(...)` is called. This way, another package could require nuclide-logging
// during activation without worrying about introducing a significant startup cost.
function createLazyLogger(category: string): Logger {
  function createLazyLoggerMethod(level: Level): (...args: Array<any>) => mixed {
    return function(...args: Array<any>) {
      const logger = getLog4jsLogger(category);
      invariant(logger);
      logger[level].apply(logger, args);
    };
  }

  function setLoggerLevelHelper(level: string): void {
    const logger = getLog4jsLogger(category);
    invariant(logger);
    logger.setLevel(level);
  }

  function isLevelEnabledHelper(level: string): void {
    const logger = getLog4jsLogger(category);
    invariant(logger);
    return logger.isLevelEnabled(level);
  }

  return {
    debug: createLazyLoggerMethod('debug'),
    error: createLazyLoggerMethod('error'),
    fatal: createLazyLoggerMethod('fatal'),
    info: createLazyLoggerMethod('info'),
    trace: createLazyLoggerMethod('trace'),
    warn: createLazyLoggerMethod('warn'),
    isLevelEnabled: isLevelEnabledHelper,
    setLevel: setLoggerLevelHelper,
  };
}

/**
 * Push initial default config to log4js.
 * Execute only once.
 */
export function initialUpdateConfig(): Promise<void> {
  return singleton.get(
    INITIAL_UPDATE_CONFIG_KEY,
    async () => {
      const defaultConfig = await require('./config').getDefaultConfig();
      updateConfig(defaultConfig);
    });
}

// Get Logger instance which is singleton per logger category.
export function getLogger(category: ?string): Logger {
  addPrepareStackTraceHook();
  initialUpdateConfig();

  const loggerCategory = getCategory(category);
  return singleton.get(
    loggerCategory,
    () => {
      return createLazyLogger(loggerCategory);
    },
  );
}

export type CategoryLogger = {
  log(message: string): void;
  logTrace(message: string): void;
  logInfo(message: string): void;
  logError(message: string): void;
  logErrorAndThrow(message: string): void;
  setLogLevel(level: LogLevel): void;
};

// Utility function that returns a wrapper logger for input category.
export function getCategoryLogger(category: string): CategoryLogger {
  function setLogLevel(level: LogLevel): void {
    getLogger(category).setLevel(level);
  }

  function logHelper(level: string, message: string): void {
    const logger = getLogger(category);
    // isLevelEnabled() is required to reduce the amount of logging to
    // log4js which greatly improves performance.
    if (logger.isLevelEnabled(level)) {
      logger[level](message);
    }
  }

  function logTrace(message: string): void {
    logHelper('trace', message);
  }

  function log(message: string): void {
    logHelper('debug', message);
  }

  function logInfo(message: string): void {
    logHelper('info', message);
  }

  function logError(message: string): void {
    logHelper('error', message);
  }

  function logErrorAndThrow(message: string): void {
    logError(message);
    logError(new Error().stack);
    throw new Error(message);
  }

  return {
    log,
    logTrace,
    logInfo,
    logError,
    logErrorAndThrow,
    setLogLevel,
  };
}

export function getPathToLogFileForToday(): string {
  return require('./config').getPathToLogFileForToday();
}
