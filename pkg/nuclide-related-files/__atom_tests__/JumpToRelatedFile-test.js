'use strict';

var _JumpToRelatedFile;

function _load_JumpToRelatedFile() {
  return _JumpToRelatedFile = _interopRequireDefault(require('../lib/JumpToRelatedFile'));
}

var _RelatedFileFinder;

function _load_RelatedFileFinder() {
  return _RelatedFileFinder = _interopRequireDefault(require('../lib/RelatedFileFinder'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

describe('JumpToRelatedFile', () => {
  const relatedFiles = ['dir/Test.h', 'dir/Test.m', 'dir/TestInternal.h'];
  let currentFile = '';

  beforeEach(() => {
    jest.spyOn((_RelatedFileFinder || _load_RelatedFileFinder()).default, 'find').mockImplementation(() => {
      return { relatedFiles, index: relatedFiles.indexOf(currentFile) };
    });
  });

  describe('@getNextRelatedFile_', () => {
    it('gets next related file at the start of the sequence', async () => {
      await (async () => {
        currentFile = 'dir/Test.h';

        const jumpToRelatedFile = new (_JumpToRelatedFile || _load_JumpToRelatedFile()).default();
        expect((await jumpToRelatedFile.getNextRelatedFile(currentFile))).toEqual('dir/TestInternal.h');
      })();
    });

    it('gets next related file in the middle of the sequence', async () => {
      await (async () => {
        currentFile = 'dir/Test.m';

        const jumpToRelatedFile = new (_JumpToRelatedFile || _load_JumpToRelatedFile()).default();
        expect((await jumpToRelatedFile.getNextRelatedFile(currentFile))).toEqual('dir/Test.h');
      })();
    });

    it('gets next related file at the end of the sequence', async () => {
      await (async () => {
        currentFile = 'dir/TestInternal.h';

        const jumpToRelatedFile = new (_JumpToRelatedFile || _load_JumpToRelatedFile()).default();
        expect((await jumpToRelatedFile.getNextRelatedFile(currentFile))).toEqual('dir/Test.m');
      })();
    });
  });

  describe('@getPreviousRelatedFile_', () => {
    it('gets previous related file at the start of the sequence', async () => {
      await (async () => {
        currentFile = 'dir/Test.h';

        const jumpToRelatedFile = new (_JumpToRelatedFile || _load_JumpToRelatedFile()).default();
        expect((await jumpToRelatedFile.getPreviousRelatedFile(currentFile))).toEqual('dir/Test.m');
      })();
    });

    it('gets previous related file in the middle of the sequence', async () => {
      await (async () => {
        currentFile = 'dir/Test.m';

        const jumpToRelatedFile = new (_JumpToRelatedFile || _load_JumpToRelatedFile()).default();
        expect((await jumpToRelatedFile.getPreviousRelatedFile(currentFile))).toEqual('dir/TestInternal.h');
      })();
    });

    it('gets previous related file at the end of the sequence', async () => {
      await (async () => {
        currentFile = 'dir/TestInternal.h';

        const jumpToRelatedFile = new (_JumpToRelatedFile || _load_JumpToRelatedFile()).default();
        expect((await jumpToRelatedFile.getPreviousRelatedFile(currentFile))).toEqual('dir/Test.h');
      })();
    });

    it('does nothing for missing files', async () => {
      await (async () => {
        currentFile = 'dir/Test.h~';

        const jumpToRelatedFile = new (_JumpToRelatedFile || _load_JumpToRelatedFile()).default();
        expect((await jumpToRelatedFile.getPreviousRelatedFile(currentFile))).toEqual('dir/Test.h~');
      })();
    });
  });
});