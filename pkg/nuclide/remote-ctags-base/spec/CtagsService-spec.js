'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import path from 'path';

import {findTags, findTagsFile} from '../lib/CtagsService';

const TAGS_PATH = path.join(__dirname, 'fixtures', 'tags');

describe('CtagsService.findTagsFile', () => {
  it('can find the tags file from a path', () => {
    waitsForPromise(async () => {
      const filePath = path.join(__dirname, 'fixtures', 'a.cpp');
      const tagsPath = await findTagsFile(filePath);
      expect(tagsPath).toBe(path.join(__dirname, 'fixtures', 'tags'));
    });
  });

  it('returns null when no tags file exists', () => {
    waitsForPromise(async () => {
      const filePath = '/tmp/';
      const tagsPath = await findTagsFile(filePath);
      expect(tagsPath).toBe(null);
    });
  });
});

describe('CtagsService.findTags', () => {
  it('can read a tags file', () => {
    waitsForPromise(async () => {
      let tags = await findTags(TAGS_PATH, 'a');
      expect(tags).toEqual([
        {
          name: 'a',
          file: path.join(__dirname, 'fixtures', 'a.cpp'),
          lineNumber: 0,
          kind: '',
          pattern: '/^void a() {$/',
        },
      ]);

      tags = await findTags(TAGS_PATH, 'b');
      expect(tags).toEqual([
        {
          name: 'b',
          file: path.join(__dirname, 'fixtures', 'b.cpp'),
          lineNumber: 0,
          kind: '',
          pattern: '/^void b() {$/',
        },
      ]);
    });
  });

  it('ignores missing files', () => {
    waitsForPromise(async () => {
      const tags = await findTags(TAGS_PATH, 'c');
      // A tag for `c` exists, but the file has been deliberately removed.
      expect(tags).toEqual([]);
    });
  });

  it('respects the given limit', () => {
    waitsForPromise(async () => {
      const tags = await findTags(TAGS_PATH, '', {partialMatch: true, limit: 1});
      expect(tags).toEqual([
        {
          name: 'a',
          file: path.join(__dirname, 'fixtures', 'a.cpp'),
          lineNumber: 0,
          kind: '',
          pattern: '/^void a() {$/',
        },
      ]);
    });
  });
});
