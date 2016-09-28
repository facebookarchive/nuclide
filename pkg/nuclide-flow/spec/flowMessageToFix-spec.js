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
});
