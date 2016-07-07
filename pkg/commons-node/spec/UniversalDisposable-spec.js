'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import UniversalDisposable from '../UniversalDisposable';

describe('UniversalDisposable', () => {
  it('disposes of the Disposable arguments', () => {
    const dispose = jasmine.createSpy('dispose');
    const universal = new UniversalDisposable({dispose});

    expect(dispose.wasCalled).toBe(false);
    universal.dispose();
    expect(dispose.callCount).toBe(1);
  });

  it('calls function arguments', () => {
    const foo = jasmine.createSpy('foo');
    const universal = new UniversalDisposable(foo);

    expect(foo.wasCalled).toBe(false);
    universal.dispose();
    expect(foo.callCount).toBe(1);
  });

  it('calls unsubscribe arguments', () => {
    const unsubscribe = jasmine.createSpy('unsubscribe');
    const universal = new UniversalDisposable(unsubscribe);

    expect(unsubscribe.wasCalled).toBe(false);
    universal.dispose();
    expect(unsubscribe.callCount).toBe(1);
  });

  it('supports creation with mixed teardowns', () => {
    const dispose = jasmine.createSpy('dispose');
    const unsubscribe = jasmine.createSpy('unsubscribe');
    const foo = jasmine.createSpy('foo');
    const universal = new UniversalDisposable(
      {dispose},
      {unsubscribe},
      foo,
    );

    expect(dispose.wasCalled).toBe(false);
    expect(unsubscribe.wasCalled).toBe(false);
    expect(foo.wasCalled).toBe(false);
    universal.dispose();
    expect(dispose.callCount).toBe(1);
    expect(unsubscribe.callCount).toBe(1);
    expect(foo.callCount).toBe(1);
  });

  it('supports adding mixed teardowns', () => {
    const dispose = jasmine.createSpy('dispose');
    const unsubscribe = jasmine.createSpy('unsubscribe');
    const foo = jasmine.createSpy('foo');
    const universal = new UniversalDisposable();
    universal.add(
      {dispose},
      {unsubscribe},
      foo,
    );

    expect(dispose.wasCalled).toBe(false);
    expect(unsubscribe.wasCalled).toBe(false);
    expect(foo.wasCalled).toBe(false);
    universal.dispose();
    expect(dispose.callCount).toBe(1);
    expect(unsubscribe.callCount).toBe(1);
    expect(foo.callCount).toBe(1);
  });

  it('supports unsubscribe as well', () => {
    const dispose = jasmine.createSpy('dispose');
    const unsubscribe = jasmine.createSpy('unsubscribe');
    const foo = jasmine.createSpy('foo');
    const universal = new UniversalDisposable(
      {dispose},
      {unsubscribe},
      foo,
    );

    expect(dispose.wasCalled).toBe(false);
    expect(unsubscribe.wasCalled).toBe(false);
    expect(foo.wasCalled).toBe(false);
    universal.unsubscribe();
    expect(dispose.callCount).toBe(1);
    expect(unsubscribe.callCount).toBe(1);
    expect(foo.callCount).toBe(1);
  });

  it('multiple dispose/unsubscribe calls have no effect', () => {
    const dispose = jasmine.createSpy('dispose');
    const unsubscribe = jasmine.createSpy('unsubscribe');
    const foo = jasmine.createSpy('foo');
    const universal = new UniversalDisposable(
      {dispose},
      {unsubscribe},
      foo,
    );

    expect(dispose.wasCalled).toBe(false);
    expect(unsubscribe.wasCalled).toBe(false);
    expect(foo.wasCalled).toBe(false);
    universal.unsubscribe();
    universal.dispose();
    universal.unsubscribe();
    universal.dispose();
    expect(dispose.callCount).toBe(1);
    expect(unsubscribe.callCount).toBe(1);
    expect(foo.callCount).toBe(1);
  });

  it('supports removal of the teardowns', () => {
    const dispose = {dispose: jasmine.createSpy('dispose')};
    const unsubscribe = {unsubscribe: jasmine.createSpy('unsubscribe')};
    const foo = jasmine.createSpy('foo');
    const universal = new UniversalDisposable(
      dispose,
      unsubscribe,
      foo,
    );

    universal.remove(unsubscribe);
    universal.remove(dispose, foo);

    universal.dispose();

    expect(dispose.dispose.wasCalled).toBe(false);
    expect(unsubscribe.unsubscribe.wasCalled).toBe(false);
    expect(foo.wasCalled).toBe(false);
  });

  it('can clear all of the teardowns', () => {
    const dispose = {dispose: jasmine.createSpy('dispose')};
    const unsubscribe = {unsubscribe: jasmine.createSpy('unsubscribe')};
    const foo = jasmine.createSpy('foo');
    const universal = new UniversalDisposable(
      dispose,
      unsubscribe,
      foo,
    );

    universal.clear();

    universal.dispose();

    expect(dispose.dispose.wasCalled).toBe(false);
    expect(unsubscribe.unsubscribe.wasCalled).toBe(false);
    expect(foo.wasCalled).toBe(false);
  });

  it('maintains implicit order of the teardowns', () => {
    const ids = [];

    const foo1 = () => ids.push(1);
    const foo2 = () => ids.push(2);
    const foo3 = () => ids.push(3);
    const foo4 = () => ids.push(4);

    const universal = new UniversalDisposable(foo1, foo3);
    universal.add(foo4, foo2);

    universal.dispose();

    expect(ids).toEqual([1, 3, 4, 2]);
  });
});
