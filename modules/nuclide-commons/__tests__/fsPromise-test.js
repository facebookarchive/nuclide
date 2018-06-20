'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../nuclideUri'));
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../fsPromise'));
}

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../test-helpers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */

(_temp || _load_temp()).default.track();

describe('fsPromise test suite', () => {
  describe('findNearestFile()', () => {
    let dirPath = null;

    beforeEach(async () => {
      await (async () => {
        dirPath = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('nearest_test', new Map([['.some_file', 'just some file'], ['nested_dir/.another_file', 'just another file']]));
      })();
    });

    it('find the file if given the exact directory', async () => {
      await (async () => {
        const foundPath = await (_fsPromise || _load_fsPromise()).default.findNearestFile('.some_file', dirPath);
        expect(foundPath).toBe(dirPath);
      })();
    });

    it('find the file if given a nested directory', async () => {
      await (async () => {
        const foundPath = await (_fsPromise || _load_fsPromise()).default.findNearestFile('.some_file', (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'nested_dir'));
        expect(foundPath).toBe(dirPath);
      })();
    });

    it('does not find the file if not existing', async () => {
      await (async () => {
        const foundPath = await (_fsPromise || _load_fsPromise()).default.findNearestFile('non-existent.txt', (_nuclideUri || _load_nuclideUri()).default.join(dirPath, 'nested_dir'));
        expect(foundPath).toBe(null);
      })();
    });
  });

  describe('findFurthestFile()', () => {
    let dirPath = null;

    beforeEach(async () => {
      await (async () => {
        dirPath = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('furthest_test', new Map([['0/.some_file', 'just a file'], ['0/1/.some_file', 'just b file'],
        // Skip one file to test consecutive vs non-consecutive.
        // ['0/1/2', 'just c file'],
        ['0/1/2/3/.some_file', 'just d file'], ['0/1/2/3/4/.some_file', 'just f file']]));
      })();
    });

    it('find the file if given the exact directory', async () => {
      await (async () => {
        const expectedPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, '0');
        const foundPath = await (_fsPromise || _load_fsPromise()).default.findFurthestFile('.some_file', expectedPath);
        expect(foundPath).toBe(expectedPath);
      })();
    });

    it('finds the furthest file if given a nested directory', async () => {
      await (async () => {
        const expectedPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, '0');
        const startPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, '0/1/2/3/4');
        const foundPath = await (_fsPromise || _load_fsPromise()).default.findFurthestFile('.some_file', startPath);
        expect(foundPath).toBe(expectedPath);
      })();
    });

    it('terminates search as soon as file is not found if given the stopOnMissing flag', async () => {
      await (async () => {
        const expectedPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, '0/1/2/3');
        const startPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, '0/1/2/3/4');
        const foundPath = await (_fsPromise || _load_fsPromise()).default.findFurthestFile('.some_file', startPath, true /* stopOnMissing */
        );
        expect(foundPath).toBe(expectedPath);
      })();
    });

    it('does not find the file if not existing', async () => {
      await (async () => {
        const startPath = (_nuclideUri || _load_nuclideUri()).default.join(dirPath, '0/1/2/3/4');
        const foundPath = await (_fsPromise || _load_fsPromise()).default.findFurthestFile('non-existent.txt', startPath);
        expect(foundPath).toBe(null);
      })();
    });
  });

  describe('getCommonAncestorDirectory', () => {
    it('gets the parent directory', () => {
      expect((_fsPromise || _load_fsPromise()).default.getCommonAncestorDirectory(['/foo/bar.txt', '/foo/baz/lol.txt'])).toBe('/foo');
      expect((_fsPromise || _load_fsPromise()).default.getCommonAncestorDirectory(['/foo/bar/abc/def/abc.txt', '/foo/bar/lol.txt'])).toBe('/foo/bar');
    });
  });

  describe('writeFileAtomic', () => {
    let pathToWriteFile;
    beforeEach(() => {
      const tempDir = (_temp || _load_temp()).default.mkdirSync();
      pathToWriteFile = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'test');
    });

    it('can write to a file', async () => {
      await (async () => {
        await (_fsPromise || _load_fsPromise()).default.writeFileAtomic(pathToWriteFile, "I'm a little teapot.\n");
        expect(_fs.default.readFileSync(pathToWriteFile).toString()).toEqual("I'm a little teapot.\n");
        // eslint-disable-next-line no-bitwise
        expect(_fs.default.statSync(pathToWriteFile).mode & 0o777).toEqual(0o666 & ~process.umask() // eslint-disable-line no-bitwise
        );
      })();
    });

    it('calls mkdirp', async () => {
      await (async () => {
        const subPath = (_nuclideUri || _load_nuclideUri()).default.join(pathToWriteFile, 'test');
        await (_fsPromise || _load_fsPromise()).default.writeFileAtomic(subPath, 'test1234\n');
        expect(_fs.default.readFileSync(subPath).toString()).toEqual('test1234\n');
      })();
    });

    it('preserves permissions on files', async () => {
      _fs.default.writeFileSync(pathToWriteFile, 'test');
      _fs.default.chmodSync(pathToWriteFile, 0o700);

      await (async () => {
        await (_fsPromise || _load_fsPromise()).default.writeFileAtomic(pathToWriteFile, 'test2');
        expect(_fs.default.readFileSync(pathToWriteFile).toString()).toEqual('test2');
        const stat = _fs.default.statSync(pathToWriteFile);
        // eslint-disable-next-line no-bitwise
        expect(stat.mode & 0o777).toEqual(0o700);
      })();
    });

    it('errors if file cannot be written', async () => {
      await (async () => {
        let err;
        try {
          await (_fsPromise || _load_fsPromise()).default.writeFileAtomic(pathToWriteFile + '/that/is/missing/', 'something');
        } catch (e) {
          err = e;
        }

        if (!(err != null)) {
          throw new Error('Expected an error');
        }
      })();
    });
  });
});