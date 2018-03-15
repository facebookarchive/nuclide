#!/usr/bin/env node
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
  rulesdir/no-commonjs: 0,
  */
/* eslint-disable no-console */

// eslint-disable-next-line rulesdir/no-unresolved
const jestCLI = require('jest-cli');
const config = require('../jest.config.js');

jestCLI.runCLI(
  {
    config: JSON.stringify(config),
    watch: process.argv.includes('--watch'),
    watchAll: process.argv.includes('--watchAll'),
    watchman: true,
  },
  [process.cwd()]
).then(response => process.exit(response.results.success ? 0 : 1));
