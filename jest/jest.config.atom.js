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
const p = nuclidePath => path.resolve(__dirname, '..', nuclidePath);

module.exports = {
  displayName: 'atom',
  rootDir: p('../..'),
  roots: [p('')],
  testMatch: ['**/__atom_tests__/**/*.js?(x)'],
  transform: {
    '\\.js$': p('modules/nuclide-jest/jestTransformer.js'),
  },
  setupTestFrameworkScriptFile: p('jest/setupTestFrameworkScriptFile.atom.js'),
  runner: p('modules/jest-atom-runner/build/index.js'),
  moduleNameMapper: {
    oniguruma: p('jest/__mocks__/emptyObject.js'),
  },
  testEnvironment: p('modules/jest-atom-runner/build/environment.js'),
  testPathIgnorePatterns: ['/node_modules/'],
};
