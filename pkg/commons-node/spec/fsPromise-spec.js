'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fs from 'fs';
import nuclideUri from '../../nuclide-remote-uri';
import temp from 'temp';
import fsPromise from '../fsPromise';

describe('fsPromise test suite', () => {

  describe('findNearestFile()', () => {
    let dirPath: any;
    let nestedDirPath: any;
    let fileName: any;
    let filePath;

    beforeEach(() => {
      temp.track();
      dirPath = temp.mkdirSync('nearest_test');
      nestedDirPath = nuclideUri.join(dirPath, 'nested_dir');
      fs.mkdirSync(nestedDirPath);
      fileName = '.some_file';
      filePath = nuclideUri.join(dirPath, fileName);
      fs.writeFileSync(filePath, 'just a file');
    });

    it('find the file if given the exact directory', () => {
      waitsForPromise(async () => {
        const foundPath = await fsPromise.findNearestFile(fileName, dirPath);
        expect(foundPath).toBe(dirPath);
      });
    });

    it('find the file if given a nested directory', () => {
      waitsForPromise(async () => {
        const foundPath = await fsPromise.findNearestFile(fileName, nestedDirPath);
        expect(foundPath).toBe(dirPath);
      });
    });

    it('does not find the file if not existing', () => {
      waitsForPromise(async () => {
        const foundPath = await fsPromise.findNearestFile('non-existent.txt', nestedDirPath);
        expect(foundPath).toBe(null);
      });
    });
  });

  describe('getCommonAncestorDirectory', () => {
    it('gets the parent directory', () => {
      expect(fsPromise.getCommonAncestorDirectory([
        '/foo/bar.txt',
        '/foo/baz/lol.txt',
      ])).toBe('/foo');
      expect(fsPromise.getCommonAncestorDirectory([
        '/foo/bar/abc/def/abc.txt',
        '/foo/bar/lol.txt',
      ])).toBe('/foo/bar');
    });
  });

});
