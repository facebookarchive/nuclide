/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {FileDiagnosticMessage} from '../../nuclide-language-service/lib/LanguageService';

import {Range} from 'simple-text-buffer';

import {
  flowStatusOutputToDiagnostics,
  diagnosticToFix,
} from '../lib/diagnosticsParser';
import {addMatchers} from '../../nuclide-test-helpers';

import flowChildrenOutput from './fixtures/flow-children-output.json';
import flowChildrenDiagnostic from './fixtures/flow-children-diagnostic.json';

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
    {
      kind: 'infer',
      level: 'warning',
      message: [
        {
          descr: 'message',
          loc: {
            source: 'myPath',
            start: {
              line: 1,
              column: 3,
            },
            end: {
              line: 2,
              column: 4,
            },
          },
        },
      ],
    },
    {
      kind: 'infer',
      level: 'error',
      message: [
        {
          context: '        next.onLoad(results, count);',
          descr: 'object type',
          type: 'Blame',
          loc: {
            source: '/flow-test/src/test.js',
            type: 'SourceFile',
            start: {line: 83, column: 9, offset: 1992},
            end: {line: 83, column: 12, offset: 1996},
          },
          path: '/flow-test/src/test.js',
          line: 83,
          endline: 83,
          start: 9,
          end: 12,
        },
        {
          context: null,
          descr: 'This type is incompatible with an argument type of',
          type: 'Comment',
          path: '',
          line: 0,
          endline: 0,
          start: 1,
          end: 0,
        },
        {
          context: null,
          descr: 'global object',
          type: 'Blame',
          loc: {
            source: '(builtins)',
            type: 'Builtins',
            start: {line: 0, column: 1, offset: 0},
            end: {line: 0, column: 0, offset: 0},
          },
          path: '(builtins)',
          line: 0,
          endline: 0,
          start: 1,
          end: 0,
        },
      ],
    },
    flowChildrenOutput,
  ],
};

const expected: Array<FileDiagnosticMessage> = [
  {
    type: 'Error',
    providerName: 'Flow',
    filePath: '/flow-test/src/test.js',
    text: 'object literal',
    range: new Range([12, 15], [12, 17]),
    trace: [
      {
        type: 'Trace',
        text: 'This type is incompatible with',
      },
      {
        type: 'Trace',
        text: 'union: object type(s)',
        filePath: '/flow-test/src/test.js',
        range: new Range([9, 7], [9, 10]),
      },
      {
        type: 'Trace',
        text: 'See also: assignment of property `bar`',
        filePath: '/flow-test/src/test.js',
        range: new Range([12, 4], [12, 12]),
      },
    ],
  },
  {
    type: 'Warning',
    providerName: 'Flow',
    filePath: 'myPath',
    text: 'message',
    range: new Range([0, 2], [1, 4]),
  },
  {
    type: 'Error',
    providerName: 'Flow',
    filePath: '/flow-test/src/test.js',
    text: 'object type',
    range: new Range([82, 8], [82, 12]),
    trace: [
      {
        type: 'Trace',
        text: 'This type is incompatible with an argument type of',
      },
      {
        type: 'Trace',
        text: 'global object',
      },
    ],
  },
  flowChildrenDiagnostic,
];

