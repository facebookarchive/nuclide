'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type HackDiagnosticsProvider from '../lib/HackDiagnosticsProvider';

import invariant from 'assert';
import {Range} from 'atom';
import {clearRequireCache, uncachedRequire} from '../../nuclide-test-helpers';

const testPath = 'myPath';

describe('HackDiagnosticsProvider', () => {

  let hackDiagnosticsProvider: HackDiagnosticsProvider = (null: any);

  beforeEach(() => {
    class FakeProviderBase { }
    const HackDiagnosticsProviderClass
      = (uncachedRequire(require, '../lib/HackDiagnosticsProvider'): any);
    hackDiagnosticsProvider = new HackDiagnosticsProviderClass(
      false,
      (FakeProviderBase: any),
    );
  });

  afterEach(() => {
    clearRequireCache(require, '../lib/HackDiagnosticsProvider');
  });

  describe('processDiagnostics', () => {

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

      const messageMap = hackDiagnosticsProvider
        ._processDiagnostics(diagnostics, testPath)
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

      const allMessages = hackDiagnosticsProvider
        ._processDiagnostics(diagnostics, testPath)
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

      const pathToMessages = hackDiagnosticsProvider
        ._processDiagnostics(diagnostics, testPath)
        .filePathToMessages;
      invariant(pathToMessages != null);
      const messages = pathToMessages.get(testPath);
      invariant(messages != null);
      const message = messages[0];
      expect(message).toEqual(expectedOutput);
    });
  });

  describe('invalidateProjectPath', () => {
    it('should remove corresponding errors to certain hack language', () => {
      // Mock a diagnostic provider with 2 hack language roots, sharing common file real paths.
      const projectRootToFilePaths = new Map();
      const root1Paths = ['/hack/root1/file.js', '/hack/common/file.js'];
      const root2Paths = ['/hack/root2/file.js', '/hack/common/file.js'];
      projectRootToFilePaths.set('/hack/root1', new Set(root1Paths));
      projectRootToFilePaths.set('/hack/root2', new Set(root2Paths));
      hackDiagnosticsProvider._projectRootToFilePaths = projectRootToFilePaths;
      // Mock the `publishMessageInvalidation` call to capture call arguments.
      const publishHandler = jasmine.createSpy('publish');
      (hackDiagnosticsProvider._providerBase: any).publishMessageInvalidation = publishHandler;

      hackDiagnosticsProvider.invalidateProjectPath('/hack/root1');
      expect(publishHandler.callCount).toBe(1);
      expect(publishHandler.argsForCall[0][0]).toEqual({scope: 'file', filePaths: root1Paths});
      expect(hackDiagnosticsProvider._projectRootToFilePaths.size).toBe(1);
      expect(hackDiagnosticsProvider._projectRootToFilePaths.get('/hack/root2'))
        .toEqual(new Set(root2Paths));
    });
  });
});
