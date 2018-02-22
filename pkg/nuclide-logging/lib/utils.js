'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.patchErrorsOfLoggingEvent = patchErrorsOfLoggingEvent;
exports.serializeLoggingEvent = serializeLoggingEvent;
exports.deserializeLoggingEvent = deserializeLoggingEvent;

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _stackTrace;

function _load_stackTrace() {
  return _stackTrace = _interopRequireDefault(require('stack-trace'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * JSON.stringify can't stringify instance of Error. To solve this problem, we
 * patch the errors in loggingEvent.data and convert it to an Object with 'name', 'message',
 * 'stack' and 'stackTrace' as fields.
 * If there is no error attached to loggingEvent.data, we create a new error and append it to
 * loggingEvent.data, so that we could get stack information which helps categorization in
 * logview.
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

function patchErrorsOfLoggingEvent(loggingEvent) {
  const loggingEventCopy = Object.assign({}, loggingEvent);
  loggingEventCopy.data = (loggingEventCopy.data || []).slice();

  if (!loggingEventCopy.data.some(item => item instanceof Error)) {
    loggingEventCopy.data.push(new Error('Auto generated Error'));
  }

  loggingEventCopy.data = loggingEventCopy.data.map(item => {
    if (item instanceof Error) {
      const stackTrace = (_stackTrace || _load_stackTrace()).default.parse(item).map(callsite => ({
        functionName: callsite.getFunctionName(),
        methodName: callsite.getMethodName(),
        fileName: callsite.getFileName(),
        lineNumber: callsite.getLineNumber(),
        columnNumber: callsite.getColumnNumber()
      }));
      return {
        name: item.name,
        message: item.message,
        stack: item.stack,
        stackTrace
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
  let loggingEvent;
  try {
    loggingEvent = JSON.parse(loggingEventString);
    loggingEvent.startTime = new Date(loggingEvent.startTime);
    loggingEvent.level = (_log4js || _load_log4js()).default.levels.toLevel(loggingEvent.level.levelStr);
  } catch (e) {
    // JSON.parse failed, just log the contents probably a naughty.
    loggingEvent = {
      startTime: new Date(),
      categoryName: 'log4js',
      level: (_log4js || _load_log4js()).default.levels.ERROR,
      data: ['Unable to parse log:', loggingEventString]
    };
  }
  return loggingEvent;
}