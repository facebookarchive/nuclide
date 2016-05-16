'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Outline, OutlineTree} from '../../nuclide-outline-view';

import {Point} from 'atom';

import {outlineFromHackOutline} from '../lib/OutlineViewProvider';
import {outlineFromHackIdeOutline} from '../lib/OutlineViewProvider';

describe('outlineFromHackOutline', () => {
  it('should return a valid outline', () => {
    const actualOutline = outlineFromHackOutline(sampleHackOutline);
    expectOutlinesToBeEqual(actualOutline, expectedOutline);
  });
});

const sampleHackOutline = [
  {
    name: 'Foo::bar',
    type: 'method',
    line: 388,
    char_start: 19,
    char_end: 25,
  },
  {
    name: 'Foo::baz',
    type: 'method',
    line: 383,
    char_start: 19,
    char_end: 27,
  },
  {
    name: 'Foo',
    type: 'class',
    line: 382,
    char_start: 13,
    char_end: 30,
  },
  {
    name: 'Bar::baz',
    type: 'static method',
    line: 301,
    char_start: 26,
    char_end: 34,
  },
  {
    name: 'Bar::foo',
    type: 'method',
    line: 279,
    char_start: 28,
    char_end: 45,
  },
  {
    name: 'Bar',
    type: 'class',
    line: 276,
    char_start: 13,
    char_end: 34,
  },
  {
    name: 'foo',
    type: 'function',
    line: 179,
    char_start: 10,
    char_end: 12,
  },
];

const expectedOutline = {
  outlineTrees: [
    {
      tokenizedText: [
        {kind: 'keyword', value: 'function'},
        {kind: 'whitespace', value: ' '},
        {kind: 'method', value: 'foo'},
      ],
      startPosition: new Point(178, 9),
      children: [],
    },
    {
      tokenizedText: [
        {kind: 'keyword', value: 'class'},
        {kind: 'whitespace', value: ' '},
        {kind: 'class-name', value: 'Bar'},
      ],
      startPosition: new Point(275, 12),
      children: [
        {
          tokenizedText: [
            {kind: 'keyword', value: 'function'},
            {kind: 'whitespace', value: ' '},
            {kind: 'method', value: 'foo'},
          ],
          startPosition: new Point(278, 27),
          children: [],
        },
        {
          tokenizedText: [
            {kind: 'keyword', value: 'static'},
            {kind: 'whitespace', value: ' '},
            {kind: 'keyword', value: 'function'},
            {kind: 'whitespace', value: ' '},
            {kind: 'method', value: 'baz'},
          ],
          startPosition: new Point(300, 25),
          children: [],
        },
      ],
    },
    {
      tokenizedText: [
        {kind: 'keyword', value: 'class'},
        {kind: 'whitespace', value: ' '},
        {kind: 'class-name', value: 'Foo'},
      ],
      startPosition: new Point(381, 12),
      children: [
        {
          tokenizedText: [
            {kind: 'keyword', value: 'function'},
            {kind: 'whitespace', value: ' '},
            {kind: 'method', value: 'baz'},
          ],
          startPosition: new Point(382, 18),
          children: [],
        },
        {
          tokenizedText: [
            {kind: 'keyword', value: 'function'},
            {kind: 'whitespace', value: ' '},
            {kind: 'method', value: 'bar'},
          ],
          startPosition: new Point(387, 18),
          children: [],
        },
      ],
    },
  ],
};

function expectOutlinesToBeEqual(actual: Outline, expected: Outline): void {
  expectOutlineTreeArraysToBeEqual(actual.outlineTrees, expected.outlineTrees);
}

function expectOutlineTreesToBeEqual(actual: OutlineTree, expected: OutlineTree): void {
  expect(actual.tokenizedText).toEqual(expected.tokenizedText);
  expect(actual.startPosition.isEqual(expected.startPosition)).toBeTruthy();
  expectOutlineTreeArraysToBeEqual(actual.children, expected.children);
}

function expectOutlineTreeArraysToBeEqual(
  actual: Array<OutlineTree>,
  expected: Array<OutlineTree>
): void {
  expect(actual.length).toEqual(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expectOutlineTreesToBeEqual(actual[i], expected[i]);
  }
}

