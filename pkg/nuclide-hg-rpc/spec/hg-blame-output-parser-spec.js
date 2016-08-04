'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {parseHgBlameOutput} from '../lib/hg-blame-output-parser';

const HG_BLAME_OUTPUT_WITH_ERROR =
'[abort: Tools/Nuclide/pkg/blah.js: no such file in rev c2096f856c82';

const HG_BLAME_FOR_FILE_WITH_COMMITTED_AND_UNCOMMITTED_CHANGES =
`[
 {
  "line": "hello",
  "line_number": 1,
  "node": "0559394b114a5245f9675bfa1e13203760a205bb",
  "user": "Abbot B a@b.com"
 },
 {
  "line": "world",
  "line_number": 2,
  "node": null,
  "user": "a@b.com"
 }
]`;

const UNEXPECTED_HG_BLAME_OUTPUT = 'not json';


describe('hg-blame-output-parser', () => {
  describe('parseHgBlameOutput', () => {
    it('handles an error message from Hg.', () => {
      const parseResults = parseHgBlameOutput(HG_BLAME_OUTPUT_WITH_ERROR);
      expect(parseResults).toEqual(new Map());
    });

    it(
      'parses the output of "hg blame" when there are committed and uncommited ' +
      'changes in the file.',
      () => {
        const parseResults =
            parseHgBlameOutput(HG_BLAME_FOR_FILE_WITH_COMMITTED_AND_UNCOMMITTED_CHANGES);
        const expectedBlame = new Map();
        expectedBlame.set('0', 'Abbot B a@b.com 0559394b');
        expectedBlame.set('1', 'a@b.com null');
        expect(parseResults).toEqual(expectedBlame);
      },
    );

    it('gracefully handles unexpected output, e.g. if the error message changes.', () => {
      const parseResults = parseHgBlameOutput(UNEXPECTED_HG_BLAME_OUTPUT);
      expect(parseResults).toEqual(new Map());
    });
  });
});
