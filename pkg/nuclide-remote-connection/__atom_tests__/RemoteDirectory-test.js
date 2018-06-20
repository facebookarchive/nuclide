'use strict';

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _atom = require('atom');

var _RemoteDirectory;

function _load_RemoteDirectory() {
  return _RemoteDirectory = require('../lib/RemoteDirectory');
}

var _connection_mock;

function _load_connection_mock() {
  return _connection_mock = _interopRequireDefault(require('../__mocks__/connection_mock'));
}

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

(_temp || _load_temp()).default.track();

const FILE_MODE = 33188;

describe('RemoteDirectory', () => {
  it('does have a existsSync() method', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/');
    expect(remoteDirectory.existsSync()).toBe(true);
  });

  it('does not list the property used to mark the directory as remote as one of its enumerable' + ' properties.', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/');
    for (const property in remoteDirectory) {
      expect(property).not.toBe('__nuclide_remote_directory__');
    }
  });

  describe('::isRemoteDirectory', () => {
    it('distinguishes a RemoteDirectory from a Directory.', () => {
      const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/');
      expect((_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory.isRemoteDirectory(remoteDirectory)).toBe(true);

      const localDirectory = new _atom.Directory('/Test/Path');
      expect((_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory.isRemoteDirectory(localDirectory)).toBe(false);
    });
  });
});

describe('RemoteDirectory::isRoot()', () => {
  it('nuclide://example.com/ is a root', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/');
    expect(remoteDirectory.isRoot()).toBe(true);
  });

  it('nuclide://example.com/path/to/directory is not a root', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/path/to/directory');
    expect(remoteDirectory.isRoot()).toBe(false);
  });
});

describe('RemoteDirectory::getBaseName()', () => {
  it('to handle a root path', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/');
    expect(remoteDirectory.getBaseName()).toBe('');
  });

  it('to handle a non-root path', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/path/to/directory');
    expect(remoteDirectory.getBaseName()).toBe('directory');
  });
});

describe('RemoteDirectory::relativize()', () => {
  it('to relativize a file against a root path', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/');
    expect(remoteDirectory.relativize('nuclide://example.com/foo/bar')).toBe('foo/bar');
    // Should not relativize paths from other hosts.
    expect(remoteDirectory.relativize('nuclide://example2.com/foo/bar')).toBe('nuclide://example2.com/foo/bar');
  });
});

describe('RemoteDirectory::getEntries()', () => {
  it('sorts directories then files alphabetically case insensitive', async () => {
    let complete = false;

    // Directories should sort first, then files, and case should be ignored
    jest.spyOn((_connection_mock || _load_connection_mock()).default.getFsService(), 'readdir').mockReturnValue([['Aa', true], ['a', true], ['Bb', false], ['b', false]]);
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/');

    remoteDirectory.getEntries((err, entries) => {
      expect(err).toBe(null);

      if (!entries) {
        throw new Error('Invariant violation: "entries"');
      }

      const sortedEntries = entries.map(entry => entry.getBaseName());
      expect(sortedEntries).toEqual(['b', 'Bb', 'a', 'Aa']);
      complete = true;
    });

    (0, (_waits_for || _load_waits_for()).default)(() => complete);
  });

  it("calls the given callback with an error on failure to match node-path-watcher's API", async () => {
    let complete = false;

    jest.spyOn((_connection_mock || _load_connection_mock()).default.getFsService(), 'readdir').mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/');

    remoteDirectory.getEntries((err, entries) => {
      expect(err).not.toBe(null);
      expect(entries).toBe(null);
      complete = true;
    });

    await (0, (_waits_for || _load_waits_for()).default)(() => complete);
  });
});

describe('RemoteDirectory::getParent()', () => {
  it('a root is its own parent', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/');
    expect(remoteDirectory.getParent()).toBe(remoteDirectory);
  });

  it('a non-root has the expected parent', () => {
    const parentDirectory = jest.fn();
    jest.spyOn((_connection_mock || _load_connection_mock()).default, 'createDirectory').mockReturnValue(parentDirectory);

    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/path/to/directory');
    expect(remoteDirectory.getParent()).toBe(parentDirectory);
    expect((_connection_mock || _load_connection_mock()).default.createDirectory).toHaveBeenCalledWith('nuclide://example.com/path/to', null);
  });
});

