'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {parseHgBlameOutput} = require('../lib/hg-blame-output-parser');

// `hg blame` output
var hgBlameOutputWithError =
`[abort: Tools/Nuclide/pkg/blah.js: no such file in rev c2096f856c82`;

var hgBlameForFileWithCommitAndUncommittedChanges =
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

var unexpectedHgBlameOutput = 'not json';


describe('hg-blame-output-parser', () => {
  describe('parseHgBlameOutput', () => {
    it('handles an error message from Hg.', () => {
      var parseResults = parseHgBlameOutput(hgBlameOutputWithError);
      expect(parseResults).toEqual(new Map());
    });

    it('parses the output of "hg blame" when there are committed and uncommited changes in the file.', () => {
      var parseResults = parseHgBlameOutput(hgBlameForFileWithCommitAndUncommittedChanges);
      var expectedBlame = new Map();
      expectedBlame.set('0', 'Abbot B a@b.com 0559394b');
      expectedBlame.set('1', 'a@b.com null');
      expect(parseResults).toEqual(expectedBlame);
    });

    it('gracefully handles unexpected output, e.g. if the error message changes.', () => {
      var parseResults = parseHgBlameOutput(unexpectedHgBlameOutput);
      expect(parseResults).toEqual(new Map());
    });
  });
});
