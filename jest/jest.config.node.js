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
  displayName: 'node',
  rootDir: path.resolve(__dirname, '../../../'),
  roots: ['<rootDir>/xplat/nuclide'],
  testMatch: ['**/__tests__/**/*.js?(x)'],
  transform: {
    '\\.js$': '<rootDir>/xplat/nuclide/modules/nuclide-jest/jestTransformer.js',
  },
  setupTestFrameworkScriptFile: '<rootDir>/xplat/nuclide/jest/setupTestFrameworkScriptFile.node.js',
  setupFiles: ['<rootDir>/xplat/nuclide/jest/setup.js'],
  testPathIgnorePatterns: ['/node_modules/'],
};