describe('outlineFromHackIdeOutline', () => {
  it('function', () => {
    const actualOutline = outlineFromHackIdeOutline(
      [
        {
          'name': 'f',
          'modifiers': [],
          'span': {
            'line_start': 3,
            'line_end': 4,
            'char_start': 1,
            'char_end': 1,
            'filename': '',
          },
          'kind': 'function',
          'params': [
            {
              'kind': 'param',
              'position': {
                'filename': '',
                'char_end': 17,
                'char_start': 16,
                'line': 3,
              },
              'modifiers': [],
              'span': {
                'line_start': 3,
                'line_end': 3,
                'char_start': 12,
                'char_end': 17,
                'filename': '',
              },
              'name': '$x',
            },
            {
              'kind': 'param',
              'position': {
                'filename': '',
                'char_end': 21,
                'char_start': 20,
                'line': 3,
              },
              'modifiers': [],
              'span': {
                'line_start': 3,
                'line_end': 3,
                'char_start': 20,
                'char_end': 21,
                'filename': '',
              },
              'name': '$y',
            },
          ],
          'position': {
            'filename': '',
            'char_end': 10,
            'line': 3,
            'char_start': 10,
          },
        },
      ]
    );
    expect(actualOutline).toEqual(
      {
        outlineTrees: [
          {
            tokenizedText: [
              {
                kind: 'keyword',
                value: 'function',
              },
              {
                kind: 'whitespace',
                value: ' ',
              },
              {
                kind: 'method',
                value: 'f',
              },
              {
                kind: 'plain',
                value: '(',
              },
              {
                kind: 'plain',
                value: '$x',
              },
              {
                kind: 'plain',
                value: ',',
              },
              {
                kind: 'whitespace',
                value: ' ',
              },
              {
                kind: 'plain',
                value: '$y',
              },
              {
                kind: 'plain',
                value: ')',
              },
            ],
            startPosition: {
              row: 2,
              column: 9,
            },
            endPosition: {
              row: 3,
              column: 0,
            },
            children: [],
          },
        ],
      });
  });

  it('class', () => {
    const actualOutline = outlineFromHackIdeOutline(
      [
        {
          'name': 'D',
          'children': [
            {
              'position': {
                'filename': '',
                'char_end': 14,
                'char_start': 14,
                'line': 11,
              },
              'kind': 'typeconst',
              'name': 'Y',
              'modifiers': [],
              'span': {
                'char_end': 20,
                'filename': '',
                'line_end': 11,
                'char_start': 3,
                'line_start': 11,
              },
            },
            {
              'kind': 'property',
              'position': {
                'char_start': 39,
                'line': 12,
                'char_end': 40,
                'filename': '',
              },
              'modifiers': [
                'private',
              ],
              'span': {
                'line_end': 12,
                'char_start': 39,
                'char_end': 40,
                'filename': '',
                'line_start': 12,
              },
              'name': 'x',
            },
            {
              'name': '__construct',
              'modifiers': [
                'public',
              ],
              'span': {
                'char_end': 3,
                'filename': '',
                'line_end': 14,
                'char_start': 3,
                'line_start': 12,
              },
              'position': {
                'char_start': 19,
                'line': 12,
                'filename': '',
                'char_end': 29,
              },
              'kind': 'method',
              'params': [
                {
                  'position': {
                    'filename': '',
                    'char_end': 40,
                    'char_start': 39,
                    'line': 12,
                  },
                  'kind': 'param',
                  'name': '$x',
                  'modifiers': [
                    'private',
                  ],
                  'span': {
                    'line_start': 12,
                    'char_start': 39,
                    'line_end': 12,
                    'filename': '',
                    'char_end': 40,
                  },
                },
              ],
            },
            {
              'modifiers': [
                'abstract',
              ],
              'span': {
                'line_start': 15,
                'char_end': 18,
                'filename': '',
                'line_end': 15,
                'char_start': 18,
              },
              'name': 'Z',
              'kind': 'const',
              'position': {
                'filename': '',
                'char_end': 18,
                'line': 15,
                'char_start': 18,
              },
            },
            {
              'kind': 'const',
              'position': {
                'char_end': 9,
                'filename': '',
                'char_start': 9,
                'line': 16,
              },
              'name': 'X',
              'modifiers': [],
              'span': {
                'char_start': 9,
                'line_end': 16,
                'filename': '',
                'char_end': 14,
                'line_start': 16,
              },
            },
          ],
          'span': {
            'filename': '',
            'char_end': 1,
            'char_start': 1,
            'line_end': 17,
            'line_start': 10,
          },
          'modifiers': [
            'abstract',
          ],
          'kind': 'class',
          'position': {
            'char_start': 16,
            'line': 10,
            'filename': '',
            'char_end': 16,
          },
        },
      ]
    );
    expect(actualOutline).toEqual(
      {
        outlineTrees: [
          {
            tokenizedText: [
              {kind: 'keyword', value: 'abstract'},
              {kind: 'whitespace', value: ' '},
              {kind: 'keyword', value: 'class'},
              {kind: 'whitespace', value: ' '},
              {kind: 'class-name', value: 'D'},
            ],
            startPosition: {row: 9, column: 15},
            endPosition: {row: 16, column: 0},
            children: [
              {
                tokenizedText: [
                  {kind: 'keyword', value: 'const'},
                  {kind: 'whitespace', value: ' '},
                  {kind: 'keyword', value: 'type'},
                  {kind: 'whitespace', value: ' '},
                  {kind: 'class-name', value: 'Y'},
                ],
                startPosition: {row: 10, column: 13},
                endPosition: {row: 10, column: 19},
                children: [],
              },
              {
                tokenizedText: [
                  {kind: 'keyword', value: 'private'},
                  {kind: 'whitespace', value: ' '},
                  {kind: 'keyword', value: 'property'},
                  {kind: 'whitespace', value: ' '},
                  {kind: 'method', value: 'x'},
                ],
                startPosition: {row: 11, column: 38},
                endPosition: {row: 11, column: 39},
                children: [],
              },
              {
                tokenizedText: [
                  {kind: 'keyword', value: 'public'},
                  {kind: 'whitespace', value: ' '},
                  {kind: 'keyword', value: 'function'},
                  {kind: 'whitespace', value: ' '},
                  {kind: 'method', value: '__construct'},
                  {kind: 'plain', value: '('},
                  {kind: 'keyword', value: 'private'},
                  {kind: 'whitespace', value: ' '},
                  {kind: 'plain', value: '$x'},
                  {kind: 'plain', value: ')'},
                ],
                startPosition: {row: 11, column: 18},
                endPosition: {row: 13, column: 2},
                children: [],
              },
              {
                tokenizedText: [
                  {kind: 'keyword', value: 'abstract'},
                  {kind: 'whitespace', value: ' '},
                  {kind: 'keyword', value: 'const'},
                  {kind: 'whitespace', value: ' '},
                  {kind: 'method', value: 'Z'},
                ],
                startPosition: {row: 14, column: 17},
                endPosition: {row: 14, column: 17},
                children: [],
              },
              {
                tokenizedText: [
                  {kind: 'keyword', value: 'const'},
                  {kind: 'whitespace', value: ' '},
                  {kind: 'method', value: 'X'},
                ],
                startPosition: {row: 15, column: 8},
                endPosition: {row: 15, column: 13},
                children: [],
              },
            ],
          },
        ],
      },
    );
  });

  it('trait', () => {
    const actualOutline = outlineFromHackIdeOutline(
      [
        {
          'position': {
            'filename': '',
            'char_end': 7,
            'char_start': 7,
            'line': 19,
          },
          'kind': 'trait',
          'children': [
            {
              'name': 'f',
              'span': {
                'char_start': 3,
                'line_end': 22,
                'filename': '',
                'char_end': 3,
                'line_start': 20,
              },
              'modifiers': [
                'public',
              ],
              'position': {
                'char_start': 19,
                'line': 20,
                'filename': '',
                'char_end': 19,
              },
              'kind': 'method',
              'params': [],
            },
          ],
          'name': 'T',
          'modifiers': [],
          'span': {
            'char_start': 1,
            'line_end': 23,
            'filename': '',
            'char_end': 1,
            'line_start': 19,
          },
        },
      ]
    );
    expect(actualOutline).toEqual(
      {
        outlineTrees: [
          {
            tokenizedText: [
              {
                kind: 'keyword',
                value: 'trait',
              },
              {
                kind: 'whitespace',
                value: ' ',
              },
              {
                kind: 'method',
                value: 'T',
              },
            ],
            startPosition: {
              row: 18,
              column: 6,
            },
            endPosition: {
              row: 22,
              column: 0,
            },
            children: [
              {
                tokenizedText: [
                  {
                    kind: 'keyword',
                    value: 'public',
                  },
                  {
                    kind: 'whitespace',
                    value: ' ',
                  },
                  {
                    kind: 'keyword',
                    value: 'function',
                  },
                  {
                    kind: 'whitespace',
                    value: ' ',
                  },
                  {
                    kind: 'method',
                    value: 'f',
                  },
                  {
                    kind: 'plain',
                    value: '(',
                  },
                  {
                    kind: 'plain',
                    value: ')',
                  },
                ],
                startPosition: {
                  row: 19,
                  column: 18,
                },
                endPosition: {
                  row: 21,
                  column: 2,
                },
                children: [],
              },
            ],
          },
        ],
      }
    );
  });

  it('interface', () => {
    const actualOutline = outlineFromHackIdeOutline(
      [
        {
          'kind': 'interface',
          'position': {
            'line': 25,
            'char_start': 11,
            'filename': '',
            'char_end': 11,
          },
          'span': {
            'filename': '',
            'char_end': 14,
            'char_start': 1,
            'line_end': 25,
            'line_start': 25,
          },
          'modifiers': [],
          'name': 'I',
          'children': [],
        },
      ]
    );
    expect(actualOutline).toEqual(
      {
        outlineTrees: [
          {
            tokenizedText: [
              {
                kind: 'keyword',
                value: 'interface',
              },
              {
                kind: 'whitespace',
                value: ' ',
              },
              {
                kind: 'method',
                value: 'I',
              },
            ],
            startPosition: {
              row: 24,
              column: 10,
            },
            endPosition: {
              row: 24,
              column: 13,
            },
            children: [],
          },
        ],
      }
    );
  });

  it('enum', () => {
    const actualOutline = outlineFromHackIdeOutline(
      [
        {
          'name': 'En',
          'children': [
            {
              'kind': 'const',
              'position': {
                'line': 28,
                'char_start': 3,
                'filename': '',
                'char_end': 3,
              },
              'span': {
                'filename': '',
                'char_end': 7,
                'char_start': 3,
                'line_end': 28,
                'line_start': 28,
              },
              'modifiers': [],
              'name': 'C',
            },
          ],
          'span': {
            'line_start': 27,
            'line_end': 29,
            'char_start': 1,
            'char_end': 1,
            'filename': '',
          },
          'modifiers': [],
          'position': {
            'char_end': 7,
            'filename': '',
            'char_start': 6,
            'line': 27,
          },
          'kind': 'enum',
        },
      ]
    );
    expect(actualOutline).toEqual(
      {
        outlineTrees: [
          {
            tokenizedText: [
              {
                kind: 'keyword',
                value: 'enum',
              },
              {
                kind: 'whitespace',
                value: ' ',
              },
              {
                kind: 'class-name',
                value: 'En',
              },
            ],
            startPosition:
            {
              row: 26,
              column: 5,
            },
            endPosition: {
              row: 28,
              column: 0,
            },
            children: [
              {
                tokenizedText: [
                  {
                    kind: 'keyword',
                    value: 'const',
                  },
                  {
                    kind: 'whitespace',
                    value: ' ',
                  },
                  {
                    kind: 'method',
                    value: 'C',
                  },
                ],
                startPosition: {
                  row: 27,
                  column: 2,
                },
                endPosition: {
                  row: 27,
                  column: 6,
                },
                children: [],
              },
            ],
          },
        ],
      });
  });
});
