'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import RelatedFileFinder from '../lib/RelatedFileFinder';
import {expectAsyncFailure} from '../../nuclide-test-helpers';

function mockFiles(files: Array<string>) {
  spyOn(require('../../nuclide-remote-connection'), 'getServiceByNuclideUri').andReturn({
    readdir: async () => {
      return files.map(file => {
        return {file, stats: {isFile: () => true}};
      });
    },
  });
}

describe('RelatedFileFinder', () => {

  describe('@find', () => {
    it('finds related file with a different extension', () => {
      waitsForPromise(async () => {
        mockFiles(['Test.h', 'Test.m']);
        const relatedFileFinder = new RelatedFileFinder();

        expect(await relatedFileFinder.find('dir/Test.m')).toEqual({
          relatedFiles: ['dir/Test.h', 'dir/Test.m'],
          index: 1,
        });
      });
    });

    it('finds related file whose name ends with `Internal`', () => {
      waitsForPromise(async () => {
        mockFiles(['Test.m', 'TestInternal.h']);
        const relatedFileFinder = new RelatedFileFinder();

        expect(await relatedFileFinder.find('dir/Test.m')).toEqual({
          relatedFiles: ['dir/Test.m', 'dir/TestInternal.h'],
          index: 0,
        });
      });
    });

    it('finds related file whose name ends with `-inl`', () => {
      waitsForPromise(async () => {
        mockFiles(['Test.h', 'Test-inl.h']);
        const relatedFileFinder = new RelatedFileFinder();

        expect(await relatedFileFinder.find('dir/Test.h')).toEqual({
          relatedFiles: ['dir/Test-inl.h', 'dir/Test.h'],
          index: 1,
        });
      });
    });

    it('does not find related file whose name starts with `Internal`', () => {
      waitsForPromise(async () => {
        mockFiles(['Test.m', 'InternalTest.h']);
        const relatedFileFinder = new RelatedFileFinder();

        expect(await relatedFileFinder.find('dir/Test.m')).toEqual({
          relatedFiles: ['dir/Test.m'],
          index: 0,
        });
      });
    });

    it('throws an error if given path is not in `relatedFiles`', () => {
      waitsForPromise(async () => {
        mockFiles([]);
        const relatedFileFinder = new RelatedFileFinder();

        await expectAsyncFailure(
          relatedFileFinder.find('dir/Test.m'),
          e => {
            expect(e).toEqual(new Error('Given path must be in `relatedFiles`: dir/Test.m'));
          },
        );
      });
    });
  });

});
