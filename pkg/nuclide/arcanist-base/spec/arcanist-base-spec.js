'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var arcanist = require('../lib/ArcanistBaseService');
var path = require('path');
var fs = require('fs-plus');
var temp = require('temp').track();

import {uncachedRequire} from 'nuclide-test-helpers';

var rootConfig = {
  'project_id': 'project1',
};
var nestedConfig = {
  'project_id': 'project-nested',
};

describe('nuclide-arcanist-base', () => {
  var rootPath: any;
  var dirPath: any;
  var file1Path: any;
  var file2Path: any;
  var nestedPath: any;
  var tempPath: any;

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

  describe('findDiagnostics', () => {
    // Map from fake arc config dir to fake files within it.
    const filePathMap: Map<string, Array<string>> = new Map([
      ['/fake/path/one', [
        'path1',
        'path2',
        '/fake/path/one/path1',
      ]],
      ['/fake/path/two', [
        'foo',
        'bar',
      ]],
    ]);
    let arcResult: any;
    let execArgs: any;
    let arcanistBaseService: any;

    function setResult(result) {
      arcResult = {stdout: JSON.stringify(result)};
    }

    beforeEach(() => {
      setResult({});
      execArgs = [];
      spyOn(require('nuclide-commons'), 'asyncExecute').andCallFake((command, args, options) => {
        execArgs.push(args);
        return arcResult;
      });
      arcanistBaseService = (uncachedRequire(require, '../lib/ArcanistBaseService'): any);
      // Add these paths to the arcConfigDirectoryMap as a roundabout way to mock
      // findArcConfigDirectory.
      for (const [arcDir, filePaths] of filePathMap) {
        for (const filePath of filePaths) {
          arcanistBaseService.arcConfigDirectoryMap.set(filePath, arcDir);
        }
      }
    });

    it('should call `arc lint` with the paths', () => {
      waitsForPromise(async () => {
        const filePaths = filePathMap.get('/fake/path/one');
        expect(filePaths.length).toBe(3);
        await arcanistBaseService.findDiagnostics(filePaths);
        // Expect arc lint to be called once
        expect(execArgs.length).toBe(1);
        for (const filePath of filePaths) {
          expect(execArgs[0].indexOf(filePath)).toBeGreaterThan(-1);
        }
      });
    });

    it('should call `arc lint` separately for paths in different arc config dirs', () => {
      waitsForPromise(async () => {
        const filePaths = ['path1', 'foo'];
        await arcanistBaseService.findDiagnostics(filePaths);
        // Expect arc lint to be called twice.
        expect(execArgs.length).toBe(2);
        let path1Args;
        let fooArgs;
        if (execArgs[0].indexOf('path1') !== -1) {
          [path1Args, fooArgs] = execArgs;
        } else {
          [fooArgs, path1Args] = execArgs;
        }
        expect(path1Args.indexOf('path1')).toBeGreaterThan(-1);
        expect(fooArgs.indexOf('foo')).toBeGreaterThan(-1);
      });
    });

    it('should return the lints', () => {
      waitsForPromise(async () => {
        setResult({
          'path1': [
            {
              'description' : 'Trailing spaces not allowed. (no-trailing-spaces)',
              'severity' : 'warning',
              'original' : null,
              'line' : 78,
              'bypassChangedLineFiltering' : null,
              'name' : 'ESLint reported a warning.',
              'granularity' : 1,
              'locations' : [],
              'replacement' : null,
              'code' : 'FBNUCLIDELINT1',
              'char' : 2,
              'context' : 'this usually contains some nearby code',
            },
          ],
        });
        const lints = await arcanistBaseService.findDiagnostics(['/fake/path/one/path1']);
        expect(lints).toEqual([
          {
            type: 'Warning',
            text: 'Trailing spaces not allowed. (no-trailing-spaces)',
            filePath: '/fake/path/one/path1',
            row: 77,
            col: 1,
            code: 'FBNUCLIDELINT1',
          },
        ]);
      });
    });
  });
});
