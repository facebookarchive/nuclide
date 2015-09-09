'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var RelatedFileFinder = require('../lib/RelatedFileFinder');

describe('RelatedFileFinder', () => {

  describe('@find', () => {
    it('finds related file with a different extension', () => {
      var fs = require('fs');
      spyOn(fs, 'readdirSync').andReturn([
        'Test.h',
        'Test.m',
      ]);
      var relatedFileFinder = new RelatedFileFinder();

      expect(relatedFileFinder.find('dir/Test.m')).toEqual({
        relatedFiles: ['dir/Test.h', 'dir/Test.m'],
        index: 1,
      });
    });

    it('finds related file whose name ends with `Internal`', () => {
      var fs = require('fs');
      spyOn(fs, 'readdirSync').andReturn([
        'TestInternal.h',
        'Test.m',
      ]);
      var relatedFileFinder = new RelatedFileFinder();

      expect(relatedFileFinder.find('dir/Test.m')).toEqual({
        relatedFiles: ['dir/Test.m', 'dir/TestInternal.h'],
        index: 0,
      });
    });

    it('does not find related file whose name starts with `Internal`', () => {
      var fs = require('fs');
      spyOn(fs, 'readdirSync').andReturn([
        'InternalTest.h',
        'Test.m',
      ]);
      var relatedFileFinder = new RelatedFileFinder();

      expect(relatedFileFinder.find('dir/Test.m')).toEqual({
        relatedFiles: ['dir/Test.m'],
        index: 0,
      });
    });

    it('throws an error if given path is not in `relatedFiles`', () => {
      var fs = require('fs');
      spyOn(fs, 'readdirSync').andReturn([]);
      var relatedFileFinder = new RelatedFileFinder();

      expect(() => relatedFileFinder.find('dir/Test.m'))
          .toThrow(new Error('Given path must be in `relatedFiles`: dir/Test.m'));
    });
  });

});
