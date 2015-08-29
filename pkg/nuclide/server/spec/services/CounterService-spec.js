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

describe('CounterService', () => {
  var testHelper, service;
  beforeEach(() => {
    testHelper = new ServiceTestHelper();
    waitsForPromise(() => testHelper.start([{
      name: 'CounterService',
      definition: path.join(__dirname, 'CounterService.def'),
      implementation: path.join(__dirname, 'CounterService.js'),
    }]));

    runs(() => {
      service = testHelper.getRemoteService(path.join(__dirname, 'CounterService.def'));
    });
  });

  it('Can create two remotable counters in parallel.', () => {
    waitsForPromise(async () => {
      invariant(service);

      var watchedCounters = 0;
      service.Counter.watchNewCounters().subscribe(async counter => {
        await counter.getCount();
        ++watchedCounters;
      });

      // Create two services.
      var counter1 = new service.Counter(3);
      var counter2 = new service.Counter(5);

      // Subscribe to events from counter1.
      var completed1 = false;
      counter1.watchChanges().subscribe(event => {
        expect(event.type).toBe('add');
        expect(event.oldValue).toBe(3);
        expect(event.newValue).toBe(4);
      }, () => {}, () => {
        completed1 = true;
      });

      // Confirm their initial value.
      expect(await counter1.getCount()).toBe(3);
      expect(await counter2.getCount()).toBe(5);

      // Increment the counters / check values.
      await counter1.addCount(1);
      await counter2.addCount(2);
      expect(await counter1.getCount()).toBe(4);
      expect(await counter2.getCount()).toBe(7);

      // Call a static method that returns Counter instances.
      var counters = await service.Counter.listCounters();
      expect(await counters[0].getCount()).toBe(4);
      expect(await counters[1].getCount()).toBe(7);

      // Call a static method with a counter as an argument.
      expect(await service.Counter.indexOf(counter1)).toBe(0);
      expect(await service.Counter.indexOf(counter2)).toBe(1);

      // Dispose the counters, ensuring that they are removed from the global list.
      await counter1.dispose();
      expect((await service.Counter.listCounters()).length).toBe(1);
      await counter2.dispose();
      expect((await service.Counter.listCounters()).length).toBe(0);

      // Wait for the counter1 Observable to complete.
      waitsFor(() => completed1, 'The counter1 Observable to complete.');

      // Wait for our watch to have seen all of the Counters.
      waitsFor(() => watchedCounters === 2, 'We have watched two counters get created.');
    });
  });

  afterEach(() => testHelper.stop());
});
