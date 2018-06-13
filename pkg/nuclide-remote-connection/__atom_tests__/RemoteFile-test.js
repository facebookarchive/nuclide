'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _stream;

function _load_stream() {
  return _stream = require('../../../modules/nuclide-commons/stream');
}

var _crypto = _interopRequireDefault(require('crypto'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

var _connection_mock;

function _load_connection_mock() {
  return _connection_mock = _interopRequireDefault(require('../__mocks__/connection_mock'));
}

var _RemoteFile;

function _load_RemoteFile() {
  return _RemoteFile = require('../lib/RemoteFile');
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
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

describe('RemoteFile', () => {
  const computeDigest = contents => {
    const hash = _crypto.default.createHash('sha1').update(contents || '');

    if (!hash) {
      throw new Error('Invariant violation: "hash"');
    }

    return hash.digest('hex');
  };

  describe('getRealPath() & getRealPathSync()', () => {
    let filePath;
    let symlinkedFilePath;

    beforeEach(() => {
      const tempDir = (_temp || _load_temp()).default.mkdirSync('realpath_test');
      filePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'file.txt');
      _fs.default.writeFileSync(filePath, 'some contents');
      filePath = _fs.default.realpathSync(filePath);
      symlinkedFilePath = filePath + '.sym';
      _fs.default.symlinkSync(filePath, symlinkedFilePath, 'file');
    });

    it('gets realpath of a file', async () => {
      await (async () => {
        const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, symlinkedFilePath);
        const realpath = await file.getRealPath();
        expect(realpath).toBe(_fs.default.realpathSync(symlinkedFilePath));
      })();
    });

    it('caches the getRealPath result', async () => {
      await (async () => {
        const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, symlinkedFilePath);
        expect(file.getRealPathSync()).toBe(symlinkedFilePath);
        await file.getRealPath();
        expect(file.getRealPathSync()).toBe(filePath);
      })();
    });
  });

  describe('delete()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = (_temp || _load_temp()).default.mkdirSync('delete_test');
    });

    it('deletes the existing file', async () => {
      await (async () => {
        const filePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'file_to_delete');
        _fs.default.writeFileSync(filePath, '');
        const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, filePath);
        expect(_fs.default.existsSync(filePath)).toBe(true);
        await file.delete();
        expect(_fs.default.existsSync(filePath)).toBe(false);
      })();
    });

    it('deletes the non-existent file', async () => {
      await (async () => {
        const filePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'file_to_delete');
        const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, filePath);
        await file.delete();
        expect(_fs.default.existsSync(filePath)).toBe(false);
      })();
    });
  });

  describe('RemoteFile::onDidDelete()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = (_temp || _load_temp()).default.mkdirSync('on_did_create_and_delete_test');
    });

    it('calls on delete', async () => {
      const filePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'file_to_delete');
      _fs.default.writeFileSync(filePath, '');
      const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, filePath);
      const callbackSpy = jest.fn();
      jest.spyOn(file, '_willAddSubscription').mockReturnValue(null);
      file.onDidDelete(callbackSpy);
      file.delete();
      await (0, (_waits_for || _load_waits_for()).default)(() => callbackSpy.mock.calls.length > 0);
      expect(callbackSpy.mock.calls.length).toBe(1);
      expect(file._willAddSubscription).toHaveBeenCalled();
    });
  });

  describe('RemoteDirectory::isSymbolicLink()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = (_temp || _load_temp()).default.mkdirSync('rename_test');
    });

    it('verifies symlink', () => {
      const targetFilePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'target');
      const symLinkedFilePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'linked');
      _fs.default.writeFileSync(targetFilePath, '');
      _fs.default.symlinkSync(targetFilePath, symLinkedFilePath, 'file');
      expect(_fs.default.lstatSync(symLinkedFilePath).isSymbolicLink()).toBe(true);

      const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, `nuclide://host13${symLinkedFilePath}`, true);
      const symlink = file.isSymbolicLink();
      expect(symlink).toBe(true);
    });

    it('verifies non-symlink', () => {
      const notLinkedFilePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'not_linked');
      _fs.default.writeFileSync(notLinkedFilePath, '');
      expect(_fs.default.lstatSync(notLinkedFilePath).isSymbolicLink()).toBe(false);

      const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, `nuclide://host13${notLinkedFilePath}`, false);
      const symlink = file.isSymbolicLink();
      expect(symlink).toBe(false);
    });
  });

  describe('copy()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = (_temp || _load_temp()).default.mkdirSync('copy_test');
    });

    // We only do this simple test to make sure it's delegating to the connection.
    // Adding the other cases is misleading and incorrect since it's actually
    // delegating to `fsPromise` here.
    it('copying existing files', async () => {
      await (async () => {
        const filePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'file_to_copy');
        const fileContents = 'copy me!';
        _fs.default.writeFileSync(filePath, fileContents);
        const newFilePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'copied_file');
        expect(_fs.default.existsSync(filePath)).toBe(true);
        expect(_fs.default.existsSync(newFilePath)).toBe(false);

        const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, filePath);
        jest.spyOn(file, '_subscribeToNativeChangeEvents').mockReturnValue(null);
        const result = await file.copy(newFilePath);
        const newFile = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, newFilePath);
        const digest = await newFile.getDigest();
        expect(result).toBe(true);
        expect(_fs.default.existsSync(newFilePath)).toBe(true);
        expect(digest).toBe(computeDigest(fileContents));
      })();
    });
  });

  // TODO: #7344702 Re-enable and don't depend on watchman.
  // eslint-disable-next-line jasmine/no-disabled-tests
  xdescribe('RemoteFile watchFile integration', () => {
    const WATCHMAN_SETTLE_TIME_MS = 1 * 1000;
    let tempDir;
    let filePath;
    let file;

    beforeEach(async () => {
      jasmine.getEnv().defaultTimeoutInterval = 10000;
      tempDir = (_temp || _load_temp()).default.mkdirSync('on_did_change_test');
      filePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'file.txt');
      file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, filePath);
      _fs.default.writeFileSync(filePath, 'sample contents');
      // Ask watchman to watch the directory.
      await (() => (_connection_mock || _load_connection_mock()).default.getFsService().watchDirectoryRecursive(tempDir))();
      // wait for the watchman to settle on the created directory and file.
      waits(WATCHMAN_SETTLE_TIME_MS + /* buffer */10);
    });

    afterEach(async () => {
      await (async () => {
        await file._unsubscribeFromNativeChangeEvents();
        await (_connection_mock || _load_connection_mock()).default.getFsService().unwatchDirectoryRecursive(tempDir);
      })();
    });

    describe('when the contents of the file change', () => {
      it('notifies ::onDidChange observers', () => {
        const changeHandler = jest.fn();
        file.onDidChange(changeHandler);
        runs(() => _fs.default.writeFileSync(filePath, 'this is new!'));
        (0, (_waits_for || _load_waits_for()).default)(() => changeHandler.mock.calls.length > 0);
        runs(() => expect(changeHandler.mock.calls.length).toBe(1));
      });
    });

    describe('when the file is deleted, but not through the client', () => {
      it('notifies ::onDidDelete observers', () => {
        const deletionHandler = jest.fn();
        file.onDidDelete(deletionHandler);
        runs(() => _fs.default.unlinkSync(filePath));
        (0, (_waits_for || _load_waits_for()).default)(() => deletionHandler.mock.calls.length > 0);
        runs(() => expect(deletionHandler.mock.calls.length).toBe(1));
      });
    });

    // Watchman doesn't support rename event, if needed, will need to be fuzzily implemented.
    // eslint-disable-next-line jasmine/no-disabled-tests
    xdescribe('when the file is renamed', () => {
      it('notifies ::onDidRename observers', () => {
        const renameHandler = jest.fn();
        file.onDidRename(renameHandler);
        runs(() => _fs.default.renameSync(filePath, filePath + '_moved'));
        waits(500); // wait for the rename event to emit.
        runs(() => advanceClock(150)); // pass the rename timeout.
        (0, (_waits_for || _load_waits_for()).default)(() => renameHandler.mock.calls.length > 0);
        runs(() => {
          expect(renameHandler.mock.calls.length).toBe(1);
          expect(renameHandler.mock.calls[0][0]).toBe((_nuclideUri || _load_nuclideUri()).default.basename(filePath + '_moved'));
        });
      });
    });

    describe('when a watch handling error happens', () => {
      it('notifies ::onWillThrowWatchError observers', async () => {
        const notExistingFile = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'no_existing.txt'));
        let skippedError;
        let handleError;
        notExistingFile.onWillThrowWatchError(watchError => {
          const { error, handle } = watchError;
          skippedError = error;
          handle();
        });
        await (async () => {
          try {
            // Simulate an change event comes, but the file doesn't exist!
            await notExistingFile._handleNativeChangeEvent('change');
          } catch (error) {
            handleError = error;
          }
        })();
        (0, (_waits_for || _load_waits_for()).default)(() => skippedError);
        runs(() => {
          expect(skippedError.code).toBe('ENOENT');
          expect(handleError).not.toBeDefined();
        });
      });
    });
  });

  describe('::create()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = (_temp || _load_temp()).default.mkdirSync('create_test');
    });

    it('returns true when file creation is successful', async () => {
      await (async () => {
        const filePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'create.txt');
        const remoteFile = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, filePath);
        const wasCreated = await remoteFile.create();
        expect(wasCreated).toBe(true);
      })();
    });
  });

  describe('::exists()', () => {
    let tempDir;

    beforeEach(() => {
      tempDir = (_temp || _load_temp()).default.mkdirSync('on_did_change_test');
    });

    it('exists resolves to true when the file exists', async () => {
      await (async () => {
        const filePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'file.txt');
        _fs.default.writeFileSync(filePath, 'sample contents');
        const existingFile = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, filePath);
        const exists = await existingFile.exists();
        expect(exists).toBe(true);
      })();
    });

    it('exists resolves to false when the file does not exist', async () => {
      await (async () => {
        const notExistingFile = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'no_existing.txt'));
        const exists = await notExistingFile.exists();
        expect(exists).toBe(false);
      })();
    });
  });

  describe('RemoteFile::getDigest(), getDigestSync() and _setDigest()', () => {
    let tempDir;
    let filePath;
    let file;
    let fileContents;

    beforeEach(() => {
      tempDir = (_temp || _load_temp()).default.mkdirSync('on_did_change_test');
      filePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'file.txt');
      fileContents = 'sample contents!';
      _fs.default.writeFileSync(filePath, fileContents);
      file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, filePath);
    });

    it('getDigest even if the file was not read before', async () => {
      await (async () => {
        const digest = await file.getDigest();
        expect(digest).toBe(computeDigest(fileContents));
      })();
    });

    it('getDigestSync cached the digest value', async () => {
      await (async () => {
        await file.getDigest();
        const digest = file.getDigestSync();
        expect(digest).toBe(computeDigest(fileContents));
      })();
    });

    it('file reading sets the digest', async () => {
      await (async () => {
        await file.read();
        const digest = file.getDigestSync();
        expect(digest).toBe(computeDigest(fileContents));
      })();
    });

    it('getDigestSync sets the digest for an empty string if no digest is cached', () => {
      const digest = file.getDigestSync();
      expect(digest).toBe(computeDigest(''));
    });

    it('_setDigest sets the digest', async () => {
      await (async () => {
        const newContents = 'new contents 2!';
        file._setDigest(newContents);
        expect(file.getDigestSync()).toBe(computeDigest(newContents));
      })();
    });
  });

  describe('RemoteFile::getParent()', () => {
    let server = null;

    beforeEach(() => {
      server = {
        createDirectory: () => {},
        getRemoteConnectionForUri: () => null
      };
    });

    it('gets the parent directory for a file in a root directory', () => {
      const parentDirectory = jest.fn();
      jest.spyOn(server, 'createDirectory').mockReturnValue(parentDirectory);

      const filePath = 'nuclide://foo.bar.com/foo.txt';
      const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile(server, filePath);
      expect(file.getParent()).toBe(parentDirectory);
      expect(server.createDirectory).toHaveBeenCalledWith('nuclide://foo.bar.com/', null);
    });

    it('gets the parent directory for a file in a non-root directory', () => {
      const parentDirectory = jest.fn();
      jest.spyOn(server, 'createDirectory').mockReturnValue(parentDirectory);

      const filePath = 'nuclide://foo.bar.com/a/foo.txt';
      const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile(server, filePath);
      expect(file.getParent()).toBe(parentDirectory);
      expect(server.createDirectory).toHaveBeenCalledWith('nuclide://foo.bar.com/a', null);
    });
  });

  describe('RemoteFile::setPath()', () => {
    it('resubscribes after a rename', () => {
      const changeHandler = jest.fn();
      const deletionHandler = jest.fn();
      const mockWatch = new _rxjsBundlesRxMinJs.Subject();
      jest.spyOn((_connection_mock || _load_connection_mock()).default, 'getFileWatch').mockReturnValue(mockWatch);
      const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, 'test');

      file.onDidChange(changeHandler);
      file.onDidDelete(deletionHandler);

      // The file tree sets the path before doing the rename.
      file.setPath('test2');

      // Simulate a Watchman rename (delete + change)
      mockWatch.next({ type: 'delete', path: 'test' });
      mockWatch.next({ type: 'change', path: 'test2' });
      expect(deletionHandler).not.toHaveBeenCalled();
      expect(changeHandler).toHaveBeenCalled();
    });
  });

  describe('RemoteFile::createReadStream()', () => {
    it('is able to read file contents', async () => {
      await (async () => {
        const tempDir = (_temp || _load_temp()).default.mkdirSync('stream_test');
        const filePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'file.txt');
        _fs.default.writeFileSync(filePath, 'test1234');

        const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, filePath);
        const readStream = file.createReadStream();
        const data = await (0, (_stream || _load_stream()).observeStream)(readStream).toArray().toPromise();
        expect(data).toEqual(['test1234']);
      })();
    });

    it('handles errors', async () => {
      await (async () => {
        const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, 'test');
        const readStream = file.createReadStream();
        const data = await (0, (_stream || _load_stream()).observeStream)(readStream).toArray().toPromise().catch(e => e);
        expect(data instanceof Error).toBe(true);
      })();
    });
  });

  describe('RemoteFile::createWriteStream()', () => {
    it('is able to write file contents', async () => {
      await (async () => {
        const tempDir = (_temp || _load_temp()).default.mkdirSync('stream_test');
        const filePath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'file.txt');
        const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, filePath);
        const writeStream = file.createWriteStream();
        writeStream.write('test1234');
        await new Promise(resolve => writeStream.end(resolve));
        expect(_fs.default.readFileSync(filePath, 'utf8')).toBe('test1234');
      })();
    });

    it('handles errors', async () => {
      await (async () => {
        const file = new (_RemoteFile || _load_RemoteFile()).RemoteFile((_connection_mock || _load_connection_mock()).default, 'a/');
        const writeStream = file.createWriteStream();
        writeStream.write('test1234');
        let error = null;
        writeStream.on('error', e => error = e);
        await new Promise(resolve => writeStream.end(resolve));
        expect(error).not.toBeNull();
      })();
    });
  });
});