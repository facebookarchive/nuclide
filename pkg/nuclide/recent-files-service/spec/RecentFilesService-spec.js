'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var RecentFilesService = require('../lib/RecentFilesService');

const FILE_PATH_1 = 'foo/bar/foo.js';
const FILE_PATH_2 = 'foo/bar/bar.js';
const FILE_PATH_3 = 'foo/bar/baz.js';

describe('RecentFilesService', () => {
  var recentFilesService;

  beforeEach(() => {
    recentFilesService = new RecentFilesService();
  });

  describe('getRecentFiles', () => {
    it('returns a reverse-chronological list of recently opened files', () => {
      waitsForPromise(async () => {
        var mostRecentFiles;
        var previousTimestamp = 0;
        expect(recentFilesService.getRecentFiles().length).toEqual(0);

        await atom.workspace.open(FILE_PATH_1);
        mostRecentFiles = recentFilesService.getRecentFiles();
        expect(mostRecentFiles.length).toEqual(1);
        expect(mostRecentFiles[0].path.endsWith(FILE_PATH_1)).toBe(true);
        expect(mostRecentFiles[0].timestamp).toBeGreaterThan(previousTimestamp);
        previousTimestamp = mostRecentFiles[0].timestamp;

        await atom.workspace.open(FILE_PATH_2);
        mostRecentFiles = recentFilesService.getRecentFiles();
        expect(mostRecentFiles.length).toEqual(2);
        expect(mostRecentFiles[0].path.endsWith(FILE_PATH_2)).toBe(true);
        expect(mostRecentFiles[0].timestamp).toBeGreaterThan(previousTimestamp);

        previousTimestamp = mostRecentFiles[0].timestamp;
        await atom.workspace.open(FILE_PATH_3);
        mostRecentFiles = recentFilesService.getRecentFiles();
        expect(mostRecentFiles.length).toEqual(3);
        expect(mostRecentFiles[0].path.endsWith(FILE_PATH_3)).toBe(true);
        expect(mostRecentFiles[0].timestamp).toBeGreaterThan(previousTimestamp);
      });
    });

    it('returns paths and timestamps of recently opened files', () => {
      waitsForPromise(async () => {
        await atom.workspace.open(FILE_PATH_1);
        var recentFiles = recentFilesService.getRecentFiles();
        var mostRecentFile = recentFiles[0];
        expect(Object.keys(mostRecentFile).length).toEqual(2);
        expect(typeof mostRecentFile.timestamp === 'number').toBe(true);
        expect(mostRecentFile.path.endsWith(FILE_PATH_1)).toBe(true);
      });
    });

    it('resets the order of previously tracked files when they are touched', () => {
      waitsForPromise(async () => {
        var mostRecentFiles;
        expect(recentFilesService.getRecentFiles().length).toEqual(0);

        await atom.workspace.open(FILE_PATH_1);
        mostRecentFiles = recentFilesService.getRecentFiles();
        expect(mostRecentFiles.length).toEqual(1);
        expect(mostRecentFiles[0].path.endsWith(FILE_PATH_1)).toBe(true);

        await atom.workspace.open(FILE_PATH_2);
        mostRecentFiles = recentFilesService.getRecentFiles();
        expect(mostRecentFiles.length).toEqual(2);
        expect(mostRecentFiles[0].path.endsWith(FILE_PATH_2)).toBe(true);

        await atom.workspace.open(FILE_PATH_1);
        mostRecentFiles = recentFilesService.getRecentFiles();
        expect(mostRecentFiles.length).toEqual(2);
        expect(mostRecentFiles[0].path.endsWith(FILE_PATH_1)).toBe(true);
        expect(mostRecentFiles[1].path.endsWith(FILE_PATH_2)).toBe(true);

        await atom.workspace.open(FILE_PATH_2);
        mostRecentFiles = recentFilesService.getRecentFiles();
        expect(mostRecentFiles.length).toEqual(2);
        expect(mostRecentFiles[0].path.endsWith(FILE_PATH_2)).toBe(true);
        expect(mostRecentFiles[1].path.endsWith(FILE_PATH_1)).toBe(true);
      });
    });
  });
});
