'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


import {Cache} from '../cache';

describe('Cache', () => {
  const key1 = 'key1';
  const value = 'value';

  it('creates values on demand', () => {
    let callCount = 0;
    const factory = jasmine.createSpy('factory').andCallFake(
      key => {
        callCount += 1;
        expect(key).toEqual(key1);
        return value;
      });
    const cache: Cache<string, string> = new Cache(factory);

    expect(factory).not.toHaveBeenCalled();
    expect(cache.has(key1)).toEqual(false);
    expect(cache.get(key1)).toEqual(value);
    expect(callCount).toEqual(1);
    expect(cache.has(key1)).toEqual(true);
    expect(factory).toHaveBeenCalledWith(key1);
    expect(Array.from(cache.values())).toEqual([value]);

    expect(cache.get(key1)).toEqual(value);
    expect(callCount).toEqual(1);
  });

  it('delete', () => {
    const factory = jasmine.createSpy('factory').andReturn(value);
    const cache: Cache<string, string> = new Cache(factory);

    expect(cache.delete(key1)).toEqual(false);
    cache.get(key1);
    expect(cache.has(key1)).toEqual(true);
    expect(cache.delete(key1)).toEqual(true);
    expect(cache.has(key1)).toEqual(false);
  });

  it('delete disposes values', () => {
    const factory = jasmine.createSpy('factory').andReturn(value);
    const dispose = jasmine.createSpy('dispose');
    const cache: Cache<string, string> = new Cache(factory, dispose);

    cache.get(key1);
    cache.delete(key1);
    expect(dispose).toHaveBeenCalledWith(value);
  });

  it('clear disposes values', () => {
    const factory = jasmine.createSpy('factory').andReturn(value);
    const dispose = jasmine.createSpy('dispose');
    const cache: Cache<string, string> = new Cache(factory, dispose);

    cache.get(key1);
    cache.clear();
    expect(dispose).toHaveBeenCalledWith(value);
  });

  it('dispose disposes values', () => {
    const factory = jasmine.createSpy('factory').andReturn(value);
    const dispose = jasmine.createSpy('dispose');
    const cache: Cache<string, string> = new Cache(factory, dispose);

    cache.get(key1);
    cache.dispose();
    expect(dispose).toHaveBeenCalledWith(value);
  });
});