describe('flowStatusOutputToDiagnostics', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  it('converts the flow status output', () => {
    expect(flowStatusOutputToDiagnostics(flowOutput)).diffJson(expected);
  });

  it('converts the flow status output >=0.66.0', () => {
    expect(
      flowStatusOutputToDiagnostics({
        flowVersion: '0.65.0',
        errors: [
          {
            kind: 'infer',
            level: 'error',
            classic: false,
            primaryLoc: {
              source: 'test.js',
              type: 'SourceFile',
              start: {line: 9, column: 3, offset: 92},
              end: {line: 9, column: 4, offset: 94},
            },
            rootLoc: {
              source: 'test.js',
              type: 'SourceFile',
              start: {line: 9, column: 2, offset: 91},
              end: {line: 9, column: 5, offset: 95},
            },
            messageMarkup: [
              {
                kind: 'Text',
                text: 'Cannot cast array literal to tuple type because ',
              },
              {
                kind: 'Reference',
                referenceId: '1',
                message: [{kind: 'Text', text: 'number'}],
              },
              {kind: 'Text', text: ' is incompatible with '},
              {
                kind: 'Reference',
                referenceId: '2',
                message: [{kind: 'Text', text: 'empty'}],
              },
              {kind: 'Text', text: ' in property '},
              {kind: 'Code', text: 'p'},
              {kind: 'Text', text: ' of index 0.'},
            ],
            referenceLocs: {
              '1': {
                source: 'test.js',
                type: 'SourceFile',
                start: {line: 7, column: 16, offset: 65},
                end: {line: 7, column: 17, offset: 67},
              },
              '2': {
                source: 'test.js',
                type: 'SourceFile',
                start: {line: 6, column: 14, offset: 42},
                end: {line: 6, column: 18, offset: 47},
              },
            },
          },
          {
            kind: 'infer',
            level: 'error',
            classic: false,
            primaryLoc: {
              source: 'test.js',
              type: 'SourceFile',
              start: {line: 10, column: 2, offset: 104},
              end: {line: 10, column: 5, offset: 108},
            },
            rootLoc: {
              source: 'test.js',
              type: 'SourceFile',
              start: {line: 10, column: 2, offset: 104},
              end: {line: 10, column: 5, offset: 108},
            },
            messageMarkup: {
              kind: 'UnorderedList',
              message: [
                {
                  kind: 'Text',
                  text: 'Cannot cast array literal to union type because:',
                },
              ],
              items: [
                [
                  {kind: 'Text', text: 'Either '},
                  {
                    kind: 'Reference',
                    referenceId: '1',
                    message: [{kind: 'Text', text: 'number'}],
                  },
                  {kind: 'Text', text: ' is incompatible with '},
                  {
                    kind: 'Reference',
                    referenceId: '2',
                    message: [{kind: 'Text', text: 'empty'}],
                  },
                  {kind: 'Text', text: ' in property '},
                  {kind: 'Code', text: 'p'},
                  {kind: 'Text', text: ' of index 0.'},
                ],
                [
                  {kind: 'Text', text: 'Or '},
                  {
                    kind: 'Reference',
                    referenceId: '1',
                    message: [{kind: 'Text', text: 'number'}],
                  },
                  {kind: 'Text', text: ' is incompatible with '},
                  {
                    kind: 'Reference',
                    referenceId: '3',
                    message: [{kind: 'Text', text: 'empty'}],
                  },
                  {kind: 'Text', text: ' in property '},
                  {kind: 'Code', text: 'p'},
                  {kind: 'Text', text: ' of index 0.'},
                ],
                [
                  {kind: 'Text', text: 'Or '},
                  {
                    kind: 'Reference',
                    referenceId: '1',
                    message: [{kind: 'Text', text: 'number'}],
                  },
                  {kind: 'Text', text: ' is incompatible with '},
                  {
                    kind: 'Reference',
                    referenceId: '4',
                    message: [{kind: 'Text', text: 'empty'}],
                  },
                  {kind: 'Text', text: ' in property '},
                  {kind: 'Code', text: 'p'},
                  {kind: 'Text', text: ' of index 0.'},
                ],
                [
                  {kind: 'Text', text: 'Or '},
                  {
                    kind: 'Reference',
                    referenceId: '1',
                    message: [{kind: 'Text', text: 'number'}],
                  },
                  {kind: 'Text', text: ' is incompatible with '},
                  {
                    kind: 'Reference',
                    referenceId: '5',
                    message: [{kind: 'Text', text: 'empty'}],
                  },
                  {kind: 'Text', text: ' in property '},
                  {kind: 'Code', text: 'p'},
                  {kind: 'Text', text: ' of index 0.'},
                ],
              ],
            },
            referenceLocs: {
              '1': {
                source: 'test.js',
                type: 'SourceFile',
                start: {line: 8, column: 16, offset: 85},
                end: {line: 8, column: 17, offset: 87},
              },
              '2': {
                source: 'test.js',
                type: 'SourceFile',
                start: {line: 10, column: 13, offset: 115},
                end: {line: 10, column: 17, offset: 120},
              },
              '3': {
                source: 'test.js',
                type: 'SourceFile',
                start: {line: 10, column: 21, offset: 123},
                end: {line: 10, column: 25, offset: 128},
              },
              '4': {
                source: 'test.js',
                type: 'SourceFile',
                start: {line: 10, column: 36, offset: 138},
                end: {line: 10, column: 40, offset: 143},
              },
              '5': {
                source: 'test.js',
                type: 'SourceFile',
                start: {line: 10, column: 44, offset: 146},
                end: {line: 10, column: 48, offset: 151},
              },
            },
          },
        ],
        passed: false,
      }),
    ).diffJson([
      {
        filePath: 'test.js',
        providerName: 'Flow',
        range: {
          end: {
            column: 4,
            row: 8,
          },
          start: {
            column: 2,
            row: 8,
          },
        },
        text:
          'Cannot cast array literal to tuple type because number [1] is incompatible with empty [2] in property `p` of index 0.',
        trace: [
          {
            filePath: 'test.js',
            range: {
              end: {
                column: 17,
                row: 6,
              },
              start: {
                column: 15,
                row: 6,
              },
            },
            text: '[1]',
            type: 'Trace',
          },
          {
            filePath: 'test.js',
            range: {
              end: {
                column: 18,
                row: 5,
              },
              start: {
                column: 13,
                row: 5,
              },
            },
            text: '[2]',
            type: 'Trace',
          },
        ],
        type: 'Error',
      },
      {
        filePath: 'test.js',
        providerName: 'Flow',
        range: {
          end: {
            column: 5,
            row: 9,
          },
          start: {
            column: 1,
            row: 9,
          },
        },
        text:
          'Cannot cast array literal to union type because:\n' +
          ' - Either number [1] is incompatible with empty [2] in property `p` of index 0.\n' +
          ' - Or number [1] is incompatible with empty [3] in property `p` of index 0.\n' +
          ' - Or number [1] is incompatible with empty [4] in property `p` of index 0.\n' +
          ' - Or number [1] is incompatible with empty [5] in property `p` of index 0.',
        trace: [
          {
            filePath: 'test.js',
            range: {
              end: {
                column: 17,
                row: 7,
              },
              start: {
                column: 15,
                row: 7,
              },
            },
            text: '[1]',
            type: 'Trace',
          },
          {
            filePath: 'test.js',
            range: {
              end: {
                column: 17,
                row: 9,
              },
              start: {
                column: 12,
                row: 9,
              },
            },
            text: '[2]',
            type: 'Trace',
          },
          {
            filePath: 'test.js',
            range: {
              end: {
                column: 25,
                row: 9,
              },
              start: {
                column: 20,
                row: 9,
              },
            },
            text: '[3]',
            type: 'Trace',
          },
          {
            filePath: 'test.js',
            range: {
              end: {
                column: 40,
                row: 9,
              },
              start: {
                column: 35,
                row: 9,
              },
            },
            text: '[4]',
            type: 'Trace',
          },
          {
            filePath: 'test.js',
            range: {
              end: {
                column: 48,
                row: 9,
              },
              start: {
                column: 43,
                row: 9,
              },
            },
            text: '[5]',
            type: 'Trace',
          },
        ],
        type: 'Error',
      },
    ]);
  });
});

