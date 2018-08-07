"use strict";

function _ServiceTestHelper() {
  const data = _interopRequireDefault(require("../../__mocks__/services/ServiceTestHelper"));

  _ServiceTestHelper = function () {
    return data;
  };

  return data;
}

function _nuclideVersion() {
  const data = require("../../../nuclide-version");

  _nuclideVersion = function () {
    return data;
  };

  return data;
}

function _servicesConfig() {
  const data = _interopRequireDefault(require("../../lib/servicesConfig"));

  _servicesConfig = function () {
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
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
jest.setTimeout(20000);
describe('InfoService', () => {
  let testHelper;
  beforeEach(async () => {
    testHelper = new (_ServiceTestHelper().default)();
    await (() => testHelper.start(_servicesConfig().default))();
  });
  it('Returns the correct version number', async () => {
    if (!testHelper) {
      throw new Error("Invariant violation: \"testHelper\"");
    }

    const service = testHelper.getRemoteService('InfoService');
    const version = await service.getServerVersion();
    expect(version).toBe((0, _nuclideVersion().getVersion)());
  });
  afterEach(async () => testHelper.stop());
});