'use strict';

var _ServiceTestHelper;

function _load_ServiceTestHelper() {
  return _ServiceTestHelper = _interopRequireDefault(require('../../__mocks__/services/ServiceTestHelper'));
}

var _nuclideVersion;

function _load_nuclideVersion() {
  return _nuclideVersion = require('../../../nuclide-version');
}

var _servicesConfig;

function _load_servicesConfig() {
  return _servicesConfig = _interopRequireDefault(require('../../lib/servicesConfig'));
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
 */

jest.setTimeout(20000);

describe('InfoService', () => {
  let testHelper;
  beforeEach(async () => {
    testHelper = new (_ServiceTestHelper || _load_ServiceTestHelper()).default();
    await (() => testHelper.start((_servicesConfig || _load_servicesConfig()).default))();
  });

  it('Returns the correct version number', async () => {
    if (!testHelper) {
      throw new Error('Invariant violation: "testHelper"');
    }

    const service = testHelper.getRemoteService('InfoService');

    const version = await service.getServerVersion();
    expect(version).toBe((0, (_nuclideVersion || _load_nuclideVersion()).getVersion)());
  });

  afterEach(async () => await testHelper.stop());
});