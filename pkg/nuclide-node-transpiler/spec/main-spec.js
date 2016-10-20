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

/* NON-TRANSPILED FILE */
/* eslint comma-dangle: [1, always-multiline], prefer-object-spread/prefer-object-spread: 0 */

/* eslint-disable no-console */

console.log(__filename);

const assert = require('assert');

require('..');

//---

assert.doesNotThrow(() => {
  require('./fixtures/modern-syntax');
});

const ModernSyntax = require('./fixtures/modern-syntax');
assert.equal(typeof ModernSyntax.Foo, 'function');
assert.equal(ModernSyntax.Foo.bar, 'qux');

//---

const VanillaSyntax = require('./fixtures/vanilla-syntax');
assert.equal(typeof VanillaSyntax.Foo, 'function');
assert.equal(typeof VanillaSyntax.Foo.bar, 'function');
assert.equal(VanillaSyntax.Foo.bar(), 'qux');

// This may not always be true forever. If the v8 output changes, then remove
// this test.
assert.equal(
  VanillaSyntax.Foo.toString(),
  `class Foo {\n  static bar() {\n    return 'qux';\n  }\n}`
);
// The transpiled version of "Foo" would've looked like this:
assert.notEqual(
  VanillaSyntax.Foo.toString(),
  `function Foo() {\n    _classCallCheck(this, Foo);\n  }`
);
