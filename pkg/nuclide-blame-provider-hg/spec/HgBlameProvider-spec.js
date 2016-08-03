'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {__test__} from '../lib/HgBlameProvider';

describe('HgBlameProvider', () => {
  describe('formatBlameInfo', () => {
    it('Returns the front part of an email address, iff an email is present.', () => {
      const originalBlame = new Map([
        ['1', 'Foo Bar <foo@bar.com> faceb00c'],
        ['2', 'A B <a.b@c.org> faceb00c'],
        ['3', 'alice@bob.com null'],
        ['4', '<alice@bob.com> faceb00c'],
        ['5', 'No Email Here faceb00c'],
        ['6', 'Some User baz@abc123-45678f faceb00k'],
      ]);
      const expectedShortenedBlame = new Map([
        [1, {author: 'foo', changeset: 'faceb00c'}],
        [2, {author: 'a.b', changeset: 'faceb00c'}],
        [3, {author: 'alice', changeset: null}],
        [4, {author: 'alice', changeset: 'faceb00c'}],
        [5, {author: 'No Email Here', changeset: 'faceb00c'}],
        [6, {author: 'baz', changeset: 'faceb00k'}],
      ]);
      const formattedBlameInfo = __test__.formatBlameInfo(originalBlame, /* useShortName */ true);
      let numEntries = 0;
      for (const [index, blame] of formattedBlameInfo) {
        ++numEntries;
        expect(blame).toEqual(expectedShortenedBlame.get(index));
      }
      expect(numEntries).toBe(6);
    });
  });
});
