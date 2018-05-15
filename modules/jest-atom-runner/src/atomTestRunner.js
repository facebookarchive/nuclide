'use strict';var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));





















var _electron = require('electron');

var _console = require('console');
var _os = _interopRequireDefault(require('os'));var _run_test;
function _load_run_test() {return _run_test = _interopRequireDefault(require('jest-runner/build/run_test'));}var _jestRuntime;
function _load_jestRuntime() {return _jestRuntime = _interopRequireDefault(require('jest-runtime'));}var _jestHasteMap;
function _load_jestHasteMap() {return _jestHasteMap = _interopRequireDefault(require('jest-haste-map'));}var _utils;

function _load_utils() {return _utils = require('./utils');}var _ipcClient;






function _load_ipcClient() {return _ipcClient = require('./ipc-client');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                        * Copyright (c) 2017-present, Facebook, Inc.
                                                                                                                                                                        * All rights reserved.
                                                                                                                                                                        *
                                                                                                                                                                        * This source code is licensed under the BSD-style license found in the
                                                                                                                                                                        * LICENSE file in the root directory of this source tree. An additional grant
                                                                                                                                                                        * of patent rights can be found in the PATENTS file in the same directory.
                                                                                                                                                                        *
                                                                                                                                                                        * 
                                                                                                                                                                        * @format
                                                                                                                                                                        */ /* eslint-disable no-console */ /* eslint-disable nuclide-internal/no-commonjs */ /*
                                                                                                                                                                                                                                                              * This file will be injected into an Atom process. It will start an IPC
                                                                                                                                                                                                                                                              * client, find the parant Jest IPC server that spawned this process and say
                                                                                                                                                                                                                                                              * "hey! i'm up and ready to run tests, send them over!"
                                                                                                                                                                                                                                                              */const redirectIO = () => {// Patch `console` to output through the main process.
  global.console = new _console.Console( /* stdout */{ write(chunk) {// $FlowFixMe
      _electron.ipcRenderer.send('write-to-stdout', chunk);} }, /* stderr */{ write(chunk) {// $FlowFixMe
      _electron.ipcRenderer.send('write-to-stderr', chunk);} });

};

process.on('uncaughtException', err => {
  console.error(err.stack);
  process.exit(1);
});







module.exports = (() => {var _ref = (0, _asyncToGenerator.default)(function* (params) {
    redirectIO();
    const firstTestPath = params.testPaths[0];

    // We pass server and worker IDs via a basename of non-existing file.
    // Yeah.. it's weird, i know! :(
    const { serverID, workerID } = (0, (_utils || _load_utils()).extractIPCIDsFromFilePath)(firstTestPath);
    const connection = yield (0, (_ipcClient || _load_ipcClient()).connectToIPCServer)({ serverID, workerID });

    global.atom = params.buildAtomEnvironment({
      applicationDelegate: params.buildDefaultApplicationDelegate(),
      window,
      document: window.document,
      configDirPath: _os.default.tmpdir(),
      enablePersistence: true });


    return new Promise(function (resolve, reject) {
      connection.onMessage(function (message) {
        try {
          const { messageType, data } = (0, (_utils || _load_utils()).parseMessage)(message);

          switch (messageType) {
            case (_utils || _load_utils()).MESSAGE_TYPES.RUN_TEST:{
                const testData = (0, (_utils || _load_utils()).parseJSON)(data);
                (0, (_run_test || _load_run_test()).default)(
                testData.path,
                testData.globalConfig,
                testData.config,
                getResolver(testData.config, testData.rawModuleMap)).

                catch(function (error) {
                  const testResult = (0, (_utils || _load_utils()).buildFailureTestResult)(testData.path, error);
                  console.error(error);
                  return testResult;
                }).
                then(function (result) {
                  const msg = (0, (_utils || _load_utils()).makeMessage)({
                    messageType: (_utils || _load_utils()).MESSAGE_TYPES.TEST_RESULT,
                    data: JSON.stringify(result) });

                  connection.send(msg);
                });
                break;
              }
            case (_utils || _load_utils()).MESSAGE_TYPES.SHUT_DOWN:{
                resolve();
                break;
              }}

        } catch (e) {
          console.error(e);
        }
      });
    }).catch(function (e) {
      console.error(e);
      throw e;
    });
  });return function (_x) {return _ref.apply(this, arguments);};})();

const resolvers = Object.create(null);
const getResolver = (config, rawModuleMap) => {
  // In watch mode, the raw module map with all haste modules is passed from
  // the test runner to the watch command. This is because jest-haste-map's
  // watch mode does not persist the haste map on disk after every file change.
  // To make this fast and consistent, we pass it from the TestRunner.
  if (rawModuleMap) {
    return (_jestRuntime || _load_jestRuntime()).default.createResolver(config, new (_jestHasteMap || _load_jestHasteMap()).default.ModuleMap(rawModuleMap));
  } else {
    const name = config.name;
    if (!resolvers[name]) {
      resolvers[name] = (_jestRuntime || _load_jestRuntime()).default.createResolver(
      config,
      (_jestRuntime || _load_jestRuntime()).default.createHasteMap(config).readModuleMap());

    }
    return resolvers[name];
  }
};