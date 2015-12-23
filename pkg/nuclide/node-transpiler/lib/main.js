/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This file installs the logic that modifies Node's built in require()
 * function to transpile .js files that start with either `'use babel'` or
 * `"use babel"`.
 */

// Make sure the transpilation is loaded only once.
var jsExtensions = Object.getOwnPropertyDescriptor(require.extensions, '.js');
if (jsExtensions === undefined || jsExtensions.writable) {
  var startTranspile = require('./transpile').startTranspile;
  startTranspile();
}
