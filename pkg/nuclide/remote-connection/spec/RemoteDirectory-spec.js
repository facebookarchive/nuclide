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
var {Directory} = require('atom');
var RemoteDirectory = require('../lib/RemoteDirectory');
var RemoteFile = require('../lib/RemoteFile');
var temp = require('temp').track();
var connectionMock = require('./connection_mock');

var FILE_MODE = 33188;

describe('RemoteDirectory', () => {

  it('does not have an existsSync() method', () => {
    // existsSync() is not implemented to prevent GitRepositoryProvider from
    // trying to create a GitRepository for this Directory. We need to create a
    // RemoteGitRepositoryProvider to handle this case correctly.
    expect(RemoteDirectory.prototype.existsSync).toBe(undefined);
  });

  it('does not list the property used to mark the directory as remote as one of its enumerable properties.', () => {
    var remoteDirectory = new RemoteDirectory(connectionMock, 'nuclide://example.com:9090/');
    for (var property in remoteDirectory) {
      expect(property).not.toBe('__nuclide_remote_directory__');
    }
  });

  describe('::isRemoteDirectory', () => {
    it('distinguishes a RemoteDirectory from a Directory.', () => {
      var remoteDirectory = new RemoteDirectory(connectionMock, 'nuclide://example.com:9090/');
      expect(RemoteDirectory.isRemoteDirectory(remoteDirectory)).toBe(true);

      var localDirectory = new Directory('/Test/Path');
      expect(RemoteDirectory.isRemoteDirectory(localDirectory)).toBe(false);
    });
  });
});

describe('RemoteDirectory::isRoot()', () => {
  it('nuclide://example.com:9090/ is a root', () => {
    var path = 'nuclide://example.com:9090/';
    var remoteDirectory = new RemoteDirectory(connectionMock, path);
    expect(remoteDirectory.isRoot()).toBe(true);
  });

  it('nuclide://example.com:9090/path/to/directory is not a root', () => {
    var path = 'nuclide://example.com:9090/path/to/directory';
    var remoteDirectory = new RemoteDirectory(connectionMock, path);
    expect(remoteDirectory.isRoot()).toBe(false);
  });
});

describe('RemoteDirectory::getBaseName()', () => {
  it('to handle a root path', () => {
    var path = 'nuclide://example.com:9090/';
    var remoteDirectory = new RemoteDirectory(connectionMock, path);
    expect(remoteDirectory.getBaseName()).toBe('');
  });

  it('to handle a non-root path', () => {
    var path = 'nuclide://example.com:9090/path/to/directory';
    var remoteDirectory = new RemoteDirectory(connectionMock, path);
    expect(remoteDirectory.getBaseName()).toBe('directory');
  });
});

describe('RemoteDirectory::relativize()', () => {
  it('to relativize a file against a root path', () => {
    var path = 'nuclide://example.com:9090/';
    var remoteDirectory = new RemoteDirectory(connectionMock, path);
    expect(remoteDirectory.relativize('nuclide://example.com:9090/foo/bar'))
        .toBe('foo/bar');
  });
});

describe('RemoteDirectory::getEntries()', () => {
  it('sorts directories then files alphabetically case insensitive', () => {
    var remote = jasmine.createSpyObj('RemoteConnection', ['getClient', 'createDirectory', 'createFile']);
    var client = jasmine.createSpyObj('NuclideClient', ['readdir']);

    remote.getClient.andReturn(client);

    remote.createDirectory.andCallFake((uri) => {
      return new RemoteDirectory(remote, uri);
    });

    remote.createFile.andCallFake((uri) => {
      return new RemoteFile(remote, uri);
    });

    var fileStats = {isFile() {return true;}};
    var directoryStats = {isFile() {return false;}};

    // Directories should sort first, then files, and case should be ignored
    client.readdir.andReturn([
      {file: 'Aa', stats: fileStats},
      {file: 'a', stats: fileStats},
      {file: 'Bb', stats: directoryStats},
      {file: 'b', stats: directoryStats},
    ]);

    var path = 'nuclide://example.com:9090/';
    var remoteDirectory = new RemoteDirectory(remote, path);

    remoteDirectory.getEntries((err, entries) => {
      expect(err).toBe(null);
      var sortedEntries = entries.map((entry) => entry.getBaseName());
      expect(sortedEntries).toEqual(['b', 'Bb', 'a', 'Aa']);
    });
  });
});

