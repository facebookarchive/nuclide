#!/usr/bin/env node --harmony
'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// THIS IS AN ES5 FILE
/*eslint-disable no-var, prefer-const*/
/*eslint-disable no-console*/

// This script expects to be passed a directory from which `apm test --one` should be run.
// It runs `apm test` under a timeout to ensure that the test terminates.

var TIMEOUT_IN_MILLIS = 5 * 60 * 1000;
var apmArgs = [
  'test',

  // Add --one option to `apm test` to ensure no deprecated APIs are used:
  // http://blog.atom.io/2015/05/01/removing-deprecated-apis.html.
  '--one',
];

// Contents of process.argv:
// 0 is "node"
// 1 is the path to this script.
// 2 is the directory in which to run `apm test --one`.
var cwdArg = process.argv[2];

var testInfo = 'cd ' + cwdArg + ' && apm ' + apmArgs.join(' ');

var timeoutId = setTimeout(function() {
  console.error('Test runner timed out for: ' + testInfo);
  process.abort();
}, TIMEOUT_IN_MILLIS);

var child = require('child_process').spawn('apm', apmArgs, {cwd: cwdArg});

child.stdout.on('data', function(/* Buffer */ data) {
  process.stdout.write(data.toString());
});

child.stderr.on('data', function(/* Buffer */ data) {
  process.stderr.write(data.toString());
});

child.on('close', function(code) {
  clearTimeout(timeoutId);
  console.log('TEST PASSED when running: ' + testInfo);
  process.exit(code);
});

child.on('error', function(err) {
  console.error('TEST FAILED when running: ' + testInfo);
  console.error(err.toString());
  process.abort();
});