describe('diagnosticToFix', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  it('should provide a fix for an unused suppression comment', () => {
    const diagnostic: FileDiagnosticMessage = {
      filePath: 'foo',
      providerName: 'Flow',
      type: 'Error',
      text: 'Error suppressing comment',
      range: new Range([5, 0], [5, 13]),
      trace: [
        {
          type: 'Trace',
          text: 'Unused suppression',
        },
      ],
    };
    const fix = diagnosticToFix(diagnostic);
    expect(fix).diffJson({
      oldRange: new Range([5, 0], [5, 13]),
      newText: '',
      speculative: true,
    });
  });

  it('should provide a fix for named import typos', () => {
    const diagnostic: FileDiagnosticMessage = {
      type: 'Error',
      providerName: 'Flow',
      filePath: 'foo',
      range: new Range([2, 8], [2, 16]),
      text: 'Named import from module `./foo`',
      trace: [
        {
          type: 'Trace',
          text:
            'This module has no named export called `FooBrBaaaaz`. Did you mean `foobar`?',
          rangeInFile: null,
        },
      ],
    };
    const fix = diagnosticToFix(diagnostic);
    expect(fix).diffJson({
      oldRange: new Range([2, 8], [2, 16]),
      oldText: 'FooBrBaaaaz',
      newText: 'foobar',
      speculative: true,
    });
  });
});
