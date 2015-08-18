'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var {Directory} = require('atom');
var FileTreeHelpers = require('../lib/FileTreeHelpers');

describe('FileTreeHelpers', () => {
  it('should convert keys to paths', () => {
    expect(FileTreeHelpers.dirKeyToPath('/a')).toBe('/a');
    expect(FileTreeHelpers.dirKeyToPath('/a/')).toBe('/a');
    expect(FileTreeHelpers.dirKeyToPath('/a/b//')).toBe('/a/b');
    expect(FileTreeHelpers.dirKeyToPath('foo://host:123/a/b//')).toBe('foo://host:123/a/b');
  });

  it('should convert paths to keys', () => {
    expect(FileTreeHelpers.dirPathToKey('/a')).toBe('/a/');
    expect(FileTreeHelpers.dirPathToKey('/a/')).toBe('/a/');
    expect(FileTreeHelpers.dirPathToKey('/a//')).toBe('/a/');
  });

  it('should instantiate a directory from a key', () => {
    expect(FileTreeHelpers.getDirectoryByKey('/a/') instanceof Directory).toBe(true);
  });

  it('should validate directories', () => {
    var validDir = new Directory('/a/b/c');
    expect(FileTreeHelpers.isValidDirectory(validDir)).toBe(true);
    var badDir = new Directory('nuclide://host:123/a/b/c');
    expect(FileTreeHelpers.isValidDirectory(badDir)).toBe(false);
  });
});
