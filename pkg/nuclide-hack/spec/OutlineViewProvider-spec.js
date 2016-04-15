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
