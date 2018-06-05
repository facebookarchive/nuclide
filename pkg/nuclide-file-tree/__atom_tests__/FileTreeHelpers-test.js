'use strict';

var _atom = require('atom');

var _FileTreeHelpers;

function _load_FileTreeHelpers() {
  return _FileTreeHelpers = _interopRequireDefault(require('../lib/FileTreeHelpers'));
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
 */

describe('FileTreeHelpers', () => {
  it('should convert key to path', () => {
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath('/a')).toBe('/a');
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath('/a/')).toBe('/a');
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath('/a/b//')).toBe('/a/b');
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath('nuclide://host/a/b//')).toBe('nuclide://host/a/b');
  });

  it('should convert path to key', () => {
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey('/a')).toBe('/a/');
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey('/a/')).toBe('/a/');
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey('/a//')).toBe('/a/');
  });

  it('should convert path to name', () => {
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToName('/a/b/foo')).toBe('foo');
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToName('/a/b/foo/')).toBe('foo');
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToName('/a/b/foo//')).toBe('foo');
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToName('nuclide://host/a/b/foo//')).toBe('foo');
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToName('asdf')).toBe('asdf');
  });

  it('should determine if a key represents a directory', () => {
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('/a/b/foo')).toBe(false);
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('/a/b/')).toBe(true);
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('/a/b//')).toBe(true);
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('nuclide://host/a/b')).toBe(false);
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('nuclide://host/a/b/')).toBe(true);
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('/a.zip')).toBe(true);
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('/a.zip/')).toBe(true);
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('nuclide://host/a.zip')).toBe(true);
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('nuclide://host/a.zip/')).toBe(true);
  });

  it('should instantiate a local directory from a key', () => {
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey('/a/') instanceof _atom.Directory).toBe(true);
  });

  it('should validate directories', () => {
    const validDir = new _atom.Directory('/a/b/c');
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isValidDirectory(validDir)).toBe(true);
    const badDir = new _atom.Directory('nuclide://host/a/b/c');
    expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isValidDirectory(badDir)).toBe(false);
  });

  describe('getFileByKey', () => {
    it('instantiates a local file from a key', () => {
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.getFileByKey('/a.md') instanceof _atom.File).toBe(true);
    });
  });

  describe('getEntryByKey', () => {
    it('instantiates a local file from a key', () => {
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.getEntryByKey('/a.md') instanceof _atom.File).toBe(true);
    });

    it('instantiates a local directory from a key', () => {
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.getEntryByKey('/a/') instanceof _atom.Directory).toBe(true);
    });
  });

  describe('on Windows', () => {
    it('should convert key to path', () => {
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath('\\a')).toBe('\\a');
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath('\\a\\')).toBe('\\a');
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath('\\a\\b\\\\')).toBe('\\a\\b');
    });

    it('should convert path to key', () => {
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey('\\a')).toBe('\\a\\');
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey('\\a\\')).toBe('\\a\\');
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey('\\a\\\\')).toBe('\\a\\');
    });

    it('should convert path to name', () => {
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToName('\\a\\b\\foo')).toBe('foo');
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToName('\\a\\b\\foo\\')).toBe('foo');
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToName('\\a\\b\\foo\\\\')).toBe('foo');
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToName('asdf')).toBe('asdf');
    });

    it('should determine if a key represents a directory', () => {
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('c:\\a\\b\\foo')).toBe(false);
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('c:\\a\\b\\')).toBe(true);
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('c:\\a\\b\\\\')).toBe(true);
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('c:\\a.zip')).toBe(true);
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isDirOrArchiveKey('c:\\a.zip\\')).toBe(true);
    });

    it('should instantiate a local directory from a key', () => {
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey('\\a\\') instanceof _atom.Directory).toBe(true);
    });

    it('should validate directories', () => {
      const validDir = new _atom.Directory('c:\\a\\b\\c');
      expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.isValidDirectory(validDir)).toBe(true);
    });

    describe('getFileByKey', () => {
      it('instantiates a local file from a key', () => {
        expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.getFileByKey('\\a.md') instanceof _atom.File).toBe(true);
      });
    });

    describe('getEntryByKey', () => {
      it('instantiates a local file from a key', () => {
        expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.getEntryByKey('\\a.md') instanceof _atom.File).toBe(true);
      });

      it('instantiates a local directory from a key', () => {
        expect((_FileTreeHelpers || _load_FileTreeHelpers()).default.getEntryByKey('\\a\\') instanceof _atom.Directory).toBe(true);
      });
    });
  });
});