describe('RemoteDirectory::getParent()', () => {
  it('a root is its own parent', () => {
    var path = 'nuclide://example.com:9090/';
    var remoteDirectory = new RemoteDirectory(connectionMock, path);
    expect(remoteDirectory.getParent()).toBe(remoteDirectory);
  });

  it('a non-root has the expected parent', () => {
    var remote = {createDirectory(){}};
    var parentDirectory = jasmine.createSpy('RemoteDirectory');
    spyOn(remote, 'createDirectory').andReturn(parentDirectory);

    var path = 'nuclide://example.com:9090/path/to/directory';
    var remoteDirectory = new RemoteDirectory(remote, path);
    expect(remoteDirectory.getParent()).toBe(parentDirectory);
    expect(remote.createDirectory).toHaveBeenCalledWith(
        'nuclide://example.com:9090/path/to');
  });
});

describe('RemoteDirectory::contains()', () => {
  it('returns false when passed undefined path', () => {
    var path = 'nuclide://example.com:9090/';
    var remoteDirectory = new RemoteDirectory(connectionMock, path);
    expect(remoteDirectory.contains(undefined)).toBe(false);
  });

  it('returns false when passed null path', () => {
    var remote = jasmine.createSpy('RemoteConnection');
    var path = 'nuclide://example.com:9090/';
    var remoteDirectory = new RemoteDirectory(remote, path);
    expect(remoteDirectory.contains(null)).toBe(false);
  });

  it('returns false when passed empty path', () => {
    var path = 'nuclide://example.com:9090/';
    var remoteDirectory = new RemoteDirectory(connectionMock, path);
    expect(remoteDirectory.contains('')).toBe(false);
  });

  it('returns true when passed sub directory', () => {
    var path = 'nuclide://example.com:9090/';
    var remoteDirectory = new RemoteDirectory(connectionMock, path);
    expect(remoteDirectory.contains('nuclide://example.com:9090/asdf')).toBe(true);
  });
});

describe('RemoteDirectory::getFile()', () => {
  it('returns a RemoteFile under the directory', () => {
    var remote = {createFile(){}};
    var remoteFile = jasmine.createSpy('RemoteFile');
    spyOn(remote, 'createFile').andReturn(remoteFile);

    var path = 'nuclide://example.com:9090/path/to/directory';
    var remoteDirectory = new RemoteDirectory(remote, path);
    expect(remoteDirectory.getFile('foo.txt')).toBe(remoteFile);
    expect(remote.createFile).toHaveBeenCalledWith(
        'nuclide://example.com:9090/path/to/directory/foo.txt');
  });
});

