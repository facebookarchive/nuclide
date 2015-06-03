'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {fsPromise} = require('nuclide-commons');

var WATCHMAN_DEFAULT_PATH = '/usr/local/bin/watchman';

async function getWatchmanBinaryPath(): Promise<string> {
  try {
    var stats = await fsPromise.stat(WATCHMAN_DEFAULT_PATH);
    // `stats` contains a `mode` property, a number which can be used to determine
    // whether this file is executable. However, the number is platform-dependent.
    if (stats && stats.isFile()) {
      return WATCHMAN_DEFAULT_PATH;
    }
  } catch (e) {
    // Suppress the error.
  }
  // Let the watchman Client find the watchman binary via the default env PATH.
  return 'watchman';
}

module.exports = {
  getWatchmanBinaryPath,

  get WatchmanClient() {
    return require('./WatchmanClient');
  },

  // Exposed for testing.
  get WatchmanSubscription() {
    return require('./WatchmanSubscription');
  },
};
