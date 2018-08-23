"use strict";

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _idbKeyval() {
  const data = _interopRequireDefault(require("idb-keyval"));

  _idbKeyval = function () {
    return data;
  };

  return data;
}

function _RecentFilesService() {
  const data = _interopRequireDefault(require("../lib/RecentFilesService"));

  _RecentFilesService = function () {
    return data;
  };

  return data;
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
 * @emails oncall+nuclide
 */
describe('RecentFilesService', () => {
  let filePath1;
  let filePath2;
  let filePath3;
  let recentFilesService;
  beforeEach(async () => {
    await _idbKeyval().default.clear();
    recentFilesService = new (_RecentFilesService().default)();
    [filePath1, filePath2, filePath3] = await Promise.all([_fsPromise().default.tempfile('1'), _fsPromise().default.tempfile('2'), _fsPromise().default.tempfile('3')]);
  });
  afterEach(async () => {
    recentFilesService.dispose();
    await _idbKeyval().default.clear();
  });
  describe('getRecentFiles', () => {
    it('returns a reverse-chronological list of recently opened files', async () => {
      let mostRecentFiles;
      let previousTimestamp = Date.now();
      mostRecentFiles = await recentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(0);
      await atom.workspace.open(filePath1);
      mostRecentFiles = await recentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(1);
      expect(mostRecentFiles[0].path.endsWith(filePath1)).toBe(true);
      expect(mostRecentFiles[0].timestamp).toBeGreaterThan(previousTimestamp);
      previousTimestamp = mostRecentFiles[0].timestamp;
      await atom.workspace.open(filePath2);
      mostRecentFiles = await recentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(2);
      expect(mostRecentFiles[0].path.endsWith(filePath2)).toBe(true);
      expect(mostRecentFiles[0].timestamp).toBeGreaterThan(previousTimestamp);
      previousTimestamp = mostRecentFiles[0].timestamp;
      await atom.workspace.open(filePath3);
      mostRecentFiles = await recentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(3);
      expect(mostRecentFiles[0].path.endsWith(filePath3)).toBe(true);
      expect(mostRecentFiles[0].timestamp).toBeGreaterThan(previousTimestamp);
    });
    it('returns paths and timestamps of recently opened files', async () => {
      await recentFilesService.touchFile(filePath1);
      const recentFiles = await recentFilesService.getRecentFiles();
      expect(recentFiles.length).toEqual(1);
      const mostRecentFile = recentFiles[0];
      expect(Object.keys(mostRecentFile).length).toEqual(3);
      expect(typeof mostRecentFile.timestamp === 'number').toBe(true);
      expect(mostRecentFile.path.endsWith(filePath1)).toBe(true);
    });
    it('resets the order of previously tracked files when they are touched', async () => {
      let mostRecentFiles;
      mostRecentFiles = await recentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(0);
      await atom.workspace.open(filePath1);
      mostRecentFiles = await recentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(1);
      expect(mostRecentFiles[0].path.endsWith(filePath1)).toBe(true);
      await atom.workspace.open(filePath2);
      mostRecentFiles = await recentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(2);
      expect(mostRecentFiles[0].path.endsWith(filePath2)).toBe(true);
      await atom.workspace.open(filePath1);
      mostRecentFiles = await recentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(2);
      expect(mostRecentFiles[0].path.endsWith(filePath1)).toBe(true);
      expect(mostRecentFiles[1].path.endsWith(filePath2)).toBe(true);
      await atom.workspace.open(filePath2);
      mostRecentFiles = await recentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(2);
      expect(mostRecentFiles[0].path.endsWith(filePath2)).toBe(true);
      expect(mostRecentFiles[1].path.endsWith(filePath1)).toBe(true);
    });
  });
  describe('RecentFilesDB', () => {
    it('saves touched files to the database on dispose and restores them', async () => {
      await recentFilesService.touchFile(filePath3);
      await recentFilesService.touchFile(filePath2);
      await recentFilesService.touchFile(filePath1);
      recentFilesService.dispose();
      const restoredRecentFilesService = new (_RecentFilesService().default)();
      const mostRecentFiles = await restoredRecentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(3);
      expect(mostRecentFiles[0].path.endsWith(filePath1)).toBe(true);
      expect(mostRecentFiles[1].path.endsWith(filePath2)).toBe(true);
      expect(mostRecentFiles[2].path.endsWith(filePath3)).toBe(true);
    });
    it('keeps files around from two sessions ago', async () => {
      await recentFilesService.touchFile(filePath3);
      await recentFilesService.touchFile(filePath2);
      await recentFilesService.touchFile(filePath1);
      recentFilesService.dispose();
      await recentFilesService.getRecentFiles();
      recentFilesService.dispose();
      const restoredRecentFilesService = new (_RecentFilesService().default)();
      const mostRecentFiles = await restoredRecentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(3);
      expect(mostRecentFiles[0].path.endsWith(filePath1)).toBe(true);
      expect(mostRecentFiles[1].path.endsWith(filePath2)).toBe(true);
      expect(mostRecentFiles[2].path.endsWith(filePath3)).toBe(true);
    });
  });
});