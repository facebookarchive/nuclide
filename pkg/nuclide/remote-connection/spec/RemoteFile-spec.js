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
var crypto = require('crypto');
var temp = require('temp').track();
var RemoteFile = require('../lib/RemoteFile');
var connectionMock = require('./connection_mock');

describe('RemoteFile', () => {

  describe('getRealPath() & getRealPathSync()', () => {
    var filePath;
    var symlinkedFilePath;

    beforeEach(() => {
      var tempDir = temp.mkdirSync('realpath_test');
      filePath = path.join(tempDir, 'file.txt');
      fs.writeFileSync(filePath, 'some contents');
      filePath = fs.realpathSync(filePath);
      symlinkedFilePath = filePath + '.sym';
      fs.symlinkSync(filePath, symlinkedFilePath);
    });

    it('gets realpath of a file', () => {
      waitsForPromise(async () => {
        var file = new RemoteFile(connectionMock, symlinkedFilePath);
        var realpath = await file.getRealPath();
        expect(realpath).toBe(fs.realpathSync(symlinkedFilePath));
      });
    });

    it('caches the getRealPath result', () => {
      waitsForPromise(async () => {
        var file = new RemoteFile(connectionMock, symlinkedFilePath);
        expect(file.getRealPathSync()).toBe(symlinkedFilePath);
        await file.getRealPath();
        expect(file.getRealPathSync()).toBe(filePath);
      });
    });
  });

  describe('delete()', () => {
    var tempDir;

    beforeEach(() => {
      tempDir = temp.mkdirSync('delete_test');
    });

    it('deletes the existing file', () => {
      waitsForPromise(async () => {
        var filePath = path.join(tempDir, 'file_to_delete');
        fs.writeFileSync(filePath, '');
        var file = new RemoteFile(connectionMock, filePath);
        expect(fs.existsSync(filePath)).toBe(true);
        await file.delete();
        expect(fs.existsSync(filePath)).toBe(false);
      });
    });

    it('deletes the non-existent file', () => {
      waitsForPromise(async () => {
        var filePath = path.join(tempDir, 'file_to_delete');
        var file = new RemoteFile(connectionMock, filePath);
        await file.delete();
        expect(fs.existsSync(filePath)).toBe(false);
      });
    });
  });

  describe('RemoteFile::onDidDelete()', () => {
    var tempDir;

    beforeEach(() => {
      tempDir = temp.mkdirSync('on_did_create_and_delete_test');
    });

    it('calls on delete', () => {
      waitsForPromise(async () => {
        var filePath = path.join(tempDir, 'file_to_delete');
        fs.writeFileSync(filePath, '');
        var file = new RemoteFile(connectionMock, filePath);
        var callbackSpy = jasmine.createSpy();
        file._willAddSubscription = jasmine.createSpy();
        file.onDidDelete(callbackSpy);
        waitsFor(() => !file._pendingSubscription);
        runs(() => file.delete());
        waitsFor(() => callbackSpy.callCount > 0);
        runs(() => {
          expect(callbackSpy.callCount).toBe(1);
          expect(file._willAddSubscription).toHaveBeenCalled();
        });
      });
    });
  });

  describe('RemoteDirectory::rename()', () => {
    var tempDir;

    beforeEach(() => {
      tempDir = temp.mkdirSync('rename_test');
    });

    // We only do this simple test to make sure it's delegating to the connection.
    // Adding the other cases is misleading and incorrect since it's actually
    // delegating to `fsPromise` here.
    it('renames existing files', () => {
      waitsForPromise(async () => {
        var filePath = path.join(tempDir, 'file_to_rename');
        fs.writeFileSync(filePath, '');
        var newFilePath = path.join(tempDir, 'new_file_name');
        expect(fs.existsSync(filePath)).toBe(true);

        var file = new RemoteFile(connectionMock, filePath);
        await file.rename(newFilePath);

        expect(fs.existsSync(filePath)).toBe(false);
        expect(fs.existsSync(newFilePath)).toBe(true);
        expect(file.getLocalPath()).toEqual(newFilePath);
      });
    });
  });

  // TODO: #7344702 Re-enable and don't depend on watchman.
  xdescribe('RemoteFile watchFile integration', () => {
    var WATCHMAN_SETTLE_TIME_MS = 1 * 1000;
    var tempDir;
    var filePath;
    var file;

    beforeEach(() => {
      jasmine.getEnv().defaultTimeoutInterval = 10000;
      tempDir = temp.mkdirSync('on_did_change_test');
      filePath = path.join(tempDir, 'file.txt');
      file = new RemoteFile(connectionMock, filePath);
      fs.writeFileSync(filePath, 'sample contents');
      // Ask watchman to watch the directory.
      waitsForPromise(() => connectionMock.getClient().watchDirectoryRecursive(tempDir));
      waits(WATCHMAN_SETTLE_TIME_MS + /* buffer */ 10); // wait for the watchman to settle on the created directory and file.
    });

    afterEach(() => {
      waitsForPromise(async () => {
        await file._unsubscribeFromNativeChangeEvents();
        await connectionMock.getClient().unwatchDirectoryRecursive(tempDir);
      });
    });

    describe('when the contents of the file change', () => {
      it('notifies ::onDidChange observers', () => {
        var changeHandler = jasmine.createSpy();
        file.onDidChange(changeHandler);
        waitsFor(() => !file._pendingSubscription);
        runs(() => fs.writeFileSync(filePath, 'this is new!'));
        waitsFor(() => changeHandler.callCount > 0);
        runs(() => expect(changeHandler.callCount).toBe(1));
      });
    });

    describe('when the file is deleted, but not through the client', () => {
      it('notifies ::onDidDelete observers', () => {
        var deletionHandler = jasmine.createSpy();
        file.onDidDelete(deletionHandler);
        waitsFor(() => !file._pendingSubscription);
        runs(() => fs.unlinkSync(filePath));
        waitsFor(() => deletionHandler.callCount > 0);
        runs(() => expect(deletionHandler.callCount).toBe(1));
      });
    });

    // Watchman doesn't support rename event, if needed, will need to be fuzzily implemented.
    xdescribe('when the file is renamed', () => {
      it('notifies ::onDidRename observers', () => {
        var renameHandler = jasmine.createSpy();
        file.onDidRename(renameHandler);
        waitsFor(() => !file._pendingSubscription);
        runs(() => fs.renameSync(filePath, filePath + '_moved'));
        waits(500); // wait for the rename event to emit.
        runs(() => window.advanceClock(150)); // pass the rename timeout.
        waitsFor(() => renameHandler.callCount > 0);
        runs(() => {
          expect(renameHandler.callCount).toBe(1);
          expect(renameHandler.argsForCall[0][0]).toBe(path.basename(filePath + '_moved'));
        });
      });
    });

    describe('when a watch handling error happens', () => {
      it('notifies ::onWillThrowWatchError observers', () => {
        var notExistingFile = new RemoteFile(connectionMock, path.join(tempDir, 'no_existing.txt'));
        var skippedError;
        var handleError;
        notExistingFile.onWillThrowWatchError((watchError) => {
          var {error, handle} = watchError;
          skippedError = error;
          handle();
        });
        waitsForPromise(async () => {
          try {
            // Simulate an change event comes, but the file doesn't exist!
            await notExistingFile._handleNativeChangeEvent('change')
          } catch (error) {
            handleError = error;
          }
        });
        waitsFor(() => skippedError);
        runs(() => {
          expect(skippedError.code).toBe('ENOENT');
          expect(handleError).not.toBeDefined();
        });
      });
    });
  });

  describe('RemoteFile::exists()', () => {
    var tempDir;

    beforeEach(() => {
      tempDir = temp.mkdirSync('on_did_change_test');
    });

    it('exists resolves to true when the file exists', () => {
      waitsForPromise(async () => {
        var filePath = path.join(tempDir, 'file.txt');
        fs.writeFileSync(filePath, 'sample contents');
        var existingFile = new RemoteFile(connectionMock, filePath);
        var exists = await existingFile.exists();
        expect(exists).toBe(true);
      });
    });

    it('exists resolves to true when the file exists', () => {
      waitsForPromise(async () => {
        var notExistingFile = new RemoteFile(connectionMock, path.join(tempDir, 'no_existing.txt'));
        var exists = await notExistingFile.exists();
        expect(exists).toBe(false);
      });
    });
  });

  describe('RemoteFile::getDigest(), getDigestSync() and _setDigest()', () => {
    var tempDir;
    var filePath;
    var file;
    var fileContents;
    var computeDigest = (contents) => crypto.createHash('sha1').update(contents || '').digest('hex');

    beforeEach(() => {
      tempDir = temp.mkdirSync('on_did_change_test');
      filePath = path.join(tempDir, 'file.txt');
      fileContents = 'sample contents!';
      fs.writeFileSync(filePath, fileContents);
      file = new RemoteFile(connectionMock, filePath);
    });

    it('getDigest even if the file was not read before', () => {
      waitsForPromise(async () => {
        var digest = await file.getDigest();
        expect(digest).toBe(computeDigest(fileContents));
      });
    });

    it('getDigestSync cached the digest value', () => {
      waitsForPromise(async () => {
        await file.getDigest();
        var digest = file.getDigestSync();
        expect(digest).toBe(computeDigest(fileContents));
      });
    });

    it('file reading sets the digest', () => {
      waitsForPromise(async () => {
        await file.read();
        var digest = file.getDigestSync();
        expect(digest).toBe(computeDigest(fileContents));
      });
    });

    it('getDigestSync throws if no digest is cached!', () => {
      var digestError;
      try {
        file.getDigestSync();
      } catch (error) {
        digestError = error;
      }
      expect(digestError).toBeDefined();
    });

    it('_setDigest sets the digest', () => {
      waitsForPromise(async () => {
        var newContents = 'new contents 2!';
        file._setDigest(newContents);
        expect(file.getDigestSync()).toBe(computeDigest(newContents));
      });
    });
  });

  describe('RemoteFile::getParent()', () => {
    it('gets the parent directory for a file in a root directory', () => {
      var remote = {createDirectory(){}};
      var parentDirectory = jasmine.createSpy('RemoteDirectory');
      spyOn(remote, 'createDirectory').andReturn(parentDirectory);

      var filePath = 'nuclide://foo.bar.com:8084/foo.txt';
      var file = new RemoteFile(remote, filePath);
      expect(file.getParent()).toBe(parentDirectory);
      expect(remote.createDirectory).toHaveBeenCalledWith(
          'nuclide://foo.bar.com:8084/');
    });

    it('gets the parent directory for a file in a non-root directory', () => {
      var remote = {createDirectory(){}};
      var parentDirectory = jasmine.createSpy('RemoteDirectory');
      spyOn(remote, 'createDirectory').andReturn(parentDirectory);

      var filePath = 'nuclide://foo.bar.com:8084/a/foo.txt';
      var file = new RemoteFile(remote, filePath);
      expect(file.getParent()).toBe(parentDirectory);
      expect(remote.createDirectory).toHaveBeenCalledWith(
          'nuclide://foo.bar.com:8084/a');
    });
  });
});
