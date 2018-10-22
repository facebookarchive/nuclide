/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

/*
 * Async implementation of Jasmine's waitsFor()
 */
const waitsFor = async <T>(
  fn: () => ?T,
  message?: string | (() => string),
  timeout: number = global[Symbol.for('WAITS_FOR_TIMEOUT')] || 4500,
): Promise<T> => {
  const startTime = Date.now();
  let returnValue;
  // eslint-disable-next-line no-await-in-loop
  while (!Boolean((returnValue = await fn()))) {
    if (Date.now() - startTime > timeout) {
      throw new Error(
        message != null
          ? typeof message === 'function'
            ? message()
            : message
          : 'Expected the function to start returning "true" but it never did.',
      );
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => setTimeout(resolve, 40));
  }

  if (returnValue == null) {
    throw new Error('value must be present');
  }
  return returnValue;
};

export default waitsFor;

// Same function but flow compatible with returning a promise
// from the passed fn
export const waitsForAsync = async <T>(
  fn: () => Promise<T>,
  message?: string,
  timeout?: number,
): Promise<T> => {
  const result = await waitsFor(fn, message, timeout);
  return result;
};
