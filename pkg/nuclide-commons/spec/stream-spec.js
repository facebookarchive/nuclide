'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {splitStream, observeStream, cacheWhileSubscribed} from '..';
import {Observable, Subject} from 'rxjs';
import Stream from 'stream';

describe('nuclide-commons/stream', () => {

  it('splitStream', () => {
    waitsForPromise(async () => {
      const input = ['foo\nbar', '\n', '\nba', 'z', '\nblar'];
      const output = await splitStream(Observable.from(input)).toArray().toPromise();
      expect(output).toEqual(['foo\n', 'bar\n', '\n', 'baz\n', 'blar']);
    });
  });

  it('observeStream', () => {
    waitsForPromise(async () => {
      const input = ['foo\nbar', '\n', '\nba', 'z', '\nblar'];
      const stream = new Stream.PassThrough();
      const promise = observeStream(stream).toArray().toPromise();
      input.forEach(value => { stream.write(value, 'utf8'); });
      stream.end();
      const output = await promise;
      expect(output.join('')).toEqual(input.join(''));
    });
  });

  it('observeStream - error', () => {
    waitsForPromise(async () => {
      const stream = new Stream.PassThrough();
      const input = ['foo\nbar', '\n', '\nba', 'z', '\nblar'];
      const output = [];
      const promise = new Promise((resolve, reject) => {
        observeStream(stream).subscribe(
          v => output.push(v),
          e => resolve(e),
          () => {}
        );
      });
      const error = new Error('Had an error');

      input.forEach(value => { stream.write(value, 'utf8'); });
      stream.emit('error', error);

      const result = await promise;
      expect(output).toEqual(input);
      expect(result).toBe(error);
    });
  });
});

describe('cacheWhileSubscribed', () => {
  let input: Subject<number> = (null: any);
  let output: Observable<number> = (null: any);

  function subscribeArray(arr: Array<number>): rx$ISubscription {
    return output.subscribe(x => arr.push(x));
  }
  beforeEach(() => {
    input = new Subject();
    output = cacheWhileSubscribed(input);
  });

  it('should provide cached values to late subscribers', () => {
    const arr1 = [];
    const arr2 = [];

    input.next(0);
    const sub1 = subscribeArray(arr1);
    input.next(1);
    input.next(2);
    const sub2 = subscribeArray(arr2);

    sub1.unsubscribe();
    sub2.unsubscribe();
    expect(arr1).toEqual([1, 2]);
    expect(arr2).toEqual([2]);
  });

  it('should not store stale events when everyone is unsubscribed', () => {
    const arr1 = [];
    const arr2 = [];

    input.next(0);
    const sub1 = subscribeArray(arr1);
    input.next(1);
    sub1.unsubscribe();

    input.next(2);

    const sub2 = subscribeArray(arr2);
    input.next(3);
    sub2.unsubscribe();

    expect(arr1).toEqual([1]);
    expect(arr2).toEqual([3]);
  });
});
