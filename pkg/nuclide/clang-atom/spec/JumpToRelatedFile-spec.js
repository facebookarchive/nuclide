'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
const JumpToRelatedFile = require('../lib/JumpToRelatedFile');

describe('JumpToRelatedFile', () => {
  const relatedFiles = ['dir/Test.h', 'dir/Test.m', 'dir/TestInternal.h'];

  describe('@getNextRelatedFile_', () => {
    it('gets next related file at the start of the sequence', () => {
      const currentFile = 'dir/Test.h';

      const jumpToRelatedFile = new JumpToRelatedFile({
        find: () => ({relatedFiles, index: relatedFiles.indexOf(currentFile)}),
      });

      expect(jumpToRelatedFile.getNextRelatedFile(currentFile))
          .toEqual('dir/TestInternal.h');
    });

    it('gets next related file in the middle of the sequence', () => {
      const currentFile = 'dir/Test.m';

      const jumpToRelatedFile = new JumpToRelatedFile({
        find: () => ({relatedFiles, index: relatedFiles.indexOf(currentFile)}),
      });

      expect(jumpToRelatedFile.getNextRelatedFile(currentFile))
          .toEqual('dir/Test.h');
    });

    it('gets next related file at the end of the sequence', () => {
      const currentFile = 'dir/TestInternal.h';

      const jumpToRelatedFile = new JumpToRelatedFile({
        find: () => ({relatedFiles, index: relatedFiles.indexOf(currentFile)}),
      });

      expect(jumpToRelatedFile.getNextRelatedFile(currentFile))
          .toEqual('dir/Test.m');
    });
  });

  describe('@getPreviousRelatedFile_', () => {
    it('gets previous related file at the start of the sequence', () => {
      const currentFile = 'dir/Test.h';

      const jumpToRelatedFile = new JumpToRelatedFile({
        find: () => ({relatedFiles, index: relatedFiles.indexOf(currentFile)}),
      });

      expect(jumpToRelatedFile.getPreviousRelatedFile(currentFile))
          .toEqual('dir/Test.m');
    });

    it('gets previous related file in the middle of the sequence', () => {
      const currentFile = 'dir/Test.m';

      const jumpToRelatedFile = new JumpToRelatedFile({
        find: () => ({relatedFiles, index: relatedFiles.indexOf(currentFile)}),
      });

      expect(jumpToRelatedFile.getPreviousRelatedFile(currentFile))
          .toEqual('dir/TestInternal.h');
    });

    it('gets previous related file at the end of the sequence', () => {
      const currentFile = 'dir/TestInternal.h';

      const jumpToRelatedFile = new JumpToRelatedFile({
        find: () => ({relatedFiles, index: relatedFiles.indexOf(currentFile)}),
      });

      expect(jumpToRelatedFile.getPreviousRelatedFile(currentFile))
          .toEqual('dir/Test.h');
    });
  });
});
