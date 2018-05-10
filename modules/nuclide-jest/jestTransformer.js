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

// eslint-disable-next-line nuclide-internal/modules-dependencies
const NodeTranspiler = require('nuclide-node-transpiler/lib/NodeTranspiler');
const transpiler = new NodeTranspiler();

// eslint-disable-next-line nuclide-internal/no-commonjs
module.exports = {
  process(src, path) {
    if (NodeTranspiler.shouldCompile(src)) {
      return transpiler.transformWithCache(src, path);
    }

    return src;
  },
};
