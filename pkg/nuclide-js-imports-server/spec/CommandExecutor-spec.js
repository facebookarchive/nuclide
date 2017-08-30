/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import invariant from 'assert';

import {getEditsForImport} from '../src/CommandExecutor';
import {parseFile} from '../src/lib/AutoImportsManager';
import {ImportFormatter} from '../src/lib/ImportFormatter';

function getProgramBody(src: string) {
  const ast = parseFile(src);
  invariant(ast != null);
  return ast.program.body;
}

describe('CommandExecutor', () => {
  it('can create new imports', () => {
    const importFormatter = new ImportFormatter([], false);
    expect(
      getEditsForImport(
        importFormatter,
        '/a/test.js',
        {
          id: 'test',
          uri: '/a/test2.js',
          isTypeExport: false,
          isDefault: true,
        },
        getProgramBody('function f() {}'),
      ),
    ).toEqual([
      {
        range: {start: {line: 0, character: 0}, end: {line: 0, character: 0}},
        newText: "import test from './test2';\n\n",
      },
    ]);
  });

  it('can insert into existing imports', () => {
    const importFormatter = new ImportFormatter([], false);
    expect(
      getEditsForImport(
        importFormatter,
        '/a/test.js',
        {
          id: 'b',
          uri: '/a/test2.js',
          isTypeExport: false,
          isDefault: false,
        },
        getProgramBody(
          "import type {a} from './test2';\nimport {a} from './test2';",
        ),
      ),
    ).toEqual([
      {
        range: {start: {line: 1, character: 9}, end: {line: 1, character: 9}},
        newText: ', b',
      },
    ]);

    expect(
      getEditsForImport(
        importFormatter,
        '/a/test.js',
        {
          id: 'c',
          uri: '/a/test2.js',
          isTypeExport: false,
          isDefault: false,
        },
        getProgramBody("const {a, b} = require('./test2');"),
      ),
    ).toEqual([
      {
        range: {start: {line: 0, character: 11}, end: {line: 0, character: 11}},
        newText: ', c',
      },
    ]);

    expect(
      getEditsForImport(
        importFormatter,
        '/a/test.js',
        {
          id: 'newType',
          uri: '/a/test2.js',
          isTypeExport: true,
          isDefault: false,
        },
        getProgramBody(
          [
            'import type {',
            '  type1,',
            '  type2,',
            '  type3,',
            '  type4,',
            '} from "./test2"',
          ].join('\n'),
        ),
      ),
    ).toEqual([
      {
        range: {start: {line: 4, character: 7}, end: {line: 4, character: 7}},
        newText: ',\n  newType',
      },
    ]);
  });
});
