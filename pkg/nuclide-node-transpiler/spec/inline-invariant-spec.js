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
const babel = require('babel-core');
const babylon = require('babylon');
const babelTransformSyntaxFlow = require('babel-plugin-syntax-flow');

const transformer = require('../lib/inline-invariant-tr');

assertTransformation(`
  import invariant from '';
  invariant(false)
`, `
  if (!false) {
    throw new Error('Invariant violation: "false"');
  }
`);

assertTransformation(`
  import invariant from '';
  invariant(false != true)
`, `
  if (!(false != true)) {
    throw new Error('Invariant violation: "false != true"');
  }
`);

assertTransformation(`
  import invariant from '';
  invariant(foo() ? !!bar : baz.qux())
`, `
  if (!(foo() ? !!bar : baz.qux())) {
    throw new Error('Invariant violation: "foo() ? !!bar : baz.qux()"');
  }
`);

assertTransformation(`
  import invariant from '';
  invariant(true, 'it is true');
`, `
  if (!true) {
    throw new Error('it is true');
  }
`);

assertTransformation(`
  import {invariant} from '';
  invariant(true, 'it is true');
`, `
  if (!true) {
    throw new Error('it is true');
  }
`);

assertTransformation(`
  import invariant from '';
  invariant(true, 'it is true');
  invariant.ok();
`, `
  import invariant from '';
  if (!true) {
    throw new Error('it is true');
  }
  invariant.ok();
`);

assertTransformation(`
  export {invariant} from ''
`, `
  export {invariant} from '';
`);

assertTransformation(`
  import {default as invariant} from ''
  invariant(true);
`, `
  if (!true) {
    throw new Error('Invariant violation: "true"');
  }
`);

assertTransformation(`
  invariant
`, `
  invariant
`);

assertTransformation(`
  var invariant = require('invariant');
`, `
  var invariant = require('invariant');
`);

assertTransformation(`
  var invariant = require('invariant');
  invariant(true)
`, `
  var invariant = require('invariant');
  invariant(true)
`);

assertTransformation(`
  import invariant from 'invariant';
  foo;
`, `
  foo;
`);

assert.throws(() => {
  assertTransformation(`
    import invariant from 'invariant';
    if (invariant(true)) {}
  `);
}, /SyntaxError: unknown: `invariant\(\)` must be used as an expression statement\./);

assert.throws(() => {
  assertTransformation(`
    import invariant from 'invariant';
    invariant()
  `);
}, /SyntaxError: unknown: `invariant\(\)` must at least one argument\./);

function stripMeta(node) {
  delete node.start;
  delete node.end;
  delete node.leadingComments;
  delete node.trailingComments;
  delete node.loc;
  delete node.tokens;
  delete node.parenStart;
  for (const p in node) {
    if (node[p] && typeof node[p] === 'object') {
      stripMeta(node[p]);
    }
  }
  return node;
}

function parse(source) {
  return babylon.parse(source, {
    sourceType: 'module',
    plugins: ['*', 'jsx', 'flow'],
  });
}

function assertTransformation(source, expected, plugins) {
  const output = babel.transform(source, {
    plugins: (plugins || []).concat([
      babelTransformSyntaxFlow,
      transformer,
    ]),
  }).code;
  try {
    assert.deepEqual(
      stripMeta(parse(output, {sourceType: 'module'})),
      stripMeta(parse(expected, {sourceType: 'module'}))
    );
  } catch (err) {
    console.log(output);
    throw err;
  }
}
