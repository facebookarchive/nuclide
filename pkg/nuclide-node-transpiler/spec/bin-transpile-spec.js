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
const child_process = require('child_process');
const vm = require('vm');

const ps = child_process.spawn(
  require.resolve('../bin/transpile.js'),
  [require.resolve('./fixtures/modern-syntax')]
);

let out = '';
let err = '';
ps.stdout.on('data', buf => { out += buf; });
ps.stderr.on('data', buf => { err += buf; });

let ran = false;
ps.on('close', () => {
  assert.equal(err, '');

  const c = {exports: {}};
  vm.runInNewContext(out, c);
  assert.equal(c.exports.Foo.bar, 'qux');

  ran = true;
});

process.once('exit', () => {
  assert.ok(ran);
});
