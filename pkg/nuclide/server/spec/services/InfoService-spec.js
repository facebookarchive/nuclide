'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import ServiceTestHelper from './ServiceTestHelper';
import {getVersion} from 'nuclide-version';
import invariant from 'assert';

describe('InfoService', () => {
  let testHelper;
  beforeEach(() => {
    testHelper = new ServiceTestHelper();
    waitsForPromise(() => testHelper.start());
  });

  it('Returns the correct version number', () => {
    waitsForPromise(async () => {
      invariant(testHelper);
      const service =
          testHelper.getRemoteService('InfoService', '../../lib/services/InfoService.js');

      const version = await service.getServerVersion();
      expect(version).toBe(getVersion());
    });
  });

  afterEach(() => testHelper.stop());
});
