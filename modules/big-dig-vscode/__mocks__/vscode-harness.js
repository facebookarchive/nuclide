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

export class Uri {
  static parse: string => any = jest.fn();
}

export class EventEmitter<T> {
  +_listeners: Set<(T) => mixed> = new Set();
  +event: ((T) => void) => IDisposable = jest.fn(listener => {
    const _listeners = this._listeners;
    _listeners.add(listener);
    return {
      dispose() {
        _listeners.delete(listener);
      },
    };
  });

  +dispose: () => void = jest.fn(() => this._listeners.clear());
  +fire: T => void = jest.fn(x =>
    this._listeners.forEach(listener => listener(x)),
  );
}

export const window = {
  showErrorMessage: (jest.fn(): any),
};
