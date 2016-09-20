'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as HackLanguageType from '../lib/HackLanguage';
import type {HackLanguage} from '../lib/HackLanguage';
import type {
  HackCompletionsResult,
  HackDiagnosticsResult,
  HackTypedRegion,
  HackReferencesResult,
} from '../../nuclide-hack-rpc/lib/HackService';

import {uncachedRequire, clearRequireCache} from '../../nuclide-test-helpers';

const basePath = '/tmp/project';
const filePath = '/tmp/project/file.hh';
const contents = `<?hh // strict
class HackClass {}`;
const contents2 = `<?hh // strict
fclass HackClass {}`;
const contents3 = `<?hh // strict
HH\\fclass HackClass {}`;

describe('HackLanguage', () => {
  let mockService: Object = (null: any);
  let hackLanguage: HackLanguage = (null: any);

  // Tests ToBeTested.functionToTest while mocking imported function toBeMocked.
  beforeEach(() => {

    mockService = jasmine.createSpyObj('HackService', [
      'getCompletions',
      'getDiagnostics',
      'getIdentifierDefinition',
      'getDefinition',
      'getTypedRegions',
      'getTypeAtPos',
      'getMethodName',
      'findReferences',
    ]);

    const HackLanguageCtor =
      ((uncachedRequire(require, '../lib/HackLanguage'): any): HackLanguageType)
        .HackLanguage;
    hackLanguage = new HackLanguageCtor((mockService: any), basePath);
  });

  it('getCompletions', () => {
    waitsForPromise(async () => {
      const serviceResults: HackCompletionsResult = [
        {
          name: 'foo',
          func_details: {
            min_arity: 2,
            return_type: 'string',
            params: [
              {
                name: 'p1',
                type: 'string',
                variadic: false,
              },
              {
                name: 'p2',
                type: 'string',
                variadic: false,
              },
            ],
          },
          type: 'foo_type',
          pos: {
            filename: filePath,
            line: 42,
            char_start: 0,
            char_end: 10,
          },
          expected_ty: false,
        },
      ];
      mockService.getCompletions.andReturn(serviceResults);

      const result = await hackLanguage.getCompletions(
        filePath, contents2, 16, 2, 2);

      expect(mockService.getCompletions).toHaveBeenCalledWith(filePath, `<?hh // strict
fclass HackClass {}`, 16, 2, 2);
      expect(result).toEqual([
        {
          snippet: 'foo(${1:p1}, ${2:p2})',
          displayText: 'foo',
          description: 'foo_type',
          rightLabel: '(string p1, string p2)',
          leftLabel: 'string',
          replacementPrefix: 'f',
          type: 'function',
        },
      ]);
    });
  });

  it('getCompletions - escaping', () => {
    waitsForPromise(async () => {
      const serviceResults: HackCompletionsResult = [
        {
          name: 'HH\\foo',
          func_details: {
            min_arity: 2,
            return_type: 'string',
            params: [
              {
                name: 'p1',
                type: 'string',
                variadic: false,
              },
              {
                name: 'p2',
                type: 'string',
                variadic: false,
              },
            ],
          },
          type: 'foo_type',
          pos: {
            filename: filePath,
            line: 42,
            char_start: 0,
            char_end: 10,
          },
          expected_ty: false,
        },
      ];
      mockService.getCompletions.andReturn(serviceResults);

      const result = await hackLanguage.getCompletions(
        filePath, contents3, 19, 2, 5);

      expect(mockService.getCompletions).toHaveBeenCalledWith(filePath, `<?hh // strict
HH\\fclass HackClass {}`, 19, 2, 5);
      expect(result).toEqual([
        {
          snippet: 'HH\\\\foo(${1:p1}, ${2:p2})',
          displayText: 'HH\\foo',
          description: 'foo_type',
          rightLabel: '(string p1, string p2)',
          leftLabel: 'string',
          replacementPrefix: 'HH\\f',
          type: 'function',
        },
      ]);
    });
  });

  it('getDiagnostics', () => {
    waitsForPromise(async () => {
      const message = {
        message: [
          {
            path: filePath,
            descr: 'Diagnostic description',
            code: 42,
            line: 12,
            start: 4,
            end: 8,
          },
        ],
      };
      const serviceResults: HackDiagnosticsResult = [
        message,
      ];

      mockService.getDiagnostics.andReturn(serviceResults);

      const result = await hackLanguage.getDiagnostics(filePath, contents);
      expect(mockService.getDiagnostics).toHaveBeenCalledWith(filePath, contents);
      expect(result).toEqual([message]);
    });
  });

  it('getTypeCoverage', () => {
    waitsForPromise(async () => {
      const serviceResults: Array<HackTypedRegion> = [
        {color: 'default', text: '123'},
        {color: 'unchecked', text: '456'},
      ];
      mockService.getTypedRegions.andReturn(serviceResults);

      const result = await hackLanguage.getTypeCoverage(filePath);

      expect(mockService.getTypedRegions).toHaveBeenCalledWith(filePath);
      expect(result).toEqual({
        percentage: 0,
        uncoveredRegions: [{type: 'unchecked', line: 1, start: 4, end: 6}],
      });
    });
  });

  it('findReferences', () => {
    waitsForPromise(async () => {
      const findResult: HackReferencesResult = [
        {
          name: 'item_name',
          filename: filePath,
          projectRoot: basePath,
          line: 1,
          char_start: 2,
          char_end: 3,
        },
        {
          name: 'item_name',
          filename: filePath,
          projectRoot: basePath,
          line: 11,
          char_start: 4,
          char_end: 7,
        },
      ];
      mockService.findReferences.andReturn(findResult);

      const result = await hackLanguage.findReferences(filePath, contents, 2, 3);
      expect(result).toEqual(
        {
          baseUri: '/tmp/project',
          symbolName: 'item_name',
          references: [
            {
              name: 'item_name',
              filename: filePath,
              projectRoot: basePath,
              line: 1,
              char_start: 2,
              char_end: 3,
            },
            {
              name: 'item_name',
              filename: filePath,
              projectRoot: basePath,
              line: 11,
              char_start: 4,
              char_end: 7,
            },
          ],
        });
      expect(mockService.findReferences).toHaveBeenCalledWith(filePath, contents, 2, 3);
    });
  });

  afterEach(() => {
    clearRequireCache(require, '../lib/HackLanguage');
  });
});
