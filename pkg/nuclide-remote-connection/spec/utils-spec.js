'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {containsPathSync} = require('../lib/utils');
const fs = require('fs');
const path = require('path');
const temp = require('temp').track();

describe('containsPathSync()', () => {

  it('returns true if a direct child of the root path', () => {
    expect(containsPathSync('/absolute/root', '/absolute/root/file.txt')).toBe(true);
  });

  it('returns true if a deep child of the root path', () => {
    expect(containsPathSync('/absolute/root', '/absolute/root/some/directory')).toBe(true);
  });

  it('returns false if the root does not match the check path', () => {
    expect(containsPathSync('/absolute/root', '/absolute/root_abc/child/path')).toBe(false);
  });

  it('returns true if the the root path is a symlink or if the file is a symlink', () => {
    const directoryPath = temp.mkdirSync();
    const originalDirPath = path.join(directoryPath, 'dir_1');
    const symlinkDirPath = path.join(directoryPath, 'dir_2');
    fs.mkdirSync(originalDirPath);
    fs.symlinkSync(originalDirPath, symlinkDirPath, 'file');
    const filePath = path.join(symlinkDirPath, 'file.txt');
    fs.writeFileSync(filePath, 'test', 'utf8');
    const fileRealPath = fs.realpathSync(filePath);

    expect(fileRealPath).toBe(path.join(fs.realpathSync(originalDirPath), 'file.txt'));
    expect(containsPathSync(originalDirPath, filePath)).toBe(true);
    expect(containsPathSync(symlinkDirPath, filePath)).toBe(true);
  });

});
