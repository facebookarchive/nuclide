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

/* eslint
   rulesdir/no-commonjs: 0,
   */

// eslint-disable-next-line rulesdir/modules-dependencies
const {__DEV__} = require('nuclide-node-transpiler/lib/env');
if (__DEV__) {
  // eslint-disable-next-line rulesdir/modules-dependencies
  require('nuclide-node-transpiler');
}

require('./MIDebugSession');
