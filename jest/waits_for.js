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
  fn: () => boolean,
  message?: string,
  timeout: number = 1000,
) {
  const startTime = Date.now();
  while (!Boolean(fn())) {
    if (Date.now() - startTime > timeout) {
      throw new Error(
        message != null
          ? message
          : 'Expected the function to start returning "true" but it never did',
      );
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise(resolve => setTimeout(resolve, 50));
  }
});
