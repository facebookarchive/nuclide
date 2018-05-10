/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @noflow
 */
'use strict';

/* eslint
  comma-dangle: [1, always-multiline],
  prefer-object-spread/prefer-object-spread: 0,
  nuclide-internal/no-commonjs: 0,
  */

module.exports.expect = global.expect;
module.exports.test = global.test;
module.exports.xtest = global.xtest;
module.exports.xit = global.xit;
module.exports.it = global.it;
module.exports.fit = global.fit;
module.exports.describe = global.describe;
module.exports.xdescribe = global.xdescribe;
module.exports.fdescribe = global.fdescribe;
module.exports.beforeEach = global.beforeEach;
module.exports.afterEach = global.afterEach;
module.exports.beforeAll = global.beforeAll;
module.exports.afterAll = global.afterAll;
// $FlowIgnore
module.exports.jest = jest;
