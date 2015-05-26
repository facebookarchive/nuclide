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
var temp = require('temp').track();
var {EventEmitter} = require('events');
var {services: watcherServices} = require('../lib/services/NuclideWatcherService');

var FILE_MODE = 33188;
var DIRECTORY_MODE = 16877;

describe('NuclideWatcher test suite', () => {

  var unwatchFile = watcherServices['/watcher/unwatchFile'].handler;
  var unwatchDirectoryRecursive = watcherServices['/watcher/unwatchDirectoryRecursive'].handler;
  var watchFile, watchDirectory, watchDirectoryRecursive;

  var dirPath;
  var filePath;

  beforeEach(() => {
    jasmine.getEnv().defaultTimeoutInterval = 10000;

    // Mock the server API to capture the results of the services.
    var eventbus = new EventEmitter();
    var eventEmitter;
    var serverApi = {
      registerEventEmitter(_eventEmitter) {
        eventEmitter = _eventEmitter;
      },
      publish(...args) {
        eventbus.emit.apply(eventbus, args);
      },
    };
    // Use the mocked server API for the watcher services.
    watchFile = async (...args) => {
      await watcherServices['/watcher/watchFile'].handler.apply(serverApi, args);
      return eventEmitter;
    };
    watchDirectory = async (...args) => {
      await watcherServices['/watcher/watchDirectory'].handler.apply(serverApi, args);
      return eventEmitter;
    };
    watchDirectoryRecursive = async (directoryPath, handler) => {
      var channel = 'watch' + directoryPath;
      eventbus.on(channel, handler);
      await watcherServices['/watcher/watchDirectoryRecursive'].handler.call(serverApi, directoryPath, channel);
    };
    dirPath = temp.mkdirSync();
    filePath = path.join(dirPath, 'test.txt');
    fs.writeFileSync(filePath, 'abc');
    // Setup the watchman project watcher.
    waitsForPromise(() => watchDirectoryRecursive(dirPath, () => {}));
    // Wait for watchman to settle on the created temp directory.
    waits(1100);
  });

  afterEach(() => {
    waitsForPromise(() => unwatchDirectoryRecursive(dirPath));
  });

  describe('watchFile()', () => {
    it('watches for file changes', () => {
      waitsForPromise(async () => {
        var watcher = await watchFile(filePath);
        var changeHandler = jasmine.createSpy();
        watcher.on('change', changeHandler);
        waits(10);
        runs(() => fs.writeFileSync(filePath, 'def'));
        waitsFor(() => changeHandler.callCount > 0);
        runs(() => {
          expect(changeHandler.callCount).toBe(1);
        });
      });
    });

    it('file changes by an atomic update amongst other directory events', () => {
      waitsForPromise(async () => {
        var watcher = await watchFile(filePath);
        var changeHandler = jasmine.createSpy();
        watcher.on('change', changeHandler);
        waits(10);
        runs(() => {
          fs.unlinkSync(filePath);
          fs.writeFileSync(filePath, 'def');
          fs.writeFileSync(filePath + '_other', 'foo bar');
        });
        waitsFor(() => changeHandler.callCount > 0);
        runs(() => expect(changeHandler.callCount).toBe(1));
      });
    });

    it('watches for file deletion', () => {
      waitsForPromise(async () => {
        var watcher = await watchFile(filePath);
        var deletionHandler = jasmine.createSpy();
        watcher.on('delete', deletionHandler);
        waits(10);
        runs(() => fs.unlinkSync(filePath));
        waitsFor(() => deletionHandler.callCount > 0);
        runs(() => expect(deletionHandler.callCount).toBe(1));
      });
    });

    it('file is deleted amongst many other directory events', () => {
      waitsForPromise(async () => {
        var watcher = await watchFile(filePath);
        var deletionHandler = jasmine.createSpy();
        watcher.on('delete', deletionHandler);
        waits(10);
        runs(() => {
          fs.unlinkSync(filePath);
          fs.writeFileSync(filePath + '_other_1', 'abc');
          fs.writeFileSync(filePath + '_other_2', 'def');
        });
        waitsFor(() => deletionHandler.callCount > 0);
        runs(() => {
          expect(deletionHandler.callCount).toBe(1);
        });
      });
    });

    xit('watches for file rename', () => {
      waitsForPromise(async () => {
        var watcher = await watchFile(filePath);
        var renameHandler = jasmine.createSpy();
        watcher.on('rename', renameHandler);
        waits(10);
        runs(() => fs.renameSync(filePath, filePath + '_moved'));
        waitsFor(() => renameHandler.callCount > 0);
        runs(() => {
          expect(renameHandler.callCount).toBe(1);
          expect(renameHandler.argsForCall[0][0]).toBe(path.basename(filePath + '_moved'));
        });
      });
    });

    it('does not notify when another file in the directory is created or removed', () => {
      waitsForPromise(async () => {
        var watcher = await watchFile(filePath);
        var renameHandler = jasmine.createSpy();
        watcher.on('rename', renameHandler);
        waits(10);
        runs(() => {
          fs.writeFileSync(path.join(dirPath, 'some_new_file'), 'some contents');
          fs.writeFileSync(path.join(dirPath, 'some_other_file'), 'some other contents');
          fs.unlinkSync(path.join(dirPath, 'some_new_file'));
        });
        waits(500);
        runs(() => expect(renameHandler.callCount).toBe(0));
      });
    });
  });

  describe('unwatchFile()', () => {
    it('cleans up watchers after unwatchFile', () => {
      waitsForPromise(async () => {
        var watcher = await watchFile(filePath);
        var changeHandler = jasmine.createSpy();
        watcher.on('change', changeHandler);
        waits(10);
        runs(() => fs.writeFileSync(filePath, 'def'));
        waitsFor(() => changeHandler.callCount > 0);
        waitsForPromise(async () => {
          expect(changeHandler.callCount).toBe(1);
          await unwatchFile(filePath);
          fs.writeFileSync(filePath, 'lol');
        });
        waits(500);
        runs(() => {
          expect(changeHandler.callCount).toBe(1);
        });
      });
    });
  });

  describe('watchDirectory()', () => {
    it('Changing a file doesn\'t trigger a change event', () => {
      waitsForPromise(async () => {
        var watcher = await watchDirectory(dirPath);
        var changeHandler = jasmine.createSpy();
        watcher.on('change', changeHandler);
        waits(10);
        runs(() => fs.writeFileSync(filePath, 'def'));
        waits(500);
        runs(() => {
          expect(changeHandler.callCount).toBe(0);
        });
      });
    });

    it('Removing a file should trigger a change event', () => {
      waitsForPromise(async () => {
        var watcher = await watchDirectory(dirPath);
        var changeHandler = jasmine.createSpy();
        watcher.on('change', changeHandler);
        waits(10);
        runs(() => fs.unlinkSync(filePath));
        waitsFor(() => changeHandler.callCount > 0);
        runs(() => {
          expect(changeHandler.callCount).toBe(1);
          expect(changeHandler.argsForCall[0][0]).toEqual([{name: 'test.txt', mode: FILE_MODE, exists: false, new: false}]);
        });
      });
    });

    it('Adding a new file should trigger a change event', () => {
      waitsForPromise(async () => {
        var watcher = await watchDirectory(dirPath);
        var changeHandler = jasmine.createSpy();
        watcher.on('change', changeHandler);
        waits(10);
        runs(() => fs.writeFileSync(path.join(dirPath, 'new_file')));
        waitsFor(() => changeHandler.callCount > 0);
        runs(() => {
          expect(changeHandler.callCount).toBe(1);
          expect(changeHandler.argsForCall[0][0]).toEqual([{name: 'new_file', mode: FILE_MODE, exists: true, new: true}]);
        });
      });
    });

    it('Adding a hidden file should trigger a change event', () => {
      waitsForPromise(async () => {
        var watcher = await watchDirectory(dirPath);
        var changeHandler = jasmine.createSpy();
        watcher.on('change', changeHandler);
        waits(10);
        runs(() => fs.writeFileSync(path.join(dirPath, '.hidden')));
        waitsFor(() => changeHandler.callCount > 0);
        runs(() => {
          expect(changeHandler.callCount).toBe(1);
          expect(changeHandler.argsForCall[0][0]).toEqual([{name: '.hidden', mode: FILE_MODE, exists: true, new: true}]);
        });
      });
    });

    it('Adding a directory should trigger a change event', () => {
      waitsForPromise(async () => {
        var watcher = await watchDirectory(dirPath);
        var changeHandler = jasmine.createSpy();
        watcher.on('change', changeHandler);
        waits(10);
        runs(() => fs.mkdirSync(path.join(dirPath, 'some_dir')));
        waitsFor(() => changeHandler.callCount > 0);
        runs(() => {
          expect(changeHandler.callCount).toBe(1);
          expect(changeHandler.argsForCall[0][0]).toEqual([{name: 'some_dir', mode: DIRECTORY_MODE, exists: true, new: true}]);
        });
      });
    });

    it('Adding a file in a nested directory shouldn\'t trigger a change event', () => {
      waitsForPromise(async () => {
        var nestedDir = path.join(dirPath, 'some_dir');
        var changeHandler = jasmine.createSpy();
        var watcher = await watchDirectory(dirPath);
        watcher.on('change', changeHandler);
        waits(10);
        runs(() => {
          fs.mkdirSync(nestedDir);
          fs.writeFileSync(path.join(nestedDir, 'some_file'), 'def');
        });
        waits(500);
        runs(() => {
          expect(changeHandler.callCount).toBe(1);
          expect(changeHandler.argsForCall[0][0]).toEqual([{name: 'some_dir', mode: DIRECTORY_MODE, exists: true, new: true}]);
        });
      });
    });
  });

  describe('watchDirectoryRecursively()', () => {
    it('watches the first level of file/directory changes', () => {
      waitsForPromise(async () => {
        var changeHandler = jasmine.createSpy();
        await watchDirectoryRecursive(dirPath, changeHandler);
        waits(10);
        runs(() => fs.mkdirSync(path.join(dirPath, 'some_dir')));
        waitsFor(() => changeHandler.callCount > 0);
        runs(() => expect(changeHandler.callCount).toBe(1));
      });
    });

    it('watches the nested level of file/directory changes', () => {
      waitsForPromise(async () => {
        var nestedDir = path.join(dirPath, 'some_dir');
        var changeHandler = jasmine.createSpy();
        await watchDirectoryRecursive(dirPath, changeHandler);
        waits(10);
        runs(() => {
          fs.mkdirSync(nestedDir);
          fs.writeFileSync(path.join(nestedDir, 'some_file'), 'def');
        });
        waitsFor(() => changeHandler.callCount > 0);
        runs(() => {
          expect(changeHandler.callCount).toBe(1);
        });
      });
    });

    it('watches change events of files', () => {
      waitsForPromise(async () => {
        var changeHandler = jasmine.createSpy();
        await watchDirectoryRecursive(dirPath, changeHandler);
        waits(10);
        runs(() => fs.writeFileSync(filePath, 'def'));
        waitsFor(() => changeHandler.callCount > 0);
        runs(() => {
          expect(changeHandler.callCount).toBe(1);
        });
      });
    });
  });
});
