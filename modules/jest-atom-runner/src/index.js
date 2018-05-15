'use strict';var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _ipcServer;



















function _load_ipcServer() {return _ipcServer = require('./ipc-server');}var _utils;
function _load_utils() {return _utils = require('./utils');}var _AtomTestWorkerFarm;

function _load_AtomTestWorkerFarm() {return _AtomTestWorkerFarm = _interopRequireDefault(require('./AtomTestWorkerFarm'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                                          * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                                                                          * All rights reserved.
                                                                                                                                                                                                                          *
                                                                                                                                                                                                                          * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                                                                          * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                                                                          * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                                                                          *
                                                                                                                                                                                                                          *  strict-local
                                                                                                                                                                                                                          * @format
                                                                                                                                                                                                                          */ /* This is the main file that Jest will specify in its config as
                                                                                                                                                                                                                              * 'runner': 'path/to/this/file'
                                                                                                                                                                                                                              */ /* eslint-disable nuclide-internal/no-commonjs */class TestRunner {constructor(globalConfig) {this._globalConfig = globalConfig;}runTests(tests, watcher, onStart,
  onResult,
  onFailure,
  options)
  {var _this = this;return (0, _asyncToGenerator.default)(function* () {
      const serverID = (0, (_utils || _load_utils()).makeUniqServerId)();
      const ipcServer = yield (0, (_ipcServer || _load_ipcServer()).startServer)({ serverID });
      const concurrency = Math.min(tests.length, _this._globalConfig.maxWorkers);
      const farm = new (_AtomTestWorkerFarm || _load_AtomTestWorkerFarm()).default({
        serverID,
        ipcServer,
        globalConfig: _this._globalConfig,
        concurrency });

      yield farm.start();

      yield Promise.all(
      tests.map(function (test) {
        return farm.
        runTest(test, onStart).
        then(function (testResult) {return onResult(test, testResult);}).
        catch(function (error) {return onFailure(test, error);});
      }));


      ipcServer.stop();
      yield farm.stop();})();
  }}


module.exports = TestRunner;