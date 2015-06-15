'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var temp = require('temp').track();
var fs = require('fs');
var path = require('path');
var {EventEmitter} = require('events');
var NuclideClient = require('../lib/NuclideClient');
var NuclideLocalEventBus = require('../lib/NuclideLocalEventbus');

describe('NuclideLocalEventBus test suite', () => {

  var dirPath;
  var filePath;
  var fileContents;
  var client;
  var eventBus;

  beforeEach(() => {
    dirPath = temp.mkdirSync();
    filePath = path.join(dirPath, 'file.txt');
    fileContents = 'sample contents!';
    fs.writeFileSync(filePath, fileContents);
    eventBus = new NuclideLocalEventBus();
    client = new NuclideClient('test', eventBus);
  });

  afterEach(() => {
    eventBus.close();
  });

  describe('Can call NuclideFsService methods', () => {
    it('calls readFile', () => {
      waitsForPromise(async () => {
        var contents = await client.readFile(filePath, 'utf8');
        expect(contents).toBe(fileContents);
      });
    });

    it('calls exists', () => {
      waitsForPromise(async () => {
        var exists = await client.exists(filePath);
        expect(exists).toBe(true);
      });
    });
  });

  describe('Can call NuclideWatcherService methods', () => {
    it('calls watchFile()', () => {
      waitsForPromise(async () => {
        waits(1010); // Wait for the watchman to settle.
        var directoryChangeHandler = jasmine.createSpy();
        var fileChangeHandler = jasmine.createSpy();
        // Start the project watcher.
        await client.watchDirectoryRecursive(dirPath, directoryChangeHandler);
        var watcher = await client.watchFile(filePath, 'utf8');
        watcher.on('change', fileChangeHandler);
        expect(watcher instanceof EventEmitter).toBe(true);
        waits(10);
        runs(() => fs.writeFileSync(filePath, 'changed contents'));
        waitsFor(() => fileChangeHandler.callCount > 0);
        runs(() => {
          expect(fileChangeHandler.callCount).toBe(1);
          expect(directoryChangeHandler.callCount).toBe(1);
        });
      });
    });
  });
});
