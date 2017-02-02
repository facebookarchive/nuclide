/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {FileDiagnosticMessage} from '../../nuclide-diagnostics-common/lib/rpc-types';

import {Range} from 'atom';

const testPath = 'myPath';

describe('FlowDiagnosticsProvider', () => {
  let flowDiagnosticsProvider: any;

  beforeEach(() => {
    class FakeProviderBase { }
    const FlowDiagnosticsProvider = require('../lib/FlowDiagnosticsProvider');
    flowDiagnosticsProvider = new FlowDiagnosticsProvider(false, (FakeProviderBase: any));
  });

  describe('processDiagnostics', () => {
    it('should invalidate errors from the current file if Flow returns none', () => {
      const diags = [];
      const update = flowDiagnosticsProvider._processDiagnostics(diags, testPath);
      expect(update.filePathToMessages.has(testPath)).toBe(true);
    });

    it('should not filter diagnostics not in the target file', () => {
      const diags: Array<FileDiagnosticMessage> = [{
        providerName: 'Flow',
        scope: 'file',
        type: 'Warning',
        filePath: 'notMyPath',
        range: new Range([1, 3], [2, 4]),
      }];

      const allMessages = flowDiagnosticsProvider
        ._processDiagnostics(diags, testPath)
        .filePathToMessages;
      expect(allMessages.has('notMyPath')).toBe(true);
    });
  });

  describe('invalidateProjectPath', () => {
    it('should remove corresponding errors to certain flow root', () => {
      // Mock a diagnostic provider with 2 flow roots, sharing common file real paths.
      const flowRootToFilePaths = new Map();
      const root1Paths = ['/flow/root1/file.js', '/flow/common/file.js'];
      const root2Paths = ['/flow/root2/file.js', '/flow/common/file.js'];
      flowRootToFilePaths.set('/flow/root1', new Set(root1Paths));
      flowRootToFilePaths.set('/flow/root2', new Set(root2Paths));
      flowDiagnosticsProvider._flowRootToFilePaths = flowRootToFilePaths;
      // Mock the `publishMessageInvalidation` call to capture call arguments.
      const publishHandler = jasmine.createSpy('publish');
      flowDiagnosticsProvider._providerBase.publishMessageInvalidation = publishHandler;

      flowDiagnosticsProvider.invalidateProjectPath('/flow/root1');
      expect(publishHandler.callCount).toBe(1);
      expect(publishHandler.argsForCall[0][0]).toEqual({scope: 'file', filePaths: root1Paths});
      expect(flowDiagnosticsProvider._flowRootToFilePaths.size).toBe(1);
      expect(flowDiagnosticsProvider._flowRootToFilePaths.get('/flow/root2'))
        .toEqual(new Set(root2Paths));
    });
  });
});
