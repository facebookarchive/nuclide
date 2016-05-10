'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import fs from 'fs';
import path from 'path';
import temp from 'temp';

import {findIncludingSourceFile} from '../lib/utils';

describe('findIncludingSourceFile', () => {
  let tmpdir;
  beforeEach(() => {
    tmpdir = temp.mkdirSync();
  });

  afterEach(() => {
    temp.cleanupSync();
  });

  it('is able to find an absolute include', () => {
    fs.mkdirSync(path.join(tmpdir, 'a'));
    const sourceFile = path.join(tmpdir, 'a/b.cpp');
    fs.writeFileSync(sourceFile, '#include <a/b.h>');
    waitsForPromise(async () => {
      const file = await findIncludingSourceFile(path.join(tmpdir, 'a/b.h'), tmpdir).toPromise();
      expect(file).toBe(sourceFile);
    });
  });

  it('is able to find a relative include', () => {
    fs.mkdirSync(path.join(tmpdir, 'a'));
    const sourceFile = path.join(tmpdir, 'a/x.cpp');
    fs.writeFileSync(sourceFile, '#include <../x.h>');
    waitsForPromise(async () => {
      const file = await findIncludingSourceFile(path.join(tmpdir, 'x.h'), tmpdir).toPromise();
      expect(file).toBe(sourceFile);
    });
  });

  it('rejects non-matching relative includes', () => {
    fs.mkdirSync(path.join(tmpdir, 'a'));
    fs.writeFileSync(path.join(tmpdir, 'a/x.cpp'), '#include <../../x.h>');
    waitsForPromise(async () => {
      const file = await findIncludingSourceFile(path.join(tmpdir, 'x.h'), tmpdir).toPromise();
      expect(file).toBeNull();
    });
  });

  it('returns null for invalid paths', () => {
    waitsForPromise(async () => {
      const file = await findIncludingSourceFile('/this/is/not/a/path', '/').toPromise();
      expect(file).toBeNull();
    });
  });
});
