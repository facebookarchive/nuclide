'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  activateAllPackages,
  deactivateAllPackages,
  jasmineIntegrationTestSetup,
} from './utils/integration-test-helpers';
import {getNumberOfMatches, deleteLogLinesMatching} from './utils/logfile';
import {copyFixture} from '../pkg/nuclide-test-helpers';
import nuclideUri from '../pkg/commons-node/nuclideUri';

const NUM_LOGS = 5;
const LOG_STRING = 'max is cool';

describe('test the logfile grepper', () => {
  it('greps logfiles correctly', () => {
    waitsForPromise(async () => {
      jasmineIntegrationTestSetup();
      await activateAllPackages();
      const dirPath = await copyFixture('logfile_1', __dirname);
      spyOnLogFileGetter(nuclideUri.join(dirPath, 'log1.txt'));
      expect(await getNumberOfMatches(LOG_STRING)).toBe(0);
      jasmine.unspy(require('../pkg/nuclide-logging'), 'getPathToLogFile');
      spyOnLogFileGetter(nuclideUri.join(dirPath, 'log2.txt'));
      expect(await getNumberOfMatches(LOG_STRING)).toBe(NUM_LOGS);
      await deleteLogLinesMatching('max');
      expect(await getNumberOfMatches(LOG_STRING)).toBe(0);
      deactivateAllPackages();
    });
  });
});

function spyOnLogFileGetter(filePath: string): void {
  spyOn(require('../pkg/nuclide-logging'), 'getPathToLogFile').andReturn(filePath);
}
