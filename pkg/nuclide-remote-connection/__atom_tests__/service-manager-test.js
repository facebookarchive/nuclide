"use strict";

function _nuclideVersion() {
  const data = require("../../nuclide-version");

  _nuclideVersion = function () {
    return data;
  };

  return data;
}

function _() {
  const data = require("..");

  _ = function () {
    return data;
  };

  return data;
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
 * @emails oncall+nuclide
 */
describe('setUseLocalRpc', () => {
  it('successfully starts up a local RPC server', async () => {
    const infoService = (0, _().getInfoServiceByNuclideUri)('');
    const version = await infoService.getServerVersion();
    expect(version).toBe((0, _nuclideVersion().getVersion)());
  });
});