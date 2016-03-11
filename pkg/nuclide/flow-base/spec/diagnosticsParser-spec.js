'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {flowStatusOutputToDiagnostics} from '../lib/diagnosticsParser';

const oldOutput = {
  version : 'big long string',
  passed : false,
  errors : [
    {
      operation : {
        endline : 13,
        end : 12,
        path : '/flow-test/src/test.js',
        line : 13,
        descr : 'assignment of property `bar`',
        start : 5,
      },
      kind : 'infer',
      message : [
        {
          end : 17,
          path : '/flow-test/src/test.js',
          endline : 13,
          start : 16,
          level : 'error',
          line : 13,
          descr : 'object literal',
        },
        {
          endline : 0,
          end : 0,
          path : '',
          descr : 'This type is incompatible with',
          line : 0,
          level : 'error',
          start : 1,
        },
        {
          line : 10,
          descr : 'union: object type(s)',
          start : 8,
          level : 'error',
          endline : 10,
          path : '/flow-test/src/test.js',
          end : 10,
        },
      ],
    },
  ],
};

const expected = {
  flowRoot: '/flow-test',
  messages: [
    {
      level: 'error',
      messageComponents: [
        {
          descr: 'object literal',
          range: {
            file: '/flow-test/src/test.js',
            start: {
              line: 13,
              column: 16,
            },
            end: {
              line: 13,
              column: 17,
            },
          },
        },
        {
          descr : 'This type is incompatible with',
          range: null,
        },
        {
          descr : 'union: object type(s)',
          range: {
            file: '/flow-test/src/test.js',
            start: {
              line: 10,
              column: 8,
            },
            end: {
              line: 10,
              column: 10,
            },
          },
        },
        {
          descr : 'See also: assignment of property `bar`',
          range: {
            file: '/flow-test/src/test.js',
            start: {
              line: 13,
              column: 5,
            },
            end: {
              line: 13,
              column: 12,
            },
          },
        },
      ],
    },
  ],
};

describe('flowStatusOutputToDiagnostics', () => {
  it('converts the old status output', () => {
    expect(flowStatusOutputToDiagnostics('/flow-test', oldOutput)).toEqual(expected);
  });
});
