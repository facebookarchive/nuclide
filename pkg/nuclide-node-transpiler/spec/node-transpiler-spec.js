'use strict';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// nuclide-node-transpiler is a dependency of nuclide-jasmine, so it cannot
// use nuclide-jasmine as a test runner.

// THIS IS AN ES5 FILE
/*eslint-disable no-var, prefer-const*/

var assert = require('assert');

require('..');

assert.doesNotThrow(function() {
  var ModernSyntax = require('./fixtures/modern-syntax');
  var Foo = ModernSyntax.Foo;
  assert.equal(typeof Foo, 'function');
  assert.equal(Foo.bar, 'qux');
});
