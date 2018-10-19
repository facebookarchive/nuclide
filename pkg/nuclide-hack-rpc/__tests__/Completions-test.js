"use strict";

function _Completions() {
  const data = require("../lib/Completions");

  _Completions = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
const filePath = '/tmp/project/file.hh';
const contents2 = `<?hh // strict
fclass HackClass {}`;
const contents3 = `<?hh // strict
HH\\fclass HackClass {}`;
describe('Completions', () => {
  describe('convertCompletions', () => {
    it('normal', () => {
      const serviceResults = [{
        name: 'foo',
        func_details: {
          min_arity: 2,
          return_type: 'string',
          params: [{
            name: 'p1',
            type: 'string',
            variadic: false
          }, {
            name: 'p2',
            type: 'string',
            variadic: false
          }]
        },
        type: 'foo_type',
        pos: {
          filename: filePath,
          line: 42,
          char_start: 0,
          char_end: 10
        },
        expected_ty: false
      }];
      const result = (0, _Completions().convertCompletions)(contents2, 16, '', serviceResults);
      expect(result).toEqual([{
        snippet: 'foo(${1:p1}, ${2:p2})',
        displayText: 'foo',
        description: 'foo_type',
        rightLabel: '(string p1, string p2)',
        leftLabel: 'string',
        replacementPrefix: 'f',
        type: 'function'
      }]);
    });
    it('getCompletions - escaping', () => {
      const serviceResults = [{
        name: 'HH\\foo',
        func_details: {
          min_arity: 2,
          return_type: 'string',
          params: [{
            name: 'p1',
            type: 'string',
            variadic: false
          }, {
            name: 'p2',
            type: 'string',
            variadic: false
          }]
        },
        type: 'foo_type',
        pos: {
          filename: filePath,
          line: 42,
          char_start: 0,
          char_end: 10
        },
        expected_ty: false
      }];
      const result = (0, _Completions().convertCompletions)(contents3, 19, '', serviceResults);
      expect(result).toEqual([{
        snippet: 'HH\\\\foo(${1:p1}, ${2:p2})',
        displayText: 'HH\\foo',
        description: 'foo_type',
        rightLabel: '(string p1, string p2)',
        leftLabel: 'string',
        replacementPrefix: 'HH\\f',
        type: 'function'
      }]);
    });
  });
});