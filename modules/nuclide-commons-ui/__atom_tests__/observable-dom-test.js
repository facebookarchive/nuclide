"use strict";

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _observableDom() {
  const data = require("../observable-dom");

  _observableDom = function () {
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
 * 
 * @format
 */
describe('new DOMObserverObservable', () => {
  let observerInstance;
  beforeEach(() => {
    observerInstance = null;
  });

  class MockDOMObserver {
    constructor(callback) {
      this._callback = callback;
      observerInstance = this;
    }

    observe(...args) {
      this._args = args;
      this._connected = true;
    }

    disconnect() {
      this._connected = false;
    }

  }

  it('does not construct a DOM Observer until the Rx Observable is subscribed to', () => {
    // $FlowFixMe(>=0.55.0) Flow suppress
    const o = new (_observableDom()._DOMObserverObservable)(MockDOMObserver, 'some', 'additional', {
      args: true
    });
    expect(observerInstance).toBe(null);
    const subscription = o.subscribe(() => {});

    if (!(observerInstance != null)) {
      throw new Error("Invariant violation: \"observerInstance != null\"");
    }

    expect(observerInstance._args).toEqual(['some', 'additional', {
      args: true
    }]);
    expect(observerInstance._connected).toBe(true);
    subscription.unsubscribe();
  });
  it('calls disconnect on the underlying DOM Observer when unsubscribe is called', () => {
    const o = new (_observableDom()._DOMObserverObservable)(MockDOMObserver, 'some', 'additional', {
      args: true
    });
    const subscription = o.subscribe(() => {});

    if (!(observerInstance != null)) {
      throw new Error("Invariant violation: \"observerInstance != null\"");
    }

    expect(observerInstance._connected).toBe(true);
    subscription.unsubscribe();
    expect(observerInstance._connected).toBe(false);
  });
  it('by default (without a call to .flattenEntries()) creates an observable of ' + 'the elements emitted from the DOM Observer', async () => {
    class MockDOMObserverEmitsArray extends MockDOMObserver {
      observe(...args) {
        super.observe(...args);

        _RxMin.Observable.interval(1).mapTo(['foo', 'bar', 'baz']).take(2).subscribe(this._callback);
      }

    }

    const output = await new (_observableDom()._DOMObserverObservable)(MockDOMObserverEmitsArray, 'arg').take(2).toArray().toPromise();
    expect(output).toEqual([['foo', 'bar', 'baz'], ['foo', 'bar', 'baz']]);
  });
  describe('multiple subscribers', () => {
    it('only disconnects the underlying observer when all subscribers have unsubscribed', () => {
      const o = new (_observableDom()._DOMObserverObservable)(MockDOMObserver, 'some', 'additional', {
        args: true
      });
      const subscription = o.subscribe(() => {});
      const subscription2 = o.subscribe(() => {});

      if (!(observerInstance != null)) {
        throw new Error("Invariant violation: \"observerInstance != null\"");
      }

      expect(observerInstance._connected).toBe(true);
      subscription.unsubscribe(); // the underlying observer is still connected when only one of the two
      // subscribers unsubscribes

      expect(observerInstance._connected).toBe(true);
      expect(() => {
        subscription2.unsubscribe();
      }).not.toThrow(); // and finally disconnect when all subscribers have unsubscribed

      expect(observerInstance._connected).toBe(false);
    });
    it('creates a new underlying observable and connects it for new' + 'subscriptions that happen after a disconnect', () => {
      const o = new (_observableDom()._DOMObserverObservable)(MockDOMObserver, 'some', 'additional', {
        args: true
      });
      const subscription = o.subscribe(() => {});
      const subscription2 = o.subscribe(() => {});

      if (!(observerInstance != null)) {
        throw new Error("Invariant violation: \"observerInstance != null\"");
      }

      const oldObserver = observerInstance;
      subscription.unsubscribe();
      subscription2.unsubscribe();
      expect(observerInstance._connected).toBe(false);
      const newSubscription = o.subscribe(() => {}); // creates a new underlying observer

      expect(observerInstance).not.toBe(oldObserver);
      expect(observerInstance._connected).toBe(true);
      newSubscription.unsubscribe();
    });
  });
  describe('flattenEntries operator', () => {
    it('implements lift to cause subsequent operators to return DOMObserverObservables', () => {
      class MockDOMObserverEmitsArray extends MockDOMObserver {
        observe(...args) {
          super.observe(...args);

          _RxMin.Observable.interval(1).mapTo(['foo', 'bar', 'baz']).take(2).subscribe(this._callback);
        }

      }

      expect(new (_observableDom()._DOMObserverObservable)(MockDOMObserverEmitsArray, 'arg').flattenEntries().map(x => x) instanceof _observableDom()._DOMObserverObservable).toBe(true);
    });
    it('creates an observable of the individual elements of the array emitted from the DOM Observer', async () => {
      class MockDOMObserverEmitsArray extends MockDOMObserver {
        observe(...args) {
          super.observe(...args);

          _RxMin.Observable.interval(1).mapTo(['foo', 'bar', 'baz']).take(2).subscribe(this._callback);
        }

      }

      const output = await new (_observableDom()._DOMObserverObservable)(MockDOMObserverEmitsArray, 'arg').flattenEntries().take(6).toArray().toPromise();
      expect(output).toEqual(['foo', 'bar', 'baz', 'foo', 'bar', 'baz']);
    });
    it('creates an observable of the individual elements of the array returned ' + 'from the getEntries method of the entrylist emitted from the DOM Observer', async () => {
      class MockDOMObserverEmitsEntryList extends MockDOMObserver {
        observe(...args) {
          super.observe(...args);

          _RxMin.Observable.interval(1).mapTo({
            getEntries: () => ['foo', 'bar', 'baz']
          }).take(2).subscribe(this._callback);
        }

      }

      const output = await new (_observableDom()._DOMObserverObservable)(MockDOMObserverEmitsEntryList, 'arg').flattenEntries().take(6).toArray().toPromise();
      expect(output).toEqual(['foo', 'bar', 'baz', 'foo', 'bar', 'baz']);
    });
    it('throws if neither an iterable nor an EntryList is emitted from the DOM Observer', async () => {
      class MockDOMObserverEmitsNonStandard extends MockDOMObserver {
        observe(...args) {
          super.observe(...args);

          _RxMin.Observable.interval(1).take(2).subscribe(this._callback);
        }

      }

      let error;

      try {
        await new (_observableDom()._DOMObserverObservable)(MockDOMObserverEmitsNonStandard, 'arg').flattenEntries().take(2).toArray().toPromise();
      } catch (e) {
        error = e;
      }

      if (!(error != null)) {
        throw new Error("Invariant violation: \"error != null\"");
      }

      expect(error.message).toEqual('Tried to merge DOM Observer entries, but they were not iterable nor were they an EntryList.');
    });
  });
});