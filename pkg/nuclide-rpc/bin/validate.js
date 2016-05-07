#!/usr/bin/env node
'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable no-var, prefer-const, no-console*/

// Load nuclide-node-transpiler to start transpiling.
require('../../nuclide-node-transpiler');

var path = require('path');

// Load the service parser module.
var serviceParser = require('..');

// There must be exactly one argument.
if (process.argv.length !== 3) {
  console.error('No file specified. Usage: <file>');
  process.exit(1);
}

try {
  // Try to generate a proxy from the file.
  var file = process.argv[2];
  var fakeClient = {};
  serviceParser.getProxy('dummyServiceName', path.resolve(file), fakeClient);
} catch (e) {
  // Proxy generation failed.
  console.error('Failed to validate ' + file);
  console.error(e.stack);
  process.exit(1);
}
