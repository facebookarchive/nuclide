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
    const {getPathToLogFileForDate} = __test__;
    it('returns the file path to the log file for today.', () => {
      const YEAR = 2015;
      const MONTH = 0; // January
      const DATE = 2;
      const targetDate = new Date(YEAR, MONTH, DATE);
      const expectedString = LOG_FILE_PATH + '-2015-01-02';
      expect(getPathToLogFileForDate(targetDate)).toEqual(expectedString);
    });
  });
});
