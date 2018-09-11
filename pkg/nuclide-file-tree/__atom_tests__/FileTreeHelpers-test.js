"use strict";

var _atom = require("atom");

function FileTreeHelpers() {
  const data = _interopRequireWildcard(require("../lib/FileTreeHelpers"));

  FileTreeHelpers = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
describe('FileTreeHelpers', () => {
  it('should convert key to path', () => {
    expect(FileTreeHelpers().keyToPath('/a')).toBe('/a');
    expect(FileTreeHelpers().keyToPath('/a/')).toBe('/a');
    expect(FileTreeHelpers().keyToPath('/a/b//')).toBe('/a/b');
    expect(FileTreeHelpers().keyToPath('nuclide://host/a/b//')).toBe('nuclide://host/a/b');
  });
  it('should convert path to key', () => {
    expect(FileTreeHelpers().dirPathToKey('/a')).toBe('/a/');
    expect(FileTreeHelpers().dirPathToKey('/a/')).toBe('/a/');
    expect(FileTreeHelpers().dirPathToKey('/a//')).toBe('/a/');
  });
  it('should convert path to name', () => {
    expect(FileTreeHelpers().keyToName('/a/b/foo')).toBe('foo');
    expect(FileTreeHelpers().keyToName('/a/b/foo/')).toBe('foo');
    expect(FileTreeHelpers().keyToName('/a/b/foo//')).toBe('foo');
    expect(FileTreeHelpers().keyToName('nuclide://host/a/b/foo//')).toBe('foo');
    expect(FileTreeHelpers().keyToName('asdf')).toBe('asdf');
  });
  it('should instantiate a local directory from a key', () => {
    expect(FileTreeHelpers().getDirectoryByKey('/a/') instanceof _atom.Directory).toBe(true);
  });
  it('should validate directories', () => {
    const validDir = new _atom.Directory('/a/b/c');
    expect(FileTreeHelpers().isValidDirectory(validDir)).toBe(true);
    const badDir = new _atom.Directory('nuclide://host/a/b/c');
    expect(FileTreeHelpers().isValidDirectory(badDir)).toBe(false);
  });
  describe('getFileByKey', () => {
    it('instantiates a local file from a key', () => {
      expect(FileTreeHelpers().getFileByKey('/a.md') instanceof _atom.File).toBe(true);
    });
  });
  describe('getEntryByKey', () => {
    it('instantiates a local file from a key', () => {
      expect(FileTreeHelpers().getEntryByKey('/a.md') instanceof _atom.File).toBe(true);
    });
    it('instantiates a local directory from a key', () => {
      expect(FileTreeHelpers().getEntryByKey('/a/') instanceof _atom.Directory).toBe(true);
    });
  });
  describe('on Windows', () => {
    it('should convert key to path', () => {
      expect(FileTreeHelpers().keyToPath('\\a')).toBe('\\a');
      expect(FileTreeHelpers().keyToPath('\\a\\')).toBe('\\a');
      expect(FileTreeHelpers().keyToPath('\\a\\b\\\\')).toBe('\\a\\b');
    });
    it('should convert path to key', () => {
      expect(FileTreeHelpers().dirPathToKey('\\a')).toBe('\\a\\');
      expect(FileTreeHelpers().dirPathToKey('\\a\\')).toBe('\\a\\');
      expect(FileTreeHelpers().dirPathToKey('\\a\\\\')).toBe('\\a\\');
    });
    it('should convert path to name', () => {
      expect(FileTreeHelpers().keyToName('\\a\\b\\foo')).toBe('foo');
      expect(FileTreeHelpers().keyToName('\\a\\b\\foo\\')).toBe('foo');
      expect(FileTreeHelpers().keyToName('\\a\\b\\foo\\\\')).toBe('foo');
      expect(FileTreeHelpers().keyToName('asdf')).toBe('asdf');
    });
    it('should instantiate a local directory from a key', () => {
      expect(FileTreeHelpers().getDirectoryByKey('\\a\\') instanceof _atom.Directory).toBe(true);
    });
    it('should validate directories', () => {
      const validDir = new _atom.Directory('c:\\a\\b\\c');
      expect(FileTreeHelpers().isValidDirectory(validDir)).toBe(true);
    });
    describe('getFileByKey', () => {
      it('instantiates a local file from a key', () => {
        expect(FileTreeHelpers().getFileByKey('\\a.md') instanceof _atom.File).toBe(true);
      });
    });
    describe('getEntryByKey', () => {
      it('instantiates a local file from a key', () => {
        expect(FileTreeHelpers().getEntryByKey('\\a.md') instanceof _atom.File).toBe(true);
      });
      it('instantiates a local directory from a key', () => {
        expect(FileTreeHelpers().getEntryByKey('\\a\\') instanceof _atom.Directory).toBe(true);
      });
    });
  });
});