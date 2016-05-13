'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as ServerHackLanguageType from '../lib/ServerHackLanguage';
import type {ServerHackLanguage} from '../lib/ServerHackLanguage';
import type {
  HackCompletionsResult,
  HackDefinitionResult,
  HackDiagnosticsResult,
  HackTypedRegion,
  HackTypeAtPosResult,
  HackFindLvarRefsResult,
  HackFormatSourceResult,
  HackGetMethodNameResult,
  HackReferencesResult,
} from '../../nuclide-hack-base/lib/HackService';

import {uncachedRequire, clearRequireCache} from '../../nuclide-test-helpers';

const basePath = '/tmp/project';
const filePath = '/tmp/project/file.hh';
const contents = `<?hh // strict
class HackClass {}`;

describe('ServerHackLanguage', () => {
  let mockService: Object = (null: any);
  let hackLanguage: ServerHackLanguage = (null: any);

  // Tests ToBeTested.functionToTest while mocking imported function toBeMocked.
  beforeEach(() => {

    mockService = jasmine.createSpyObj('HackService', [
      'getCompletions',
      'getDiagnostics',
      'getIdentifierDefinition',
      'getTypedRegions',
      'getTypeAtPos',
      'getSourceHighlights',
      'formatSource',
      'getMethodName',
      'getReferences',
    ]);

    const ServerHackLanguageCtor =
      ((uncachedRequire(require, '../lib/ServerHackLanguage'): any): ServerHackLanguageType)
        .ServerHackLanguage;
    hackLanguage = new ServerHackLanguageCtor((mockService: any), true, basePath);
  });

  it('isHackAvailable', () => {
    expect(hackLanguage.isHackAvailable()).toEqual(true);
  });

  it('getBasePath', () => {
    expect(hackLanguage.getBasePath()).toEqual(basePath);
  });

  it('getCompletions', () => {
    waitsForPromise(async () => {
      const serviceResults: HackCompletionsResult = {
        hackRoot: basePath,
        completions: [
          {
            name: 'foo',
            func_details: {
              params: [
                {
                  name: 'p1',
                },
                {
                  name: 'p2',
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
          },
        ],
      };
      mockService.getCompletions.andReturn(serviceResults);

      const result = await hackLanguage.getCompletions(filePath, contents, 15);

      expect(mockService.getCompletions).toHaveBeenCalledWith(filePath, `<?hh // strict
AUTO332class HackClass {}`);
      expect(result).toEqual([
        {
          matchSnippet: 'foo(${1:p1}, ${2:p2})',
          matchText: 'foo',
          matchType: 'foo_type',
        },
      ]);
    });
  });

  it('formatSource', () => {
    waitsForPromise(async () => {
      const serviceResult: HackFormatSourceResult = {
        error_message: '',
        result: 'format-result',
        internal_error: false,
      };
      mockService.formatSource.andReturn(serviceResult);

      const result = await hackLanguage.formatSource(contents, 0, contents.length);

      expect(mockService.formatSource).toHaveBeenCalledWith(basePath, contents, 0, contents.length);
      expect(result).toEqual(serviceResult.result);
    });
  });

  it('highlightSource', () => {
    waitsForPromise(async () => {
      const serviceResults: HackFindLvarRefsResult = {
        positions: [
          {
            filename: filePath,
            line: 1,
            char_start: 2,
            char_end: 2,
          },
          {
            filename: filePath,
            line: 2,
            char_start: 4,
            char_end: 6,
          },
        ],
        internal_error: false,
      };
      mockService.getSourceHighlights.andReturn(serviceResults);

      const result = await hackLanguage.highlightSource(filePath, contents, 4, 6);

      expect(mockService.getSourceHighlights).toHaveBeenCalledWith(filePath, contents, 4, 6);
      expect(result).toEqual([
        {start: {row: 0, column: 1}, end: {row: 0, column: 2}},
        {start: {row: 1, column: 3}, end: {row: 1, column: 6}},
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
      const serviceResults: HackDiagnosticsResult = {
        hackRoot: basePath,
        messages: [
          message,
        ],
      };

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

  it('getDefinition', () => {
    waitsForPromise(async () => {
      const definition = {
        path: filePath,
        line: 42,
        column: 24,
        name: 'foo',
        length: 3,
        scope: '',
        additionalInfo: '',
      };

      const serviceResults: HackDefinitionResult = {
        hackRoot: basePath,
        definitions: [definition],
      };
      mockService.getIdentifierDefinition.andReturn(serviceResults);

      const result = await hackLanguage.getDefinition(filePath, contents, 1, 2, 'howdy');

      expect(mockService.getIdentifierDefinition).toHaveBeenCalledWith(filePath, contents, 1, 2);
      expect(result).toEqual([definition]);
    });
  });

  it('getType', () => {
    waitsForPromise(async () => {
      const serviceResult: HackTypeAtPosResult = {
        type: 'hack-type',
        pos: {
          filename: filePath,
          line: 1,
          char_start: 2,
          char_end: 2,
        },
      };
      mockService.getTypeAtPos.andReturn(serviceResult);

      const result = await hackLanguage.getType(filePath, contents, '$expr', 1, 2);

      expect(mockService.getTypeAtPos).toHaveBeenCalledWith(filePath, contents, 1, 2);
      expect(result).toEqual(serviceResult.type);
    });
  });

  it('findReferences', () => {
    waitsForPromise(async () => {
      const getMethodResult: HackGetMethodNameResult = {
        name: 'item_name',
        pos: {
          filename: filePath,
          line: 1,
          char_start: 2,
          char_end: 3,
        },
        result_type: 'method',
      };
      mockService.getMethodName.andReturn(getMethodResult);
      const findResult: HackReferencesResult = {
        hackRoot: basePath,
        references: [
          {
            name: 'item_name',
            filename: filePath,
            line: 1,
            char_start: 2,
            char_end: 3,
          },
          {
            name: 'item_name',
            filename: filePath,
            line: 11,
            char_start: 4,
            char_end: 7,
          },
        ],
      };
      mockService.getReferences.andReturn(findResult);

      const result = await hackLanguage.findReferences(filePath, contents, 1, 2);

      expect(result).toEqual(
        {
          baseUri: '/tmp/project',
          symbolName: 'item_name',
          references: [
            {
              name: 'item_name',
              filename: filePath,
              line: 1,
              char_start: 2,
              char_end: 3,
            },
            {
              name: 'item_name',
              filename: filePath,
              line: 11,
              char_start: 4,
              char_end: 7,
            },
          ],
        });
      expect(mockService.getMethodName).toHaveBeenCalledWith(filePath, contents, 2, 3);
      expect(mockService.getReferences).toHaveBeenCalledWith(filePath, 'item_name', 2);
    });
  });

  afterEach(() => {
    clearRequireCache(require, '../lib/ServerHackLanguage');
  });
});
