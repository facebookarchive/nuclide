'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Point} from 'atom';
import {ClangCursorTypes} from '../../nuclide-clang/lib/rpc-types';
import {
  keyword,
  className,
  method,
  param,
  whitespace,
  string,
  plain,
} from '../../nuclide-tokenized-text';
import {outlineFromClangOutline} from '../lib/OutlineViewHelpers';

describe('outlineFromClangOutline', () => {
  it('works for a function', () => {
    expect(outlineFromClangOutline([
      {
        name: 'testFunction',
        extent: {
          start: {line: 0, column: 1},
          end: {line: 2, column: 3},
        },
        cursor_kind: ClangCursorTypes.FUNCTION_DECL,
        params: ['p1', 'p2'],
        tparams: ['tp1', 'tp2'],
      },
    ])).toEqual([
      {
        tokenizedText: [
          method('testFunction'),
          plain('<'),
          plain('tp1'),
          plain(', '),
          plain('tp2'),
          plain('>'),
          plain('('),
          param('p1'),
          plain(', '),
          param('p2'),
          plain(')'),
        ],
        representativeName: 'testFunction',
        startPosition: new Point(0, 1),
        endPosition: new Point(2, 3),
        children: [],
      },
    ]);
  });

  it('works for a class with children', () => {
    expect(outlineFromClangOutline([
      {
        name: 'TestClass',
        extent: {
          start: {line: 0, column: 1},
          end: {line: 2, column: 3},
        },
        cursor_kind: ClangCursorTypes.CLASS_DECL,
        children: [
          {
            name: 'testMethod',
            extent: {
              start: {line: 1, column: 1},
              end: {line: 1, column: 2},
            },
            cursor_kind: ClangCursorTypes.CXX_METHOD,
            params: [],
          },
        ],
      },
    ])).toEqual([
      {
        tokenizedText: [
          keyword('class'),
          whitespace(' '),
          className('TestClass'),
        ],
        representativeName: 'TestClass',
        startPosition: new Point(0, 1),
        endPosition: new Point(2, 3),
        children: [
          {
            tokenizedText: [
              method('testMethod'),
              plain('('),
              plain(')'),
            ],
            representativeName: 'testMethod',
            startPosition: new Point(1, 1),
            endPosition: new Point(1, 2),
            children: [],
          },
        ],
      },
    ]);
  });

  it('works for a global variable', () => {
    expect(outlineFromClangOutline([
      {
        name: 'testVariable',
        extent: {
          start: {line: 0, column: 1},
          end: {line: 2, column: 3},
        },
        cursor_kind: ClangCursorTypes.VAR_DECL,
        cursor_type: 'std::string',
      },
    ])).toEqual([
      {
        tokenizedText: [
          plain('std::string'),
          whitespace(' '),
          className('testVariable'),
        ],
        representativeName: 'testVariable',
        startPosition: new Point(0, 1),
        endPosition: new Point(2, 3),
        children: [],
      },
    ]);
  });

  it('collapses very long types', () => {
    expect(outlineFromClangOutline([
      {
        name: 'testVariable',
        extent: {
          start: {line: 0, column: 1},
          end: {line: 2, column: 3},
        },
        cursor_kind: ClangCursorTypes.VAR_DECL,
        cursor_type: 'std::vector<std::vector<std::vector<std::vector<int>>>>',
      },
    ])).toEqual([
      {
        tokenizedText: [
          plain('std::vector<'),
          string('...'),
          plain('>'),
          whitespace(' '),
          className('testVariable'),
        ],
        representativeName: 'testVariable',
        startPosition: new Point(0, 1),
        endPosition: new Point(2, 3),
        children: [],
      },
    ]);
  });
});
