Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.patchErrorsOfLoggingEvent = patchErrorsOfLoggingEvent;
exports.serializeLoggingEvent = serializeLoggingEvent;
exports.deserializeLoggingEvent = deserializeLoggingEvent;

/**
 * JSON.stringify can't stringify instance of Error. To solve this problem, we
 * patch the errors in loggingEvent.data and convert it to an Object with 'name', 'message',
 * 'stack' and 'stackTrace' as fields.
 * If there is no error attached to loggingEvent.data, we create a new error and append it to
 * loggingEvent.data, so that we could get stack information which helps categorization in
 * logview.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _log4js2;

function _log4js() {
  return _log4js2 = _interopRequireDefault(require('log4js'));
}

function patchErrorsOfLoggingEvent(loggingEvent) {
  var loggingEventCopy = _extends({}, loggingEvent);
  loggingEventCopy.data = (loggingEventCopy.data || []).slice();

  if (!loggingEventCopy.data.some(function (item) {
    return item instanceof Error;
  })) {
    loggingEventCopy.data.push(new Error('Auto generated Error'));
  }

  loggingEventCopy.data = loggingEventCopy.data.map(function (item) {
    if (item instanceof Error) {
      return {
        name: item.name,
        message: item.message,
        stack: item.stack,
        stackTrace: item.stackTrace
      };
    }
    return item;
  });

  return loggingEventCopy;
}

/**
 * Takes a loggingEvent object, returns string representation of it.
 */

function serializeLoggingEvent(loggingEvent) {
  return JSON.stringify(loggingEvent);
}

/**
 * Takes a string, returns an object with the correct log properties.
 *
 * This method has been "borrowed" from the `multiprocess` appender
 * by `nomiddlename` (https://github.com/nomiddlename/log4js-node/blob/master/lib/appenders/multiprocess.js)
 *
 * Apparently, node.js serializes everything to strings when using `process.send()`,
 * so we need smart deserialization that will recreate log date and level for further processing by
 * log4js internals.
 */

function deserializeLoggingEvent(loggingEventString) {
  var loggingEvent = undefined;
  try {
    loggingEvent = JSON.parse(loggingEventString);
    loggingEvent.startTime = new Date(loggingEvent.startTime);
    loggingEvent.level = (_log4js2 || _log4js()).default.levels.toLevel(loggingEvent.level.levelStr);
  } catch (e) {
    // JSON.parse failed, just log the contents probably a naughty.
    loggingEvent = {
      startTime: new Date(),
      categoryName: 'log4js',
      level: (_log4js2 || _log4js()).default.levels.ERROR,
      data: ['Unable to parse log:', loggingEventString]
    };
  }
  return loggingEvent;
}