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

temp.track();

describe('fsPromise test suite', () => {

  describe('findNearestFile()', () => {
    let dirPath: any;
    let nestedDirPath: any;
    let fileName: any;
    let filePath;

    beforeEach(() => {
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

  describe('findFurthestFile()', () => {
    let dirPath;
    let fileName;

    beforeEach(() => {
      dirPath = temp.mkdirSync('furthest_test');
      fileName = '.some_file';

      let currPath = dirPath;
      for (let i = 0; i < 5; i++) {
        currPath = nuclideUri.join(currPath, `${i}`);
        fs.mkdirSync(currPath);
        // Skip one file to test consecutive vs non-consecutive.
        if (i !== 2) {
          const filePath = nuclideUri.join(currPath, fileName);
          fs.writeFileSync(filePath, 'just a file');
        }
      }
    });

    it('find the file if given the exact directory', () => {
      waitsForPromise(async () => {
        const expectedPath = nuclideUri.join(dirPath, '0');
        const foundPath = await fsPromise.findFurthestFile(fileName, expectedPath);
        expect(foundPath).toBe(expectedPath);
      });
    });

    it('finds the furthest file if given a nested directory', () => {
      waitsForPromise(async () => {
        const expectedPath = nuclideUri.join(dirPath, '0');
        const startPath = nuclideUri.join(dirPath, '0/1/2/3/4');
        const foundPath = await fsPromise.findFurthestFile(fileName, startPath);
        expect(foundPath).toBe(expectedPath);
      });
    });

    it('terminates search as soon as file is not found if given the stopOnMissing flag', () => {
      waitsForPromise(async () => {
        const expectedPath = nuclideUri.join(dirPath, '0/1/2/3');
        const startPath = nuclideUri.join(dirPath, '0/1/2/3/4');
        const foundPath = await fsPromise.findFurthestFile(
          fileName,
          startPath,
          true /* stopOnMissing */,
        );
        expect(foundPath).toBe(expectedPath);
      });
    });

    it('does not find the file if not existing', () => {
      waitsForPromise(async () => {
        const startPath = nuclideUri.join(dirPath, '0/1/2/3/4');
        const foundPath = await fsPromise.findFurthestFile('non-existent.txt', startPath);
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
