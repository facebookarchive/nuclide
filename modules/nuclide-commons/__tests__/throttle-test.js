"use strict";

function _observable() {
  const data = require("../observable.js");

  _observable = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function _promise() {
  const data = require("../promise");

  _promise = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('throttle', () => {
  it('handles basic test', () => {
    const source = new _rxjsCompatUmdMin.Subject();
    const delay = new _rxjsCompatUmdMin.Subject();
    const throttled = source.pipe((0, _observable().throttle)(() => delay));
    const values = [];
    throttled.subscribe(x => {
      values.push(x);
    }); // Make sure we emit the leading elements.

    source.next(1);
    expect(values).toEqual([1]); // Make sure we ignore elements during the cooldown.

    source.next(2);
    source.next(3);
    expect(values).toEqual([1]); // Make sure we emit the trailing elements.

    delay.next();
    expect(values).toEqual([1, 3]); // Make sure we don't re-emit values when no new ones come in.

    delay.next();
    delay.next();
    expect(values).toEqual([1, 3]);
  });
  it('emits trailing values when the source is a synchronously emitting cold observable', async () => {
    const source = _rxjsCompatUmdMin.Observable.of(1, 2, 3, 4).concat(_rxjsCompatUmdMin.Observable.never());

    const delay = new _rxjsCompatUmdMin.Subject();
    const throttled = source.pipe((0, _observable().throttle)(() => delay));
    const values = [];
    throttled.subscribe(x => {
      values.push(x);
    }); // Make sure we emit the leading elements.

    expect(values).toEqual([1]); // Make sure we emit the trailing elements.

    delay.next();
    expect(values).toEqual([1, 4]);
  });
  it('handles numeric delay', async () => {
    const source = new _rxjsCompatUmdMin.Subject();
    const delay = 100;
    const throttled = source.pipe((0, _observable().throttle)(delay));
    const values = [];
    let lastTiming = null;
    throttled.subscribe(x => {
      values.push(x);
      const currentTime = Date.now();

      if (lastTiming != null) {
        expect(currentTime - lastTiming).toBeGreaterThan(delay);
      }

      lastTiming = currentTime;
    });
    source.next('A');
    await (0, _promise().sleep)(70);
    source.next('B');
    await (0, _promise().sleep)(50);
    source.next('C');
    await (0, _promise().sleep)(110);
    source.next('D');
    await (0, _promise().sleep)(30);
    source.next('E');
    await (0, _promise().sleep)(200);
    source.next('F');
    source.complete();
    await (0, _promise().sleep)(delay);
    expect(values).toEqual(['A', 'B', 'C', 'E', 'F']);
  });
  it('calls delay based on emitted value', async () => {
    const delayInput = 1500;
    const source = new _rxjsCompatUmdMin.Observable.of(delayInput, delayInput);

    function delay(val) {
      return _rxjsCompatUmdMin.Observable.timer(val);
    }

    const throttled = source.pipe((0, _observable().throttle)(delay));
    let lastTiming = null;
    const intervalThreshold = 20;
    throttled.subscribe(x => {
      const currentTime = Date.now();

      if (lastTiming != null) {
        expect(Math.abs(currentTime - lastTiming - delayInput)).toBeGreaterThan(intervalThreshold);
      }

      lastTiming = currentTime;
    });
  });
  it('emits the leading item immeditately by default', () => {
    const source = _rxjsCompatUmdMin.Observable.of(1, 2).merge(_rxjsCompatUmdMin.Observable.never());

    const spy = jest.fn();
    source.pipe((0, _observable().throttle)(() => _rxjsCompatUmdMin.Observable.never())).subscribe(spy);
    expect(spy).toHaveBeenCalledWith(1);
  });
  it("doesn't emit the leading item twice", () => {
    const source = _rxjsCompatUmdMin.Observable.of(1).merge(_rxjsCompatUmdMin.Observable.never());

    const notifier = _rxjsCompatUmdMin.Observable.of(null); // emits immediately on subscription.


    const spy = jest.fn();
    source.pipe((0, _observable().throttle)(() => notifier)).subscribe(spy);
    expect(spy.mock.calls.length).toBe(1);
  });
  it('subscribes to the source once per subscription', () => {
    const spy = jest.fn();

    const source = _rxjsCompatUmdMin.Observable.create(spy);

    source.pipe((0, _observable().throttle)(() => _rxjsCompatUmdMin.Observable.of(null))).subscribe();
    expect(spy.mock.calls.length).toBe(1);
  });
  it('supports promises', () => {
    const source = _rxjsCompatUmdMin.Observable.of(1, 2);

    const spy = jest.fn();
    const notifier = new Promise((resolve, reject) => {
      resolve('done');
    });
    source.pipe((0, _observable().throttle)(notifier)).subscribe(spy);
    expect(spy.mock.calls.length).toBe(2);
  });
});