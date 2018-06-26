'use strict';

var _RelatedFileFinder;

function _load_RelatedFileFinder() {
  return _RelatedFileFinder = _interopRequireDefault(require('../lib/RelatedFileFinder'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

jest.mock('../../nuclide-remote-connection', () => ({
  getFileSystemServiceByNuclideUri: jest.fn()
})); /**
      * Copyright (c) 2015-present, Facebook, Inc.
      * All rights reserved.
      *
      * This source code is licensed under the license found in the LICENSE file in
      * the root directory of this source tree.
      *
      *  strict-local
      * @format
      */

function mockFiles(files) {
  // $FlowFixMe
  (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri.mockReturnValue({
    readdir: async () => {
      return files.map(name => {
        return [name, true, false];
      });
    }
  });
}

describe('RelatedFileFinder', () => {
  describe('@find', () => {
    it('finds related file with a different extension', async () => {
      mockFiles(['Test.h', 'Test.m', 'Test.m~']);
      expect((await (_RelatedFileFinder || _load_RelatedFileFinder()).default.find('dir/Test.m'))).toEqual({
        relatedFiles: ['dir/Test.h', 'dir/Test.m'],
        index: 1
      });
    });

    it('finds related file whose name ends with `Internal`', async () => {
      mockFiles(['Test.m', 'TestInternal.h']);
      expect((await (_RelatedFileFinder || _load_RelatedFileFinder()).default.find('dir/Test.m'))).toEqual({
        relatedFiles: ['dir/Test.m', 'dir/TestInternal.h'],
        index: 0
      });
    });

    it('finds related file whose name ends with `-inl`', async () => {
      mockFiles(['Test.h', 'Test-inl.h']);
      expect((await (_RelatedFileFinder || _load_RelatedFileFinder()).default.find('dir/Test.h'))).toEqual({
        relatedFiles: ['dir/Test-inl.h', 'dir/Test.h'],
        index: 1
      });
    });

    it('does not find related file whose name starts with `Internal`', async () => {
      mockFiles(['Test.m', 'InternalTest.h']);
      expect((await (_RelatedFileFinder || _load_RelatedFileFinder()).default.find('dir/Test.m'))).toEqual({
        relatedFiles: ['dir/Test.m'],
        index: 0
      });
    });

    it('finds related file whose name ends with `t` and itself', async () => {
      mockFiles(['Test.m', 'Test.v', 'Test.t']);
      expect((await (_RelatedFileFinder || _load_RelatedFileFinder()).default.find('dir/Test.m', new Set(['.t'])))).toEqual({
        relatedFiles: ['dir/Test.m', 'dir/Test.t'],
        index: 0
      });
    });

    it('finds related file but nothing and then return all', async () => {
      mockFiles(['Test.m', 'Test.v', 'Test.t']);
      expect((await (_RelatedFileFinder || _load_RelatedFileFinder()).default.find('dir/Test.m', new Set(['.o'])))).toEqual({
        relatedFiles: ['dir/Test.m', 'dir/Test.t', 'dir/Test.v'],
        index: 0
      });
    });

    it('finds related file but only itself', async () => {
      mockFiles(['Test.m', 'Test.v', 'Test.t']);
      expect((await (_RelatedFileFinder || _load_RelatedFileFinder()).default.find('dir/Test.m', new Set(['.m'])))).toEqual({
        relatedFiles: ['dir/Test.m'],
        index: 0
      });
    });

    it('finds related file from a provider', async () => {
      (_RelatedFileFinder || _load_RelatedFileFinder()).default.registerRelatedFilesProvider({
        getRelatedFiles(path) {
          return Promise.resolve(['dir/Related.h']);
        }
      });
      mockFiles(['Test.m', 'Related.h', 'Test.h']);
      expect((await (_RelatedFileFinder || _load_RelatedFileFinder()).default.find('dir/Test.m'))).toEqual({
        relatedFiles: ['dir/Related.h', 'dir/Test.h', 'dir/Test.m'],
        index: 2
      });
    });

    it('returns result even with bad provider', async () => {
      // relies on the 1 second timeout in RFF._findRelatedFilesFromProviders
      (_RelatedFileFinder || _load_RelatedFileFinder()).default.registerRelatedFilesProvider({
        getRelatedFiles(path) {
          // return a promise that never calls resolve.
          return new Promise(resolve => {});
        }
      });
      // copy an earlier test
      mockFiles(['Test.m', 'Test.v', 'Test.t']);
      expect((await (_RelatedFileFinder || _load_RelatedFileFinder()).default.find('dir/Test.m', new Set(['.t'])))).toEqual({
        relatedFiles: ['dir/Test.m', 'dir/Test.t'],
        index: 0
      });
    });
  });
});