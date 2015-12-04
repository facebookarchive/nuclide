'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Rx from 'rx';

type Comparer = (a: mixed, b: mixed) => boolean;
type SubscribeCallback = (...args: Array<mixed>) => mixed;
type SubscribeFunction = (callback: SubscribeCallback) => atom$IDisposable;
type NotifyFunction = (getValue: () => mixed) => void;
type Result = {notify: NotifyFunction, observe: SubscribeFunction};
type MethodMap = {[methodName: string]: (instance: Object) => mixed};
type Decorator = (target: Object) => Object;

const strictEquals = (a, b) => a === b;

/**
 * A decorator for adding Atom-style observation methods to a React component class whose
 * whose subscribers are invoked whenever the component updates.
 */
export default function addObserveMethods(methodMap: MethodMap): Decorator {
  return function(target) {
    const proto = (target.prototype: Object);

    // Add an observation method for each item in the map.
    Object.keys(methodMap).forEach(methodName => {
      const getValue = methodMap[methodName];
      Object.defineProperty(
        proto,
        methodName,
        createObserveMethodDescriptor(target, methodName, getValue),
      );
    });

    // Wrap `componentDidUpdate` to notify Atom of changes.
    const oldMethod = proto.componentDidUpdate;
    proto.componentDidUpdate = function(...args) {
      if (oldMethod) {
        oldMethod.apply(this, args);
      }
      if (this._notifiers) {
        this._notifiers.forEach(notify => notify());
      }
    };

    return target;
  };
}

/**
 * Creates a descriptor that overwrites itself on first access with a method for observing changes
 * of a specific property.
 */
function createObserveMethodDescriptor(target, key, getValue) {
  return {
    configurable: true,
    get() {
      // Don't override when accessed via prototype.
      if (this === target.prototype) {
        return null;
      }

      // If the instance doesn't have a list of notifiers yet, create one.
      if (!this._notifiers) {
        this._notifiers = [];
      }

      // Override the method with a new version on first access.
      const {notify, observe} = createObserveFunction();
      this._notifiers.push(() => notify(() => getValue(this)));
      Object.defineProperty(this, key, {
        value: observe,
        configurable: true,
        writable: true,
      });
      return observe;
    },
  };
}

/**
 * A utility for creating an Atom-style subscription function (`onDidChangeBlah`, `observeBlah`)
 * with an associated notification mechanism. This is just a thin wrapper around an RxJS Subject. We
 * provide our own default comparer because we want to be more strict (by default) than RxJS is.
 * (For example, RxJS will consider similar objects equal.)
 */
function createObserveFunction(comparer: Comparer = strictEquals): Result {
  const value$ = new Rx.Subject();
  const distinctValue$ = value$.distinctUntilChanged(undefined, comparer);
  // Wrap each callback so that we don't leak the fact that subscribe is implemented with
  // observables (by accepting Observers as well as callbacks).
  return {
    observe: callback => distinctValue$.subscribe(value => callback(value)),
    notify(getValue) {
      // Don't calculate the next value unless somebody's listening.
      if (value$.hasObservers()) {
        value$.onNext(getValue());
      }
    },
  };
}
