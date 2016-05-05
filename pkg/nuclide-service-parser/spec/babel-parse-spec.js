'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import * as babel from 'babel-core';
import babelParse from '../lib/babel-parse';

describe('babelParse', () => {
  it('Creates equivalent ASTs', () => {
    const source = `\
      // sourceType module
      export class Foo<T: TFoo> { // plugins.flow
        static bar: number = 42; // es7.classProperties
        @timing() // es7.decorators
        async baz( // es7.asyncFunctions
          opts: OptsType = {}, // es7.trailingFunctionCommas
        ) {
          return {
            qux: <Component />, // plugins.jsx
            ...opts, // es7.objectRestSpread
          };
        }
      }
      export * from './foo'; // export extensions
    `;

    expect(
      babelParse(source)
    ).toEqual(
      babel.parse(source)
    );
  });
});
