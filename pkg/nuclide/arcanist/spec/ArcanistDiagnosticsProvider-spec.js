'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {uncachedRequire} from 'nuclide-test-helpers';

describe('ArcanistDiagnosticsProvider', () => {
  let provider: any;
  let willDestroyCallbacks: Array<Function> = (null: any);
  let fakeEditor: any;
  let getTextEditorsReturn: any;

  beforeEach(() => {
    fakeEditor = { getPath() { return 'foo'; } };
    willDestroyCallbacks = [];
    getTextEditorsReturn = [fakeEditor];
    spyOn(atom.workspace, 'onWillDestroyPaneItem').andCallFake(callback => {
      willDestroyCallbacks.push(callback);
    });
    spyOn(atom.workspace, 'getTextEditors').andCallFake(() => getTextEditorsReturn);
    require('nuclide-diagnostics-provider-base').DiagnosticsProviderBase = (class {
      publishMessageInvalidation() {}
    }: any);
    const {ArcanistDiagnosticsProvider} =
      (uncachedRequire(require, '../lib/ArcanistDiagnosticsProvider'): any);
    provider = new ArcanistDiagnosticsProvider();
  });

  it('should invalidate the messages when a file is closed', () => {
    spyOn(provider._providerBase, 'publishMessageInvalidation');
    willDestroyCallbacks.forEach(callback => callback({item: fakeEditor}));
    expect(provider._providerBase.publishMessageInvalidation).toHaveBeenCalledWith({
      scope: 'file',
      filePaths: ['foo'],
    });
  });

  it('should not invalidate the messages when there are multiple buffers with the file', () => {
    getTextEditorsReturn = [fakeEditor, fakeEditor];
    spyOn(provider._providerBase, 'publishMessageInvalidation');
    willDestroyCallbacks.forEach(callback => callback({item: fakeEditor}));
    expect(provider._providerBase.publishMessageInvalidation).not.toHaveBeenCalled();
  });
});
