'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {asyncExecute} = require("nuclide-commons");
var fs = require('fs');
var path = require('path');
var scanhandler = require('./../lib/scanhandler');
var temp = require('temp').track();

describe('Scan Handler Tests', () => {

  // find -exec grep test.
  it('Should scan all files in a directory', () => {
    waitsForPromise(async () => {
      // Setup the test folder.
      var folder = temp.mkdirSync();
      fs.writeFileSync(path.join(folder, 'file1.js'), `var a = 4;
        console.log("Hello World!");
        console.log(a);`);

      fs.mkdirSync(path.join(folder, 'directory'));
      fs.writeFileSync(path.join(folder, 'directory', 'file2.js'), `var a = 4;
        console.log("Hello World!");
        console.log(a);`);

      var results = await scanhandler.search(folder, 'Hello World');
      var expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'basic.json')));
      expect(expected).toEqual(results);
    });
  });

  // git grep test.
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

      var results = await scanhandler.search(folder, 'Hello World');
      var expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'repo.json')));
      expect(results).toEqual(expected);
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

      var results = await scanhandler.search(folder, 'Hello World');
      var expected = JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'repo.json')));
      expect(results).toEqual(expected);
    });
  });
});
