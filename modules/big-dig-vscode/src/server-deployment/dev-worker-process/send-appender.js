/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

import type {LoggerMessage} from './types';
import send from './send';

type LoggingEvent = {
  categoryName: string,
  level: {},
  data: LoggerMessage[],
};

export function appender(): LoggingEvent => void {
  return function(loggingEvent: LoggingEvent) {
    send({
      tag: 'log',
      category: loggingEvent.categoryName,
      level: loggingEvent.level.toString().toLowerCase(),
      data: loggingEvent.data,
    });
  };
}

export function configure(config: {}): LoggingEvent => void {
  return appender();
}
