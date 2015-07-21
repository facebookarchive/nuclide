'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {search$FileResult} from '../lib/types';

var {asyncExecute} = require('nuclide-commons');
var fs = require('fs');
var {matchers} = require('nuclide-test-helpers');
var path = require('path');
var scanhandler = require('./../lib/scanhandler');
var temp = require('temp').track();

describe('Scan Handler Tests', () => {
  beforeEach(function() {
    this.addMatchers(matchers);
  });

  /* UNIX GREP TESTS */
  it('Should recursively scan all files in a directory', () => {
    waitsForPromise(async () => {
      // Setup the test folder.
      var folder = temp.mkdirSync();
      fs.writeFileSync(path.join(folder, 'file1.js'), `var a = 4;
        console.log("Hello World!");
        console.log(a);
        console.error("Hello World!");`);

      fs.mkdirSync(path.join(folder, 'directory'));
      fs.writeFileSync(path.join(folder, 'directory', 'file2.js'), `var a = 4;
        console.log("Hello World!");
        console.log(a);`);

      var updates = [];
      var results = await scanhandler.search(folder, 'hello world', update => { updates.push(update) }, false, []);
      var expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'basic.json')));
      expect({results, updates}).diffJson(expected);
    });
  });

  it('Can execute a case sensitive search', () => {
    waitsForPromise(async () => {
      // Setup the test folder.
      var folder = temp.mkdirSync();
      fs.writeFileSync(path.join(folder, 'file1.js'), `var a = 4;
        console.log("Hello World!");
        console.log(a);
        console.error("hello world!");`);

      var updates = [];
      var results = await scanhandler.search(folder, 'hello world', update => { updates.push(update) }, true, []);
      var expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'casesensitive.json')));
      expect({results, updates}).diffJson(expected);
    });
  });

  it('Can execute a search of subdirectories.', () => {
    waitsForPromise(async () => {
      // Setup the test folder.
      var folder = temp.mkdirSync();
      var testCode = 'console.log("Hello World!");'
      fs.mkdirSync(path.join(folder, 'dir1'));
      fs.writeFileSync(path.join(folder, 'dir1', 'file.txt'), testCode);
      fs.mkdirSync(path.join(folder, 'dir2'));
      fs.writeFileSync(path.join(folder, 'dir2', 'file.txt'), testCode);
      fs.mkdirSync(path.join(folder, 'dir3'));
      fs.writeFileSync(path.join(folder, 'dir3', 'file.txt'), testCode);

      var updates = [];
      var results = await scanhandler.search(folder, 'hello world', update => { updates.push(update) }, false, ['dir2', 'dir3', 'nonexistantdir']);
      var expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'subdirs.json')));

      // Since order in which results are returned for different subdirectories may not be deterministic, sort the list of matches by filename
      sortResults(updates);
      sortResults(results);

      expect({results, updates}).diffJson(expected);
    });
  });

  /* GIT GREP TESTS */
  it('Git repo: should ignore untracked files or files listed in .gitignore', () => {
    waitsForPromise(async () => {
      // Create a git repo in a temporary folder.
      var folder = temp.mkdirSync();
      await asyncExecute('git', ['init'], {cwd: folder});

      // Create a file that is ignored.
      fs.writeFileSync(path.join(folder, '.gitignore'), 'ignored.txt');
      fs.writeFileSync(path.join(folder, 'ignored.txt'), 'Hello World!');

      // Create a file that is tracked.
      fs.writeFileSync(path.join(folder, 'tracked.txt'), 'Hello World!');
      await asyncExecute('git', ['add', 'tracked.txt'], {cwd: folder});

      // Create a file that is untracked.
      fs.writeFileSync(path.join(folder, 'untracked.txt'), 'Hello World!');

      var updates = [];
      var results = await scanhandler.search(folder, 'hello world', update => { updates.push(update) }, false, []);
      var expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'repo.json')));
      expect({updates, results}).diffJson(expected);
    });
  });

  // HG Grep test. This test is disabled due to differences in the behavior of
  // Mercurial between v3.3 (where hg grep searches the revision history), and v3.4
  // (where hg grep) searches the working directory.
  xit('Hg repo: should ignore untracked files or files listed in .hgignore', () => {
    waitsForPromise(async () => {
      // Create a git repo in a temporary folder.
      var folder = temp.mkdirSync();
      await asyncExecute('hg', ['init'], {cwd: folder});

      // Create a file that is ignored.
      fs.writeFileSync(path.join(folder, '.hgignore'), 'ignored.txt');
      fs.writeFileSync(path.join(folder, 'ignored.txt'), 'Hello World!');

      // Create a file that is tracked.
      fs.writeFileSync(path.join(folder, 'tracked.txt'), 'Hello World!');
      await asyncExecute('hg', ['add', 'tracked.txt'], {cwd: folder});

      // Create a file that is untracked.
      fs.writeFileSync(path.join(folder, 'untracked.txt'), 'Hello World!');

      await asyncExecute('hg', ['commit', '-m', 'test commit'], {cwd: folder});

      var updates = [];
      var results = await scanhandler.search(folder, 'hello world', update => { updates.push(update) }, false, []);
      var expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'repo.json')));
      expect({updates, results}).diffJson(expected);
    });
  });
});

// Helper function to sort an array of file results - first by their filepath,
// and then by the number of matches.
function sortResults(results: Array<search$FileResult>) {
  results.sort((a, b) => {
    if (a.filePath < b.filePath) {
      return -1;
    } else if (a.filePath > b.filePath) {
      return 1;
    } else {
      return a.matches.length - b.matches.length;
    }
  });
}
