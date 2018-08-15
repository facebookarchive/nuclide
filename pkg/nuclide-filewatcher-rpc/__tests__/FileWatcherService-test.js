"use strict";

function _eventKit() {
  const data = require("event-kit");

  _eventKit = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
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

var _fs = _interopRequireDefault(require("fs"));

function _log4js() {
  const data = _interopRequireDefault(require("log4js"));

  _log4js = function () {
    return data;
  };

  return data;
}

function _FileWatcherService() {
  const data = require("../lib/FileWatcherService");

  _FileWatcherService = function () {
    return data;
  };

  return data;
}

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
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
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
jest.setTimeout(25000);
let emitter;
jest.mock("../../../modules/nuclide-watchman-helpers", () => {
  const mockWatchmanClient = {
    hasSubscription: () => false,

    watchDirectoryRecursive() {
      emitter = new (_eventKit().Emitter)(); // $FlowIgnore

      emitter.path = TEST_DIR;
      return Promise.resolve(emitter);
    }

  };
  return {
    WatchmanClient: jest.fn(() => mockWatchmanClient)
  };
});
jest.unmock('log4js');
const TEST_FILE = '/path/to/file';
const TEST_DIR = '/path/to';
const NODE_TEST_FILE = 'node_test_file';
describe('FileWatcherService', () => {
  let statMock;
  let realpathMock;
  let nodeTestDirPath;
  let nodeTestFilePath;

  const createNodeTestFile = async callback => {
    nodeTestDirPath = await (0, _testHelpers().generateFixture)('watchWithNodeTest', new Map([[NODE_TEST_FILE, null]]));
    nodeTestFilePath = `${nodeTestDirPath}/${NODE_TEST_FILE}`;

    if (callback) {
      callback();
    }
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    statMock = jest.spyOn(_fsPromise().default, 'stat').mockImplementation(path => ({
      isFile: () => path === TEST_FILE
    }));
    realpathMock = jest.spyOn(_fsPromise().default, 'realpath').mockImplementation(x => x);
    jest.spyOn(_fs.default, 'watch');
    await createNodeTestFile();
  });
  it('watches changes to files', async () => {
    const watchReady = jest.fn();
    (0, _FileWatcherService().watchDirectoryRecursive)(TEST_DIR).refCount().subscribe({
      next: watchReady
    });
    await (0, _waits_for().default)(() => watchReady.mock.calls.length > 0);
    const nextMock = jest.fn();
    const nextMockWithNode = jest.fn();
    const parentNextMock = jest.fn();
    const completeMock = jest.fn();
    expect(watchReady).toHaveBeenCalledWith('SUCCESS');
    (0, _FileWatcherService().watchFile)(TEST_FILE).refCount().subscribe({
      next: nextMock,
      complete: completeMock
    });
    (0, _FileWatcherService().watchDirectory)(TEST_DIR).refCount().subscribe({
      next: parentNextMock
    });
    (0, _FileWatcherService().watchWithNode)(nodeTestFilePath).refCount().subscribe({
      next: nextMockWithNode
    }); // Hacky: there's no good way of checking if the inner observables are ready.
    // For now, we know it subscribes after realpath resolves.

    await (0, _waits_for().default)(() => realpathMock.mock.calls.length === 2); // Simulate a file creation.

    emitter.emit('change', [{
      name: 'file',
      new: true,
      exists: true,
      mode: 0
    }]);
    await (0, _waits_for().default)(() => nextMock.mock.calls.length > 0 && parentNextMock.mock.calls.length > 0);
    expect(nextMock).toHaveBeenCalledWith({
      path: TEST_FILE,
      type: 'change'
    }); // The parent dir should change.

    expect(parentNextMock).toHaveBeenCalledWith({
      path: TEST_DIR,
      type: 'change'
    }); // Simulate a regular file change.

    emitter.emit('change', [{
      name: 'file',
      new: false,
      exists: true,
      mode: 0
    }]); // Write to watcWithNode test file.
    // Add a slight delay to allow fs.watch to start up.

    await (0, _promise().sleep)(100);

    _fs.default.writeFileSync(nodeTestFilePath, 'These are words.');

    await (0, _waits_for().default)(() => nextMock.mock.calls.length === 2);
    await (0, _waits_for().default)(() => nextMockWithNode.mock.calls.length > 0); // Regular changes don't affect parent directories.

    expect(parentNextMock.mock.calls.length).toBe(1); // Simulate a file deletion.

    emitter.emit('change', [{
      name: 'file',
      new: false,
      exists: false,
      mode: 0
    }]);

    _fs.default.unlinkSync(nodeTestFilePath); // Watch should complete after a delete.


    await (0, _waits_for().default)(() => completeMock.mock.calls.length > 0);
    await (0, _waits_for().default)(() => nextMockWithNode.mock.calls.length > 1);
    expect(nextMock).toHaveBeenCalledWith({
      path: TEST_FILE,
      type: 'delete'
    });
    expect(nextMockWithNode).toHaveBeenCalledWith({
      path: nodeTestFilePath,
      type: 'delete'
    }); // The parent dir should change again.

    expect(parentNextMock.mock.calls.length).toBe(2); // Test that rewatching produces a new observer.

    const completeMock2 = jest.fn();
    const nextMockWithNode2 = jest.fn();
    (0, _FileWatcherService().watchFile)(TEST_FILE).refCount().subscribe({
      complete: completeMock2
    });
    createNodeTestFile(() => {
      (0, _FileWatcherService().watchWithNode)(nodeTestFilePath).refCount().subscribe({
        next: nextMockWithNode2
      });
    }); // Use the same hack again..

    await (0, _waits_for().default)(() => realpathMock.mock.calls.length === 3); // Delete the file again.

    emitter.emit('change', [{
      name: 'file',
      new: false,
      exists: false,
      mode: 0
    }]); // Give fs.watch some time to start up.

    await (0, _promise().sleep)(100);

    _fs.default.unlinkSync(nodeTestFilePath);

    await (0, _waits_for().default)(() => completeMock2.mock.calls.length > 0 && nextMockWithNode2.mock.calls.length > 0);
  });
  it('debounces file deletions', async () => {
    const changes = [];
    let completed = false;
    const watch = (0, _FileWatcherService().watchDirectoryRecursive)(TEST_DIR).refCount();
    watch.subscribe();
    await watch.take(1).toPromise();
    (0, _FileWatcherService().watchFile)(TEST_FILE).refCount().subscribe({
      next: change => changes.push(change),
      complete: () => {
        completed = true;
      }
    });
    await (0, _waits_for().default)(() => realpathMock.mock.calls.length === 1); // A file gets deleted and then created.

    emitter.emit('change', [{
      name: 'file',
      new: false,
      exists: false,
      mode: 0
    }]);
    emitter.emit('change', [{
      name: 'file',
      new: true,
      exists: true,
      mode: 0
    }]); // The deletion should be cancelled out.

    expect(changes).toEqual([{
      path: TEST_FILE,
      type: 'change'
    }]);
    emitter.emit('change', [{
      name: 'file',
      new: false,
      exists: false,
      mode: 0
    }]);
    await (0, _waits_for().default)(() => completed);
    expect(changes).toEqual([{
      path: TEST_FILE,
      type: 'change'
    }, {
      path: TEST_FILE,
      type: 'delete'
    }]);
  });
  it('errors for missing files', async () => {
    statMock.mockImplementation(() => {
      throw new Error();
    });
    const errorMock = jest.fn();
    const errorMockWithNode = jest.fn();

    _fs.default.unlinkSync(nodeTestFilePath);

    (0, _FileWatcherService().watchFile)(TEST_FILE).refCount().subscribe({
      error: errorMock
    });

    try {
      (0, _FileWatcherService().watchWithNode)(nodeTestFilePath).refCount().subscribe({
        next: x => x
      });
    } catch (err) {
      errorMockWithNode();
    }

    await (0, _waits_for().default)(() => errorMock.mock.calls.length > 0 && errorMockWithNode.mock.calls.length > 0);
  });
  it('warns when you try to watch the wrong entity type', async () => {
    const warnSpy = jest.fn();
    jest.spyOn(_log4js().default, 'getLogger').mockReturnValue({
      warn: warnSpy
    });
    (0, _FileWatcherService().watchFile)(TEST_DIR).refCount();
    await (0, _waits_for().default)(() => warnSpy.mock.calls.length > 0);
    (0, _FileWatcherService().watchDirectory)(TEST_FILE).refCount();
    await (0, _waits_for().default)(() => warnSpy.mock.calls.length === 2);
  });
});