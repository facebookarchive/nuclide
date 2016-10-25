'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _util = _interopRequireDefault(require('util'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function layout(loggingEvent) {
  const eventInfo = _util.default.format('[%s] [%s] %s - ', loggingEvent.startTime.toISOString(), loggingEvent.level, loggingEvent.categoryName);

  const data = loggingEvent.data.slice();

  // Since console.log support string format as first parameter, we should preserve this behavior
  // by concating eventInfo with first parameter if it is string.
  if (data.length > 0 && typeof data[0] === 'string') {
    data[0] = eventInfo + data[0];
  } else {
    data.unshift(eventInfo);
  }
  return data;
}

/**
 * Comparing to log4js's console appender(https://fburl.com/69861669), you can expand and explore
 * the object in console logged by this Appender.
 */
function consoleAppender() {
  return loggingEvent => {
    // eslint-disable-next-line no-console
    console.log(...layout(loggingEvent));
  };
}

module.exports = {
  appender: consoleAppender,
  configure: consoleAppender
};