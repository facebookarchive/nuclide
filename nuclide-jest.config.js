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

const path = require('path');

module.exports = {
  jestBin: path.resolve(__dirname, 'node_modules/.bin/jest'),
  jestConfig: path.resolve(__dirname, 'jest.config.js'),
  nodeBin: path.resolve(__dirname, '../third-party/node/bin/node'),
  rootDir: __dirname,
  testRegex: '__(atom_)?tests__\\/.*\\.js$',
  env: {},
};
