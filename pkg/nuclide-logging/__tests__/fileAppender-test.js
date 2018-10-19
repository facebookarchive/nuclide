"use strict";

var _fs = _interopRequireDefault(require("fs"));

function _log4js() {
  const data = _interopRequireDefault(require("log4js"));

  _log4js = function () {
    return data;
  };

  return data;
}

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
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
 * @emails oncall+nuclide
 */
_temp().default.track();

jest.unmock('log4js');
describe('fileAppender', () => {
  let tempFile;
  beforeEach(() => {
    tempFile = _temp().default.openSync().path;

    _log4js().default.configure({
      appenders: [{
        type: require.resolve("../VendorLib/fileAppender"),
        filename: tempFile,
        maxLogSize: 1048576,
        backups: 1,
        layout: {
          type: 'pattern',
          // level category - message
          pattern: '%p %c - %m'
        }
      }]
    });
  });
  it('flushes immediately on shutdown', async () => {
    const times = 10;

    const logger = _log4js().default.getLogger('testCategory');

    for (let i = 0; i < times; i++) {
      logger.info('test1234');
    }

    await new Promise(resolve => _log4js().default.shutdown(resolve));
    expect(_fs.default.readFileSync(tempFile, 'utf8')).toBe('INFO testCategory - test1234\n'.repeat(times));
  });
});