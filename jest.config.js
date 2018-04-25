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
  rulesdir/no-commonjs: 0,
  */
'use strict';

/* eslint
  comma-dangle: [1, always-multiline],
  prefer-object-spread/prefer-object-spread: 0,
  rulesdir/no-commonjs: 0,
  */

module.exports = {
  rootDir: __dirname,
  testMatch: ['**/__tests__/**/*.js?(x)'],
  transform: {
    '\\.js$': '<rootDir>/modules/nuclide-jest/jestTransformer.js',
  },
  setupFiles: ['<rootDir>/jest-setup.js'],
  testFailureExitCode: 0,
  forceExit: true,
  testPathIgnorePatterns: ['/node_modules/'],
};
