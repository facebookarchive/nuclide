'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var path = require('path');
var fs = require('fs');
var temp = require('temp').track();
var {findNearestFile} = require('../lib/main');

describe('filesystem test suite', () => {

  describe('findNearestFile()', () => {
    var dirPath: any;
    var nestedDirPath: any;
    var fileName: any;
    var filePath;

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
        var foundPath = await findNearestFile(fileName, dirPath);
        expect(foundPath).toBe(dirPath);
      });
    });

    it('find the file if given a nested directory', () => {
      waitsForPromise(async () => {
        var foundPath = await findNearestFile(fileName, nestedDirPath);
        expect(foundPath).toBe(dirPath);
      });
    });

    it('does not find the file if not existing', () => {
      waitsForPromise(async () => {
        var foundPath = await findNearestFile('non-existent.txt', nestedDirPath);
        expect(foundPath).toBe(null);
      });
    });
  });

});
