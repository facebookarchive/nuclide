'use strict';

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _RecentFilesService;

function _load_RecentFilesService() {
  return _RecentFilesService = _interopRequireDefault(require('../lib/RecentFilesService'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('RecentFilesService', () => {
  let filePath1;
  let filePath2;
  let filePath3;
  let recentFilesService;

  beforeEach(async () => {
    recentFilesService = new (_RecentFilesService || _load_RecentFilesService()).default();

    [filePath1, filePath2, filePath3] = await Promise.all([(_fsPromise || _load_fsPromise()).default.tempfile('1'), (_fsPromise || _load_fsPromise()).default.tempfile('2'), (_fsPromise || _load_fsPromise()).default.tempfile('3')]);
  });

  describe('getRecentFiles', () => {
    it.skip('returns a reverse-chronological list of recently opened files', async () => {
      let mostRecentFiles;
      let previousTimestamp = Date.now();
      expect(recentFilesService.getRecentFiles().length).toEqual(0);

      await atom.workspace.open(filePath1);
      mostRecentFiles = recentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(1);
      expect(mostRecentFiles[0].path.endsWith(filePath1)).toBe(true);
      expect(mostRecentFiles[0].timestamp).toBe(previousTimestamp);
      previousTimestamp = mostRecentFiles[0].timestamp;

      await atom.workspace.open(filePath2);
      mostRecentFiles = recentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(2);
      expect(mostRecentFiles[0].path.endsWith(filePath2)).toBe(true);
      expect(mostRecentFiles[0].timestamp).toBe(previousTimestamp);

      previousTimestamp = mostRecentFiles[0].timestamp;
      await atom.workspace.open(filePath3);
      mostRecentFiles = recentFilesService.getRecentFiles();
      expect(mostRecentFiles.length).toEqual(3);
      expect(mostRecentFiles[0].path.endsWith(filePath3)).toBe(true);
      expect(mostRecentFiles[0].timestamp).toBe(previousTimestamp);
    });

    it('returns paths and timestamps of recently opened files', async () => {
      await (async () => {
        await atom.workspace.open(filePath1);
        const recentFiles = recentFilesService.getRecentFiles();
        const mostRecentFile = recentFiles[0];
        expect(Object.keys(mostRecentFile).length).toEqual(3);
        expect(typeof mostRecentFile.timestamp === 'number').toBe(true);
        expect(mostRecentFile.path.endsWith(filePath1)).toBe(true);
      })();
    });

    it('resets the order of previously tracked files when they are touched', async () => {
      await (async () => {
        let mostRecentFiles;
        expect(recentFilesService.getRecentFiles().length).toEqual(0);

        await atom.workspace.open(filePath1);
        mostRecentFiles = recentFilesService.getRecentFiles();
        expect(mostRecentFiles.length).toEqual(1);
        expect(mostRecentFiles[0].path.endsWith(filePath1)).toBe(true);

        await atom.workspace.open(filePath2);
        mostRecentFiles = recentFilesService.getRecentFiles();
        expect(mostRecentFiles.length).toEqual(2);
        expect(mostRecentFiles[0].path.endsWith(filePath2)).toBe(true);

        await atom.workspace.open(filePath1);
        mostRecentFiles = recentFilesService.getRecentFiles();
        expect(mostRecentFiles.length).toEqual(2);
        expect(mostRecentFiles[0].path.endsWith(filePath1)).toBe(true);
        expect(mostRecentFiles[1].path.endsWith(filePath2)).toBe(true);

        await atom.workspace.open(filePath2);
        mostRecentFiles = recentFilesService.getRecentFiles();
        expect(mostRecentFiles.length).toEqual(2);
        expect(mostRecentFiles[0].path.endsWith(filePath2)).toBe(true);
        expect(mostRecentFiles[1].path.endsWith(filePath1)).toBe(true);
      })();
    });
  });

  describe('initialization and de-serialization', () => {
    it('correctly restores itself from serialized state', () => {
      const serializedState = {
        filelist: [{ resultType: 'FILE', path: filePath1, timestamp: 100 }, { resultType: 'FILE', path: filePath2, timestamp: 200 }, { resultType: 'FILE', path: filePath3, timestamp: 300 }]
      };
      const restoredRecentFilesService = new (_RecentFilesService || _load_RecentFilesService()).default(serializedState);
      const mostRecentFiles = restoredRecentFilesService.getRecentFiles();
      expect(mostRecentFiles).toEqual(serializedState.filelist);
    });

    it('starts out empty if no serialized state is passed to the constructor', () => {
      if (!recentFilesService) {
        throw new Error('Invariant violation: "recentFilesService"');
      }

      expect(recentFilesService.getRecentFiles().length).toEqual(0);
    });
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */