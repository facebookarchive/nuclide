'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {fixtures} from '..';
import fs from 'fs';
import nuclideUri from '../../nuclide-remote-uri';
import glob from 'glob';

const {copyFixture, generateFixture} = fixtures;

describe('copyFixture', () => {

  it('should copy a directory recursively', () => {
    waitsForPromise(async () => {
      const copyOfFixture = await copyFixture('fixture-to-copy', __dirname);
      expect(nuclideUri.isAbsolute(copyOfFixture)).toBe(true);

      expect(fs.statSync(copyOfFixture).isDirectory()).toBe(true);

      const file1txt = nuclideUri.join(copyOfFixture, 'file1.txt');
      expect(fs.statSync(file1txt).isFile()).toBe(true);
      expect(fs.readFileSync(file1txt, 'utf8')).toBe('hello\n');

      const dir1 = nuclideUri.join(copyOfFixture, 'dir1');
      expect(fs.statSync(dir1).isDirectory()).toBe(true);

      const file2txt = nuclideUri.join(dir1, 'file2.txt');
      expect(fs.statSync(file2txt).isFile()).toBe(true);
      expect(fs.readFileSync(file2txt, 'utf8')).toBe('world\n');
    });
  });
});

describe('generateFixture', () => {
  it('should create the directory hierarchy', () => {
    waitsForPromise(async () => {
      const fixturePath = await generateFixture(
        'fixture-to-generate',
        new Map([
          ['foo.js'],
          ['bar/baz.txt', 'some text'],
        ])
      );

      expect(nuclideUri.isAbsolute(fixturePath)).toBe(true);
      expect(fs.statSync(fixturePath).isDirectory()).toBe(true);

      const fooPath = nuclideUri.join(fixturePath, 'foo.js');
      const bazPath = nuclideUri.join(fixturePath, 'bar/baz.txt');

      expect(fs.statSync(fooPath).isFile()).toBe(true);
      expect(fs.statSync(bazPath).isFile()).toBe(true);

      expect(fs.readFileSync(fooPath, 'utf8')).toBe('');
      expect(fs.readFileSync(bazPath, 'utf8')).toBe('some text');
    });
  });

  it('should work with lots of files', () => {
    waitsForPromise({timeout: 10000}, async () => {
      const files = new Map();
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 1000; j++) {
          files.set(`dir_${i}/file_${j}.txt`, `${i} + ${j} = ${i + j}`);
        }
      }
      const fixturePath = await generateFixture('lots-of-files', files);
      const fixtureFiles = glob.sync(nuclideUri.join(fixturePath, 'dir_*/file_*.txt'));
      expect(fixtureFiles.length).toBe(10000);
    });
  });

  it('should work with no files', () => {
    waitsForPromise(async () => {
      const fixturePath = await generateFixture('fixture-empty', new Map());
      expect(nuclideUri.isAbsolute(fixturePath)).toBe(true);
      expect(fs.statSync(fixturePath).isDirectory()).toBe(true);
      expect(fs.readdirSync(fixturePath)).toEqual([]);
    });
  });

  it('works with no files arg', () => {
    waitsForPromise(async () => {
      const fixturePath = await generateFixture('fixture-empty');
      expect(nuclideUri.isAbsolute(fixturePath)).toBe(true);
      expect(fs.statSync(fixturePath).isDirectory()).toBe(true);
      expect(fs.readdirSync(fixturePath)).toEqual([]);
    });
  });
});

