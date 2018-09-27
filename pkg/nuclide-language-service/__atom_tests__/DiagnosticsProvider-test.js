"use strict";

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _DiagnosticsProvider() {
  const data = require("../lib/DiagnosticsProvider");

  _DiagnosticsProvider = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
beforeEach(() => {
  jest.restoreAllMocks();
});
describe('FileDiagnosticsProvider', () => {
  let diagnosticsProvider = null;
  beforeEach(() => {
    class FakeProviderBase {
      dispose() {}

    }

    const busySignalProvider = {
      reportBusyWhile(message, f) {
        return f();
      }

    };
    diagnosticsProvider = new (_DiagnosticsProvider().FileDiagnosticsProvider)('Hack', ['text.html.hack', 'text.html.php'], false, 'hack.diagnostics', null, // connectionToLanguageService
    busySignalProvider, FakeProviderBase);
  });
  describe('invalidateProjectPath', () => {
    it('should remove corresponding errors to certain hack language', () => {
      // Mock a diagnostic provider with 2 hack language roots, sharing common file real paths.
      const projectRootToFilePaths = new Map();
      const root1Paths = ['/hack/root1/file.js', '/hack/common/file.js'];
      const root2Paths = ['/hack/root2/file.js', '/hack/common/file.js'];
      projectRootToFilePaths.set('/hack/root1', new Set(root1Paths));
      projectRootToFilePaths.set('/hack/root2', new Set(root2Paths));
      diagnosticsProvider._projectRootToFilePaths = projectRootToFilePaths; // Mock the `publishMessageInvalidation` call to capture call arguments.

      const publishHandler = jest.fn();
      diagnosticsProvider._providerBase.publishMessageInvalidation = publishHandler;
      diagnosticsProvider.invalidateProjectPath('/hack/root1');
      expect(publishHandler.mock.calls.length).toBe(1);
      expect(publishHandler.mock.calls[0][0]).toEqual({
        scope: 'file',
        filePaths: root1Paths
      });
      expect(diagnosticsProvider._projectRootToFilePaths.size).toBe(1);
      expect(diagnosticsProvider._projectRootToFilePaths.get('/hack/root2')).toEqual(new Set(root2Paths));
    });
  });
});
describe('ObservableDiagnosticsProvider', () => {
  let connectionCache;
  let diagnosticsProvider;
  const TEST_FILE = 'test.txt';
  const mockLanguageService = {
    observeDiagnostics() {
      return _RxMin.Observable.of(new Map([[TEST_FILE, []]])).publish();
    }

  };
  beforeEach(() => {
    connectionCache = new (_nuclideRemoteConnection().ConnectionCache)(() => Promise.resolve(mockLanguageService),
    /* lazy */
    true);
    diagnosticsProvider = new (_DiagnosticsProvider().ObservableDiagnosticProvider)('Test', ['text.plain.null-grammar'], (0, _log4js().getLogger)('DiagnosticsProvider-spec'), connectionCache);
  });
  afterEach(() => {
    diagnosticsProvider.dispose();
  });
  it.skip('starts a language server upon file open', async () => {
    expect(connectionCache.getExistingForUri(TEST_FILE)).toBeNull();
    const updates = diagnosticsProvider.updates.take(1).toPromise();
    await atom.workspace.open(TEST_FILE);
    expect((await connectionCache.getExistingForUri(TEST_FILE))).toBe(mockLanguageService);
    expect((await updates)).toEqual(new Map([[TEST_FILE, []]]));
  });
});