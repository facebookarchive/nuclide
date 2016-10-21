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

const transformer = require('../lib/use-minified-libs-tr');

// export-all-minified
assertTransformation(`
  export * from 'rxjs';
`, `
  export * from 'rxjs/bundles/Rx.min.js';
`);

// export-named-minified
assertTransformation(`
  export {Observable} from 'rxjs';
`, `
  export { Observable } from 'rxjs/bundles/Rx.min.js';
`);

// ignore-other
assertTransformation(`
  import path from 'path';
`, `
  import path from 'path';
`);

// import-minified
assertTransformation(`
  import Rx from 'rxjs';
  import {Observable} from 'rxjs';
  assert(Rx.Observable === Observable);
`, `
  import Rx from 'rxjs/bundles/Rx.min.js';
  import { Observable } from 'rxjs/bundles/Rx.min.js';
  assert(Rx.Observable === Observable);
`);

// no-type
assertTransformation(`
  import type {using} from 'rxjs/observable/using';
`, `
  import type { using } from 'rxjs/observable/using';
`);

// require-minified
assertTransformation(`
  const Rx = require('rxjs');
  const {Observable} = require('rxjs');
  assert(Rx.Observable === Observable);
`, `
  const Rx = require('rxjs/bundles/Rx.min.js');
  const { Observable } = require('rxjs/bundles/Rx.min.js');
  assert(Rx.Observable === Observable);
`);

// with-inline-imports
assertTransformation(`
  import Rx from 'rxjs';
  assert(Rx.Observable === Observable);
`, `
  'use strict';

  var _RxMin;

  function _load_RxMin() {
    return _RxMin = _interopRequireDefault(require('rxjs/bundles/Rx.min.js'));
  }

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

  assert((_RxMin || _load_RxMin()).default.Observable === Observable);
`, [
  require('babel-plugin-transform-inline-imports-commonjs'),
]);

// only-entry-module
assert.throws(() => {
  assertTransformation(`
    import {using} from 'rxjs/observable/using';
  `, `
    import {using} from 'rxjs/observable/using';
  `);
}, /SyntaxError: unknown: Only importing "rxjs" is supported/);

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
