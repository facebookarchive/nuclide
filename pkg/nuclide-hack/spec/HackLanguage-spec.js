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
  HackDiagnosticsResult,
} from '../../nuclide-hack-rpc/lib/HackService';

import {uncachedRequire, clearRequireCache} from '../../nuclide-test-helpers';

const basePath = '/tmp/project';
const filePath = '/tmp/project/file.hh';
const contents = `<?hh // strict
class HackClass {}`;

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

  afterEach(() => {
    clearRequireCache(require, '../lib/HackLanguage');
  });
});
