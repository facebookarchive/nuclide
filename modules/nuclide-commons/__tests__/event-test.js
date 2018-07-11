"use strict";

var _events = _interopRequireDefault(require("events"));

function _event() {
  const data = require("../event");

  _event = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
 */
describe('attachEvent', () => {
  describe('the returned disposable', () => {
    it("doesn't remove other listeners when disposed multiple times", () => {
      const foo = jasmine.createSpy('foo');
      const emitter = new _events.default();
      const d1 = (0, _event().attachEvent)(emitter, 'event', foo);
      (0, _event().attachEvent)(emitter, 'event', foo);
      d1.dispose();
      d1.dispose();
      emitter.emit('event');
      expect(foo).toHaveBeenCalled();
    });
  });
});
describe('observableFromSubscribeFunction', () => {
  let callback;
  let disposable; // The subscribe function will put the given callback and the returned disposable in the variables
  // above for inspection.

  const subscribeFunction = fn => {
    callback = fn;
    disposable = {
      dispose() {
        callback = null;
      }

    };
    jest.spyOn(disposable, 'dispose');
    return disposable;
  };

  beforeEach(() => {
    callback = null;
    disposable = null;
  });
  it('should not call the subscription function until the Observable is subscribed to', () => {
    const observable = (0, _event().observableFromSubscribeFunction)(subscribeFunction);
    expect(callback).toBeNull();
    observable.subscribe(() => {});
    expect(callback).not.toBeNull();
  });
  it('should send events to the observable stream', async () => {
    const result = (0, _event().observableFromSubscribeFunction)(subscribeFunction).take(2).toArray().toPromise();

    if (!(callback != null)) {
      throw new Error("Invariant violation: \"callback != null\"");
    }

    callback(1);
    callback(2);
    expect((await result)).toEqual([1, 2]);
  });
  it('should properly unsubscribe and resubscribe', () => {
    const observable = (0, _event().observableFromSubscribeFunction)(subscribeFunction);
    let subscription = observable.subscribe(() => {});
    expect(callback).not.toBeNull();

    if (!(disposable != null)) {
      throw new Error("Invariant violation: \"disposable != null\"");
    }

    expect(disposable.dispose).not.toHaveBeenCalled();
    subscription.unsubscribe();
    expect(disposable.dispose).toHaveBeenCalled();
    expect(callback).toBeNull();
    subscription = observable.subscribe(() => {});
    expect(callback).not.toBeNull();
    expect(disposable.dispose).not.toHaveBeenCalled();
    subscription.unsubscribe();
    expect(disposable.dispose).toHaveBeenCalled();
  });
});