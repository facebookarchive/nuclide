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

// Generates a .proxy file to stdout from a service definition file.

require('../../nuclide-node-transpiler');

var parseServiceDefinition = require('../lib/service-parser').parseServiceDefinition;
var generateProxy = require('../lib/proxy-generator').generateProxy;

if (process.argv.length < 3) {
  console.error('Missing service definition file argument.');
  process.exit(1);
}

if (process.argv.length < 4) {
  console.error('Missing service name argument.');
  process.exit(1);
}

if (process.argv.length > 4) {
  console.error('Too many arguments.');
  process.exit(1);
}

var fs = require('fs');

var file = process.argv[2];
var serviceName = process.argv[3];
var definitions = parseServiceDefinition(file, fs.readFileSync(file, 'utf8'));

var code = generateProxy(serviceName, definitions);
console.log(code);
