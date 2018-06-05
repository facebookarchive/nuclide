'use strict';

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _ServiceTester;

function _load_ServiceTester() {
  return _ServiceTester = require('../__mocks__/ServiceTester');
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

describe('ImportService', () => {
  let testHelper;
  let service;

  beforeEach(async () => {
    testHelper = new (_ServiceTester || _load_ServiceTester()).ServiceTester();
    await (() => {
      if (!testHelper) {
        throw new Error('Invariant violation: "testHelper"');
      }

      return testHelper.start([{
        name: 'ImportService',
        definition: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/ImportService.js'),
        implementation: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/ImportService.js')
      }], 'import_protocol');
    })();

    if (!testHelper) {
      throw new Error('Invariant violation: "testHelper"');
    }

    service = testHelper.getRemoteService('ImportService');
  });

  it('ImportService - basic type import', async () => {
    if (!service) {
      throw new Error('Invariant violation: "service"');
    }

    const result = await service.f('msg');
    expect(result).toBe('msg');
  });

  it('ImportService - type import requiring multiple imports of a ImportedType', async () => {
    if (!service) {
      throw new Error('Invariant violation: "service"');
    }

    const result = await service.g({ field: 'msg' });
    expect(result).toBe('msg');
  });

  it('ImportService - type import of export specifiers', async () => {
    if (!service) {
      throw new Error('Invariant violation: "service"');
    }

    const result = await service.f2('msg');
    expect(result).toBe('msg');
    const result2 = await service.f3('msg');
    expect(result2).toBe('msg');
  });

  afterEach(() => {
    if (!testHelper) {
      throw new Error('Invariant violation: "testHelper"');
    }

    return testHelper.stop();
  });
});