'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var arcanist = require('../lib/main');
var path = require('path');
var fs = require('fs-plus');
var temp = require('temp').track();

var rootConfig = {
  'project_id': 'project1',
};
var nestedConfig = {
  'project_id': 'project-nested',
};

describe('nuclide-arcanist-base', () => {
  var rootPath;
  var dirPath;
  var file1Path;
  var file2Path;
  var nestedPath;
  var tempPath;

  beforeEach(() => {
    waitsForPromise(async () => {
      // Copy the contents of 'fixtures' into a temp directory
      // ... and rename any .arcconfig.test -> .arcconfig
      tempPath = fs.absolute(temp.mkdirSync());
      var fixturesPath = path.join(__dirname, 'fixtures');
      fs.copySync(fixturesPath, tempPath);

      function adjustArcConfig(dir: string) {
        fs.renameSync(
          path.join(dir, '.arcconfig.test'),
          path.join(dir, '.arcconfig'));
      }

      adjustArcConfig(path.join(tempPath, 'arc'));
      adjustArcConfig(path.join(tempPath, 'arc', 'nested-project'));

      rootPath = path.join(tempPath, 'arc');
      dirPath = path.join(rootPath, 'dir1');
      file1Path = path.join(dirPath, 'file1');
      file2Path = path.join(rootPath, 'file2');
      nestedPath = path.join(rootPath, 'nested-project');
    });
  });

  afterEach(() => {
    temp.cleanup();
  });

  it('findArcConfigDirectory', () => {
    waitsForPromise(async () => {
      expect(await arcanist.findArcConfigDirectory(rootPath)).toBe(rootPath);
      expect(await arcanist.findArcConfigDirectory(dirPath)).toBe(rootPath);
      expect(await arcanist.findArcConfigDirectory(file1Path)).toBe(rootPath);
      expect(await arcanist.findArcConfigDirectory(file2Path)).toBe(rootPath);
      expect(await arcanist.findArcConfigDirectory(nestedPath)).toBe(nestedPath);
      expect(await arcanist.findArcConfigDirectory(tempPath)).toBe(null);
    });
  });

  it('readArcConfig', () => {
    waitsForPromise(async () => {
      expect(await arcanist.readArcConfig(rootPath)).toEqual(rootConfig);
      expect(await arcanist.readArcConfig(dirPath)).toEqual(rootConfig);
      expect(await arcanist.readArcConfig(file1Path)).toEqual(rootConfig);
      expect(await arcanist.readArcConfig(file2Path)).toEqual(rootConfig);
      expect(await arcanist.readArcConfig(nestedPath)).toEqual(nestedConfig);
      expect(await arcanist.readArcConfig(tempPath)).toEqual(null);
    });
  });

  it('findArcProjectIdOfPath', () => {
    waitsForPromise(async () => {
      expect(await arcanist.findArcProjectIdOfPath(rootPath)).toBe('project1');
      expect(await arcanist.findArcProjectIdOfPath(dirPath)).toBe('project1');
      expect(await arcanist.findArcProjectIdOfPath(file1Path)).toBe('project1');
      expect(await arcanist.findArcProjectIdOfPath(file2Path)).toBe('project1');
      expect(await arcanist.findArcProjectIdOfPath(nestedPath)).toBe('project-nested');
      expect(await arcanist.findArcProjectIdOfPath(tempPath)).toBe(null);
    });
  });

  it('getProjectRelativePath', () => {
    waitsForPromise(async () => {
      expect(await arcanist.getProjectRelativePath(rootPath)).toBe('');
      expect(await arcanist.getProjectRelativePath(dirPath)).toBe('dir1');
      expect(await arcanist.getProjectRelativePath(file1Path)).toBe('dir1/file1');
      expect(await arcanist.getProjectRelativePath(file2Path)).toBe('file2');
      expect(await arcanist.getProjectRelativePath(nestedPath)).toBe('');
      expect(await arcanist.getProjectRelativePath(tempPath)).toBe(null);
    });
  });
});
