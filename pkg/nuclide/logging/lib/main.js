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

import type {Logger} from './types';

/* Listed in order of severity. */
type Level = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

var LOGGER_CATEGORY = 'nuclide';
var LOG4JS_INSTANCE_KEY = '_nuclide_log4js_logger';

/**
 * Create the log4js logger. Note we could call this function more than once to update the config.
 * params `config` and `options` are configurations used by log4js, refer
 * https://www.npmjs.com/package/log4js#configuration for more information.
 */
function configLog4jsLogger(config: any, options: any): void {
  var log4js = require('log4js');
  log4js.configure(config, options);
  return log4js.getLogger(LOGGER_CATEGORY);
}

export function updateConfig(config: any, options: any): void {
  require('nuclide-commons').singleton.reset(
        LOG4JS_INSTANCE_KEY,
        () => configLog4jsLogger(config, options));
}

// Create a lazy logger that will not initialize the underlying log4js logger until
// `lazyLogger.$level(...)` is called. This way, another package could require nuclide-logging
// during activation without worrying about introducing a significant startup cost.
function createLazyLogger(): Logger {
  var defaultConfigPromise;

  function createLazyLoggerMethod(level: Level): (...args: Array<any>) => mixed {
    return async function(...args: Array<any>) {
      if (!defaultConfigPromise) {
        defaultConfigPromise = require('./config').getDefaultConfig();
      }
      var defaultConfig = await defaultConfigPromise;
      var logger = require('nuclide-commons').singleton.get(
        LOG4JS_INSTANCE_KEY,
        () => configLog4jsLogger(defaultConfig),
      );
      invariant(logger);
      logger[level].apply(logger, args);
    };
  }

  return {
    debug: createLazyLoggerMethod('debug'),
    error: createLazyLoggerMethod('error'),
    fatal: createLazyLoggerMethod('fatal'),
    info: createLazyLoggerMethod('info'),
    trace: createLazyLoggerMethod('trace'),
    warn: createLazyLoggerMethod('warn'),
  };
}

var lazyLogger: ?Logger;

export function getLogger(): Logger {
  addPrepareStackTraceHook();
  return lazyLogger ? lazyLogger : (lazyLogger = createLazyLogger());
}
