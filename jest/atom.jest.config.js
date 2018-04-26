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

const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname, '..'),
  testMatch: ['**/__atom_tests__/**/*.js?(x)'],
  transform: {
    '\\.js$': '<rootDir>/modules/nuclide-jest/jestTransformer.js',
  },
  setupFiles: [],
  testFailureExitCode: 0,
  forceExit: true,
  testPathIgnorePatterns: ['/node_modules/'],
  runner: path.resolve(__dirname, '../modules/jest-atom-runner/build/index.js'),
  moduleNameMapper: {
    oniguruma: path.resolve(__dirname, './__mocks__/emptyObject.js'),
  },
  testEnvironment: '<rootDir>/modules/jest-atom-runner/build/environment.js',
};
