'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {shortenBlameNames} = require('../lib/HgBlameProvider').__test__;

describe('HgBlameProvider', () => {
  describe('shortenBlameNames', () => {
    it('Returns the front part of an email address, iff an email is present.', () => {
      var originalBlame = new Map([
        [1, 'Foo Bar <foo@bar.com>'],
        [2, 'A B <a.b@c.org>'],
        [3, 'alice@bob.com'],
        [4, '<alice@bob.com>'],
        [5, 'No Email Here'],
      ]);
      var expectedShortenedBlame = new Map([
        [1, 'foo'],
        [2, 'a.b'],
        [3, 'alice'],
        [4, 'alice'],
        [5, 'No Email Here'],
      ]);
      var shortenedBlame = shortenBlameNames(originalBlame);
      for (var key of shortenedBlame.keys()) {
        expect(shortenedBlame.get(key)).toEqual(expectedShortenedBlame.get(key));
      }
    });
  });
});
