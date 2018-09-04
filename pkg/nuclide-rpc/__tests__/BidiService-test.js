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
 * 
 * @format
 * @emails oncall+nuclide
 */
class I1 {
  async m(arg) {
    return 'I1:' + arg;
  }

  dispose() {}

}

class I2 {
  async m(arg) {
    return 'I2:' + arg;
  }

  dispose() {}

}

describe('BidiService', () => {
  let testHelper;
  let service = null;
  beforeEach(async () => {
    testHelper = new (_ServiceTester().ServiceTester)();
    await testHelper.start([{
      name: 'BidiService',
      definition: _nuclideUri().default.join(__dirname, '../__mocks__/BidiService.def'),
      implementation: _nuclideUri().default.join(__dirname, '../__mocks__/BidiService.js')
    }], 'bidi_protocol');
    service = testHelper.getRemoteService('BidiService');
  });
  it('Test calls from server back to client', async () => {
    const i1 = new I1();
    const i2 = new I2();
    const r1 = await service.f('call1', i1);
    const r2 = await service.f('call2', i2);
    expect(r1).toBe('I1:call1');
    expect(r2).toBe('I2:call2');
  });
  afterEach(() => testHelper.stop());
});