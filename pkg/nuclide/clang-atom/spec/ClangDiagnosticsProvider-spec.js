'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Range} from 'atom';
import {array} from '../../commons';
import ClangDiagnosticsProvider from '../lib/ClangDiagnosticsProvider';

describe('ClangDiagnosticsProvider', () => {

  const TEST_PATH = '/path/test.cpp';
  const TEST_PATH2 = '/path/asdf';
  const fakeEditor: any = {
    getPath() {
      return TEST_PATH;
    },
    getBuffer() {
      return {
        lineLengthForRow() {
          return 1;
        },
      };
    },
  };

  let diagnosticsProvider: ClangDiagnosticsProvider = (null: any);
  beforeEach(() => {
    diagnosticsProvider = new ClangDiagnosticsProvider(({}: any));
  });

  describe('processDiagnostics', () => {
    it('should group diagnostics by file', () => {
      const filePathToMessages = diagnosticsProvider
        ._processDiagnostics({
          diagnostics: [
            {
              severity: 1, // severity < 2 is ignored
              location: {
                file: '',
                line: 0,
                column: 0,
              },
              ranges: [],
              spelling: 'ignore me',
            },
            {
              severity: 2,
              location: {
                file: TEST_PATH2,
                line: 0,
                column: 0,
              },
              ranges: null, // use the entire line
              spelling: 'other file',
            },
            {
              severity: 2,
              location: {
                file: TEST_PATH,
                line: 0,
                column: 0,
              },
              ranges: null,
              spelling: 'test error',
            },
            {
              severity: 3,
              location: {
                file: TEST_PATH,
                line: 0,
                column: 0,
              },
              ranges: [
                {
                  start: {line: 1, column: 0},
                  end: {line: 1, column: 2},
                },
              ],
              spelling: 'test error 2',
            },
          ],
        }, fakeEditor);

      expect(array.from(filePathToMessages)).toEqual([
        [
          TEST_PATH2,
          [
            {
              scope: 'file',
              providerName: 'Clang',
              type: 'Warning',
              filePath: TEST_PATH2,
              text: 'other file',
              range: new Range([0, 0], [0, 1]),
            },
          ],
        ],
        [
          TEST_PATH,
          [
            {
              scope: 'file',
              providerName: 'Clang',
              type: 'Warning',
              filePath: TEST_PATH,
              text: 'test error',
              range: new Range([0, 0], [0, 1]),
            },
            {
              scope: 'file',
              providerName: 'Clang',
              type: 'Error',
              filePath: TEST_PATH,
              text: 'test error 2',
              range: new Range([1, 0], [1, 2]),
            },
          ],
        ],
      ]);
    });
  });

  describe('invalidateProjectPath', () => {
    it('should invalidate all errors in the directory', () => {
      diagnosticsProvider._diagnosticPaths.set(TEST_PATH, [
        TEST_PATH,
        TEST_PATH + '.test',
        '/asdf',
      ]);
      // Should not be invalidated
      diagnosticsProvider._diagnosticPaths.set('/other/asdf', [
        TEST_PATH + '.test2',
      ]);

      spyOn(diagnosticsProvider._providerBase, 'publishMessageInvalidation');
      diagnosticsProvider.invalidateProjectPath('/path');
      expect(diagnosticsProvider._providerBase.publishMessageInvalidation)
        .toHaveBeenCalledWith({
          scope: 'file',
          filePaths: [
            TEST_PATH,
            TEST_PATH + '.test',
            '/asdf',
          ],
        });
    });
  });

});
