'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
var path = require('path');
var request = require('request');
var rimraf = require('rimraf');
var temp = require('temp').track();
var NuclideClient = require('../lib/NuclideClient');
var NuclideServer = require('../lib/NuclideServer');
var NuclideRemoteEventbus = require('../lib/NuclideRemoteEventbus');

var server: NuclideServer;
var client: NuclideClient;

var pathToTestDir = path.join(__dirname, 'testfiles');
var pathToTestFile = path.join(pathToTestDir, 'testfile.txt');
var pathToWriteFile = pathToTestFile + '.1';
var pathToLinkFile = pathToTestFile + '.2';
var pathToBrokenLinkFile = pathToTestFile + '.3';
var pathToMissingFile = pathToTestFile + '.oops';

describe('NuclideFs test suite', () => {
  beforeEach(() => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;
    waitsForPromise(async () => {
      server = new NuclideServer({port: 8176});
      await server.connect();
      client = new NuclideClient('test', new NuclideRemoteEventbus('http://localhost:8176'));
    });
  });

  afterEach(() => {
    client.eventbus.socket.close();
    server.close();
    if (fs.existsSync(pathToWriteFile)) {
      fs.unlinkSync(pathToWriteFile);
    }
    if (fs.existsSync(pathToLinkFile)) {
      fs.unlinkSync(pathToLinkFile);
    }
    try {
      fs.unlinkSync(pathToBrokenLinkFile);
    } catch(e) { /*exists can't check for broken symlinks, just absorb the error for cleanup*/ }
  });

  it('can readFile', () => {
    waitsForPromise(async () => {
      var body = await client.readFile(pathToTestFile);
      expect(body).toEqual('I\'m a little teapot.\n');
    });
  });

  it('returns 500 code if file cannot be opened', () => {
    waitsForPromise(async () => {
      var err;
      try {
        await client.readFile(pathToMissingFile);
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.code).toBe('ENOENT');
    });
  });

  it('returns 500 code if path not specified', () => {
    waitsForPromise(async () => {
      var err;
      try {
        await client.readFile();
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.code).toBe(500);
    });
  });

  it('returns 404 if wrong method used', () => {
    var callsStarted = 0;
    var callsFinished = 0;

    runs(() => {
      ['readFile', 'stat', 'lstat', 'exists'].forEach((call) => {
        ['post', 'del', 'head', 'put', 'patch'].forEach((verb) => {
          callsStarted += 1;
          request[verb]({
            uri: `http://localhost:8176/fs/${call}`,
            qs: { args: [pathToTestFile] },
            useQueryString: true,
          }, (error, response, body) => {
            expect(response.statusCode).toEqual(404);
            callsFinished += 1;
          });
        });
      });

      ['writeFile'].forEach((call) => {
        ['get', 'del', 'head', 'put', 'patch'].forEach((verb) => {
          callsStarted += 1;
          request({
            uri: `http://localhost:8176/fs/${call}`,
            qs: { args: [pathToTestFile] },
            useQueryString: true,
          }, (error, response, body) => {
            expect(response.statusCode).toEqual(404);
            callsFinished += 1;
          });
        });
      });
    });

    waitsFor(() => {
      return callsStarted === callsFinished;
    });
  });

  it('can writeFile', () => {
    waitsForPromise(async () => {
      await client.writeFile(pathToWriteFile, new Buffer('I\'m a little teapot.\n'));
      expect(fs.readFileSync(pathToWriteFile).toString()).toEqual('I\'m a little teapot.\n');
    });
  });

  it('returns 500 if file cannot be written', () => {
    waitsForPromise(async () => {
      var err;
      try {
        await client.writeFile(pathToWriteFile + '/that/is/missing', 'something');
      } catch (e) {
        err = e;
      }
      expect(err).toBeDefined();
      expect(err.code).toBe('ENOENT');
    });
  });

  it('can stat', () => {
    waitsForPromise(async () => {
      var stats = await client.stat(pathToTestFile);
      expect(stats).toEqual(fs.statSync(pathToTestFile));
    });
  });

  it('can readdir', () => {
    waitsForPromise(async () => {
      fs.symlinkSync(pathToTestFile, pathToLinkFile);
      fs.symlinkSync(pathToMissingFile, pathToBrokenLinkFile);
      var entries = await client.readdir(pathToTestDir);
      expect(entries.length).toBe(2); // Skips broken link
      entries.sort((a, b) => {
        return a.file.localeCompare(b.file);
      });
      var statsTarget = fs.statSync(pathToTestFile);

      expect(entries[0].stats).toEqual(statsTarget);
      expect(entries[0].file).toBe('testfile.txt');
      expect(entries[0].isSymbolicLink).toBe(false);

      statsTarget = fs.statSync(pathToLinkFile);

      expect(entries[1].stats).toEqual(statsTarget);
      expect(entries[1].file).toBe('testfile.txt.2');
      expect(entries[1].isSymbolicLink).toBe(true);
    });
  });

  it('can lstat', () => {
    waitsForPromise(async () => {
      fs.symlinkSync(pathToTestFile, pathToLinkFile);
      var lstats = await client.lstat(pathToLinkFile);
      expect(lstats).toEqual(fs.lstatSync(pathToLinkFile));
    });
  });

  it('returns false from exists if file missing', () => {
    waitsForPromise(async () => {
      var exists = await client.exists(pathToMissingFile);
      expect(exists).toBe(false);
    });
  });

  it('returns true from exists if file exists', () => {
    waitsForPromise(async () => {
      var exists = await client.exists(pathToTestFile);
      expect(exists).toBe(true);
    });
  });

  describe('newFile()', () => {
    var dirPath;

    beforeEach(() => {
      dirPath = path.join(__dirname, 'newFile_test');
    });

    afterEach(() => {
      rimraf.sync(dirPath);
      dirPath = null;
    });

    it('creates the file and the expected subdirectories', () => {
      waitsForPromise(async () => {
        var newPath = path.join(dirPath, 'foo/bar/baz.txt');
        expect(fs.existsSync(newPath)).toBe(false);
        var isNew = await client.newFile(newPath);
        expect(fs.existsSync(newPath)).toBe(true);
        expect(fs.statSync(newPath).isFile()).toBe(true);
        expect(fs.readFileSync(newPath).toString()).toBe('');
        expect(isNew).toBe(true);
      });
    });

    it('is a no-op for an existing file', () => {
      waitsForPromise(async () => {
        fs.mkdirSync(dirPath);
        fs.mkdirSync(path.join(dirPath, 'foo'));
        fs.mkdirSync(path.join(dirPath, 'foo/bar'));
        var newPath = path.join(dirPath, 'foo/bar/baz.txt');
        fs.writeFileSync(newPath, 'contents');
        expect(fs.existsSync(newPath)).toBe(true);

        var isNew = await client.newFile(newPath);
        expect(fs.statSync(newPath).isFile()).toBe(true);
        expect(fs.readFileSync(newPath).toString()).toBe('contents');
        expect(isNew).toBe(false);
      });
    });
  });

  describe('realpath()', () => {
    it('gets the same exact path of a normal file', () => {
      waitsForPromise(async () => {
        var realpath = await client.realpath(pathToTestFile);
        expect(realpath).toBe(pathToTestFile);
      });
    });

    it('gets the real path of a symlinked file', () => {
      waitsForPromise(async () => {
        fs.symlinkSync(pathToTestFile, pathToLinkFile);
        var realpath = await client.realpath(pathToLinkFile);
        expect(realpath).toBe(pathToTestFile);
      });
    });
  });

  describe('rename()', () => {
    var dirPath;

    beforeEach(() => {
      dirPath = temp.mkdirSync('rename_test');
    });

    it('succeeds when renaming a file', () => {
      waitsForPromise(async () => {
        var sourcePath = path.join(dirPath, 'file');
        fs.writeFileSync(sourcePath, '');
        var destinationPath = path.join(dirPath, 'destination_file');

        await client.rename(sourcePath, destinationPath);

        expect(fs.existsSync(sourcePath)).toBe(false);
        expect(fs.existsSync(destinationPath)).toBe(true);
      });
    });

    it('succeeds when renaming a folder', () => {
      waitsForPromise(async () => {
        var sourcePath = path.join(dirPath, 'directory');
        fs.mkdirSync(sourcePath);
        var destinationPath = path.join(dirPath, 'destination_folder');

        await client.rename(sourcePath, destinationPath);

        expect(fs.existsSync(sourcePath)).toBe(false);
        expect(fs.existsSync(destinationPath)).toBe(true);
      });
    });

    it('succeeds when renaming into a non-existent directory', () => {
      waitsForPromise(async () => {
        var sourcePath = path.join(dirPath, 'file');
        fs.writeFileSync(sourcePath, '');
        var destinationPath = path.join(dirPath, 'non-existent', 'destination_file');

        await client.rename(sourcePath, destinationPath);

        expect(fs.existsSync(sourcePath)).toBe(false);
        expect(fs.existsSync(destinationPath)).toBe(true);
      });
    });

    it('throws error if the source does not exist', () => {
      waitsForPromise(async () => {
        var sourcePath = path.join(dirPath, 'file');
        var destinationPath = path.join(dirPath, 'destination_file');

        var err;
        try {
          await client.rename(sourcePath, destinationPath);
        } catch (e) {
          err = e;
        }

        expect(err).toBeDefined();
        expect(err.code).toBe('ENOENT');
        expect(fs.existsSync(destinationPath)).toBe(false);
      });
    });

    it('throws error if the destination exists', () => {
      waitsForPromise(async () => {
        var sourcePath = path.join(dirPath, 'file');
        fs.writeFileSync(sourcePath, '');
        var destinationPath = path.join(dirPath, 'destination_file');
        fs.writeFileSync(destinationPath, '');

        var err;
        try {
          await client.rename(sourcePath, destinationPath);
        } catch (e) {
          err = e;
        }

        expect(err).toBeDefined();
        expect(err.code).toBe('EEXIST');
      });
    });
  });

  describe('mkdir()', () => {
    var dirPath;

    beforeEach(() => {
      dirPath = path.join(__dirname, 'mkdir_test');
    });

    afterEach(() => {
      if (fs.existsSync(dirPath)) {
        fs.rmdir(dirPath);
      }
      dirPath = null;
    });

    it('creates a directory at a given path', () => {
      waitsForPromise(async () => {
        expect(fs.existsSync(dirPath)).toBe(false);
        await client.mkdir(dirPath);
        expect(fs.existsSync(dirPath)).toBe(true);
        expect(fs.statSync(dirPath).isDirectory()).toBe(true);
      });
    });

    it('throws an error if already existing directory', () => {
      waitsForPromise(async () => {
        var err;
        fs.mkdirSync(dirPath);
        try {
          await client.mkdir(dirPath);
        } catch (e) {
          err = e;
        }
        expect(err).toBeDefined();
        expect(err.code).toBe('EEXIST');
      });
    });

    it('throws an error if the path is nested in a non-existing directory', () => {
      waitsForPromise(async () => {
        var err;
        try {
          await client.mkdir(path.join(dirPath, 'foo'));
        } catch (e) {
          err = e;
        }
        expect(err).toBeDefined();
        expect(err.code).toBe('ENOENT');
      });
    });
  });

  describe('mkdirp()', () => {
    var dirPath;

    beforeEach(() => {
      dirPath = path.join(__dirname, 'mkdirp_test');
    });

    afterEach(() => {
      rimraf.sync(dirPath);
      dirPath = null;
    });

    it('creates the expected subdirectories', () => {
      waitsForPromise(async () => {
        var newPath = path.join(dirPath, 'foo/bar/baz');
        expect(fs.existsSync(newPath)).toBe(false);
        var isNew = await client.mkdirp(newPath);
        expect(fs.existsSync(newPath)).toBe(true);
        expect(isNew).toBe(true);
      });
    });

    it('is a no-op for an existing directory', () => {
      waitsForPromise(async () => {
        fs.mkdirSync(dirPath);
        fs.mkdirSync(path.join(dirPath, 'foo'));
        fs.mkdirSync(path.join(dirPath, 'foo/bar'));
        var newPath = path.join(dirPath, 'foo/bar/baz');
        fs.mkdirSync(newPath);
        expect(fs.existsSync(newPath)).toBe(true);

        var isNew = await client.mkdirp(newPath);
        expect(fs.existsSync(newPath)).toBe(true);
        expect(isNew).toBe(false);
      });
    });
  });

  describe('rmdir()', () => {
    var dirPath;

    beforeEach(() => {
      dirPath = temp.mkdirSync('rmdir_test');
    });

    it('removes non-empty directories', () => {
      waitsForPromise(async () => {
        var directoryToRemove = path.join(dirPath, 'foo');
        await client.mkdirp(path.join(directoryToRemove, 'bar'));
        expect(fs.existsSync(directoryToRemove)).toBe(true);
        await client.rmdir(directoryToRemove);
        expect(fs.existsSync(directoryToRemove)).toBe(false);
      });
    });

    it('does nothing for non-existent directories', () => {
      waitsForPromise(async () => {
        var directoryToRemove = path.join(dirPath, 'foo');
        await client.rmdir(directoryToRemove);
        expect(fs.existsSync(directoryToRemove)).toBe(false);
      });
    });
  });

  describe('unlink()', () => {
    var dirPath;

    beforeEach(() => {
      dirPath = temp.mkdirSync('unlink_test');
    });

    it('removes file if it exists', () => {
      waitsForPromise(async () => {
        var fileToRemove = path.join(dirPath, 'foo');
        fs.writeFileSync(fileToRemove, '');
        expect(fs.existsSync(fileToRemove)).toBe(true);
        await client.unlink(fileToRemove);
        expect(fs.existsSync(fileToRemove)).toBe(false);
      });
    });

    it('does nothing for non-existent files', () => {
      waitsForPromise(async () => {
        var fileToRemove = path.join(dirPath, 'foo');
        await client.unlink(fileToRemove);
        expect(fs.existsSync(fileToRemove)).toBe(false);
      });
    });
  });
});
