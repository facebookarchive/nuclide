"use strict";

function proto() {
  const data = _interopRequireWildcard(require("../Protocol.js"));

  proto = function () {
    return data;
  };

  return data;
}

var pathModule = _interopRequireWildcard(require("path"));

function _HgRpcMethods() {
  const data = require("../HgRpcMethods");

  _HgRpcMethods = function () {
    return data;
  };

  return data;
}

function _nuclideWatchmanHelpers() {
  const data = require("../../nuclide-watchman-helpers");

  _nuclideWatchmanHelpers = function () {
    return data;
  };

  return data;
}

function _process() {
  const data = require("../../nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 * @emails oncall+nuclide
 */
jest.setTimeout(60000);
const TIMEOUT_FOR_LONG_INTEGRATION_TEST_MS = 60 * 1000;
describe('HgRpcMethods', () => {
  // afterEach() will walk this list in reverse order, calling each function
  // to tear it down. This ensures that even if there is an exception in
  let tearDowns;
  beforeEach(() => {
    tearDowns = [];
  });
  afterEach(async () => {
    if (!(tearDowns != null)) {
      throw new Error("Invariant violation: \"tearDowns != null\"");
    } // Create our own copy of the array because clients should not be able
    // to expect to continue to add things to tearDowns after afterEach() has
    // been called and get their things torn down.


    const tearDownsReverse = tearDowns.slice(0).reverse();
    tearDowns = null;

    for (const tearDown of tearDownsReverse) {
      const result = tearDown();

      if ((0, _promise().isPromise)(result)) {
        // eslint-disable-next-line no-await-in-loop
        await result;
      }
    }
  });
  describe('isHgRepo', () => {
    it('check various directories', async () => {
      const tmp = await _fsPromise().default.tempdir();
      const repoRoot = pathModule.join(tmp, 'subdir1');
      const repoSubdir = pathModule.join(repoRoot, 'subdir2');
      await _fsPromise().default.mkdir(repoRoot);
      await _fsPromise().default.mkdir(repoSubdir);
      const hg = createHgCommandRunner(repoRoot);
      await hg('init');
      const watchman = new (_nuclideWatchmanHelpers().WatchmanClient)();
      const rpc = new (_HgRpcMethods().HgRpcMethods)(watchman);

      if (!(tearDowns != null)) {
        throw new Error("Invariant violation: \"tearDowns != null\"");
      }

      tearDowns.push(() => rpc.dispose());
      const parent = await rpc.isHgRepo({
        directory: tmp
      });
      expect(parent).toEqual({
        root: null
      });
      const root = await rpc.isHgRepo({
        directory: repoRoot
      });
      expect(root).toEqual({
        root: repoRoot
      });
      const subdir = await rpc.isHgRepo({
        directory: repoSubdir
      });
      expect(subdir).toEqual({
        root: repoRoot
      });
    });
  });
  describe('observeStatus', () => {
    let context; // As part of the test setup, we create an Hg repo with a .watchmanconfig so
    // we can watch it with Watchman.

    beforeEach(async () => {
      // We must use the realpath with Watchman or else the call to watch-del
      // will fail: https://github.com/facebook/watchman/issues/533.
      const tmp = await _fsPromise().default.realpath((await _fsPromise().default.tempdir()));
      const hg = createHgCommandRunner(tmp);
      await hg('init');
      await _fsPromise().default.writeFile(pathModule.join(tmp, '.watchmanconfig'), JSON.stringify({
        ignore_dirs: [],
        fsevents_latency: 0.05
      }, null, 2));
      const watchman = new (_nuclideWatchmanHelpers().WatchmanClient)();

      if (!(tearDowns != null)) {
        throw new Error("Invariant violation: \"tearDowns != null\"");
      }

      tearDowns.push(async () => {
        // Here is a handy script to remove all of the Watchman watches in your temp directory on a Mac
        // in the event this cleanup logic is not executed correctly:
        //
        // watchman watch-list | grep /private | sed -e 's#"\(.*\)",#\1#' | xargs -I {} watchman watch-del {}
        //
        // TODO(mbolin): Make _command a public method of WatchmanClient.
        await watchman._command('watch-del', tmp);
        watchman.dispose();
      });
      const rpc = new (_HgRpcMethods().HgRpcMethods)(watchman);
      tearDowns.push(() => rpc.dispose());
      context = {
        watchman,
        rpc,
        tmp,
        hg
      };
    });
    it('stream of events', async () => {
      if (!(context != null)) {
        throw new Error("Invariant violation: \"context != null\"");
      }

      const {
        rpc,
        hg,
        tmp
      } = context;
      const events = rpc.observeStatus({
        root: tmp
      }).publish();
      const subscription = events.connect();

      if (!(tearDowns != null)) {
        throw new Error("Invariant violation: \"tearDowns != null\"");
      }

      tearDowns.push(() => subscription.unsubscribe());

      async function verifyNextStatus(nextStatus) {
        const {
          status
        } = await events.first().timeout(12000).toPromise();
        expect(status).toEqual(nextStatus);
      }

      const writeFile = createFileWriter(tmp); // We should get the current `hg status` upon initial connection.

      await verifyNextStatus({
        '.watchmanconfig': '?'
      }); // Creating an untracked file should generate an event.

      await writeFile('foo', 'foobar');
      await verifyNextStatus({
        '.watchmanconfig': '?',
        foo: '?'
      }); // `hg add`'ing a file should generate an event.

      await hg('add', 'foo');
      await verifyNextStatus({
        '.watchmanconfig': '?',
        foo: 'A'
      }); // `hg add`'ing a second file should generate another event.

      await hg('add', '.watchmanconfig');
      await verifyNextStatus({
        '.watchmanconfig': 'A',
        foo: 'A'
      }); // Creating a commit, thereby clearing the status, should generate an
      // event.

      await hg('commit', '-m', 'first commit!');
      await verifyNextStatus({}); // Modifying a tracked file should generate an event.

      await writeFile('foo', '');
      await verifyNextStatus({
        foo: 'M'
      }); // Restoring the contents of the file should generate an event.

      await writeFile('foo', 'foobar');
      await verifyNextStatus({}); // Forgetting a file should generate an event.

      await hg('forget', 'foo');
      await verifyNextStatus({
        foo: 'R'
      }); // `hg add`'ing the file back should generate an event.

      await hg('add', 'foo');
      await verifyNextStatus({}); // Changing the file permissions should generate an event.

      await _fsPromise().default.chmod(pathModule.join(tmp, 'foo'), 0o755);
      await verifyNextStatus({
        foo: 'M'
      });
    }, TIMEOUT_FOR_LONG_INTEGRATION_TEST_MS);
  });
  describe('getHgGetContents', () => {
    it('read contents without revision', async () => {
      const tmp = await _fsPromise().default.tempdir();
      const hg = createHgCommandRunner(tmp);
      const writeFile = createFileWriter(tmp);
      const watchman = new (_nuclideWatchmanHelpers().WatchmanClient)();
      const rpc = new (_HgRpcMethods().HgRpcMethods)(watchman);

      if (!(tearDowns != null)) {
        throw new Error("Invariant violation: \"tearDowns != null\"");
      }

      tearDowns.push(() => rpc.dispose());

      async function verifyHgGetContents(path, ref, expectedContents) {
        const fullPath = pathModule.join(tmp, path);
        const params = {
          path: fullPath,
          ref
        };
        const result = await rpc.getHgGetContents(params);
        const {
          contents
        } = result;
        expect(contents).toEqual(expectedContents);
      }

      await hg('init');
      await writeFile('foo', 'foo contents');
      await hg('add', 'foo');
      await hg('commit', '-m', 'first commit!');
      const firstCommitId = await hg('log', '--limit', '1', '-T', '{node}'); // For a tracked file, we can request the contents at a hash.

      await verifyHgGetContents('foo', firstCommitId, 'foo contents');
      await writeFile('foo', 'foo contents 2');
      await hg('commit', '-m', 'second commit!');
      const secondCommitId = await hg('log', '--limit', '1', '-T', '{node}');
      await verifyHgGetContents('foo', secondCommitId, 'foo contents 2'); // For an untracked file, the contents will always be ''.

      await writeFile('bar', 'bar contents');
      await verifyHgGetContents('bar', '', '');
      await verifyHgGetContents('bar', firstCommitId, '');
      await verifyHgGetContents('bar', secondCommitId, ''); // For a tracked file with local modifications, a ref of '' should
      // return the contents at the current commit. This is what makes
      // getHgGetContents() useful for building a diff view.

      await writeFile('foo', 'totally different contents');
      await verifyHgGetContents('foo', '', 'foo contents 2');
    }, TIMEOUT_FOR_LONG_INTEGRATION_TEST_MS);
  });
});

function createHgCommandRunner(cwd) {
  const env = createEnvWithHgPlain();
  return function (...args) {
    return (0, _process().runCommand)('hg', args, {
      cwd,
      env
    }).toPromise();
  };
}

function createEnvWithHgPlain() {
  return Object.assign({}, process.env, {
    HGPLAIN: '1'
  });
}

function createFileWriter(baseDirectory) {
  return function (path, contents) {
    return _fsPromise().default.writeFile(pathModule.join(baseDirectory, path), contents);
  };
}