describe('RemoteDirectory::contains()', () => {
  it('returns false when passed undefined path', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/');
    expect(remoteDirectory.contains(undefined)).toBe(false);
  });

  it('returns false when passed null path', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/');
    expect(remoteDirectory.contains(null)).toBe(false);
  });

  it('returns false when passed empty path', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/');
    expect(remoteDirectory.contains('')).toBe(false);
  });

  it('returns true when passed sub directory', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/');
    expect(remoteDirectory.contains('nuclide://example.com/asdf')).toBe(true);
  });

  it('returns false when passed dir at same level with similar name', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/www');
    expect(remoteDirectory.contains('nuclide://example.com/www-base')).toBe(false);
  });

  it('returns false when has slash and passed dir with similar name', () => {
    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/www/');
    expect(remoteDirectory.contains('nuclide://example.com/www-base')).toBe(false);
  });
});

describe('RemoteDirectory::getFile()', () => {
  it('returns a RemoteFile under the directory', () => {
    const remoteFile = jest.fn();
    jest.spyOn((_connection_mock || _load_connection_mock()).default, 'createFile').mockReturnValue(remoteFile);

    const remoteDirectory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, 'nuclide://example.com/path/to/directory');
    expect(remoteDirectory.getFile('foo.txt')).toBe(remoteFile);
    expect((_connection_mock || _load_connection_mock()).default.createFile).toHaveBeenCalledWith('nuclide://example.com/path/to/directory/foo.txt');
  });
});

describe('RemoteDirectory::delete()', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = (_temp || _load_temp()).default.mkdirSync('delete_test');
  });

  it('deletes the existing directory', async () => {
    await (async () => {
      const directoryPath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'directory_to_delete');
      _fs.default.mkdirSync(directoryPath);
      _fs.default.mkdirSync((_nuclideUri || _load_nuclideUri()).default.join(directoryPath, 'subdir'));
      const directory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, `nuclide://host13${directoryPath}`);
      expect(_fs.default.existsSync(directoryPath)).toBe(true);
      await directory.delete();
      expect(_fs.default.existsSync(directoryPath)).toBe(false);
    })();
  });

  it('deletes the non-existent directory', async () => {
    await (async () => {
      const directoryPath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'directory_to_delete');
      const directory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, `nuclide://host13${directoryPath}`);
      await directory.delete();
      expect(_fs.default.existsSync(directoryPath)).toBe(false);
    })();
  });
});

describe('RemoteDirectory::exists()', () => {
  it('verifies existence', async () => {
    await (async () => {
      const directoryPath = (_temp || _load_temp()).default.mkdirSync('exists_test');
      expect(_fs.default.existsSync(directoryPath)).toBe(true);

      const directory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, `nuclide://host13${directoryPath}`);
      const exists = await directory.exists();
      expect(exists).toBe(true);
    })();
  });

  it('verifies non-existence', async () => {
    await (async () => {
      const tempDir = (_temp || _load_temp()).default.mkdirSync('exists_test');
      const directoryPath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, '/directory_that_doesnt_exist');
      expect(_fs.default.existsSync(directoryPath)).toBe(false);

      const directory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, `nuclide://host13${directoryPath}`);
      const exists = await directory.exists();
      expect(exists).toBe(false);
    })();
  });
});

describe('RemoteDirectory::isSymbolicLink()', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = (_temp || _load_temp()).default.mkdirSync('rename_test');
  });

  it('verifies symlink', () => {
    const targetDirectoryPath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'target');
    const symLinkedDirectoryPath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'linked');
    _fs.default.mkdirSync(targetDirectoryPath);
    _fs.default.symlinkSync(targetDirectoryPath, symLinkedDirectoryPath, 'dir');
    expect(_fs.default.lstatSync(symLinkedDirectoryPath).isSymbolicLink()).toBe(true);

    const directory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, `nuclide://host13${symLinkedDirectoryPath}`, true);
    const symlink = directory.isSymbolicLink();
    expect(symlink).toBe(true);
  });

  it('verifies non-symlink', () => {
    const notLinkedDirectoryPath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'not_linked');
    _fs.default.mkdirSync(notLinkedDirectoryPath);
    expect(_fs.default.lstatSync(notLinkedDirectoryPath).isSymbolicLink()).toBe(false);

    const directory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, `nuclide://host13${notLinkedDirectoryPath}`, false);
    const symlink = directory.isSymbolicLink();
    expect(symlink).toBe(false);
  });
});

