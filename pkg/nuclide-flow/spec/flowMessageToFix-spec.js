'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Diagnostic} from '../../nuclide-flow-rpc';

import {Range} from 'atom';

import flowMessageToFix from '../lib/flowMessageToFix';

describe('flowMessageToFix', () => {
  it('should provide a fix for an unused suppression comment', () => {
    const diagnostic: Diagnostic = {
      level: 'error',
      messageComponents: [
        {
          descr: 'Error suppressing comment',
          range: {
            file: 'foo',
            start: {
              line: 6,
              column: 1,
            },
            end: {
              line: 6,
              column: 13,
            },
          },
        },
        {
          descr: 'Unused suppression',
          range: null,
        },
      ],
    };
    const fix = flowMessageToFix(diagnostic);
    expect(fix).toEqual({
      oldRange: new Range([5, 0], [5, 13]),
      newText: '',
      speculative: true,
    });
  });

  it('should provide a fix for named import typos', () => {
    const diagnostic: Diagnostic = {
      level: 'error',
      messageComponents: [
        {
          descr: 'Named import from module `./foo`',
          range: {
            file: 'foo',
            start: {
              line: 3,
              column: 9,
            },
            end: {
              line: 3,
              column: 16,
            },
          },
        },
        {
          descr: 'This module has no named export called `FooBrBaaaaz`. Did you mean `foobar`?',
          range: null,
        },
      ],
    };
    const fix = flowMessageToFix(diagnostic);
    expect(fix).toEqual({
      oldRange: new Range([2, 8], [2, 16]),
      oldText: 'FooBrBaaaaz',
      newText: 'foobar',
      speculative: true,
    });
  });
});
