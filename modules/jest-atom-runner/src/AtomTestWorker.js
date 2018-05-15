'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));






















var _child_process = require('child_process');var _mkdirp;
function _load_mkdirp() {return _mkdirp = _interopRequireDefault(require('mkdirp'));}
var _path = _interopRequireDefault(require('path'));
var _fs = _interopRequireDefault(require('fs'));
var _os = _interopRequireDefault(require('os'));var _utils;
function _load_utils() {return _utils = require('./utils');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} // eslint-disable-next-line nuclide-internal/consistent-import-name








const TMP_DIR = _path.default.resolve(_os.default.tmpdir(), 'jest-atom-runner');

// Atom resolves to its testing framework based on what's specified
// under the "atomTestRunner" key in the package.json in the parent directory
// of the first passed path.
// so if we run `atom -t /some_dir/__tests__/1-test.js`
// it'll look up `/some_dir/package.json` and then require whatever file is
// specified in "atomTestRunner" of this packages.json.
// To work around (or rather make atom execute arbitrary code) we
// will create a dummy `/tmp/packages.json` with `atomTestRunner` pointing
// to the file that we want to inject into atom's runtime.
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
 */ /* This is a Jest worker. An abstraction class that knows how to start up
      * an Atom process and communicate with it */ /* eslint-disable nuclide-internal/prefer-nuclide-uri */ /* eslint-disable-next-line nuclide-internal/consistent-import-name */const createDummyPackageJson = () => {(_mkdirp || _load_mkdirp()).default.sync(_path.default.resolve(TMP_DIR));const packageJsonPath = _path.default.resolve(TMP_DIR, 'package.json');_fs.default.writeFileSync(packageJsonPath, JSON.stringify({ atomTestRunner: require.resolve('./atomTestRunner') }));};
class AtomTestWorker {




  // whether the worker is up and running





  constructor({
    ipcServer,
    serverID,
    globalConfig })




  {
    this._ipcServer = ipcServer;
    this._serverID = serverID;
    this._alive = false;
    this._onMessageCallbacks = [];
    this._workerID = (0, (_utils || _load_utils()).makeUniqWorkerId)();
    this._globalConfig = globalConfig;
    this._runningTests = new Map();
  }

  start() {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      const { _serverID: serverID, _ipcServer: ipcServer } = _this;
      return new Promise(function (resolve) {
        createDummyPackageJson();
        const workerID = _this._workerID;
        const atomPathArg = _path.default.resolve(
        TMP_DIR,
        (0, (_utils || _load_utils()).mergeIPCIDs)({ serverID, workerID }));


        let firstMessage = false;
        ipcServer.on(workerID, function (message, socket) {
          const { messageType, data } = (0, (_utils || _load_utils()).parseMessage)(message);
          if (!firstMessage) {
            firstMessage = true;
            _this._alive = true;
            _this._socket = socket;
            resolve();
          } else {
            _this._onMessage(messageType, data);
          }
        });

        _this._childProcess = (0, _child_process.spawn)('atom', ['-t', atomPathArg], {
          stdio: ['inherit', 'inherit', 'inherit'] });

      });})();
  }

  stop() {var _this2 = this;return (0, _asyncToGenerator.default)(function* () {
      _this2.send((0, (_utils || _load_utils()).makeMessage)({ messageType: (_utils || _load_utils()).MESSAGE_TYPES.SHUT_DOWN }));
      _this2._childProcess.kill('SIGTERM');})();
  }

  send(message) {
    if (!this._socket || !this._alive || !this._workerID) {
      throw new Error("Can't interact with the worker before it comes alive");
    }
    this._ipcServer.emit(this._socket, this._workerID, message);
  }

  _onMessage(messageType, data) {
    switch (messageType) {
      case (_utils || _load_utils()).MESSAGE_TYPES.TEST_RESULT:{
          const testResult = (0, (_utils || _load_utils()).parseJSON)(data);
          const { testFilePath } = testResult;
          const runningTest = this._runningTests.get(testFilePath);
          if (!runningTest) {
            throw new Error(`
             Can't find any references to the test result that returned from the worker.
             returned test path: ${testFilePath}
             list of tests that we know has been running in the worker:
             ${Array.from(this._runningTests).
            map(([key, _]) => key).
            join(', ')}
             `);
          }

          runningTest.resolve(testResult);
          this._runningTests.delete(testFilePath);
        }}

  }

  runTest(test) {
    if (this._runningTests.has(test.path)) {
      throw new Error(
      "Can't run the same times in the same worker at the same time");

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

      this.send(
      (0, (_utils || _load_utils()).makeMessage)({
        messageType: (_utils || _load_utils()).MESSAGE_TYPES.RUN_TEST,
        data: JSON.stringify({
          rawModuleMap,
          config,
          globalConfig,
          path: test.path }) }));




      this._runningTests.set(test.path, { resolve, reject });
    });
  }

  isBusy() {
    return this._runningTests.size > 0;
  }}exports.default =


AtomTestWorker;