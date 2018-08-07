"use strict";

function _ArchiveDirectory() {
  const data = require("../lib/ArchiveDirectory");

  _ArchiveDirectory = function () {
    return data;
  };

  return data;
}

function _ArchiveFile() {
  const data = require("../lib/ArchiveFile");

  _ArchiveFile = function () {
    return data;
  };

  return data;
}

function _ArchiveFileAsDirectory() {
  const data = require("../lib/ArchiveFileAsDirectory");

  _ArchiveFileAsDirectory = function () {
    return data;
  };

  return data;
}

function _nuclideFsAtom() {
  const data = require("../../nuclide-fs-atom");

  _nuclideFsAtom = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
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
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
const fixtures = _nuclideUri().default.join(__dirname, '../../nuclide-fs/__mocks__/fixtures');

const PARENT_TEXT = 'Parent directory text file contents\n';
const CHILD_TEXT = 'Child directory text file contents\n';
const PARENT_DIR = ['Directory', 'EmptyDirectory', 'EmptyFile', 'LinkDirectory', 'LinkDirectorySlashTextFile.txt', 'LinkLinkDirectory', 'LinkLinkDirectorySlashTextFile.txt', 'TextFile.txt'];
const CHILD_DIR = ['LinkDotDotSlashTextFile.txt', 'TextFile.txt'];
const DIR_ZIP_DIR = fixture('dir.zip', 'dir');
describe('dir.zip/dir', () => {
  const dir = _nuclideFsAtom().ROOT_ARCHIVE_FS.newArchiveDirectory(DIR_ZIP_DIR);

  checkRoot(dir);
});

function checkRoot(root) {
  describe('root', () => {
    checkGetEntries(root, PARENT_DIR);
  });
  describe('Directory', () => {
    const directory = root.getSubdirectory('Directory');
    checkGetEntries(directory, CHILD_DIR);
    describe('TextFile', () => {
      const directoryTextFile = directory.getFile('TextFile.txt');
      checkTextFile(directoryTextFile, CHILD_TEXT);
    });
  });
  describe('EmptyDirectory', () => {
    const emptyDirectory = root.getSubdirectory('EmptyDirectory');
    checkGetEntries(emptyDirectory, []);
  });
  describe('EmptyFile', () => {
    const emptyFile = root.getFile('EmptyFile');
    checkTextFile(emptyFile, '');
  });
  describe('TextFile', () => {
    const textFile = root.getFile('TextFile.txt');
    checkTextFile(textFile, PARENT_TEXT);
  });
}

function checkGetEntries(directory, expected) {
  checkDirectory(directory);
  checkExistingPath(directory);
  describe('getEntries', () => {
    it('returns expected names', async () => {
      await (() => new Promise((resolve, reject) => directory.getEntries((error, entries) => {
        if (entries != null) {
          expect(names(entries)).toEqual(expected);
          resolve();
        } else {
          reject(error);
        }
      })))();
    });
  });
}

function checkTextFile(entry, contents) {
  checkFile(entry);
  checkExistingPath(entry);
  checkText(entry, contents);
}

function checkText(entry, contents) {
  describe(`text file ${entry.getBaseName()}`, () => {
    it('has expected contents', async () => {
      expect((await entry.read())).toEqual(contents);
    });
  });
}

function checkDirectory(entry) {
  describe('directory isDirectory', () => {
    it('is true', () => {
      expect(entry.isDirectory()).toBeTruthy();
    });
  });
  describe('directory isFile', () => {
    it('is false', () => {
      expect(entry.isFile()).toBeFalsy();
    });
  });
}

function checkFile(entry) {
  describe('file isDirectory', () => {
    it('is false', () => {
      expect(entry.isDirectory()).toBeFalsy();
    });
  });
  describe('file isFile', () => {
    it('is true', () => {
      expect(entry.isFile()).toBeTruthy();
    });
  });
}

function checkExistingPath(entry) {
  describe('existence', () => {
    it('is true', async () => {
      expect((await entry.exists())).toBeTruthy();
    });
  });
}

function fixture(dir, archiveOffset) {
  const fsDir = _nuclideUri().default.join(fixtures, dir);

  if (archiveOffset == null) {
    return fsDir;
  } else {
    return _nuclideUri().default.archiveJoin(fsDir, archiveOffset);
  }
}

function names(entries) {
  return entries.map(x => x.getBaseName());
}