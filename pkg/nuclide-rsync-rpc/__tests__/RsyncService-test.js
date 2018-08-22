/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+jackalope
 */

import * as RsyncService from '../lib/RsyncService';

describe('RsyncService', () => {
  describe('startDaemon', () => {
    it('Starts a daemon process and returns version / port number.', async () => {
      const startMessage = await RsyncService.startDaemon(__dirname)
        .refCount()
        .first()
        .toPromise();

      expect(typeof startMessage.port === 'number').toBe(true);
      expect(typeof startMessage.version === 'string').toBe(true);
    });
  });
});
