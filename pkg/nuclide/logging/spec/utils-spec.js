'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {serializeLoggingEvent, deserializeLoggingEvent} = require('../lib/utils');

describe('Logview Appender Utils.', () => {

  it('Test serialization/deserialization utils.', () => {
    // Construct a loggingEvent following log4js event format.
    var loggingEvent = {
      startTime: new Date(),
      categoryName: 'test',
      data: [new Error('123')],
      level: {
        level: 40000,
        levelStr: 'ERROR',
      },
      logger: {
        category: 'arsenal',
        _events: {
          log: [
            null,
            null,
          ],
        },
      },
    };

    var serialization = serializeLoggingEvent(loggingEvent);
    expect(typeof serialization === 'string').toBe(true);

    var deserialization = deserializeLoggingEvent(serialization);
    expect(deserialization.startTime.toString()).toEqual(loggingEvent.startTime.toString());
    expect(deserialization.categoryName).toEqual(loggingEvent.categoryName);
    expect(JSON.stringify(deserialization.level))
        .toEqual(JSON.stringify(loggingEvent.level));
    expect(JSON.stringify(deserialization.logger))
        .toEqual(JSON.stringify(loggingEvent.logger));
    expect(JSON.stringify(deserialization.data))
        .toEqual(JSON.stringify([{stack: loggingEvent.data[0].stack}]));
  });
});
