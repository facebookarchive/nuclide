/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @noflow
 */
'use strict';

/* eslint
  comma-dangle: [1, always-multiline],
  prefer-object-spread/prefer-object-spread: 0,
  nuclide-internal/no-commonjs: 0,
  */

const NodeTranspiler = require('nuclide-node-transpiler/lib/NodeTranspiler');
const transpiler = new NodeTranspiler();

module.exports = {
  process(src, path) {
    return NodeTranspiler.shouldCompile(src)
      ? transpiler.transform(src, path)
      : src;
  },
};
