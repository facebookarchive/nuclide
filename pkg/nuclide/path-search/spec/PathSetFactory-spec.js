'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var fs = require('fs');
var {asyncExecute} = require('nuclide-commons');
var {getFilesFromHg} = require('../lib/PathSetFactory')['__test__'];
var path = require('path');
var temp = require('temp').track();

describe('PathSetFactory', () => {
  var TRACKED_FILE_BASE = 'tracked.js';
  var UNTRACKED_FILE_BASE = 'untracked.js';
  var IGNORED_FILE_BASE = 'ignored.js';

  var testDir;
  var trackedFile;
  var untrackedFile;
  var ignoredFile;
  beforeEach(() => {
    testDir = temp.mkdirSync();
    testDir = fs.realpathSync(testDir);
    trackedFile = path.join(testDir, TRACKED_FILE_BASE);
    untrackedFile = path.join(testDir, UNTRACKED_FILE_BASE);
    ignoredFile = path.join(testDir, IGNORED_FILE_BASE);
  });

  describe('getFilesFromHg()', () => {
    var setUpHgRepo = async () => {
      // Add a tracked file, ignored file, and untracked file.
      await asyncExecute('hg', ['init'], {cwd: testDir});
      fs.writeFileSync(trackedFile);
      fs.writeFileSync(path.join(testDir, '.hgignore'), `.hgignore\n${IGNORED_FILE_BASE}`);
      fs.writeFileSync(ignoredFile);
      await asyncExecute('hg', ['addremove'], {cwd: testDir});
      fs.writeFileSync(untrackedFile);
    };

    it('returns tracked and untracked files, but not ignored files.', () => {
      waitsForPromise(async () => {
        await setUpHgRepo();
        var expectedOutput = {
          [TRACKED_FILE_BASE]: true,
          [UNTRACKED_FILE_BASE]: true,
        };
        var fetchedFiles = await getFilesFromHg(testDir);
        expect(fetchedFiles).toEqual(expectedOutput);
      });
    });
  });
});
