/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {search$FileResult} from '../lib/types';

import {addMatchers} from '../../nuclide-test-helpers';
import {remoteAtomSearch} from '../lib/CodeSearchService';
import {POSIX_TOOLS} from '../lib/searchTools';
import fs from 'fs';
import nuclideUri from 'nuclide-commons/nuclideUri';
import {runCommand} from 'nuclide-commons/process';
import which from 'nuclide-commons/which';
import {generateFixture} from 'nuclide-commons/test-helpers';

describe('Remote Atom Search', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  const tools = POSIX_TOOLS.map(t =>
    which(t).then(cmd => (cmd != null ? t : null)),
  );

  tools.forEach(toolPromise => {
    /* UNIX GREP TESTS */
    it('Should recursively scan all files in a directory', () => {
      waitsForPromise(async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Setup the test folder.
        const folder = await generateFixture(
          'grep-rpc',
          new Map([
            [
              'file1.js',
              `var a = 4;
        console.log("Hello World!");
        console.log(a);
        console.error("Hello World!");`,
            ],
            [
              'directory/file2.js',
              `var a = 4;
        console.log("Hello World!");
        console.log(a);`,
            ],
          ]),
        );

        const results = await remoteAtomSearch(
          folder,
          /hello world/i,
          [],
          false,
          tool,
        )
          .refCount()
          .toArray()
          .toPromise();
        const expected = loadExpectedFixture(folder, 'basic.json');
        sortResults(results);

        expect(results).diffJson(expected);
      });
    });

    it('Can execute a case sensitive search', () => {
      waitsForPromise(async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Setup the test folder.
        const folder = await generateFixture(
          'grep-rpc',
          new Map([
            [
              'file1.js',
              `var a = 4;
        console.log("Hello World!");
        console.log(a);
        console.error("hello world!");`,
            ],
          ]),
        );

        const results = await remoteAtomSearch(
          folder,
          /hello world/,
          [],
          false,
          tool,
        )
          .refCount()
          .toArray()
          .toPromise();
        const expected = loadExpectedFixture(folder, 'casesensitive.json');
        sortResults(results);

        expect(results).diffJson(expected);
      });
    });

    it('Does not crash with no results', () => {
      waitsForPromise(async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Setup the (empty) test folder.
        const folder = await generateFixture('grep-rpc', new Map());

        const results = await remoteAtomSearch(folder, /hello/, [], false, tool)
          .refCount()
          .toArray()
          .toPromise();
        const expected = [];
        expect(results).toEqual(expected);
      });
    });

    it('Can execute a search of subdirectories.', () => {
      waitsForPromise(async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Setup the test folder.
        const folder = await generateFixture(
          'grep-rpc',
          new Map([
            ['dir1/file.txt', 'console.log("Hello World!");'],
            ['dir2/file.txt', 'console.log("Hello World!");'],
            ['dir3/file.txt', 'console.log("Hello World!");'],
          ]),
        );
        const results = await remoteAtomSearch(
          folder,
          /hello world/i,
          ['dir2', 'dir3', 'nonexistantdir'],
          false,
          tool,
        )
          .refCount()
          .toArray()
          .toPromise();
        const expected = loadExpectedFixture(folder, 'subdirs.json');
        sortResults(results);

        expect(results).diffJson(expected);
      });
    });

    it('Should include results from files matching wildcard path name', () => {
      waitsForPromise(async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Create test folders and files
        const folder = await generateFixture(
          'grep-rpc',
          new Map([
            ['foo.js', 'console.log("a wildcard appears!");'],
            ['foo.py', 'console.log("a wildcard appears!");'],
            ['test/foo.js', 'console.log("a wildcard appears!");'],
          ]),
        );
        const results = await remoteAtomSearch(
          folder,
          /a wildcard appears/i,
          ['*.js', 'test'],
          false,
          tool,
        )
          .refCount()
          .toArray()
          .toPromise();
        const expected = loadExpectedFixture(folder, 'wildcard.json');
        sortResults(results);

        expect(results).diffJson(expected);
      });
    });

    it('Should include multiple results matching on the same line', () => {
      waitsForPromise(async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Setup test files
        const folder = await generateFixture(
          'grep-rpc',
          new Map([
            ['foo.js', 'const foo = require("foo");'],
            ['test/foo.js', 'const foo = require("foo");'],
          ]),
        );
        const results = await remoteAtomSearch(
          // Need 'g' flag to search all matches. Normally, Atom inserts it for us.
          folder,
          /foo/g,
          ['*.js', 'test'],
          false,
          tool,
        )
          .refCount()
          .toArray()
          .toPromise();
        const expected = loadExpectedFixture(
          folder,
          'multipleMatchesOnSameLine.json',
        );
        sortResults(results);

        expect(results).diffJson(expected);
      });
    });

    it('Should include results from hidden files.', () => {
      waitsForPromise(async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Setup test files
        const folder = await generateFixture(
          'grep-rpc',
          new Map([
            ['.foo.js', 'const foo = 1;'],
            ['test/.foo.js', 'const foo = 1;'],
          ]),
        );
        const results = await remoteAtomSearch(
          // Need 'g' flag to search all matches. Normally, Atom inserts it for us.
          folder,
          /foo/g,
          ['*.js', 'test'],
          false,
          tool,
        )
          .refCount()
          .toArray()
          .toPromise();
        const expected = loadExpectedFixture(folder, 'hiddenFiles.json');
        sortResults(results);

        expect(results).diffJson(expected);
      });
    });

    /* GIT GREP TESTS */
    it('Git repo: should ignore untracked files or files listed in .gitignore', () => {
      waitsForPromise(async () => {
        const tool = await toolPromise;
        // Run this test once since it tests git grep only.
        if (tool == null || tool !== POSIX_TOOLS[0]) {
          return;
        }
        // Create a git repo in a temporary folder.
        const folder = await generateFixture('grep-rpc');
        await runCommand('git', ['init'], {cwd: folder}).toPromise();

        // Create a file that is ignored.
        fs.writeFileSync(nuclideUri.join(folder, '.gitignore'), 'ignored.txt');
        fs.writeFileSync(
          nuclideUri.join(folder, 'ignored.txt'),
          'Hello World!',
        );

        // Create a file that is tracked.
        fs.writeFileSync(
          nuclideUri.join(folder, 'tracked.txt'),
          'Hello World!',
        );
        await runCommand('git', ['add', 'tracked.txt'], {
          cwd: folder,
        }).toPromise();

        // Create a file that is untracked.
        fs.writeFileSync(
          nuclideUri.join(folder, 'untracked.txt'),
          'Hello World!',
        );

        const results = await remoteAtomSearch(folder, /hello world/i, [], true)
          .refCount()
          .toArray()
          .toPromise();
        const expected = loadExpectedFixture(folder, 'repo.json');
        sortResults(results);

        expect(results).diffJson(expected);
      });
    });

    // HG Grep test. This test is disabled due to differences in the behavior of
    // Mercurial between v3.3 (where hg grep searches the revision history), and v3.4
    // (where hg grep) searches the working directory.
    // eslint-disable-next-line jasmine/no-disabled-tests
    xit('Hg repo: should ignore untracked files or files listed in .hgignore', () => {
      waitsForPromise(async () => {
        const tool = await toolPromise;
        // Run this test once since it tests hg grep only.
        if (tool == null || tool !== POSIX_TOOLS[0]) {
          return;
        }
        // Create a git repo in a temporary folder.
        const folder = await generateFixture('grep-rpc');
        await runCommand('hg', ['init'], {cwd: folder}).toPromise();

        // Create a file that is ignored.
        fs.writeFileSync(nuclideUri.join(folder, '.hgignore'), 'ignored.txt');
        fs.writeFileSync(
          nuclideUri.join(folder, 'ignored.txt'),
          'Hello World!',
        );

        // Create a file that is tracked.
        fs.writeFileSync(
          nuclideUri.join(folder, 'tracked.txt'),
          'Hello World!',
        );
        await runCommand('hg', ['add', 'tracked.txt'], {
          cwd: folder,
        }).toPromise();

        // Create a file that is untracked.
        fs.writeFileSync(
          nuclideUri.join(folder, 'untracked.txt'),
          'Hello World!',
        );

        await runCommand('hg', ['commit', '-m', 'test commit'], {
          cwd: folder,
        }).toPromise();

        const results = await remoteAtomSearch(
          folder,
          /hello world()/i,
          [],
          false,
        )
          .refCount()
          .toArray()
          .toPromise();
        const expected = loadExpectedFixture(folder, 'repo.json');
        sortResults(results);

        expect(results).diffJson(expected);
      });
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

// Helper function to load a result fixture by name and absolutize its paths.
function loadExpectedFixture(
  folder: string,
  fixtureName: string,
): Array<search$FileResult> {
  const fixture = JSON.parse(
    fs.readFileSync(
      nuclideUri.join(__dirname, 'fixtures', fixtureName),
      'utf8',
    ),
  );
  // Join paths in fixtures to make them absolute.
  for (const result of fixture) {
    result.filePath = nuclideUri.join(folder, result.filePath);
  }
  return fixture;
}
