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

/*eslint-disable no-console*/

console.log(__filename);

const assert = require('assert');
const babel = require('babel-core');
const fs = require('fs');
const path = require('path');

const transformer = require('../lib/inline-imports-tr');

[
  'decorators',
  'default-and-namespace-specifier',
  'default-specifier',
  'global-identifier',
  'multiple-specifiers',
  'namespace-specifier',
  'no-assign',
  'no-shadow',
  'no-specifiers',
  'no-type',
  'react-jsx',
  'renamed-default-specifier',
  'renamed-specifier',
  'short-method-shadow',
  'single-specifier',
  'zzz',
].forEach(name => {
  console.log('inline-imports should handle %s', name);
  const testPath = path.join(__dirname, 'fixtures/inline-imports', name + '.test');
  const errorPath = path.join(__dirname, 'fixtures/inline-imports', name + '.error');
  const expectedPath = path.join(__dirname, 'fixtures/inline-imports', name + '.expected');
  const source = fs.readFileSync(testPath, 'utf8');
  if (fs.existsSync(errorPath)) {
    const error = fs.readFileSync(errorPath, 'utf8').trim();
    assert.throws(() => { assertTransformation(source, ''); }, RegExp(error));
  } else {
    const expected = fs.readFileSync(expectedPath, 'utf8');
    assertTransformation(source, expected);
  }
});

function stripMeta(node) {
  delete node.start;
  delete node.end;
  delete node.leadingComments;
  delete node.trailingComments;
  delete node.raw;
  for (const p in node) {
    if (node[p] && typeof node[p] === 'object') {
      stripMeta(node[p]);
    }
  }
  return node;
}

function assertTransformation(source, expected) {
  const output = babel.transform(source, {
    plugins: [transformer],
    blacklist: [
      'es3.memberExpressionLiterals',
      'strict',
    ],
    optional: [
      'es7.decorators',
    ],
  }).code;
  assert.deepEqual(
    stripMeta(babel.parse(output)),
    stripMeta(babel.parse(expected))
  );
}
