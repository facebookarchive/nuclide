'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {parseRevisionFileChangeOutput} = require('../lib/hg-revision-state-helpers');
var path = require('path');

describe('parseRevisionFileChangeOutput', () => {
  var testWorkingDirectory = '/Hg/Working/Directory';
  var test1 = path.join(testWorkingDirectory, 'test1.js');
  var test2 = path.join(testWorkingDirectory, 'test2.js');
  var test3 = path.join(testWorkingDirectory, 'test3.js');
  var test4 = path.join(testWorkingDirectory, 'test4.js');
  var test5 = path.join(testWorkingDirectory, 'test5.js');
  var testOrig1 = path.join(testWorkingDirectory, 'test-orig1.js');
  var testOrig2 = path.join(testWorkingDirectory, 'test-orig2.js');

  it('correctly parses a revision with files added, deleted, copied, and modified.', () => {
    // This output is in the form of the REVISION_FILE_CHANGES_TEMPLATE in hg-revision-state-helpers.
    var testOutput =
`files: test1.js test2.js test3.js test4.js test5.js
file-adds: test1.js test2.js
file-dels: test3.js test4.js
file-copies: test1.js (test-orig1.js)test2.js (test-orig2.js)
file-mods: test4.js test5.js`;
    var result = parseRevisionFileChangeOutput(testOutput, testWorkingDirectory);
    var expectedResult = {
      all: [test1, test2, test3, test4, test5],
      added: [test1, test2],
      deleted: [test3, test4],
      copied: [
        {from: testOrig1, to: test1},
        {from: testOrig2, to: test2}
      ],
      modified: [test4, test5],
    };
    expect(result).toEqual(expectedResult);
  });

  // While this isn't a technically possible situation, the parser doesn't care.
  // This lets us to test the null cases all at once.
  it('correctly parses a revision with no files added, deleted, copied, or modified.', () => {
    // This output is in the form of the REVISION_FILE_CHANGES_TEMPLATE in hg-revision-state-helpers.
    var testOutput =
`files:
file-adds:
file-dels:
file-copies:
file-mods:`;
    var result = parseRevisionFileChangeOutput(testOutput, testWorkingDirectory);
    var expectedResult = {
      all: [],
      added: [],
      deleted: [],
      copied: [],
      modified: [],
    };
    expect(result).toEqual(expectedResult);
  });
});
