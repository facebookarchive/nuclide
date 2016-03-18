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

import ast from './fixtures/ast';

const expectedOutline = [
  {
    tokenizedText: [
      {value: 'export', kind: 'keyword'},
      {value: ' ', kind: 'whitespace'},
      {value: 'class', kind: 'keyword'},
      {value: ' ', kind: 'whitespace'},
      {value: 'Foo', kind: 'class-name'},
    ],
    startPosition: {
      line: 15,
      column: 0,
    },
    endPosition: {
      line: 19,
      column: 1,
    },
    children: [
      {
        tokenizedText: [
          {value: 'bar', kind: 'method'},
          {value: '(', kind: 'plain'},
          {value: 'arg', kind: 'param'},
          {value: ')', kind: 'plain'},
        ],
        startPosition: {
          line: 16,
          column: 2,
        },
        endPosition: {
          line: 18,
          column: 3,
        },
        children: [],
      },
    ],
  },
  {
    tokenizedText: [
      {value: 'function', kind: 'keyword'},
      {value: ' ', kind: 'whitespace'},
      {value: 'baz', kind: 'method'},
      {value: '(', kind: 'plain'},
      {value: 'arg', kind: 'param'},
      {value: ',', kind: 'plain'},
      {value: ' ', kind: 'whitespace'},
      {value: 'a', kind: 'param'},
      {value: ')', kind: 'plain'},
    ],
    startPosition: {
      line: 21,
      column: 0,
    },
    endPosition: {
      line: 23,
      column: 1,
    },
    children: [],
  },
  {
    tokenizedText: [
      {value: 'describe', kind: 'method'},
      {value: ' ', kind: 'whitespace'},
      {value: 'foo', kind: 'string'},
    ],
    startPosition: {
      line: 25,
      column: 0,
    },
    endPosition: {
      line: 30,
      column: 3,
    },
    children: [
      {
        tokenizedText: [
          {value: 'it', kind: 'method'},
          {value: ' ', kind: 'whitespace'},
          {value: 'should work', kind: 'string'},
        ],
        startPosition: {
          line: 27,
          column: 2,
        },
        endPosition: {
          line: 29,
          column: 5,
        },
        children: [],
      },
    ],
  },
  {
    tokenizedText: [
      {value: 'describe', kind: 'method'},
      {value: ' ', kind: 'whitespace'},
      {value: 'bar', kind: 'string'},
    ],
    startPosition: {
      line: 32,
      column: 0,
    },
    endPosition: {
      line: 35,
      column: 3,
    },
    children: [
      {
        tokenizedText: [
          {value: 'it', kind: 'method'},
          {value: ' ', kind: 'whitespace'},
          {value: 'should work with a normal function', kind: 'string'},
        ],
        startPosition: {
          line: 33,
          column: 2,
        },
        endPosition: {
          line: 34,
          column: 5,
        },
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
