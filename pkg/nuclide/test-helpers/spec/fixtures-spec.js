'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
import {fixtures} from '../lib/main';
import fs from 'fs';
import path from 'path';

var {copyFixture} = fixtures;

describe('copyFixture', () => {

  it('should copy a directory recursively', () => {
    waitsForPromise(async () => {
      var copyOfFixture = await copyFixture('fixture-to-copy', __dirname);
      expect(path.isAbsolute(copyOfFixture)).toBe(true);

      expect(fs.statSync(copyOfFixture).isDirectory()).toBe(true);

      var file1txt = path.join(copyOfFixture, 'file1.txt');
      expect(fs.statSync(file1txt).isFile()).toBe(true);
      expect(fs.readFileSync(file1txt, 'utf8')).toBe('hello\n');

      var dir1 = path.join(copyOfFixture, 'dir1');
      expect(fs.statSync(dir1).isDirectory()).toBe(true);

      var file2txt = path.join(dir1, 'file2.txt');
      expect(fs.statSync(file2txt).isFile()).toBe(true);
      expect(fs.readFileSync(file2txt, 'utf8')).toBe('world\n');
    });
  });
});
