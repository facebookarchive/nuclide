'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var OpenFileListProvider = require('../lib/OpenFileListProvider');

describe('OpenFileListProvider', () => {

  describe('getOpenTabsMatching', () => {
    it('should not return duplicate open files', () => {
      waitsForPromise(async () => {
        await Promise.all([
          atom.workspace.open('file1'),
          atom.workspace.open('file2'),
        ]);
        await atom.workspace.open('file1', {split: 'right'});
        await atom.workspace.open('file3', {split: 'right'});
      });

      // Create an untitled text editor.
      runs(() => {
        expect(atom.workspace.getTextEditors().length).toBe(4);
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'application:new-file');
      });

      // Wait until the untitled text editor is open.
      // TODO(mbolin): This should test for 5 rather than 4.
      // Unfortunately, the above code to open an untitled text editor does not work today:
      // https://discuss.atom.io/t/create-an-untitled-window-from-apm-test/19568.
      // Once a workaround is found / the bug is fixed, this should be changed to verify that the
      // untitled text editor is open.
      waitsFor(() => atom.workspace.getTextEditors().length === 4);

      // Ensure that getOpenTabsMatching() works in the presence of an untitled window.
      runs(() => {
        var matchingTabs = OpenFileListProvider.getOpenTabsMatching('file');
        expect(matchingTabs.length).toBe(3);
      });
    });
  });
});
