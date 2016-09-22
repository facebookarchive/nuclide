'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {convertDiagnostics} from '../lib/Diagnostics';
import {Range} from 'simple-text-buffer';
import invariant from 'assert';

const testPath = 'myPath';

describe('Diagnostics', () => {

  describe('convertDiagnostics', () => {

    it('should propertly transform a simple diagnostic', () => {
      const diagnostics = [
        {
          message: [
            {
              path: testPath,
              descr: 'message',
              line: 1,
              start: 3,
              end: 4,
              code: 1234,
            },
          ],
        },
      ];

      const expectedOutput = {
        scope: 'file',
        providerName: 'Hack: 1234',
        text: 'message',
        type: 'Error',
        filePath: testPath,
        range: new Range([0, 2], [0, 4]),
      };

      const messageMap = convertDiagnostics({errors: diagnostics})
        .filePathToMessages;
      invariant(messageMap != null);
      const messages = messageMap.get(testPath);
      invariant(messages != null);
      const message = messages[0];
      expect(message).toEqual(expectedOutput);
    });

    it('should not filter diagnostics not in the target file', () => {
      const diagnostics = [
        {
          message: [
            {
              path: 'notMyPath',
              descr: 'message',
              line: 1,
              start: 3,
              end: 4,
              code: 1234,
            },
          ],
        },
      ];

      const allMessages = convertDiagnostics({errors: diagnostics})
        .filePathToMessages;
      invariant(allMessages != null);
      expect(allMessages.size).toBe(1);
      expect(allMessages.has('notMyPath')).toBe(true);
    });

    it('should create traces for diagnostics on multiple messages and combine the text', () => {
      const diagnostics = [
        {
          message: [
            {
              path: testPath,
              descr: 'message',
              line: 1,
              start: 3,
              end: 4,
              code: 1234,
            },
            {
              path: 'otherPath',
              descr: 'more message',
              line: 5,
              start: 7,
              end: 8,
              code: 4321,
            },
          ],
        },
      ];

      const expectedOutput = {
        scope: 'file',
        providerName: 'Hack: 1234',
        type: 'Error',
        text: 'message',
        filePath: testPath,
        range: new Range([0, 2], [0, 4]),
        trace: [{
          type: 'Trace',
          filePath: 'otherPath',
          text: 'more message',
          range: new Range([4, 6], [4, 8]),
        }],
      };

      const pathToMessages = convertDiagnostics({errors: diagnostics})
        .filePathToMessages;
      invariant(pathToMessages != null);
      const messages = pathToMessages.get(testPath);
      invariant(messages != null);
      const message = messages[0];
      expect(message).toEqual(expectedOutput);
    });
  });
});
