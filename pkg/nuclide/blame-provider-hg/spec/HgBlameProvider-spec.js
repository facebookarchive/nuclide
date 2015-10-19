'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {formatBlameInfo} = require('../lib/HgBlameProvider').__test__;

describe('HgBlameProvider', () => {
  describe('formatBlameInfo', () => {
    it('Returns the front part of an email address, iff an email is present.', () => {
      var originalBlame = new Map([
        ['1', 'Foo Bar <foo@bar.com> faceb00c'],
        ['2', 'A B <a.b@c.org> faceb00c'],
        ['3', 'alice@bob.com null'],
        ['4', '<alice@bob.com> faceb00c'],
        ['5', 'No Email Here faceb00c'],
      ]);
      var expectedShortenedBlame = new Map([
        [1, {author: 'foo', changeset: 'faceb00c'}],
        [2, {author: 'a.b', changeset: 'faceb00c'}],
        [3, {author: 'alice', changeset: null}],
        [4, {author: 'alice', changeset: 'faceb00c'}],
        [5, {author: 'No Email Here', changeset: 'faceb00c'}],
      ]);
      var formattedBlameInfo = formatBlameInfo(originalBlame, /* useShortName */ true);
      var numEntries = 0;
      for (var [index, blame] of formattedBlameInfo) {
        ++numEntries;
        expect(blame).toEqual(expectedShortenedBlame.get(index));
      }
      expect(numEntries).toBe(5);
    });
  });
});
