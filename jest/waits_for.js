/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

/*
 * Async implementation of Jasmine's waitsFor()
 */
export default (async function waitsFor(
  fn: () => boolean | Promise<boolean>,
  message?: string,
  timeout: number = global[Symbol.for('WAITS_FOR_TIMEOUT')] || 4500,
) {
  const error = new Error(
    message != null
      ? message
      : 'Expected the function to start returning "true" but it never did.',
  );
  const startTime = Date.now();
  // eslint-disable-next-line no-await-in-loop
  while (!Boolean(await fn())) {
    if (Date.now() - startTime > timeout) {
      throw error;
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => setTimeout(resolve, 40));
  }
});
