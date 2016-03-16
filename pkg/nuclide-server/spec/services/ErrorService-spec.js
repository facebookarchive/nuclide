'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import path from 'path';
import ServiceTestHelper from './ServiceTestHelper';

describe('ErrorServer', () => {
  let testHelper, service;
  beforeEach(() => {
    testHelper = new ServiceTestHelper();
    waitsForPromise(() => {
      invariant(testHelper);
      return testHelper.start([{
        name: 'ErrorService',
        definition: path.join(__dirname, 'ErrorService.def'),
        implementation: path.join(__dirname, 'ErrorService.js'),
      }]);
    });

    runs(() => {
      invariant(testHelper);
      service = testHelper.getRemoteService('ErrorService',
          path.join(__dirname, 'ErrorService.def'));
    });
  });

  it('ErrorService - error message', () => {
    waitsForPromise(async () => {
      try {
        invariant(service);
        await service.promiseError('msg');
        expect(false).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
        expect(e.message).toBe('msg');
      }
    });
  });

  it('ErrorService - error string', () => {
    waitsForPromise(async () => {
      try {
        invariant(service);
        await service.promiseErrorString('msg');
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBe('msg');
      }
    });
  });

  it('ErrorService - error undefined', () => {
    waitsForPromise(async () => {
      try {
        invariant(service);
        await service.promiseErrorUndefined();
        expect(false).toBe(true);
      } catch (e) {
        expect(e).toBe(undefined);
      }
    });
  });

  it('ErrorService - error code', () => {
    waitsForPromise(async () => {
      try {
        invariant(service);
        await service.promiseErrorCode(42);
        expect(false).toBe(true);
      } catch (e) {
        expect(e instanceof Error).toBe(true);
        expect(e.code).toBe(42);
      }
    });
  });

  it('ErrorService - observable error.message', () => {
    invariant(service);
    const o = service.observableError('msg');
    let completed = false;

    o.subscribe(
      () => { expect(true).toBe(false); },
      e => {
        expect(e.message).toBe('msg');
        completed = true;
      },
      () => { expect(true).toBe(false); });

    waitsFor(() => completed);
  });

  it('ErrorService - observable message', () => {
    invariant(service);
    const o = service.observableErrorString('msg');
    let completed = false;

    o.subscribe(
      () => { expect(true).toBe(false); },
      e => {
        expect(e).toBe('msg');
        completed = true;
      },
      () => { expect(true).toBe(false); });

    waitsFor(() => completed);
  });

  it('ErrorService - observable undefined', () => {
    invariant(service);
    const o = service.observableErrorUndefined();
    let completed = false;

    o.subscribe(
      () => { expect(true).toBe(false); },
      e => {
        expect(e).toBe(undefined);
        completed = true;
      },
      () => { expect(true).toBe(false); });

    waitsFor(() => completed);
  });

  it('ErrorService - observable code', () => {
    invariant(service);
    const o = service.observableErrorCode(42);
    let completed = false;

    o.subscribe(
      () => { expect(true).toBe(false); },
      e => {
        expect(e.code).toBe(42);
        completed = true;
      },
      () => { expect(true).toBe(false); });

    waitsFor(() => completed);
  });

  afterEach(() => {
    invariant(testHelper);
    return testHelper.stop();
  });
});
