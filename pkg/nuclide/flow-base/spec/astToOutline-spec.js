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
];

describe('astToOutline', () => {
  it('should provide an outline', () => {
    expect(astToOutline(ast)).toEqual(expectedOutline);
  });
});
