/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import nuclideUri from 'nuclide-commons/nuclideUri';
import {generateFixture} from 'nuclide-commons/test-helpers';
import {RelatedFileFinder} from '../lib/related-file/finders';

describe('getRelatedSourceForHeader', () => {
  const finder = new RelatedFileFinder();
  it('is able to find an absolute include with project root but with a different real root', () => {
    waitsForPromise(async () => {
      spyOn(finder, '_getProjectRoots').andReturn(['project/subproject']);
      const tmpdir = await generateFixture(
        'clang_rpc',
        new Map([
          [
            'a/project/subproject/subroot/source.cpp',
            '#include "subroot/header.h"',
          ],
        ]),
      );
      const sourceFile = nuclideUri.join(
        tmpdir,
        'a/project/subproject/subroot/source.cpp',
      );
      const file = await finder.getRelatedSourceForHeader(
        nuclideUri.join(tmpdir, 'a/project/subproject/subroot/header.h'),
        nuclideUri.join(tmpdir, 'a/project/subproject/subroot'),
      );
      expect(file).toBe(sourceFile);
    });
  });

  it('is able to find an absolute include without project root', () => {
    spyOn(finder, '_getProjectRoots').andReturn(['project/subproject']);
    waitsForPromise(async () => {
      const tmpdir = await generateFixture(
        'clang_rpc',
        new Map([
          [
            'a/project/subproject/subroot/source.cpp',
            '#include "subroot/header.h"',
          ],
        ]),
      );
      const sourceFile = nuclideUri.join(
        tmpdir,
        'a/project/subproject/subroot/source.cpp',
      );
      const file = await finder.getRelatedSourceForHeader(
        nuclideUri.join(tmpdir, 'a/project/subproject/subroot/header.h'),
      );
      expect(file).toBe(sourceFile);
    });
  });

  it('is able to find an absolute include', () => {
    waitsForPromise(async () => {
      const tmpdir = await generateFixture(
        'clang_rpc',
        new Map([['a/b.cpp', '#include <a/b.h>']]),
      );
      const sourceFile = nuclideUri.join(tmpdir, 'a/b.cpp');
      const file = await finder.getRelatedSourceForHeader(
        nuclideUri.join(tmpdir, 'a/b.h'),
        tmpdir,
      );
      expect(file).toBe(sourceFile);
    });
  });

  it('is able to find a relative include', () => {
    waitsForPromise(async () => {
      const tmpdir = await generateFixture(
        'clang_rpc',
        new Map([['a/x.cpp', '#include <../x.h>']]),
      );
      const sourceFile = nuclideUri.join(tmpdir, 'a/x.cpp');
      const file = await finder.getRelatedSourceForHeader(
        nuclideUri.join(tmpdir, 'x.h'),
        tmpdir,
      );
      expect(file).toBe(sourceFile);
    });
  });

  it('rejects non-matching relative includes', () => {
    waitsForPromise(async () => {
      const tmpdir = await generateFixture(
        'clang_rpc',
        new Map([['a/b.cpp', '#include <../../x.h>']]),
      );
      const file = await finder.getRelatedSourceForHeader(
        nuclideUri.join(tmpdir, 'x.h'),
        tmpdir,
      );
      expect(file).toBeNull();
    });
  });

  it('returns null for invalid paths', () => {
    waitsForPromise(async () => {
      const file = await finder.getRelatedSourceForHeader(
        '/this/is/not/a/path',
        '/',
      );
      expect(file).toBeNull();
    });
  });
});
