'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {
  Directory,
  File,
} = require('atom');
var FileTreeHelpers = require('../lib/FileTreeHelpers');

describe('FileTreeHelpers', () => {
  it('should convert key to path', () => {
    expect(FileTreeHelpers.keyToPath('/a')).toBe('/a');
    expect(FileTreeHelpers.keyToPath('/a/')).toBe('/a');
    expect(FileTreeHelpers.keyToPath('/a/b//')).toBe('/a/b');
    expect(FileTreeHelpers.keyToPath('nuclide://host:123/a/b//')).toBe('nuclide://host:123/a/b');
  });

  it('should convert path to key', () => {
    expect(FileTreeHelpers.dirPathToKey('/a')).toBe('/a/');
    expect(FileTreeHelpers.dirPathToKey('/a/')).toBe('/a/');
    expect(FileTreeHelpers.dirPathToKey('/a//')).toBe('/a/');
  });

  it('should convert path to name', () => {
    expect(FileTreeHelpers.keyToName('/a/b/foo')).toBe('foo');
    expect(FileTreeHelpers.keyToName('/a/b/foo/')).toBe('foo');
    expect(FileTreeHelpers.keyToName('/a/b/foo//')).toBe('foo');
    expect(FileTreeHelpers.keyToName('nuclide://host:123/a/b/foo//')).toBe('foo');
    expect(FileTreeHelpers.keyToName('asdf')).toBe('asdf');
  });

  it('should determine if a key represents a directory', () => {
    expect(FileTreeHelpers.isDirKey('/a/b/foo')).toBe(false);
    expect(FileTreeHelpers.isDirKey('/a/b/')).toBe(true);
    expect(FileTreeHelpers.isDirKey('/a/b//')).toBe(true);
    expect(FileTreeHelpers.isDirKey('nuclide://host:456/a/b')).toBe(false);
    expect(FileTreeHelpers.isDirKey('nuclide://host:456/a/b/')).toBe(true);
  });

  it('should instantiate a local directory from a key', () => {
    expect(FileTreeHelpers.getDirectoryByKey('/a/') instanceof Directory).toBe(true);
  });

  it('should validate directories', () => {
    var validDir = new Directory('/a/b/c');
    expect(FileTreeHelpers.isValidDirectory(validDir)).toBe(true);
    var badDir = new Directory('nuclide://host:123/a/b/c');
    expect(FileTreeHelpers.isValidDirectory(badDir)).toBe(false);
  });

  describe('getFileByKey', () => {
    it('instantiates a local file from a key', () => {
      expect(FileTreeHelpers.getFileByKey('/a.md') instanceof File).toBe(true);
    });

    it('instantiates a local directory from a key', () => {
      expect(FileTreeHelpers.getFileByKey('/a/') instanceof Directory).toBe(true);
    });
  });
});