// TODO: #7344702 Re-enable and don't depend on watchman.
// eslint-disable-next-line jasmine/no-disabled-tests
xdescribe('RemoteDirectory::onDidChange()', () => {
  const WATCHMAN_SETTLE_TIME_MS = 1 * 1000;
  let directoryPath;
  let filePath;

  beforeEach(async () => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;
    directoryPath = (_temp || _load_temp()).default.mkdirSync('on_did_change_test');
    filePath = (_nuclideUri || _load_nuclideUri()).default.join(directoryPath, 'sample_file.txt');
    _fs.default.writeFileSync(filePath, 'sample contents!');
    await (() => (_connection_mock || _load_connection_mock()).default.getFsService().watchDirectoryRecursive(directoryPath))();
    // wait for the watchman to settle on the created directory and file.
    waits(WATCHMAN_SETTLE_TIME_MS + /* buffer */10);
  });

  afterEach(async () => {
    await (() => (_connection_mock || _load_connection_mock()).default.getFsService().unwatchDirectoryRecursive(directoryPath))();
  });

  it('notifies onDidChange observers when a new file is added to the directory', () => {
    const directory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, directoryPath);
    const changeHandler = jest.fn();
    directory.onDidChange(changeHandler);
    runs(() => _fs.default.writeFileSync((_nuclideUri || _load_nuclideUri()).default.join(directoryPath, 'new_file.txt'), 'new contents!'));
    (0, (_waits_for || _load_waits_for()).default)(() => changeHandler.mock.calls.length > 0);
    runs(() => {
      expect(changeHandler.mock.calls.length).toBe(1);
      expect(changeHandler.mock.calls[0][0]).toEqual([{
        name: 'new_file.txt',
        mode: FILE_MODE,
        exists: true,
        new: true
      }]);
    });
  });

  it('notifies onDidChange observers when a file is removed from the directory', () => {
    const directory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, directoryPath);
    const changeHandler = jest.fn();
    directory.onDidChange(changeHandler);
    runs(() => _fs.default.unlinkSync(filePath));
    (0, (_waits_for || _load_waits_for()).default)(() => changeHandler.mock.calls.length > 0);
    runs(() => {
      expect(changeHandler.mock.calls.length).toBe(1);
      expect(changeHandler.mock.calls[0][0]).toEqual([{
        name: (_nuclideUri || _load_nuclideUri()).default.basename(filePath),
        mode: FILE_MODE,
        exists: false,
        new: false
      }]);
    });
  });

  it("Doesn't notify observers when a file is changed contents inside the the directory", () => {
    const directory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, directoryPath);
    const changeHandler = jest.fn();
    directory.onDidChange(changeHandler);
    _fs.default.writeFileSync(filePath, 'new contents!');
    waits(1000);
    runs(() => expect(changeHandler.mock.calls.length).toBe(0));
  });

  it('batches change events into a single call', () => {
    const directory = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, directoryPath);
    const changeHandler = jest.fn();
    directory.onDidChange(changeHandler);
    runs(() => {
      _fs.default.writeFileSync((_nuclideUri || _load_nuclideUri()).default.join(directoryPath, 'new_file_1.txt'), 'new contents 1!');
      _fs.default.writeFileSync((_nuclideUri || _load_nuclideUri()).default.join(directoryPath, 'new_file_2.txt'), 'new contents 2!');
    });
    (0, (_waits_for || _load_waits_for()).default)(() => changeHandler.mock.calls.length > 0);
    runs(() => {
      expect(changeHandler.mock.calls.length).toBe(1);
      const sortedChange = changeHandler.mock.calls[0][0].sort((a, b) => a.name > b.name);
      expect(sortedChange).toEqual([{ name: 'new_file_1.txt', exists: true, mode: FILE_MODE, new: true }, { name: 'new_file_2.txt', exists: true, mode: FILE_MODE, new: true }]);
    });
  });
});

describe('RemoteDirectory::onDidDelete()', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = (_temp || _load_temp()).default.mkdirSync('on_did_delete');
  });

  it('calls on delete', async () => {
    await (async () => {
      const dirPath = (_nuclideUri || _load_nuclideUri()).default.join(tempDir, 'dir_to_delete');
      const dir = new (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory((_connection_mock || _load_connection_mock()).default, `nuclide://host13${dirPath}`);
      const callbackSpy = jest.fn();
      dir.onDidDelete(callbackSpy);
      await dir.delete();
      expect(callbackSpy.mock.calls.length).toBe(1);
    })();
  });
});