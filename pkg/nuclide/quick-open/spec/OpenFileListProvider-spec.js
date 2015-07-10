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
      //enable setTimeout: https://discuss.atom.io/t/solved-settimeout-not-working-firing-in-specs-tests/11427
      jasmine.unspy(window, 'setTimeout');
      waitsForPromise(() => new Promise((resolve, reject) => {
        setTimeout(() => {
          var matchingTabs = OpenFileListProvider.getOpenTabsMatching('file');
          expect(matchingTabs.length).toBe(3);
          resolve();
        }, 100);
        atom.workspace.open('file1');
        atom.workspace.open('file2');
        atom.workspace.open('file1', {split: 'right'});
        atom.workspace.open('file3', {split: 'right'});
      }));
    });
  });
});
