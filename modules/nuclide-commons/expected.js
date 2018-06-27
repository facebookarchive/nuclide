/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict
 * @format
 */

/**
 * Expected<T> tries to mimic llvm's Expected class.
 * This is specially useful for Observables that can return a stream of errors instead of closing
 * the subscription.
 */

type ExpectedError<T> = {
  isError: true,
  isPending: false,
  error: Error,
  getOrDefault: (def: T) => T,
  map<U>(fn: (T) => U): Expected<U>,
};

type ExpectedValue<T> = {
  isError: false,
  isPending: false,
  value: T,
  getOrDefault: (def: T) => T,
  map<U>(fn: (T) => U): Expected<U>,
};

type ExpectedPendingValue<T> = {
  isError: false,
  isPending: true,
  value: T,
  getOrDefault: (def: T) => T,
  map<U>(fn: (T) => U): Expected<U>,
};

export type Expected<T> =
  | ExpectedError<T>
  | ExpectedValue<T>
  | ExpectedPendingValue<T>;

export class Expect {
  static error<T>(error: Error): ExpectedError<T> {
    return {
      isError: true,
      isPending: false,
      error,
      getOrDefault(def: T): T {
        return def;
      },
      map<U>(fn: T => U): Expected<U> {
        return Expect.error(error);
      },
    };
  }

  static value<T>(value: T): ExpectedValue<T> {
    return {
      isError: false,
      isPending: false,
      value,
      getOrDefault(def: T): T {
        return this.value;
      },
      map<U>(fn: T => U): Expected<U> {
        return Expect.value(fn(value));
      },
    };
  }

  static pendingValue<T>(value: T): ExpectedPendingValue<T> {
    return {
      isError: false,
      isPending: true,
      value,
      getOrDefault(def: T): T {
        return this.value;
      },
      map<U>(fn: T => U): Expected<U> {
        return Expect.pendingValue(fn(value));
      },
    };
  }
}

export function expectedEqual<T>(
  a: Expected<T>,
  b: Expected<T>,
  valueEqual: (valueA: T, valueB: T) => boolean,
  errorEqual: (errorA: Error, errorB: Error) => boolean,
): boolean {
  if (a.isError && b.isError) {
    return errorEqual(a.error, b.error);
  } else if (a.isPending && b.isPending) {
    return true;
  } else if (!a.isError && !b.isError && !a.isPending && !b.isPending) {
    return valueEqual(a.value, b.value);
  } else {
    return false;
  }
}
