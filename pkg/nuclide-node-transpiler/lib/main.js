'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// If babel-core is not available, then this is a production build, so don't
// bother loading the require hook.

let hasBabel = false;
try {
  hasBabel = Boolean(require.resolve('babel-core'));
} catch (err) {
}

if (hasBabel) {
  require('./require-hook');
}
