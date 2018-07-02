"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.patchErrorsOfLoggingEvent = patchErrorsOfLoggingEvent;
exports.serializeLoggingEvent = serializeLoggingEvent;
exports.deserializeLoggingEvent = deserializeLoggingEvent;

function _log4js() {
  const data = _interopRequireDefault(require("log4js"));

  _log4js = function () {
    return data;
  };

  return data;
}

function _stackTrace() {
  const data = _interopRequireDefault(require("stack-trace"));

  _stackTrace = function () {
    return data;
  };

  return data;
}

function _jsonStringifySafe() {
  const data = _interopRequireDefault(require("json-stringify-safe"));

  _jsonStringifySafe = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

/**
 * JSON.stringify can't stringify instance of Error. To solve this problem, we
 * patch the errors in loggingEvent.data and convert it to an Object with 'name', 'message',
 * 'stack' and 'stackTrace' as fields.
 * If there is no error attached to loggingEvent.data, we create a new error and append it to
 * loggingEvent.data, so that we could get stack information which helps categorization in
 * logview.
 */
function patchErrorsOfLoggingEvent(loggingEvent) {
  const loggingEventCopy = Object.assign({}, loggingEvent);
  loggingEventCopy.data = (loggingEventCopy.data || []).slice();

  if (!loggingEventCopy.data.some(item => item instanceof Error)) {
    loggingEventCopy.data.push(new Error('Auto generated Error'));
  }

  loggingEventCopy.data = loggingEventCopy.data.map(item => {
    if (item instanceof Error) {
      // Atom already parses stack traces and stores them as rawStack -
      // so no need to manually parse things in that case.
      const rawStack = Array.isArray(item.rawStack) ? item.rawStack : _stackTrace().default.parse(item);
      const stackTrace = rawStack.map(callsite => ({
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
  return (0, _jsonStringifySafe().default)(loggingEvent);
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
    loggingEvent.level = _log4js().default.levels.toLevel(loggingEvent.level.levelStr);
  } catch (e) {
    // JSON.parse failed, just log the contents probably a naughty.
    loggingEvent = {
      startTime: new Date(),
      categoryName: 'log4js',
      level: _log4js().default.levels.ERROR,
      data: ['Unable to parse log:', loggingEventString]
    };
  }

  return loggingEvent;
}