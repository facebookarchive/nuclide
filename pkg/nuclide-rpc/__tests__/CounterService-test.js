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

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
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
describe('CounterService', () => {
  let testHelper;
  let service;
  beforeEach(async () => {
    testHelper = new (_ServiceTester().ServiceTester)();
    await testHelper.start([{
      name: 'CounterService',
      definition: _nuclideUri().default.join(__dirname, '../__mocks__/CounterService.js'),
      implementation: _nuclideUri().default.join(__dirname, '../__mocks__/CounterService.js')
    }], 'counter_protocol');
    service = testHelper.getRemoteService('CounterService');
  });
  it('Can create two remotable counters in parallel.', async () => {
    if (!service) {
      throw new Error("Invariant violation: \"service\"");
    }

    let watchedCounters = 0;
    service.Counter.watchNewCounters().refCount().subscribe(async counter => {
      await counter.getCount();
      ++watchedCounters;
    }); // Create two services.

    const counter1 = await service.Counter.createCounter(3);
    const counter2 = await service.Counter.createCounter(5); // Subscribe to events from counter1.

    let completed1 = false;
    counter1.watchChanges().refCount().subscribe(event => {
      expect(event.type).toBe('add');
      expect(event.oldValue).toBe(3);
      expect(event.newValue).toBe(4);
    }, () => {}, () => {
      completed1 = true;
    }); // Confirm their initial value.

    expect((await counter1.getCount())).toBe(3);
    expect((await counter2.getCount())).toBe(5); // Increment the counters / check values.

    await counter1.addCount(1);
    await counter2.addCount(2);
    expect((await counter1.getCount())).toBe(4);
    expect((await counter2.getCount())).toBe(7); // Call a static method that returns Counter instances.

    const counters = await service.Counter.listCounters();
    expect((await counters[0].getCount())).toBe(4);
    expect((await counters[1].getCount())).toBe(7); // Call a static method with a counter as an argument.

    expect((await service.Counter.indexOf(counter1))).toBe(0);
    expect((await service.Counter.indexOf(counter2))).toBe(1); // Dispose the counters, ensuring that they are removed from the global list.

    await counter1.dispose();
    expect((await service.Counter.listCounters()).length).toBe(1);
    await counter2.dispose();
    expect((await service.Counter.listCounters()).length).toBe(0); // Calling dispose multiple times should not throw.

    await counter2.dispose(); // Wait for the counter1 Observable to complete.

    (0, _waits_for().default)(() => completed1, 'The counter1 Observable to complete.'); // Wait for our watch to have seen all of the Counters.

    (0, _waits_for().default)(() => watchedCounters === 2, 'We have watched two counters get created.');
  });
  it('can subscribe/unsubscribe to the same observable multiple times.', async () => {
    if (!service) {
      throw new Error("Invariant violation: \"service\"");
    }

    const obs = service.Counter.watchNewCounters().refCount();
    let watchedCounters1 = 0;
    const sub1 = obs.subscribe(counter => {
      sub1.unsubscribe();
      ++watchedCounters1;
    });
    let watchedCounters2 = 0;
    const sub2 = obs.subscribe(counter => {
      ++watchedCounters2;

      if (watchedCounters2 === 2) {
        sub2.unsubscribe();
      }
    }); // Create two services.

    const counter1 = await service.Counter.createCounter(3);
    await counter1.getCount();
    const counter2 = await service.Counter.createCounter(5);
    await counter2.getCount();
    const counter3 = await service.Counter.createCounter(7);
    await counter3.getCount();
    expect(watchedCounters1).toBe(1);
    expect(watchedCounters2).toBe(2);
  });
  afterEach(() => testHelper.stop());
});