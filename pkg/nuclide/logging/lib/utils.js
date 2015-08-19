'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// Serialization utils borrowed from https://fburl.com/68062438.
var log4js = require('log4js');

// JSON.stringify(new Error('test')) returns {}, which is not really useful for us.
// The replacer allows us to serialize errors correctly.
function errorReplacer(key: string, value: mixed): mixed {
  if (value instanceof Array && key === 'data') {
    value = value.map((item) => {
      if (item && item.stack && JSON.stringify(item) === '{}') {
        item = {stack: item.stack};
      }
      return item;
    });
  }
  return value;
}

module.exports = {
  errorReplacer,

  /**
   * Takes a loggingEvent object, returns string representation of it.
   */
  serializeLoggingEvent(loggingEvent: mixed): string {
    return JSON.stringify(loggingEvent, errorReplacer);
  },

  /**
   * Takes a string, returns an object with the correct log properties.
   *
   * This method has been "borrowed" from the `multiprocess` appender
   * by `nomiddlename` (https://github.com/nomiddlename/log4js-node/blob/master/lib/appenders/multiprocess.js)
   *
   * Apparently, node.js serializes everything to strings when using `process.send()`,
   * so we need smart deserialization that will recreate log date and level for further processing by log4js internals.
   */
  deserializeLoggingEvent(loggingEventString: string): mixed {
    var loggingEvent;
    try {
      loggingEvent = JSON.parse(loggingEventString);
      loggingEvent.startTime = new Date(loggingEvent.startTime);
      loggingEvent.level = log4js.levels.toLevel(loggingEvent.level.levelStr);
    } catch (e) {
      // JSON.parse failed, just log the contents probably a naughty.
      loggingEvent = {
        startTime: new Date(),
        categoryName: 'log4js',
        level: log4js.levels.ERROR,
        data: ['Unable to parse log:', loggingEventString],
      };
    }
    return loggingEvent;
  },
};
