'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/**
 * This is the set of modules that are "built-in" and never need to be required.
 */
module.exports = new Set([
  'Array',
  'Boolean',
  'Date',
  'Error',
  'JSON',
  'Math',
  'Number',
  'Object',
  'RegExp',
  'String',
  'Symbol',
  'arguments',
  'global',
  'parseFloat',
  'parseInt',
  'undefined',
  'console',

  // Browser built ins.
  'document',
  'location',
  'window',

  // Module built ins.
  'exports',
  'module',
  'require',

  // Common dev flag.
  '__DEV__',

  // Jest/Jasmine build ins.
  'afterEach',
  'beforeEach',
  'describe',
  'expect',
  'it',
  'jest',
  'waitsForPromise',
]);
