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

const {asyncExecute} = require('nuclide-commons');
const fs = require('fs');
const {addMatchers} = require('nuclide-test-helpers');
const path = require('path');
const temp = require('temp').track();

import search from './../lib/scanhandler';

describe('Scan Handler Tests', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  /* UNIX GREP TESTS */
  it('Should recursively scan all files in a directory', () => {
    waitsForPromise(async () => {
      // Setup the test folder.
      const folder = temp.mkdirSync();
      fs.writeFileSync(path.join(folder, 'file1.js'), `var a = 4;
        console.log("Hello World!");
        console.log(a);
        console.error("Hello World!");`);

      fs.mkdirSync(path.join(folder, 'directory'));
      fs.writeFileSync(path.join(folder, 'directory', 'file2.js'), `var a = 4;
        console.log("Hello World!");
        console.log(a);`);

      const results = await search(folder, /hello world/i, []).toArray().toPromise();
      const expected = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'fixtures', 'basic.json'), 'utf8')
      );

      // Sort results by filename to normalize order.
      sortResults(results);
      expect(results).diffJson(expected);
    });
  });

  it('Can execute a case sensitive search', () => {
    waitsForPromise(async () => {
      // Setup the test folder.
      const folder = temp.mkdirSync();
      fs.writeFileSync(path.join(folder, 'file1.js'), `var a = 4;
        console.log("Hello World!");
        console.log(a);
        console.error("hello world!");`);

      const results = await search(folder, /hello world/, []).toArray().toPromise();
      const expected = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'fixtures', 'casesensitive.json'), 'utf8')
      );

      // Sort the list of matches by filename to normalize order.
      sortResults(results);
      expect(results).diffJson(expected);
    });
  });

  it('Can execute a search of subdirectories.', () => {
    waitsForPromise(async () => {
      // Setup the test folder.
      const folder = temp.mkdirSync();
      const testCode = 'console.log("Hello World!");';
      fs.mkdirSync(path.join(folder, 'dir1'));
      fs.writeFileSync(path.join(folder, 'dir1', 'file.txt'), testCode);
      fs.mkdirSync(path.join(folder, 'dir2'));
      fs.writeFileSync(path.join(folder, 'dir2', 'file.txt'), testCode);
      fs.mkdirSync(path.join(folder, 'dir3'));
      fs.writeFileSync(path.join(folder, 'dir3', 'file.txt'), testCode);

      const results = await search(
        folder, /hello world/i, ['dir2', 'dir3', 'nonexistantdir']
      ).toArray().toPromise();
      const expected = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'fixtures', 'subdirs.json'), 'utf8')
      );

      // Sort the list of matches by filename to normalize order.
      sortResults(results);
      expect(results).diffJson(expected);
    });
  });

  /* GIT GREP TESTS */
  it('Git repo: should ignore untracked files or files listed in .gitignore', () => {
    waitsForPromise(async () => {
      // Create a git repo in a temporary folder.
      const folder = temp.mkdirSync();
      await asyncExecute('git', ['init'], {cwd: folder});

      // Create a file that is ignored.
      fs.writeFileSync(path.join(folder, '.gitignore'), 'ignored.txt');
      fs.writeFileSync(path.join(folder, 'ignored.txt'), 'Hello World!');

      // Create a file that is tracked.
      fs.writeFileSync(path.join(folder, 'tracked.txt'), 'Hello World!');
      await asyncExecute('git', ['add', 'tracked.txt'], {cwd: folder});

      // Create a file that is untracked.
      fs.writeFileSync(path.join(folder, 'untracked.txt'), 'Hello World!');

      const results = await search(folder, /hello world/i, []).toArray().toPromise();
      const expected = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'fixtures', 'repo.json'), 'utf8')
      );

      // Sort the list of matches by filename to normalize order.
      sortResults(results);
      expect(results).diffJson(expected);
    });
  });

  // HG Grep test. This test is disabled due to differences in the behavior of
  // Mercurial between v3.3 (where hg grep searches the revision history), and v3.4
  // (where hg grep) searches the working directory.
  xit('Hg repo: should ignore untracked files or files listed in .hgignore', () => {
    waitsForPromise(async () => {
      // Create a git repo in a temporary folder.
      const folder = temp.mkdirSync();
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

      const results = await search(folder, /hello world/i, []).toArray().toPromise();
      const expected = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'fixtures', 'repo.json'), 'utf8')
      );

      // Sort the list of matches by filename to normalize order.
      sortResults(results);
      expect(results).diffJson(expected);
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
