'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {__test__, LOG_FILE_PATH} from '../lib/config';

describe('nuclide-logging/lib/config.js', () => {
  describe('getPathToLogFileForDate', () => {
    var {getPathToLogFileForDate} = __test__;
    it('returns the file path to the log file for today.', () => {
      var YEAR = 2015;
      var MONTH = 0; // January
      var DATE = 2;
      var targetDate = new Date(YEAR, MONTH, DATE);
      var expectedString = LOG_FILE_PATH + '-2015-01-02';
      expect(getPathToLogFileForDate(targetDate)).toEqual(expectedString);
    });
  });
});
