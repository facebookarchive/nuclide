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

require('../loadTranspiler');

if (process.argv.length !== 4) {
  console.error('Usage: production-server-zip.js <version> <path to zipfile>');
  process.exit(1);
}

const prodZip = require('../src/server-deployment/production');
prodZip.createServerPackage(process.argv[2], process.argv[3]).then(
  () => {
    console.log('Successfully created production server zip!');
  },
  error => {
    console.error(error);
    process.exit(1);
  }
);
