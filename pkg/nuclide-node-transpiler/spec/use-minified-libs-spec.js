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
/* eslint-disable babel/func-params-comma-dangle, prefer-object-spread/prefer-object-spread */

/* eslint-disable no-console */

console.log(__filename);

const assert = require('assert');
const babel = require('babel-core');

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
`);

// require-minified
assertTransformation(`
  const Rx = require('rxjs');
  const {Observable} = require('rxjs');
  assert(Rx.Observable === Observable);
`, `
  var Rx = require('rxjs/bundles/Rx.min.js');
  var _require = require('rxjs/bundles/Rx.min.js');
  var Observable = _require.Observable;
  assert(Rx.Observable === Observable);
`);

// with-inline-imports
assertTransformation(`
  import Rx from 'rxjs';
  assert(Rx.Observable === Observable);
`, `
  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _rxjs;

  function _load_rxjs() {
    return _rxjs = _interopRequireDefault(require('rxjs/bundles/Rx.min.js'));
  }

  assert((_rxjs || _load_rxjs())['default'].Observable === Observable);
`, [
  require.resolve('../lib/inline-imports-tr'),
]);

// only-entry-module
assert.throws(() => {
  assertTransformation(`
    import {using} from 'rxjs/observable/using';
  `, `
    import {using} from 'rxjs/observable/using';
  `);
}, /SyntaxError: unknown: Line 2: Only importing "rxjs" is supported/);


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

function assertTransformation(source, expected, plugins) {
  const output = babel.transform(source, {
    plugins: (plugins || []).concat([
      transformer,
    ]),
    blacklist: ['strict', 'es6.modules'],
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
