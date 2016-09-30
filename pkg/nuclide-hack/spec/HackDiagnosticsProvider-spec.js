'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import typeof * as HackDiagnosticsProviderFile from '../lib/HackDiagnosticsProvider';
import type {HackDiagnosticsProvider} from '../lib/HackDiagnosticsProvider';

import {clearRequireCache, uncachedRequire} from '../../nuclide-test-helpers';

describe('HackDiagnosticsProvider', () => {

  let hackDiagnosticsProvider: HackDiagnosticsProvider = (null: any);

  beforeEach(() => {
    class FakeProviderBase { }
    const file: HackDiagnosticsProviderFile
      = (uncachedRequire(require, '../lib/HackDiagnosticsProvider'): any);
    hackDiagnosticsProvider = new file.HackDiagnosticsProvider(
      false,
      (FakeProviderBase: any),
    );
  });

  afterEach(() => {
    clearRequireCache(require, '../lib/HackDiagnosticsProvider');
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
