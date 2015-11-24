'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const path = require('path');
const fs = require('fs');
const temp = require('temp').track();
import {findNearestFile, expandHomeDir} from '../lib/filesystem';

describe('filesystem test suite', () => {

  describe('findNearestFile()', () => {
    let dirPath: any;
    let nestedDirPath: any;
    let fileName: any;
    let filePath;

    beforeEach(() => {
      dirPath = temp.mkdirSync('nearest_test');
      nestedDirPath = path.join(dirPath, 'nested_dir');
      fs.mkdirSync(nestedDirPath);
      fileName = '.some_file';
      filePath = path.join(dirPath, fileName);
      fs.writeFileSync(filePath, 'just a file');
    });

    it('find the file if given the exact directory', () => {
      waitsForPromise(async () => {
        const foundPath = await findNearestFile(fileName, dirPath);
        expect(foundPath).toBe(dirPath);
      });
    });

    it('find the file if given a nested directory', () => {
      waitsForPromise(async () => {
        const foundPath = await findNearestFile(fileName, nestedDirPath);
        expect(foundPath).toBe(dirPath);
      });
    });

    it('does not find the file if not existing', () => {
      waitsForPromise(async () => {
        const foundPath = await findNearestFile('non-existent.txt', nestedDirPath);
        expect(foundPath).toBe(null);
      });
    });
  });

  describe('expandHomeDir()', () => {
    it('expands ~ to HOME', () => {
      expect(expandHomeDir('~')).toBe(process.env.HOME);
    });

    it('expands ~/ to HOME', () => {
      expect(expandHomeDir('~/abc')).toBe(path.join(process.env.HOME, 'abc'));
    });

    it('keeps ~def to ~def', () => {
      expect(expandHomeDir('~def')).toBe('~def');
    });
  });

});
