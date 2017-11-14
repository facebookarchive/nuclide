/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {getVersion} from '../../nuclide-version';
import {getInfoServiceByNuclideUri} from '..';
import {setUseLocalRpc} from '../lib/service-manager';

describe('setUseLocalRpc', () => {
  it('successfully starts up a local RPC server', () => {
    setUseLocalRpc(true, true);

    waitsForPromise(async () => {
      const infoService = getInfoServiceByNuclideUri('');
      const version = await infoService.getServerVersion();
      expect(version).toBe(getVersion());
    });
  });
});