describe('RemoteDirectory::delete()', () => {
  var tempDir;

  beforeEach(() => {
    tempDir = temp.mkdirSync('delete_test');
  });

  it('deletes the existing directory', () => {
    waitsForPromise(async () => {
      var directoryPath = path.join(tempDir, 'directory_to_delete');
      fs.mkdirSync(directoryPath);
      fs.mkdirSync(path.join(directoryPath, 'subdir'));
      var directory = new RemoteDirectory(connectionMock, directoryPath);
      expect(fs.existsSync(directoryPath)).toBe(true);
      await directory.delete();
      expect(fs.existsSync(directoryPath)).toBe(false);
    });
  });

  it('deletes the non-existent directory', () => {
    waitsForPromise(async () => {
      var directoryPath = path.join(tempDir, 'directory_to_delete');
      var directory = new RemoteDirectory(connectionMock, directoryPath);
      await directory.delete();
      expect(fs.existsSync(directoryPath)).toBe(false);
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
  it('renames existing directories', () => {
    waitsForPromise(async () => {
      var directoryPath = path.join(tempDir, 'directory_to_rename');
      fs.mkdirSync(directoryPath);
      var newDirectoryPath = path.join(tempDir, 'new_directory_name');
      expect(fs.existsSync(directoryPath)).toBe(true);

      var directory = new RemoteDirectory(connectionMock, directoryPath);
      await directory.rename(newDirectoryPath);

      expect(fs.existsSync(directoryPath)).toBe(false);
      expect(fs.existsSync(newDirectoryPath)).toBe(true);
      expect(directory.getLocalPath()).toEqual(newDirectoryPath);
    });
  });
});

// TODO: #7344702 Re-enable and don't depend on watchman.
xdescribe('RemoteDirectory::onDidChange()', () => {
  var WATCHMAN_SETTLE_TIME_MS = 1 * 1000;
  var directoryPath;
  var filePath;

  beforeEach(() => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;
    directoryPath = temp.mkdirSync('on_did_change_test');
    filePath = path.join(directoryPath, 'sample_file.txt');
    fs.writeFileSync(filePath, 'sample contents!');
    waitsForPromise(() => connectionMock.getClient().watchDirectoryRecursive(directoryPath));
    waits(WATCHMAN_SETTLE_TIME_MS + /* buffer */ 10); // wait for the watchman to settle on the created directory and file.
  });

  afterEach(() => {
    waitsForPromise(() => connectionMock.getClient().unwatchDirectoryRecursive(directoryPath));
  });

  it('notifies onDidChange observers when a new file is added to the directory', () => {
    var directory = new RemoteDirectory(connectionMock, directoryPath);
    var changeHandler = jasmine.createSpy();
    directory.onDidChange(changeHandler);
    waitsFor(() => !directory._pendingSubscription);
    runs(() => fs.writeFileSync(path.join(directoryPath, 'new_file.txt'), 'new contents!'));
    waitsFor(() => changeHandler.callCount > 0);
    runs(() => {
      expect(changeHandler.callCount).toBe(1);
      expect(changeHandler.argsForCall[0][0]).toEqual([{name: 'new_file.txt', mode: FILE_MODE, exists: true, new: true}]);
    });
  });

  it('notifies onDidChange observers when a file is removed from the directory', () => {
    var directory = new RemoteDirectory(connectionMock, directoryPath);
    var changeHandler = jasmine.createSpy();
    directory.onDidChange(changeHandler);
    waitsFor(() => !directory._pendingSubscription);
    runs(() => fs.unlinkSync(filePath));
    waitsFor(() => changeHandler.callCount > 0);
    runs(() => {
      expect(changeHandler.callCount).toBe(1);
      expect(changeHandler.argsForCall[0][0]).toEqual([{name: path.basename(filePath), mode: FILE_MODE, exists: false, new: false}]);
    });
  });

  it('Doesn\'t notify observers when a file is changed contents inside the the directory', () => {
    var directory = new RemoteDirectory(connectionMock, directoryPath);
    var changeHandler = jasmine.createSpy();
    directory.onDidChange(changeHandler);
    waitsFor(() => !directory._pendingSubscription);
    fs.writeFileSync(filePath, 'new contents!');
    waits(1000);
    runs(() => expect(changeHandler.callCount).toBe(0));
  });

  it('batches change events into a single call', () => {
    var directory = new RemoteDirectory(connectionMock, directoryPath);
    var changeHandler = jasmine.createSpy();
    directory.onDidChange(changeHandler);
    waitsFor(() => !directory._pendingSubscription);
    runs(() => {
      fs.writeFileSync(path.join(directoryPath, 'new_file_1.txt'), 'new contents 1!');
      fs.writeFileSync(path.join(directoryPath, 'new_file_2.txt'), 'new contents 2!');
    });
    waitsFor(() => changeHandler.callCount > 0);
    runs(() => {
      expect(changeHandler.callCount).toBe(1);
      var sortedChange = changeHandler.argsForCall[0][0].sort((a, b) => a.name > b.name);
      expect(sortedChange).toEqual([
        {name: 'new_file_1.txt', exists: true, mode: FILE_MODE, new: true},
        {name: 'new_file_2.txt', exists: true, mode: FILE_MODE, new: true},
      ]);
    });
  });
});
