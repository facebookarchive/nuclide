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

const transformer = require('../lib/use-minified-libs-tr');

[
  'export-all-minified',
  'export-named-minified',
  'ignore-other',
  'import-minified',
  'import-minified',
  'no-type',
  'only-entry',
  'require-minified',
].forEach(name => {
  console.log('use-minified-libs should handle %s', name);
  const testPath = path.join(__dirname, 'fixtures/use-minified-libs', name + '.test');
  const errorPath = path.join(__dirname, 'fixtures/use-minified-libs', name + '.error');
  const expectedPath = path.join(__dirname, 'fixtures/use-minified-libs', name + '.expected');
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
    blacklist: ['strict'],
  }).code;
  try {
    assert.deepEqual(
      stripMeta(babel.parse(output)),
      stripMeta(babel.parse(expected))
    );
  } catch (err) {
    console.log(output);
    throw err;
  }
}
