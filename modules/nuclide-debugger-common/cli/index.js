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

'use strict';

/* eslint
  comma-dangle: [1, always-multiline],
  prefer-object-spread/prefer-object-spread: 0,
  rulesdir/no-commonjs: 0,
  */

// Load v8-compile-cache.
require('v8-compile-cache');

/**
 * This is the main insertion point for starting the command line debugger
 */
const {__DEV__} = require('nuclide-node-transpiler/lib/env');
if (__DEV__) {
  require('nuclide-node-transpiler');
}

// Load the ES6+ client code now that the transpiler is in place.
require('./main');
