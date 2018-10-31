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

// remove references to this file from stack trace, so we can get
// a nice code frame in test failures that looks like this:
//       60 |
//       61 | test('stack trace points to the callsite, not the implementation', async () => {
//     > 62 |   const fail = () => waitsFor(() => false);
//
// Rather than everything pointing to this file.
const removeImplementationFromStackTrace = e => {
  const regexp = new RegExp(`\\s+at waitsFor.*${__filename}.*\\n`);
  e.stack = e.stack.replace(regexp, '\n');
};

/*
 * Async implementation of Jasmine's waitsFor()
 */
const waitsFor = async <T>(
  fn: () => ?T,
  message?: string | (() => string),
  timeout: number = global[Symbol.for('WAITS_FOR_TIMEOUT')] || 4500,
): Promise<T> => {
  const errorMessage =
    (message != null
      ? typeof message === 'function'
        ? message()
        : message
      : 'Expected the function to start returning "true" but it never did.') +
    ` Timeout = ${timeout}`;
  // Error must be created right away, so we keep the stack trace.
  // (we would lose it if we threw it from a promise/async loop)
  const error = new Error(errorMessage);
  removeImplementationFromStackTrace(error);

  const startTime = Date.now();
  let returnValue;
  // eslint-disable-next-line no-await-in-loop
  while (!Boolean((returnValue = await fn()))) {
    if (Date.now() - startTime > timeout) {
      throw error;
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
