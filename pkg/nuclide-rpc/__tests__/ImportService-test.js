"use strict";

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _ServiceTester() {
  const data = require("../__mocks__/ServiceTester");

  _ServiceTester = function () {
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
describe('ImportService', () => {
  let testHelper;
  let service;
  beforeEach(async () => {
    testHelper = new (_ServiceTester().ServiceTester)();
    await (() => {
      if (!testHelper) {
        throw new Error("Invariant violation: \"testHelper\"");
      }

      return testHelper.start([{
        name: 'ImportService',
        definition: _nuclideUri().default.join(__dirname, '../__mocks__/ImportService.js'),
        implementation: _nuclideUri().default.join(__dirname, '../__mocks__/ImportService.js')
      }], 'import_protocol');
    })();

    if (!testHelper) {
      throw new Error("Invariant violation: \"testHelper\"");
    }

    service = testHelper.getRemoteService('ImportService');
  });
  it('ImportService - basic type import', async () => {
    if (!service) {
      throw new Error("Invariant violation: \"service\"");
    }

    const result = await service.f('msg');
    expect(result).toBe('msg');
  });
  it('ImportService - type import requiring multiple imports of a ImportedType', async () => {
    if (!service) {
      throw new Error("Invariant violation: \"service\"");
    }

    const result = await service.g({
      field: 'msg'
    });
    expect(result).toBe('msg');
  });
  it('ImportService - type import of export specifiers', async () => {
    if (!service) {
      throw new Error("Invariant violation: \"service\"");
    }

    const result = await service.f2('msg');
    expect(result).toBe('msg');
    const result2 = await service.f3('msg');
    expect(result2).toBe('msg');
  });
  afterEach(() => {
    if (!testHelper) {
      throw new Error("Invariant violation: \"testHelper\"");
    }

    return testHelper.stop();
  });
});