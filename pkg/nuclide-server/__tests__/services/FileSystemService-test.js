'use strict';

var _ServiceTestHelper;

function _load_ServiceTestHelper() {
  return _ServiceTestHelper = _interopRequireDefault(require('../../__mocks__/services/ServiceTestHelper'));
}

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _rimraf;

function _load_rimraf() {
  return _rimraf = _interopRequireDefault(require('rimraf'));
}

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(_temp || _load_temp()).default.track(); /**
                                          * Copyright (c) 2015-present, Facebook, Inc.
                                          * All rights reserved.
                                          *
                                          * This source code is licensed under the license found in the LICENSE file in
                                          * the root directory of this source tree.
                                          *
                                          * 
                                          * @format
                                          */

const pathToTestDir = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../../__mocks__/testfiles');
const pathToTestFile = (_nuclideUri || _load_nuclideUri()).default.join(pathToTestDir, 'testfile.txt');
const pathToWriteFile = pathToTestFile + '.1';
const pathToLinkFile = pathToTestFile + '.2';
const pathToBrokenLinkFile = pathToTestFile + '.3';
const pathToMissingFile = pathToTestFile + '.oops';

describe('FileSystemService', () => {
  let testHelper;
  let service;
  beforeEach(async () => {
    testHelper = new (_ServiceTestHelper || _load_ServiceTestHelper()).default();
    const FILE_SYSTEM_SERVICE_PATH = require.resolve('../../lib/services/FileSystemService');
    await testHelper.start([{
      name: 'FileSystemService',
      definition: FILE_SYSTEM_SERVICE_PATH,
      implementation: FILE_SYSTEM_SERVICE_PATH
    }]);
    service = testHelper.getRemoteService('FileSystemService');
  });

  it('can readFile', async () => {
    const body = await service.readFile(pathToTestFile);
    expect(body.toString()).toEqual("I'm a little teapot.\n");
  });

  it('returns 500 code if file cannot be opened', async () => {
    let err;
    try {
      await service.readFile(pathToMissingFile);
    } catch (e) {
      err = e;
    }

    if (!(err != null)) {
      throw new Error('Invariant violation: "err != null"');
    }

    expect(err).toMatch('ENOENT');
  });

  it('can writeFile', async () => {
    await (async () => {
      await service.writeFile(pathToWriteFile, "I'm a little teapot.\n");
      expect(_fs.default.readFileSync(pathToWriteFile).toString()).toEqual("I'm a little teapot.\n");
    })();
  });

  function normalizeStat(stat) {
    // Access time will naturally differ between calls.
    delete stat.atime;
    // "Ms" fields are new to Node 8 and are not currently supported.
    Object.keys(stat).forEach(key => {
      if (key.endsWith('Ms')) {
        delete stat[key];
      }
    });
  }

  it('can stat', async () => {
    await (async () => {
      const stats = await service.stat(pathToTestFile);
      const expected = _fs.default.statSync(pathToTestFile);
      expect(normalizeStat(stats)).toEqual(normalizeStat(expected));
    })();
  });

  it('can readdir', async () => {
    await (async () => {
      _fs.default.symlinkSync(pathToTestFile, pathToLinkFile, 'file');
      _fs.default.symlinkSync(pathToMissingFile, pathToBrokenLinkFile, 'file');
      const entries = await service.readdir(pathToTestDir);
      expect(entries.length).toBe(2); // Skips broken link
      entries.sort((a, b) => {
        return a[0].localeCompare(b[0]);
      });

      expect(entries[0]).toEqual(['testfile.txt', true, false]);
      expect(entries[1]).toEqual(['testfile.txt.2', true, true]);
    })();
  });

  it('can readdirSorted', async () => {
    await (async () => {
      _fs.default.symlinkSync(pathToTestFile, pathToLinkFile, 'file');
      _fs.default.symlinkSync(pathToMissingFile, pathToBrokenLinkFile, 'file');
      const entries = await service.readdirSorted(pathToTestDir);
      expect(entries.length).toBe(2); // Skips broken link
      expect(entries[0]).toEqual(['testfile.txt', true, false]);
      expect(entries[1]).toEqual(['testfile.txt.2', true, true]);
    })();
  });

  it('can lstat', async () => {
    await (async () => {
      _fs.default.symlinkSync(pathToTestFile, pathToLinkFile, 'file');
      const lstats = await service.lstat(pathToLinkFile);
      const expected = _fs.default.lstatSync(pathToLinkFile);
      expect(normalizeStat(lstats)).toEqual(normalizeStat(expected));
    })();
  });

  it('returns false from exists if file missing', async () => {
    await (async () => {
      const exists = await service.exists(pathToMissingFile);
      expect(exists).toBe(false);
    })();
  });

  it('returns true from exists if file exists', async () => {
    await (async () => {
      const exists = await service.exists(pathToTestFile);
      expect(exists).toBe(true);
    })();
  });

  describe('newFile()', () => {
    let dirPath = null;

    beforeEach(() => {
      dirPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'newFile_test');
    });

    afterEach(() => {
      (_rimraf || _load_rimraf()).default.sync(dirPath);
    });

    it('creates the file and the expected subdirectories', async () => {
      await (async () => {
        const newPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo/bar/baz.txt');
        expect(_fs.default.existsSync(newPath)).toBe(false);
        const isNew = await service.newFile(newPath);
        expect(_fs.default.existsSync(newPath)).toBe(true);
        expect(_fs.default.statSync(newPath).isFile()).toBe(true);
        expect(_fs.default.readFileSync(newPath).toString()).toBe('');
        expect(isNew).toBe(true);
      })();
    });

    it('is a no-op for an existing file', async () => {
      await (async () => {
        _fs.default.mkdirSync(dirPath);
        _fs.default.mkdirSync((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo'));
        _fs.default.mkdirSync((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo/bar'));
        const newPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo/bar/baz.txt');
        _fs.default.writeFileSync(newPath, 'contents');
        expect(_fs.default.existsSync(newPath)).toBe(true);

        const isNew = await service.newFile(newPath);
        expect(_fs.default.statSync(newPath).isFile()).toBe(true);
        expect(_fs.default.readFileSync(newPath).toString()).toBe('contents');
        expect(isNew).toBe(false);
      })();
    });
  });

  describe('realpath()', () => {
    it('gets the same exact path of a normal file', async () => {
      await (async () => {
        const realpath = await service.realpath(pathToTestFile);
        expect(realpath).toBe(testHelper.getUriOfRemotePath(pathToTestFile));
      })();
    });

    it('gets the real path of a symlinked file', async () => {
      await (async () => {
        _fs.default.symlinkSync(pathToTestFile, pathToLinkFile, 'file');
        const realpath = await service.realpath(pathToLinkFile);
        expect(realpath).toBe(testHelper.getUriOfRemotePath(pathToTestFile));
      })();
    });
  });

  describe('rename()', () => {
    let dirPath;

    beforeEach(() => {
      dirPath = (_temp || _load_temp()).default.mkdirSync('rename_test');
    });

    it('succeeds when renaming a file', async () => {
      await (async () => {
        const sourcePath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'file');
        _fs.default.writeFileSync(sourcePath, '');
        const destinationPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'destination_file');

        await service.rename(sourcePath, destinationPath);

        expect(_fs.default.existsSync(sourcePath)).toBe(false);
        expect(_fs.default.existsSync(destinationPath)).toBe(true);
      })();
    });

    it('succeeds when renaming a folder', async () => {
      await (async () => {
        const sourcePath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'directory');
        _fs.default.mkdirSync(sourcePath);
        const destinationPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'destination_folder');

        await service.rename(sourcePath, destinationPath);

        expect(_fs.default.existsSync(sourcePath)).toBe(false);
        expect(_fs.default.existsSync(destinationPath)).toBe(true);
      })();
    });

    it('succeeds when renaming into a non-existent directory', async () => {
      await (async () => {
        const sourcePath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'file');
        _fs.default.writeFileSync(sourcePath, '');
        const destinationPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'non-existent', 'destination_file');

        await service.rename(sourcePath, destinationPath);

        expect(_fs.default.existsSync(sourcePath)).toBe(false);
        expect(_fs.default.existsSync(destinationPath)).toBe(true);
      })();
    });

    it('throws error if the source does not exist', async () => {
      await (async () => {
        const sourcePath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'file');
        const destinationPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'destination_file');

        let err;
        try {
          await service.rename(sourcePath, destinationPath);
        } catch (e) {
          err = e;
        }

        if (!(err != null)) {
          throw new Error('Invariant violation: "err != null"');
        }

        expect(err).toMatch('ENOENT');
        expect(_fs.default.existsSync(destinationPath)).toBe(false);
      })();
    });

    it('throws error if the destination exists', async () => {
      await (async () => {
        const sourcePath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'file');
        _fs.default.writeFileSync(sourcePath, '');
        const destinationPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'destination_file');
        _fs.default.writeFileSync(destinationPath, '');

        let err;
        try {
          await service.rename(sourcePath, destinationPath);
        } catch (e) {
          err = e;
        }

        if (!(err != null)) {
          throw new Error('Invariant violation: "err != null"');
        }

        expect(err).toMatch('EEXIST');
      })();
    });
  });

  describe('mkdir()', () => {
    let dirPath = null;

    beforeEach(() => {
      dirPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'mkdir_test');
    });

    afterEach(() => {
      if (_fs.default.existsSync(dirPath)) {
        _fs.default.rmdirSync(dirPath);
      }
    });

    it('creates a directory at a given path', async () => {
      await (async () => {
        expect(_fs.default.existsSync(dirPath)).toBe(false);
        await service.mkdir(dirPath);
        expect(_fs.default.existsSync(dirPath)).toBe(true);
        expect(_fs.default.statSync(dirPath).isDirectory()).toBe(true);
      })();
    });

    it('throws an error if already existing directory', async () => {
      await (async () => {
        let err;
        _fs.default.mkdirSync(dirPath);
        try {
          await service.mkdir(dirPath);
        } catch (e) {
          err = e;
        }

        if (!(err != null)) {
          throw new Error('Invariant violation: "err != null"');
        }

        expect(err).toMatch('EEXIST');
      })();
    });

    it('throws an error if the path is nested in a non-existing directory', async () => {
      await (async () => {
        let err;
        try {
          await service.mkdir((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo'));
        } catch (e) {
          err = e;
        }

        if (!(err != null)) {
          throw new Error('Invariant violation: "err != null"');
        }

        expect(err).toMatch('ENOENT');
      })();
    });
  });

  describe('mkdirp()', () => {
    let dirPath = null;

    beforeEach(() => {
      dirPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'mkdirp_test');
    });

    afterEach(() => {
      (_rimraf || _load_rimraf()).default.sync(dirPath);
    });

    it('creates the expected subdirectories', async () => {
      await (async () => {
        const newPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo/bar/baz');
        expect(_fs.default.existsSync(newPath)).toBe(false);
        const isNew = await service.mkdirp(newPath);
        expect(_fs.default.existsSync(newPath)).toBe(true);
        expect(isNew).toBe(true);
      })();
    });

    it('is a no-op for an existing directory', async () => {
      await (async () => {
        _fs.default.mkdirSync(dirPath);
        _fs.default.mkdirSync((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo'));
        _fs.default.mkdirSync((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo/bar'));
        const newPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo/bar/baz');
        _fs.default.mkdirSync(newPath);
        expect(_fs.default.existsSync(newPath)).toBe(true);

        const isNew = await service.mkdirp(newPath);
        expect(_fs.default.existsSync(newPath)).toBe(true);
        expect(isNew).toBe(false);
      })();
    });
  });

  describe('rmdir()', () => {
    let dirPath;

    beforeEach(() => {
      dirPath = (_temp || _load_temp()).default.mkdirSync('rmdir_test');
    });

    it('removes non-empty directories', async () => {
      await (async () => {
        const directoryToRemove = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo');
        await service.mkdirp((_nuclideUri || _load_nuclideUri()).default.join(directoryToRemove, 'bar'));
        expect(_fs.default.existsSync(directoryToRemove)).toBe(true);
        await service.rmdir(directoryToRemove);
        expect(_fs.default.existsSync(directoryToRemove)).toBe(false);
      })();
    });

    it('does nothing for non-existent directories', async () => {
      await (async () => {
        const directoryToRemove = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo');
        await service.rmdir(directoryToRemove);
        expect(_fs.default.existsSync(directoryToRemove)).toBe(false);
      })();
    });
  });

  describe('unlink()', () => {
    let dirPath;

    beforeEach(() => {
      dirPath = (_temp || _load_temp()).default.mkdirSync('unlink_test');
    });

    it('removes file if it exists', async () => {
      await (async () => {
        const fileToRemove = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo');
        _fs.default.writeFileSync(fileToRemove, '');
        expect(_fs.default.existsSync(fileToRemove)).toBe(true);
        await service.unlink(fileToRemove);
        expect(_fs.default.existsSync(fileToRemove)).toBe(false);
      })();
    });

    it('does nothing for non-existent files', async () => {
      await (async () => {
        const fileToRemove = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo');
        await service.unlink(fileToRemove);
        expect(_fs.default.existsSync(fileToRemove)).toBe(false);
      })();
    });
  });

  describe('chmod()', () => {
    let dirPath = null;
    let testFilePath = null;

    beforeEach(() => {
      dirPath = (_temp || _load_temp()).default.mkdirSync('chmod_test');
      testFilePath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo');
      _fs.default.writeFileSync(testFilePath, '');
      _fs.default.chmodSync(testFilePath, '0644');
    });

    afterEach(() => {
      if (dirPath != null) {
        service.rmdir(dirPath);
      }
    });

    it.skip('can change permissions', async () => {
      await (async () => {
        if (!(testFilePath != null)) {
          throw new Error('Invariant violation: "testFilePath != null"');
        }
        // chmod 0777


        await service.chmod(testFilePath, 511);
        expect(_fs.default.statSync(testFilePath).mode % 512).toBe(511);
      })();
    });
  });

  describe('findNearestAncestorNamed', () => {
    let dirPath = null;

    beforeEach(() => {
      dirPath = (_temp || _load_temp()).default.mkdirSync('findNearestAncestorNamed_test');
      _fs.default.mkdirSync((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo'));
      _fs.default.mkdirSync((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', 'bar'));
      _fs.default.mkdirSync((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', 'bar', 'baz'));
      _fs.default.mkdirSync((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'boo'));
      const filePaths = [(_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', 'BUCK'), (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', 'bar', 'baz', 'BUCK')];
      filePaths.forEach(filePath => _fs.default.writeFileSync(filePath, 'any contents'));
    });

    it.skip('findNearestAncestorNamed in dir', async () => {
      const pathToDirectory1 = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo');
      const nearestFile1 = await service.findNearestAncestorNamed('BUCK', pathToDirectory1);
      expect(nearestFile1).toBe((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', 'BUCK'));

      const pathToDirectory2 = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', 'bar', 'baz');
      const nearestFile2 = await service.findNearestAncestorNamed('BUCK', pathToDirectory2);
      expect(nearestFile2).toBe((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', 'bar', 'baz', 'BUCK'));
    });

    it.skip('findNearestAncestorNamed in ancestor', async () => {
      const pathToDirectory = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', 'bar');
      const nearestFile = await service.findNearestAncestorNamed('BUCK', pathToDirectory);
      expect(nearestFile).toBe((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', 'BUCK'));
    });

    it('findNearestAncestorNamed not in ancestor', async () => {
      const pathToDirectory = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'boo');
      const nearestFile = await service.findNearestAncestorNamed('BUCK', pathToDirectory);
      expect(nearestFile).toBe(null);
    });
  });

  describe('findFilesInDirectories()', () => {
    let dirPath = null;
    let fileName = null;
    let filePaths = null;

    function toLocalPaths(fileUris) {
      return fileUris.map(fileUri => (_nuclideUri || _load_nuclideUri()).default.getPath(fileUri));
    }

    beforeEach(() => {
      dirPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, 'find_in_dir');
      fileName = 'file.txt';

      _fs.default.mkdirSync(dirPath);
      _fs.default.mkdirSync((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo'));
      _fs.default.mkdirSync((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', 'bar'));
      _fs.default.mkdirSync((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'baz'));
      // A directory with the same file name won't be matched.
      _fs.default.mkdirSync((_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', fileName));

      filePaths = [(_nuclideUri || _load_nuclideUri()).default.join(dirPath, fileName), (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'baz', fileName), (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'baz', 'other_file1'), (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', 'other_file2'), (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', 'bar', 'other_file3'), (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo', 'bar', fileName)];
      filePaths.forEach(filePath => _fs.default.writeFileSync(filePath, 'any contents'));
    });

    afterEach(() => {
      (_rimraf || _load_rimraf()).default.sync(dirPath);
    });

    it('errors when no search directories are provided', async () => {
      let error;
      try {
        await service.findFilesInDirectories([], fileName).refCount().toPromise();
      } catch (e) {
        error = e;
      }
      expect(error != null).toBeTruthy();
    });

    it('return empty list when no files are matching', async () => {
      await (async () => {
        const foundFiles = await service.findFilesInDirectories([dirPath], 'not_existing').refCount().toPromise();
        expect(foundFiles.length).toBe(0);
      })();
    });

    it('return matching file names in a directory (& nested directories)', async () => {
      const foundFiles = await service.findFilesInDirectories([dirPath], fileName).refCount().toPromise();
      expect(foundFiles.length).toBe(3);
      expect(toLocalPaths(foundFiles).sort()).toEqual([filePaths[0], filePaths[1], filePaths[5]].sort());
    });

    it('return matching file names in specific search directories', async () => {
      const foundFiles = await service.findFilesInDirectories([(_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'baz'), (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'foo')], fileName).refCount().toPromise();
      expect(foundFiles.length).toBe(2);
      expect(toLocalPaths(foundFiles).sort()).toEqual([filePaths[1], filePaths[5]].sort());
    });
  });

  afterEach(() => {
    if (!testHelper) {
      throw new Error('Invariant violation: "testHelper"');
    }

    testHelper.stop();
    if (_fs.default.existsSync(pathToWriteFile)) {
      _fs.default.unlinkSync(pathToWriteFile);
    }
    if (_fs.default.existsSync(pathToLinkFile)) {
      _fs.default.unlinkSync(pathToLinkFile);
    }
    try {
      _fs.default.unlinkSync(pathToBrokenLinkFile);
    } catch (e) {
      /* exists can't check for broken symlinks, just absorb the error for cleanup */
    }
  });
});