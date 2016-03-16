'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {astToOutline} from '../lib/astToOutline';

import ast from './fixtures/ast.json';

const expectedOutline = [
  {
    displayText: 'export class Foo',
    startLine: 15,
    startColumn: 0,
    children: [
      {
        displayText: 'bar(arg)',
        startLine: 16,
        startColumn: 2,
        children: [],
      },
    ],
  },
  {
    displayText: 'function baz(arg, a)',
    startLine: 21,
    startColumn: 0,
    children: [],
  },
  {
    displayText: 'describe foo',
    startLine: 25,
    startColumn: 0,
    children: [
      {
        displayText: 'it should work',
        startLine: 27,
        startColumn: 2,
        children: [],
      },
    ],
  },
  {
    displayText: 'describe bar',
    startLine: 32,
    startColumn: 0,
    children: [
      {
        displayText: 'it should work with a normal function',
        startLine: 33,
        startColumn: 2,
        children: [],
      },
    ],
  },
];

describe('astToOutline', () => {
  it('should provide an outline', () => {
    expect(astToOutline(ast)).toEqual(expectedOutline);
  });
});
