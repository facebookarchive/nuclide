'use strict';

var _CodeSearchService;

function _load_CodeSearchService() {
  return _CodeSearchService = require('../lib/CodeSearchService');
}

var _searchTools;

function _load_searchTools() {
  return _searchTools = require('../lib/searchTools');
}

var _fs = _interopRequireDefault(require('fs'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _which;

function _load_which() {
  return _which = _interopRequireDefault(require('../../../modules/nuclide-commons/which'));
}

var _testHelpers;

function _load_testHelpers() {
  return _testHelpers = require('../../../modules/nuclide-commons/test-helpers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

describe('Remote Atom Search by directory', () => {
  const tools = (_searchTools || _load_searchTools()).POSIX_TOOLS.map(t => (0, (_which || _load_which()).default)(t).then(cmd => cmd != null ? t : null));

  tools.forEach(toolPromise => {
    /* UNIX GREP TESTS */
    it('Should recursively scan all files in a directory', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Setup the test folder.
        const folder = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('grep-rpc', new Map([['file1.js', `var a = 4;
        console.log("Hello World!");
        console.log(a);
        console.error("Hello World!");`], ['directory/file2.js', `var a = 4;
        console.log("Hello World!");
        console.log(a);`]]));

        const results = await (0, (_CodeSearchService || _load_CodeSearchService()).remoteAtomSearch)(folder, /hello world/i, [], false, tool).refCount().toArray().toPromise();
        const expected = loadExpectedFixture(folder, 'basic.json');
        sortResults(results);

        expect(results).toEqual(expected);
      })();
    });

    it('Can execute a case sensitive search', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Setup the test folder.
        const folder = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('grep-rpc', new Map([['file1.js', `var a = 4;
        console.log("Hello World!");
        console.log(a);
        console.error("hello world!");`]]));

        const results = await (0, (_CodeSearchService || _load_CodeSearchService()).remoteAtomSearch)(folder, /hello world/, [], false, tool).refCount().toArray().toPromise();
        const expected = loadExpectedFixture(folder, 'casesensitive.json');
        sortResults(results);

        expect(results).toEqual(expected);
      })();
    });

    it('Does not crash with no results', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Setup the (empty) test folder.
        const folder = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('grep-rpc', new Map());

        const results = await (0, (_CodeSearchService || _load_CodeSearchService()).remoteAtomSearch)(folder, /hello/, [], false, tool).refCount().toArray().toPromise();
        const expected = [];
        expect(results).toEqual(expected);
      })();
    });

    it('Can execute a search of subdirectories.', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Setup the test folder.
        const folder = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('grep-rpc', new Map([['dir1/file.txt', 'console.log("Hello World!");'], ['dir2/file.txt', 'console.log("Hello World!");'], ['dir3/file.txt', 'console.log("Hello World!");']]));
        const results = await (0, (_CodeSearchService || _load_CodeSearchService()).remoteAtomSearch)(folder, /hello world/i, ['dir2', 'dir3', 'nonexistantdir'], false, tool).refCount().toArray().toPromise();
        const expected = loadExpectedFixture(folder, 'subdirs.json');
        sortResults(results);

        expect(results).toEqual(expected);
      })();
    });

    it('Should include results from files matching wildcard path name', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Create test folders and files
        const folder = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('grep-rpc', new Map([['foo.js', 'console.log("a wildcard appears!");'], ['foo.py', 'console.log("a wildcard appears!");'], ['test/foo.js', 'console.log("a wildcard appears!");']]));
        const results = await (0, (_CodeSearchService || _load_CodeSearchService()).remoteAtomSearch)(folder, /a wildcard appears/i, ['*.js', 'test'], false, tool).refCount().toArray().toPromise();
        const expected = loadExpectedFixture(folder, 'wildcard.json');
        sortResults(results);

        expect(results).toEqual(expected);
      })();
    });

    it('Should include multiple results matching on the same line', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Setup test files
        const folder = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('grep-rpc', new Map([['foo.js', 'const foo = require("foo");'], ['test/foo.js', 'const foo = require("foo");']]));
        const results = await (0, (_CodeSearchService || _load_CodeSearchService()).remoteAtomSearch)(
        // Need 'g' flag to search all matches. Normally, Atom inserts it for us.
        folder, /foo/g, ['*.js', 'test'], false, tool).refCount().toArray().toPromise();
        const expected = loadExpectedFixture(folder, 'multipleMatchesOnSameLine.json');
        sortResults(results);

        expect(results).toEqual(expected);
      })();
    });

    it('Should include results from hidden files.', async () => {
      await (async () => {
        const tool = await toolPromise;
        if (tool == null) {
          return;
        }
        // Setup test files
        const folder = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('grep-rpc', new Map([['.foo.js', 'const foo = 1;'], ['test/.foo.js', 'const foo = 1;']]));
        const results = await (0, (_CodeSearchService || _load_CodeSearchService()).remoteAtomSearch)(
        // Need 'g' flag to search all matches. Normally, Atom inserts it for us.
        folder, /foo/g, ['*.js', 'test'], false, tool).refCount().toArray().toPromise();
        const expected = loadExpectedFixture(folder, 'hiddenFiles.json');
        sortResults(results);

        expect(results).toEqual(expected);
      })();
    });

    /* GIT GREP TESTS */
    it('Git repo: should ignore untracked files or files listed in .gitignore', async () => {
      await (async () => {
        const tool = await toolPromise;
        // Run this test once since it tests git grep only.
        if (tool == null || tool !== (_searchTools || _load_searchTools()).POSIX_TOOLS[0]) {
          return;
        }
        // Create a git repo in a temporary folder.
        const folder = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('grep-rpc');
        await (0, (_process || _load_process()).runCommand)('git', ['init'], { cwd: folder }).toPromise();

        // Create a file that is ignored.
        _fs.default.writeFileSync((_nuclideUri || _load_nuclideUri()).default.join(folder, '.gitignore'), 'ignored.txt');
        _fs.default.writeFileSync((_nuclideUri || _load_nuclideUri()).default.join(folder, 'ignored.txt'), 'Hello World!');

        // Create a file that is tracked.
        _fs.default.writeFileSync((_nuclideUri || _load_nuclideUri()).default.join(folder, 'tracked.txt'), 'Hello World!');
        await (0, (_process || _load_process()).runCommand)('git', ['add', 'tracked.txt'], {
          cwd: folder
        }).toPromise();

        // Create a file that is untracked.
        _fs.default.writeFileSync((_nuclideUri || _load_nuclideUri()).default.join(folder, 'untracked.txt'), 'Hello World!');

        const results = await (0, (_CodeSearchService || _load_CodeSearchService()).remoteAtomSearch)(folder, /hello world/i, [], true).refCount().toArray().toPromise();
        const expected = loadExpectedFixture(folder, 'repo.json');
        sortResults(results);

        expect(results).toEqual(expected);
      })();
    });

    // HG Grep test. This test is disabled due to differences in the behavior of
    // Mercurial between v3.3 (where hg grep searches the revision history), and v3.4
    // (where hg grep) searches the working directory.
    // eslint-disable-next-line jasmine/no-disabled-tests
    xit('Hg repo: should ignore untracked files or files listed in .hgignore', async () => {
      await (async () => {
        const tool = await toolPromise;
        // Run this test once since it tests hg grep only.
        if (tool == null || tool !== (_searchTools || _load_searchTools()).POSIX_TOOLS[0]) {
          return;
        }
        // Create a git repo in a temporary folder.
        const folder = await (0, (_testHelpers || _load_testHelpers()).generateFixture)('grep-rpc');
        await (0, (_process || _load_process()).runCommand)('hg', ['init'], { cwd: folder }).toPromise();

        // Create a file that is ignored.
        _fs.default.writeFileSync((_nuclideUri || _load_nuclideUri()).default.join(folder, '.hgignore'), 'ignored.txt');
        _fs.default.writeFileSync((_nuclideUri || _load_nuclideUri()).default.join(folder, 'ignored.txt'), 'Hello World!');

        // Create a file that is tracked.
        _fs.default.writeFileSync((_nuclideUri || _load_nuclideUri()).default.join(folder, 'tracked.txt'), 'Hello World!');
        await (0, (_process || _load_process()).runCommand)('hg', ['add', 'tracked.txt'], {
          cwd: folder
        }).toPromise();

        // Create a file that is untracked.
        _fs.default.writeFileSync((_nuclideUri || _load_nuclideUri()).default.join(folder, 'untracked.txt'), 'Hello World!');

        await (0, (_process || _load_process()).runCommand)('hg', ['commit', '-m', 'test commit'], {
          cwd: folder
        }).toPromise();

        const results = await (0, (_CodeSearchService || _load_CodeSearchService()).remoteAtomSearch)(folder, /hello world()/i, [], false).refCount().toArray().toPromise();
        const expected = loadExpectedFixture(folder, 'repo.json');
        sortResults(results);

        expect(results).toEqual(expected);
      })();
    });
  });
});

// Helper function to sort an array of file results - first by their filepath,
// and then by the number of matches.
function sortResults(results) {
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
function loadExpectedFixture(folder, fixtureName) {
  const fixture = JSON.parse(_fs.default.readFileSync((_nuclideUri || _load_nuclideUri()).default.join(__dirname, '../__mocks__/fixtures', fixtureName), 'utf8'));
  // Join paths in fixtures to make them absolute.
  for (const result of fixture) {
    result.filePath = (_nuclideUri || _load_nuclideUri()).default.join(folder, result.filePath);
  }
  return fixture;
}