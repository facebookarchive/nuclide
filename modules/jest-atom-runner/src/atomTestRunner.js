'use strict';





















var _os = _interopRequireDefault(require('os'));var _run_test;
function _load_run_test() {return _run_test = _interopRequireDefault(require('jest-runner/build/run_test'));}var _jestRuntime;
function _load_jestRuntime() {return _jestRuntime = _interopRequireDefault(require('jest-runtime'));}var _jestHasteMap;
function _load_jestHasteMap() {return _jestHasteMap = _interopRequireDefault(require('jest-haste-map'));}var _patchAtomConsole;
function _load_patchAtomConsole() {return _patchAtomConsole = _interopRequireDefault(require('../../nuclide-commons/patch-atom-console'));}var _utils;

function _load_utils() {return _utils = require('./utils');}var _ipcClient;






function _load_ipcClient() {return _ipcClient = require('./ipc-client');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}


const ATOM_BUILTIN_MODULES = new Set(['atom', 'electron']); /**
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
                                                                                                                                                   */process.on('uncaughtException', err => {console.error(err.stack);process.exit(1);});module.exports = async function (params) {(0, (_patchAtomConsole || _load_patchAtomConsole()).default)();
  const firstTestPath = params.testPaths[0];

  // We pass server and worker IDs via a basename of non-existing file.
  // Yeah.. it's weird, i know! :(
  const { serverID, workerID } = (0, (_utils || _load_utils()).extractIPCIDsFromFilePath)(firstTestPath);
  const connection = await (0, (_ipcClient || _load_ipcClient()).connectToIPCServer)({
    serverID,
    workerID });


  global.atom = params.buildAtomEnvironment({
    applicationDelegate: params.buildDefaultApplicationDelegate(),
    window,
    document: window.document,
    configDirPath: _os.default.tmpdir(),
    enablePersistence: true });


  return new Promise((resolve, reject) => {
    connection.onMessage(message => {
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

              catch(error => {
                const testResult = (0, (_utils || _load_utils()).buildFailureTestResult)(testData.path, error);
                console.error(error);
                return testResult;
              }).
              then(result => {
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
  }).catch(e => {
    console.error(e);
    throw e;
  });
};

// Atom has builtin modules that can't go through jest transforme/cache
// pipeline. There's no easy way to add custom modules to jest, so we'll wrap
// jest Resolver object and make it bypass atom's modules.
const wrapResolver = resolver => {
  const isCoreModule = resolver.isCoreModule;
  const resolveModule = resolver.resolveModule;

  resolver.isCoreModule = moduleName => {
    if (ATOM_BUILTIN_MODULES.has(moduleName)) {
      return true;
    } else {
      return isCoreModule.call(resolver, moduleName);
    }
  };

  resolver.resolveModule = (from, to, options) => {
    if (ATOM_BUILTIN_MODULES.has(to)) {
      return to;
    } else {
      return resolveModule.call(resolver, from, to, options);
    }
  };

  return resolver;
};

const resolvers = Object.create(null);
const getResolver = (config, rawModuleMap) => {
  // In watch mode, the raw module map with all haste modules is passed from
  // the test runner to the watch command. This is because jest-haste-map's
  // watch mode does not persist the haste map on disk after every file change.
  // To make this fast and consistent, we pass it from the TestRunner.
  if (rawModuleMap) {
    return wrapResolver(
    (_jestRuntime || _load_jestRuntime()).default.createResolver(config, new (_jestHasteMap || _load_jestHasteMap()).default.ModuleMap(rawModuleMap)));

  } else {
    const name = config.name;
    if (!resolvers[name]) {
      resolvers[name] = wrapResolver(
      (_jestRuntime || _load_jestRuntime()).default.createResolver(
      config,
      (_jestRuntime || _load_jestRuntime()).default.createHasteMap(config).readModuleMap()));


    }
    return resolvers[name];
  }
};