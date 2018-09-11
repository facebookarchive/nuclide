"use strict";

function _CodeSearchService() {
  const data = require("../lib/CodeSearchService");

  _CodeSearchService = function () {
    return data;
  };

  return data;
}

var _fs = _interopRequireDefault(require("fs"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../../modules/nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _testHelpers() {
  const data = require("../../../modules/nuclide-commons/test-helpers");

  _testHelpers = function () {
    return data;
  };

  return data;
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
 * @emails oncall+nuclide
 */
const TOOL = 'grep';
describe('Remote Atom Search by directory', () => {
  /* UNIX GREP TESTS */
  it('Should recursively scan all files in a directory', async () => {
    // Setup the test folder.
    const folder = await (0, _testHelpers().generateFixture)('grep-rpc', new Map([['file1.js', `var a = 4;
        console.log("Hello World!");
        console.log(a);
        console.error("Hello World!");`], ['directory/file2.js', `var a = 4;
        console.log("Hello World!");
        console.log(a);`]]));
    const results = await (0, _CodeSearchService().remoteAtomSearch)(folder, /hello world/i, [], false, TOOL).refCount().toArray().toPromise();
    sortResults(results, folder);
    expect(results).toMatchSnapshot();
  });
  it('Can execute a case sensitive search', async () => {
    // Setup the test folder.
    const folder = await (0, _testHelpers().generateFixture)('grep-rpc', new Map([['file1.js', `var a = 4;
        console.log("Hello World!");
        console.log(a);
        console.error("hello world!");`]]));
    const results = await (0, _CodeSearchService().remoteAtomSearch)(folder, /hello world/, [], false, TOOL).refCount().toArray().toPromise();
    sortResults(results, folder);
    expect(results).toMatchSnapshot();
  });
  it('Does not crash with no results', async () => {
    // Setup the (empty) test folder.
    const folder = await (0, _testHelpers().generateFixture)('grep-rpc', new Map());
    const results = await (0, _CodeSearchService().remoteAtomSearch)(folder, /hello/, [], false, TOOL).refCount().toArray().toPromise();
    sortResults(results, folder);
    expect(results).toMatchSnapshot();
  });
  it('Can execute a search of subdirectories.', async () => {
    // Setup the test folder.
    const folder = await (0, _testHelpers().generateFixture)('grep-rpc', new Map([['dir1/file.txt', 'console.log("Hello World!");'], ['dir2/file.txt', 'console.log("Hello World!");'], ['dir3/file.txt', 'console.log("Hello World!");']]));
    const results = await (0, _CodeSearchService().remoteAtomSearch)(folder, /hello world/i, ['dir2', 'dir3', 'nonexistantdir'], false, TOOL).refCount().toArray().toPromise();
    sortResults(results, folder);
    expect(results).toMatchSnapshot();
  });
  it('Should include results from files matching wildcard path name', async () => {
    // Create test folders and files
    const folder = await (0, _testHelpers().generateFixture)('grep-rpc', new Map([['foo.js', 'console.log("a wildcard appears!");'], ['foo.py', 'console.log("a wildcard appears!");'], ['test/foo.js', 'console.log("a wildcard appears!");']]));
    const results = await (0, _CodeSearchService().remoteAtomSearch)(folder, /a wildcard appears/i, ['*.js', 'test'], false, TOOL).refCount().toArray().toPromise();
    sortResults(results, folder);
    expect(results).toMatchSnapshot();
  });
  it('Should include multiple results matching on the same line', async () => {
    // Setup test files
    const folder = await (0, _testHelpers().generateFixture)('grep-rpc', new Map([['foo.js', 'const foo = require("foo");'], ['test/foo.js', 'const foo = require("foo");']]));
    const results = await (0, _CodeSearchService().remoteAtomSearch)( // Need 'g' flag to search all matches. Normally, Atom inserts it for us.
    folder, /foo/g, ['*.js', 'test'], false, TOOL).refCount().toArray().toPromise();
    sortResults(results, folder);
    expect(results).toMatchSnapshot();
  });
  it('Should include results from hidden files.', async () => {
    // Setup test files
    const folder = await (0, _testHelpers().generateFixture)('grep-rpc', new Map([['.foo.js', 'const foo = 1;'], ['test/.foo.js', 'const foo = 1;']]));
    const results = await (0, _CodeSearchService().remoteAtomSearch)( // Need 'g' flag to search all matches. Normally, Atom inserts it for us.
    folder, /foo/g, ['*.js', 'test'], false, TOOL).refCount().toArray().toPromise();
    sortResults(results, folder);
    expect(results).toMatchSnapshot();
  });
  /* GIT GREP TESTS */

  it('Git repo: should ignore untracked files or files listed in .gitignore', async () => {
    // Create a git repo in a temporary folder.
    const folder = await (0, _testHelpers().generateFixture)('grep-rpc');
    await (0, _process().runCommand)('git', ['init'], {
      cwd: folder
    }).toPromise(); // Create a file that is ignored.

    _fs.default.writeFileSync(_nuclideUri().default.join(folder, '.gitignore'), 'ignored.txt');

    _fs.default.writeFileSync(_nuclideUri().default.join(folder, 'ignored.txt'), 'Hello World!'); // Create a file that is tracked.


    _fs.default.writeFileSync(_nuclideUri().default.join(folder, 'tracked.txt'), 'Hello World!\ntest');

    await (0, _process().runCommand)('git', ['add', 'tracked.txt'], {
      cwd: folder
    }).toPromise(); // Create a file that is untracked.

    _fs.default.writeFileSync(_nuclideUri().default.join(folder, 'untracked.txt'), 'Hello World!');

    const results = await (0, _CodeSearchService().remoteAtomSearch)(folder, /hello world/i, [], true, null,
    /* leadingLines */
    1,
    /* trailingLines */
    1).refCount().toArray().toPromise();
    sortResults(results, folder);
    expect(results).toMatchSnapshot();
  });
  it('Should include leading and trailing context', async () => {
    // Create test folders and files
    const folder = await (0, _testHelpers().generateFixture)('grep-rpc', new Map([['foo.js', 'test1\ntest2\ntest3\n']]));
    const results = await (0, _CodeSearchService().remoteAtomSearch)(folder, /test2/i, ['*.js', 'test'], false, TOOL,
    /* leadingLines */
    2,
    /* trailingLines */
    2).refCount().toArray().toPromise();
    sortResults(results, folder);
    expect(results).toMatchSnapshot();
  });
  it('Hg repo: should ignore untracked files or files listed in .gitignore', async () => {
    // Create an hg repo in a temporary folder.
    const folder = await (0, _testHelpers().generateFixture)('grep-rpc');
    await (0, _process().runCommand)('hg', ['init'], {
      cwd: folder
    }).toPromise(); // Create a file that is ignored.

    _fs.default.writeFileSync(_nuclideUri().default.join(folder, '.gitignore'), 'ignored.txt\n');

    _fs.default.writeFileSync(_nuclideUri().default.join(folder, 'ignored.txt'), 'Hello World!'); // Create a file that is tracked.


    _fs.default.writeFileSync(_nuclideUri().default.join(folder, 'tracked.txt'), 'Hello World!\ntest');

    await (0, _process().runCommand)('hg', ['add', 'tracked.txt'], {
      cwd: folder
    }).toPromise(); // Create a file that is untracked.

    _fs.default.writeFileSync(_nuclideUri().default.join(folder, 'untracked.txt'), 'Hello World!');

    await (0, _process().runCommand)('hg', ['commit', '-m', 'test commit'], {
      cwd: folder
    }).toPromise();
    const results = await (0, _CodeSearchService().remoteAtomSearch)(folder, /hello world/i, [], true, null,
    /* leadingLines */
    1,
    /* trailingLines */
    1).refCount().toArray().toPromise();
    sortResults(results, folder);
    expect(results).toMatchSnapshot();
  });
}); // Helper function to sort an array of file results - first by their filepath,
// and then by the number of matches.
// This also relativizes paths (since they're in a tmpdir).

function sortResults(results, folder) {
  results.forEach(result => {
    result.filePath = _nuclideUri().default.relative(folder, result.filePath);
  });
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