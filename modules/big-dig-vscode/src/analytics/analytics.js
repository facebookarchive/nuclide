/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

let logToScribeImpl: (
  key: string,
  values: {[key: string]: mixed},
) => Promise<mixed>;
try {
  // $FlowFB
  logToScribeImpl = require('./fb-analytics').logToScribe;
} catch (e) {
  // MODULE_NOT_FOUND is expected for non-FB.
  if (e.code !== 'MODULE_NOT_FOUND') {
    throw e;
  } else {
    logToScribeImpl = (key: string, values: {[key: string]: mixed}) =>
      Promise.resolve();
  }
}

/**
 * Although this returns a Promise, generally, it is not worth await'ing.
 */
export function logToScribe(
  key: string,
  values: {[key: string]: mixed},
): Promise<mixed> {
  return logToScribeImpl(key, values);
}
