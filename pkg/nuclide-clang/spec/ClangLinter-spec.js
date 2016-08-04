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
import ClangLinter from '../lib/ClangLinter';

describe('ClangDiagnosticsProvider', () => {

  const TEST_PATH = '/path/test.cpp';
  const TEST_PATH2 = '/path/asdf';

  describe('processDiagnostics', () => {
    it('should group diagnostics by file', () => {
      const messages = ClangLinter
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
              fixits: [
                {
                  range: {
                    file: TEST_PATH2,
                    start: {line: 3, column: 4},
                    end: {line: 3, column: 5},
                  },
                  value: 'fixit',
                },
              ],
              children: [
                {
                  spelling: 'child error',
                  location: {
                    file: TEST_PATH2,
                    line: 0,
                    column: 0,
                  },
                  ranges: [],
                },
              ],
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
                  file: TEST_PATH,
                  start: {line: 1, column: 0},
                  end: {line: 1, column: 2},
                },
              ],
              spelling: 'test error 2',
            },
          ],
          accurateFlags: true,
        }, TEST_PATH);

      expect(messages).toEqual([
        {
          scope: 'file',
          providerName: 'Clang',
          type: 'Warning',
          filePath: TEST_PATH2,
          text: 'other file',
          range: new Range([0, 0], [1, 0]),
          trace: [
            {
              type: 'Trace',
              text: 'child error',
              filePath: TEST_PATH2,
              range: new Range([0, 0], [1, 0]),
            },
          ],
          fix: {
            range: new Range([3, 4], [3, 5]),
            newText: 'fixit',
          },
        },
        {
          scope: 'file',
          providerName: 'Clang',
          type: 'Warning',
          filePath: TEST_PATH,
          text: 'test error',
          range: new Range([0, 0], [1, 0]),
          fix: undefined,
          trace: undefined,
        },
        {
          scope: 'file',
          providerName: 'Clang',
          type: 'Error',
          filePath: TEST_PATH,
          text: 'test error 2',
          range: new Range([1, 0], [1, 2]),
          fix: undefined,
          trace: undefined,
        },
      ]);
    });
  });

});
