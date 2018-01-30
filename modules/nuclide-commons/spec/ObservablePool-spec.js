/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import invariant from 'assert';
import {Observable, Subject} from 'rxjs';
import ObservablePool from '../ObservablePool';

describe('ObservablePool', () => {
  it('limits the concurrency of observable values with cancellation', () => {
    const pool = new ObservablePool(2);

    const subject1 = new Subject();
    const spy1 = jasmine.createSpy('1').andReturn(subject1);
    const req1 = pool.schedule(spy1);

    const subject2 = new Subject();
    const spy2 = jasmine.createSpy('2').andReturn(subject2);
    const req2 = pool.schedule(spy2);

    const subject3 = new Subject();
    const spy3 = jasmine.createSpy('3').andReturn(subject3);
    const req3 = pool.schedule(Observable.defer(spy3));

    // Nothing should happen until subscription.
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
    expect(spy3).not.toHaveBeenCalled();

    const subscription = req1.subscribe();
    req2.subscribe();
    const nextSpy = jasmine.createSpy('nextSpy');
    const errorSpy = jasmine.createSpy('errorSpy');
    req3.subscribe(nextSpy, errorSpy);

    // Only the first two should be subscribed to.
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(spy3).not.toHaveBeenCalled();

    // Once we cancel the first, the third goes through.
    subscription.unsubscribe();
    expect(spy3).toHaveBeenCalled();

    subject2.complete();
    expect(pool._responseListeners.size).toBe(1);

    subject3.next('test');
    subject3.error('error');
    expect(pool._responseListeners.size).toBe(0);
    expect(nextSpy).toHaveBeenCalledWith('test');
    expect(errorSpy).toHaveBeenCalledWith('error');
  });

  it('waits for promises, even on unsubscribe', () => {
    const pool = new ObservablePool(1);
    let resolve: ?Function;
    let reject: ?Function;
    const spy1 = jasmine.createSpy('1').andReturn(
      new Promise(r => {
        resolve = r;
      }),
    );
    const spy2 = jasmine.createSpy('2').andReturn(
      new Promise((_, r) => {
        reject = r;
      }),
    );
    const errorSpy = jasmine.createSpy('errorSpy');
    const sub1 = pool.schedule(spy1).subscribe();
    pool.schedule(spy2).subscribe(() => {}, errorSpy);

    // Immediately subscribe & unsubscribe -
    // the request should never be scheduled.
    const spy3 = jasmine.createSpy('3').andReturn(Promise.resolve());
    pool
      .schedule(spy3)
      .subscribe()
      .unsubscribe();

    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();

    sub1.unsubscribe();
    // Remove the request, but remain blocked until the promise actually resolves.
    expect(pool._responseListeners.size).toEqual(1);
    expect(spy2).not.toHaveBeenCalled();
    invariant(resolve != null, 'spy1 should have been scheduled');
    resolve();

    // Promise resolution is always async...
    waitsFor(() => spy2.wasCalled, 'spy2 should be called');

    runs(() => {
      invariant(reject != null, 'spy2 was called');
      reject('test');
    });

    waitsFor(() => errorSpy.wasCalled, 'errorSpy should be called');

    runs(() => {
      expect(errorSpy).toHaveBeenCalledWith('test');
      expect(pool._responseListeners.size).toBe(0);
      expect(spy3).not.toHaveBeenCalled();
    });
  });

  it('catches executor errors', () => {
    const pool = new ObservablePool(1);
    let error;
    pool
      .schedule(() => {
        throw Error('test');
      })
      .subscribe({
        error(err) {
          error = err;
        },
      });
    expect(error).toEqual(Error('test'));
  });

  it('errors on disposal', () => {
    const pool = new ObservablePool(1);
    const errorSpy = jasmine.createSpy('errorSpy');
    pool.schedule(() => Promise.resolve()).subscribe({error: errorSpy});
    pool.dispose();
    expect(errorSpy).toHaveBeenCalled();
  });
});
