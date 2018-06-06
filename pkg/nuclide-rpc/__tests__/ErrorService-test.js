'use strict';

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _ServiceTester;

function _load_ServiceTester() {
  return _ServiceTester = require('../__mocks__/ServiceTester');
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
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

describe('ErrorServer', () => {
  let testHelper;
  let service;
  beforeEach(async () => {
    testHelper = new (_ServiceTester || _load_ServiceTester()).ServiceTester();

    if (!testHelper) {
      throw new Error('Invariant violation: "testHelper"');
    }

    await testHelper.start([{
      name: 'ErrorService',
      definition: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/ErrorService.def'),
      implementation: (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/ErrorService.js')
    }], 'error_protocol');

    if (!testHelper) {
      throw new Error('Invariant violation: "testHelper"');
    }

    service = testHelper.getRemoteService('ErrorService');
  });

  it('ErrorService - error message', async () => {
    await (async () => {
      try {
        if (!service) {
          throw new Error('Invariant violation: "service"');
        }

        await service.promiseError('msg');
        expect(false).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
        expect(e.message.startsWith('Remote Error: msg processing message {"protocol":"error_protocol","type":' + '"call","method":"ErrorService/promiseError","id":1,"args":{"message":"msg"}}')).toBe(true);
      }
    })();
  });

  it('ErrorService - error string', async () => {
    await (async () => {
      try {
        if (!service) {
          throw new Error('Invariant violation: "service"');
        }

        await service.promiseErrorString('msg');
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBe('msg');
      }
    })();
  });

  it('ErrorService - error undefined', async () => {
    await (async () => {
      try {
        if (!service) {
          throw new Error('Invariant violation: "service"');
        }

        await service.promiseErrorUndefined();
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBe(undefined);
      }
    })();
  });

  it('ErrorService - error code', async () => {
    await (async () => {
      try {
        if (!service) {
          throw new Error('Invariant violation: "service"');
        }

        await service.promiseErrorCode(42);
        expect(false).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
        expect(e.code).toBe(42);
      }
    })();
  });

  it('ErrorService - observable error.message', () => {
    if (!service) {
      throw new Error('Invariant violation: "service"');
    }

    const o = service.observableError('msg').refCount();
    let completed = false;

    o.subscribe(() => {
      expect(true).toBe(false);
    }, e => {
      expect(e.message.startsWith('Remote Error: msg processing message {"protocol":"error_protocol","type":' + '"call","method":"ErrorService/observableError","id":1,"args":{"message":"msg"}}')).toBe(true);
      completed = true;
    }, () => {
      expect(true).toBe(false);
    });

    (0, (_waits_for || _load_waits_for()).default)(() => completed);
  });

  it('ErrorService - observable message', () => {
    if (!service) {
      throw new Error('Invariant violation: "service"');
    }

    const o = service.observableErrorString('msg').refCount();
    let completed = false;

    o.subscribe(() => {
      expect(true).toBe(false);
    }, e => {
      expect(e).toBe('msg');
      completed = true;
    }, () => {
      expect(true).toBe(false);
    });

    (0, (_waits_for || _load_waits_for()).default)(() => completed);
  });

  it('ErrorService - observable undefined', () => {
    if (!service) {
      throw new Error('Invariant violation: "service"');
    }

    const o = service.observableErrorUndefined().refCount();
    let completed = false;

    o.subscribe(() => {
      expect(true).toBe(false);
    }, e => {
      expect(e).toBe(undefined);
      completed = true;
    }, () => {
      expect(true).toBe(false);
    });

    (0, (_waits_for || _load_waits_for()).default)(() => completed);
  });

  it('ErrorService - observable code', () => {
    if (!service) {
      throw new Error('Invariant violation: "service"');
    }

    const o = service.observableErrorCode(42).refCount();
    let completed = false;

    o.subscribe(() => {
      expect(true).toBe(false);
    }, e => {
      expect(e.code).toBe(42);
      completed = true;
    }, () => {
      expect(true).toBe(false);
    });

    (0, (_waits_for || _load_waits_for()).default)(() => completed);
  });

  afterEach(() => {
    if (!testHelper) {
      throw new Error('Invariant violation: "testHelper"');
    }

    return testHelper.stop();
  });
});