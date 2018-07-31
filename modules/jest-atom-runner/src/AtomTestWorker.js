"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _child_process = require("child_process");

function _mkdirp() {
  const data = _interopRequireDefault(require("mkdirp"));

  _mkdirp = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

var _os = _interopRequireDefault(require("os"));

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */

/* This is a Jest worker. An abstraction class that knows how to start up
  * an Atom process and communicate with it */

/* eslint-disable nuclide-internal/prefer-nuclide-uri */

/* eslint-disable-next-line nuclide-internal/consistent-import-name */
// eslint-disable-next-line nuclide-internal/consistent-import-name
const TMP_DIR = _path.default.resolve(_os.default.tmpdir(), 'jest-atom-runner'); // Atom resolves to its testing framework based on what's specified
// under the "atomTestRunner" key in the package.json in the parent directory
// of the first passed path.
// so if we run `atom -t /some_dir/__tests__/1-test.js`
// it'll look up `/some_dir/package.json` and then require whatever file is
// specified in "atomTestRunner" of this packages.json.
// To work around (or rather make atom execute arbitrary code) we
// will create a dummy `/tmp/packages.json` with `atomTestRunner` pointing
// to the file that we want to inject into atom's runtime.


const createDummyPackageJson = () => {
  _mkdirp().default.sync(_path.default.resolve(TMP_DIR));

  const packageJsonPath = _path.default.resolve(TMP_DIR, 'package.json');

  _fs.default.writeFileSync(packageJsonPath, JSON.stringify({
    atomTestRunner: require.resolve("./atomTestRunner")
  }));
};

class AtomTestWorker {
  // whether the worker is up and running
  constructor({
    ipcServer,
    serverID,
    globalConfig
  }) {
    this._ipcServer = ipcServer;
    this._serverID = serverID;
    this._alive = false;
    this._onMessageCallbacks = [];
    this._workerID = (0, _utils().makeUniqWorkerId)();
    this._globalConfig = globalConfig;
    this._runningTests = new Map();
  }

  async start() {
    const {
      _serverID: serverID,
      _ipcServer: ipcServer
    } = this;
    return new Promise(resolve => {
      createDummyPackageJson();
      const workerID = this._workerID;

      const atomPathArg = _path.default.resolve(TMP_DIR, (0, _utils().mergeIPCIDs)({
        serverID,
        workerID
      }));

      let firstMessage = false;
      ipcServer.on(workerID, (message, socket) => {
        const {
          messageType,
          data
        } = (0, _utils().parseMessage)(message);

        if (!firstMessage) {
          firstMessage = true;
          this._alive = true;
          this._socket = socket;
          resolve();
        } else {
          this._onMessage(messageType, data);
        }
      });
      this._childProcess = (0, _child_process.spawn)('atom', ['-t', atomPathArg], {
        stdio: ['inherit', // redirect child process' stdout to parent process stderr, so it
        // doesn't break any tools that depend on stdout (like the ones
        // that consume a generated JSON report from jest's stdout)
        process.stderr, 'inherit']
      });

      const crash = error => {
        for (const _ref of this._runningTests.values()) {
          const {
            reject
          } = _ref;
          reject(error);
        }
      };

      this._childProcess.on('error', crash);

      this._childProcess.on('close', code => {
        crash(new Error(`child process exited with code: ${code}`));
      });
    });
  }

  async stop() {
    this.send((0, _utils().makeMessage)({
      messageType: _utils().MESSAGE_TYPES.SHUT_DOWN
    }));

    this._childProcess.kill('SIGTERM');
  }

  send(message) {
    if (!this._socket || !this._alive || !this._workerID) {
      throw new Error("Can't interact with the worker before it comes alive");
    }

    this._ipcServer.emit(this._socket, this._workerID, message);
  }

  _onMessage(messageType, data) {
    switch (messageType) {
      case _utils().MESSAGE_TYPES.TEST_RESULT:
        {
          const testResult = (0, _utils().parseJSON)(data);
          const {
            testFilePath
          } = testResult;

          const runningTest = this._runningTests.get(testFilePath);

          if (!runningTest) {
            throw new Error(`
             Can't find any references to the test result that returned from the worker.
             returned test path: ${testFilePath}
             list of tests that we know has been running in the worker:
             ${Array.from(this._runningTests).map(([key, _]) => key).join(', ')}
             `);
          }

          testResult.testExecError != null ? // $FlowFixMe jest expects it to be rejected with an object
          runningTest.reject(testResult.testExecError) : runningTest.resolve(testResult);

          this._runningTests.delete(testFilePath);
        }
    }
  }

  runTest(test) {
    if (this._runningTests.has(test.path)) {
      throw new Error("Can't run the same test in the same worker at the same time");
    }

    return new Promise((resolve, reject) => {
      // Ideally we don't want to pass all thing info with every test
      // because it never changes. We should try to initialize it
      // when the worker starts and keep it there for the whole run
      // (if it's a single run and not a watch mode of course, in that case
      // it'll be able to change)
      const rawModuleMap = test.context.moduleMap.getRawModuleMap();
      const config = test.context.config;
      const globalConfig = this._globalConfig;
      this.send((0, _utils().makeMessage)({
        messageType: _utils().MESSAGE_TYPES.RUN_TEST,
        data: JSON.stringify({
          rawModuleMap,
          config,
          globalConfig,
          path: test.path
        })
      }));

      this._runningTests.set(test.path, {
        resolve,
        reject
      });
    });
  }

  isBusy() {
    return this._runningTests.size > 0;
  }

}

var _default = AtomTestWorker;
exports.default = _default;