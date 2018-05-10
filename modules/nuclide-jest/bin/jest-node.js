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
  nuclide-internal/no-commonjs: 0,
  */
/* eslint-disable no-console */

const jestCLI = require('jest-cli');
const config = require('../jest.config.js');
const yargs = require('yargs');
const {options} = require('jest-cli/build/cli/args');

// We reach into the internals of Jest to get the options it uses for arg
// parsing with yargs to ensure we parse the args consistently with Jest.
const {argv} = yargs(process.argv.slice(2)).options(options);
// Then we override some of the options with hardcoded values.
argv.watchman = true;
argv.config = JSON.stringify(config);

jestCLI
  .runCLI(argv, [process.cwd()])
  .then(response => process.exit(response.results.success ? 0 : 1));
