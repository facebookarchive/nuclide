'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {RemoteConnection} from '..';

import invariant from 'assert';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const temp = require('temp').track();
const connectionMock = require('./connection_mock');
const {RemoteFile} = require('../lib/RemoteFile');


describe('RemoteFile', () => {

  const computeDigest = contents => {
    const hash = crypto.createHash('sha1').update(contents || '');
    invariant(hash);
    return hash.digest('hex');
  };

  describe('getRealPath() & getRealPathSync()', () => {
    let filePath;
    let symlinkedFilePath;

    beforeEach(() => {
      const tempDir = temp.mkdirSync('realpath_test');
      filePath = path.join(tempDir, 'file.txt');
      fs.writeFileSync(filePath, 'some contents');
      filePath = fs.realpathSync(filePath);
      symlinkedFilePath = filePath + '.sym';
      fs.symlinkSync(filePath, symlinkedFilePath, 'file');
    });

    it('gets realpath of a file', () => {
      waitsForPromise(async () => {
        const file = new RemoteFile(connectionMock, symlinkedFilePath);
        const realpath = await file.getRealPath();
        expect(realpath).toBe(fs.realpathSync(symlinkedFilePath));
      });
    });

    it('caches the getRealPath result', () => {
      waitsForPromise(async () => {
        const file = new RemoteFile(connectionMock, symlinkedFilePath);
        expect(file.getRealPathSync()).toBe(symlinkedFilePath);
        await file.getRealPath();
        expect(file.getRealPathSync()).toBe(filePath);
      });
    });
  });

  describe('delete()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = temp.mkdirSync('delete_test');
    });

    it('deletes the existing file', () => {
      waitsForPromise(async () => {
        const filePath = path.join(tempDir, 'file_to_delete');
        fs.writeFileSync(filePath, '');
        const file = new RemoteFile(connectionMock, filePath);
        expect(fs.existsSync(filePath)).toBe(true);
        await file.delete();
        expect(fs.existsSync(filePath)).toBe(false);
      });
    });

    it('deletes the non-existent file', () => {
      waitsForPromise(async () => {
        const filePath = path.join(tempDir, 'file_to_delete');
        const file = new RemoteFile(connectionMock, filePath);
        await file.delete();
        expect(fs.existsSync(filePath)).toBe(false);
      });
    });
  });

  describe('RemoteFile::onDidDelete()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = temp.mkdirSync('on_did_create_and_delete_test');
    });

    it('calls on delete', () => {
      waitsForPromise(async () => {
        const filePath = path.join(tempDir, 'file_to_delete');
        fs.writeFileSync(filePath, '');
        const file = new RemoteFile(connectionMock, filePath);
        const callbackSpy = jasmine.createSpy();
        spyOn(file, '_willAddSubscription').andReturn(null);
        file.onDidDelete(callbackSpy);
        runs(() => file.delete());
        waitsFor(() => callbackSpy.callCount > 0);
        runs(() => {
          expect(callbackSpy.callCount).toBe(1);
          expect(file._willAddSubscription).toHaveBeenCalled();
        });
      });
    });
  });

  describe('RemoteDirectory::isSymbolicLink()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = temp.mkdirSync('rename_test');
    });

    it('verifies symlink', () => {
      const targetFilePath = path.join(tempDir, 'target');
      const symLinkedFilePath = path.join(tempDir, 'linked');
      fs.writeFileSync(targetFilePath, '');
      fs.symlinkSync(
        targetFilePath,
        symLinkedFilePath,
        'file',
      );
      expect(fs.lstatSync(symLinkedFilePath).isSymbolicLink()).toBe(true);

      const file = new RemoteFile(
        connectionMock,
        `nuclide://host13:1234${symLinkedFilePath}`,
        true,
      );
      const symlink = file.isSymbolicLink();
      expect(symlink).toBe(true);
    });

    it('verifies non-symlink', () => {
      const notLinkedFilePath = path.join(tempDir, 'not_linked');
      fs.writeFileSync(notLinkedFilePath, '');
      expect(fs.lstatSync(notLinkedFilePath).isSymbolicLink()).toBe(false);

      const file = new RemoteFile(
        connectionMock,
        `nuclide://host13:1234${notLinkedFilePath}`,
        false,
      );
      const symlink = file.isSymbolicLink();
      expect(symlink).toBe(false);
    });
  });

  describe('RemoteFile::rename()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = temp.mkdirSync('rename_test');
    });

    // We only do this simple test to make sure it's delegating to the connection.
    // Adding the other cases is misleading and incorrect since it's actually
    // delegating to `fsPromise` here.
    it('renames existing files', () => {
      waitsForPromise(async () => {
        const filePath = path.join(tempDir, 'file_to_rename');
        fs.writeFileSync(filePath, '');
        const newFilePath = path.join(tempDir, 'new_file_name');
        expect(fs.existsSync(filePath)).toBe(true);

        const file = new RemoteFile(connectionMock, `nuclide://host123:1234${filePath}`);
        spyOn(file, '_subscribeToNativeChangeEvents').andReturn(null);
        await file.rename(newFilePath);

        expect(fs.existsSync(filePath)).toBe(false);
        expect(fs.existsSync(newFilePath)).toBe(true);
        expect(file.getLocalPath()).toEqual(newFilePath);
      });
    });
  });

  describe('copy()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = temp.mkdirSync('copy_test');
    });

    // We only do this simple test to make sure it's delegating to the connection.
    // Adding the other cases is misleading and incorrect since it's actually
    // delegating to `fsPromise` here.
    it('copying existing files', () => {
      waitsForPromise(async () => {
        const filePath = path.join(tempDir, 'file_to_copy');
        const fileContents = 'copy me!';
        fs.writeFileSync(filePath, fileContents);
        const newFilePath = path.join(tempDir, 'copied_file');
        expect(fs.existsSync(filePath)).toBe(true);
        expect(fs.existsSync(newFilePath)).toBe(false);

        const file = new RemoteFile(connectionMock, filePath);
        spyOn(file, '_subscribeToNativeChangeEvents').andReturn(null);
        const result = await file.copy(newFilePath);
        const newFile = new RemoteFile(connectionMock, newFilePath);
        const digest = await newFile.getDigest();
        expect(result).toBe(true);
        expect(fs.existsSync(newFilePath)).toBe(true);
        expect(digest).toBe(computeDigest(fileContents));
      });
    });
  });

  // TODO: #7344702 Re-enable and don't depend on watchman.
  xdescribe('RemoteFile watchFile integration', () => {
    const WATCHMAN_SETTLE_TIME_MS = 1 * 1000;
    let tempDir;
    let filePath;
    let file;

    beforeEach(() => {
      jasmine.getEnv().defaultTimeoutInterval = 10000;
      tempDir = temp.mkdirSync('on_did_change_test');
      filePath = path.join(tempDir, 'file.txt');
      file = new RemoteFile(connectionMock, filePath);
      fs.writeFileSync(filePath, 'sample contents');
      // Ask watchman to watch the directory.
      waitsForPromise(() => connectionMock.getFsService().watchDirectoryRecursive(tempDir));
      // wait for the watchman to settle on the created directory and file.
      waits(WATCHMAN_SETTLE_TIME_MS + /* buffer */ 10);
    });

    afterEach(() => {
      waitsForPromise(async () => {
        await file._unsubscribeFromNativeChangeEvents();
        await connectionMock.getFsService().unwatchDirectoryRecursive(tempDir);
      });
    });

    describe('when the contents of the file change', () => {
      it('notifies ::onDidChange observers', () => {
        const changeHandler = jasmine.createSpy();
        file.onDidChange(changeHandler);
        runs(() => fs.writeFileSync(filePath, 'this is new!'));
        waitsFor(() => changeHandler.callCount > 0);
        runs(() => expect(changeHandler.callCount).toBe(1));
      });
    });

    describe('when the file is deleted, but not through the client', () => {
      it('notifies ::onDidDelete observers', () => {
        const deletionHandler = jasmine.createSpy();
        file.onDidDelete(deletionHandler);
        runs(() => fs.unlinkSync(filePath));
        waitsFor(() => deletionHandler.callCount > 0);
        runs(() => expect(deletionHandler.callCount).toBe(1));
      });
    });

    // Watchman doesn't support rename event, if needed, will need to be fuzzily implemented.
    xdescribe('when the file is renamed', () => {
      it('notifies ::onDidRename observers', () => {
        const renameHandler = jasmine.createSpy();
        file.onDidRename(renameHandler);
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
        const notExistingFile = new RemoteFile(
          connectionMock,
          path.join(tempDir, 'no_existing.txt')
        );
        let skippedError;
        let handleError;
        notExistingFile.onWillThrowWatchError(watchError => {
          const {error, handle} = watchError;
          skippedError = error;
          handle();
        });
        waitsForPromise(async () => {
          try {
            // Simulate an change event comes, but the file doesn't exist!
            await notExistingFile._handleNativeChangeEvent('change');
          } catch (error) {
            handleError = error;
          }
        });
        waitsFor(() => skippedError);
        runs(() => {
          // $FlowFixMe non-standard property.
          expect(skippedError.code).toBe('ENOENT');
          expect(handleError).not.toBeDefined();
        });
      });
    });
  });

  describe('::create()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = temp.mkdirSync('create_test');
    });

    it('returns true when file creation is successful', () => {
      waitsForPromise(async () => {
        const filePath = path.join(tempDir, 'create.txt');
        const remoteFile = new RemoteFile(connectionMock, filePath);
        const wasCreated = await remoteFile.create();
        expect(wasCreated).toBe(true);
      });
    });
  });

  describe('::exists()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = temp.mkdirSync('on_did_change_test');
    });

    it('exists resolves to true when the file exists', () => {
      waitsForPromise(async () => {
        const filePath = path.join(tempDir, 'file.txt');
        fs.writeFileSync(filePath, 'sample contents');
        const existingFile = new RemoteFile(connectionMock, filePath);
        const exists = await existingFile.exists();
        expect(exists).toBe(true);
      });
    });

    it('exists resolves to false when the file does not exist', () => {
      waitsForPromise(async () => {
        const notExistingFile = new RemoteFile(
          connectionMock,
          path.join(tempDir, 'no_existing.txt')
        );
        const exists = await notExistingFile.exists();
        expect(exists).toBe(false);
      });
    });
  });

  describe('RemoteFile::getDigest(), getDigestSync() and _setDigest()', () => {
    let tempDir;
    let filePath;
    let file;
    let fileContents;

    beforeEach(() => {
      tempDir = temp.mkdirSync('on_did_change_test');
      filePath = path.join(tempDir, 'file.txt');
      fileContents = 'sample contents!';
      fs.writeFileSync(filePath, fileContents);
      file = new RemoteFile(connectionMock, filePath);
    });

    it('getDigest even if the file was not read before', () => {
      waitsForPromise(async () => {
        const digest = await file.getDigest();
        expect(digest).toBe(computeDigest(fileContents));
      });
    });

    it('getDigestSync cached the digest value', () => {
      waitsForPromise(async () => {
        await file.getDigest();
        const digest = file.getDigestSync();
        expect(digest).toBe(computeDigest(fileContents));
      });
    });

    it('file reading sets the digest', () => {
      waitsForPromise(async () => {
        await file.read();
        const digest = file.getDigestSync();
        expect(digest).toBe(computeDigest(fileContents));
      });
    });

    it('getDigestSync throws if no digest is cached!', () => {
      let digestError;
      try {
        file.getDigestSync();
      } catch (error) {
        digestError = error;
      }
      expect(digestError).toBeDefined();
    });

    it('_setDigest sets the digest', () => {
      waitsForPromise(async () => {
        const newContents = 'new contents 2!';
        file._setDigest(newContents);
        expect(file.getDigestSync()).toBe(computeDigest(newContents));
      });
    });
  });

  describe('RemoteFile::getParent()', () => {
    let remote: RemoteConnection = (null: any);

    beforeEach(() => {
      remote = ({
        createDirectory: () => {},
      }: any);
    });

    it('gets the parent directory for a file in a root directory', () => {
      const parentDirectory = jasmine.createSpy('RemoteDirectory');
      spyOn(remote, 'createDirectory').andReturn(parentDirectory);

      const filePath = 'nuclide://foo.bar.com:8084/foo.txt';
      const file = new RemoteFile(remote, filePath);
      expect(file.getParent()).toBe(parentDirectory);
      expect(remote.createDirectory).toHaveBeenCalledWith(
          'nuclide://foo.bar.com:8084/');
    });

    it('gets the parent directory for a file in a non-root directory', () => {
      const parentDirectory = jasmine.createSpy('RemoteDirectory');
      spyOn(remote, 'createDirectory').andReturn(parentDirectory);

      const filePath = 'nuclide://foo.bar.com:8084/a/foo.txt';
      const file = new RemoteFile(remote, filePath);
      expect(file.getParent()).toBe(parentDirectory);
      expect(remote.createDirectory).toHaveBeenCalledWith(
          'nuclide://foo.bar.com:8084/a');
    });
  });
});
