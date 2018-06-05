'use strict';

var _nuclideVersion;

function _load_nuclideVersion() {
  return _nuclideVersion = require('../../nuclide-version');
}

var _;

function _load_() {
  return _ = require('..');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

describe('setUseLocalRpc', () => {
  it('successfully starts up a local RPC server', async () => {
    await (async () => {
      const infoService = (0, (_ || _load_()).getInfoServiceByNuclideUri)('');
      const version = await infoService.getServerVersion();
      expect(version).toBe((0, (_nuclideVersion || _load_nuclideVersion()).getVersion)());
    })();
  });
});