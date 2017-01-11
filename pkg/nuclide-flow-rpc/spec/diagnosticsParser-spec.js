/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Diagnostics} from '..';

import {Range} from 'simple-text-buffer';

import {flowStatusOutputToDiagnostics} from '../lib/diagnosticsParser';
import {addMatchers} from '../../nuclide-test-helpers';

const flowOutput = {
  passed: false,
  flowVersion: '0.23.0',
  errors: [
    {
      operation: {
        descr: 'assignment of property `bar`',
        loc: {
          start: {
            offset: 104,
            line: 13,
            column: 5,
          },
          source: '/flow-test/src/test.js',
          end: {
            offset: 112,
            line: 13,
            column: 12,
          },
        },
      },
      message: [
        {
          descr: 'object literal',
          loc: {
            start: {
              offset: 115,
              line: 13,
              column: 16,
            },
            source: '/flow-test/src/test.js',
            end: {
              line: 13,
              offset: 117,
              column: 17,
            },
          },
        },
        {
          descr: 'This type is incompatible with',
          path: '',
        },
        {
          descr: 'union: object type(s)',
          loc: {
            end: {
              line: 10,
              offset: 87,
              column: 10,
            },
            source: '/flow-test/src/test.js',
            start: {
              column: 8,
              line: 10,
              offset: 84,
            },
          },
        },
      ],
      kind: 'infer',
      level: 'error',
    },
  ],
};

const expected: Diagnostics = {
  flowRoot: '/flow-test',
  messages: [
    {
      level: 'error',
      messageComponents: [
        {
          descr: 'object literal',
          rangeInFile: {
            file: '/flow-test/src/test.js',
            range: new Range([13, 16], [13, 17]),
          },
        },
        {
          descr: 'This type is incompatible with',
          rangeInFile: null,
        },
        {
          descr: 'union: object type(s)',
          rangeInFile: {
            file: '/flow-test/src/test.js',
            range: new Range([10, 8], [10, 10]),
          },
        },
        {
          descr: 'See also: assignment of property `bar`',
          rangeInFile: {
            file: '/flow-test/src/test.js',
            range: new Range([13, 5], [13, 12]),
          },
        },
      ],
    },
  ],
};

describe('flowStatusOutputToDiagnostics', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  it('converts the flow status output', () => {
    expect(flowStatusOutputToDiagnostics('/flow-test', flowOutput)).diffJson(expected);
  });
});
