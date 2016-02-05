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

const testPath = 'myPath';

describe('HackDiagnosticsProvider', () => {

  let hackDiagnosticsProvider: any;
  let fakeHackLanguages: Array<any>;

  function createFakeHackLanguage(uri: string) {
    return {
      _uri: uri,
      isHackAvailable: () => true,
    };
  }

  beforeEach(() => {
    // Mock 2 hack languages
    fakeHackLanguages = [];
    fakeHackLanguages.push(createFakeHackLanguage('/hack/root1'));
    fakeHackLanguages.push(createFakeHackLanguage('/hack/root2'));
    require('../lib/hack').getCachedHackLanguageForUri = uri =>
      fakeHackLanguages.filter(fakeLanguage => uri.startsWith(fakeLanguage._uri))[0];
    class FakeProviderBase { }
    const HackDiagnosticsProvider = require('../lib/HackDiagnosticsProvider');
    hackDiagnosticsProvider = new HackDiagnosticsProvider(
      false,
      (FakeProviderBase: any),
    );
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
            },
          ],
        },
      ];

      const expectedOutput = {
        scope: 'file',
        providerName: 'Hack',
        text: 'message',
        type: 'Error',
        filePath: testPath,
        range: new Range([0, 2], [0, 4]),
      };

      const message = hackDiagnosticsProvider
        ._processDiagnostics(diagnostics, testPath)
        .filePathToMessages.get(testPath)[0];
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
            },
          ],
        },
      ];

      const allMessages = hackDiagnosticsProvider
        ._processDiagnostics(diagnostics, testPath)
        .filePathToMessages;
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
            },
            {
              path: 'otherPath',
              descr: 'more message',
              line: 5,
              start: 7,
              end: 8,
            },
          ],
        },
      ];

      const expectedOutput = {
        scope: 'file',
        providerName: 'Hack',
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

      const message = hackDiagnosticsProvider
        ._processDiagnostics(diagnostics, testPath)
        .filePathToMessages.get(testPath)[0];
      expect(message).toEqual(expectedOutput);
    });
  });

  describe('invalidateProjectPath', () => {
    it('should remove corresponding errors to certain hack language', () => {
      // Mock a diagnostic provider with 2 hack language roots, sharing common file real paths.
      const hackLanguageToFilePaths = new Map();
      const root1Paths = ['/hack/root1/file.js', '/hack/common/file.js'];
      const root2Paths = ['/hack/root2/file.js', '/hack/common/file.js'];
      hackLanguageToFilePaths.set(fakeHackLanguages[0], new Set(root1Paths));
      hackLanguageToFilePaths.set(fakeHackLanguages[1], new Set(root2Paths));
      hackDiagnosticsProvider._hackLanguageToFilePaths = hackLanguageToFilePaths;
      // Mock the `publishMessageInvalidation` call to capture call arguments.
      const publishHandler = jasmine.createSpy('publish');
      hackDiagnosticsProvider._providerBase.publishMessageInvalidation = publishHandler;

      hackDiagnosticsProvider.invalidateProjectPath('/hack/root1');
      expect(publishHandler.callCount).toBe(1);
      expect(publishHandler.argsForCall[0][0]).toEqual({scope: 'file', filePaths: root1Paths});
      expect(hackDiagnosticsProvider._hackLanguageToFilePaths.size).toBe(1);
      expect(hackDiagnosticsProvider._hackLanguageToFilePaths.get(fakeHackLanguages[1]))
        .toEqual(new Set(root2Paths));
    });
  });
});
