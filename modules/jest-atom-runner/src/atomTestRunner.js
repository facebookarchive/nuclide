"use strict";

var _os = _interopRequireDefault(require("os"));

function _run_test() {
  const data = _interopRequireDefault(require("jest-runner/build/run_test"));

  _run_test = function () {
    return data;
  };

  return data;
}

function _jestRuntime() {
  const data = _interopRequireDefault(require("jest-runtime"));

  _jestRuntime = function () {
    return data;
  };

  return data;
}

function _jestHasteMap() {
  const data = _interopRequireDefault(require("jest-haste-map"));

  _jestHasteMap = function () {
    return data;
  };

  return data;
}

function _patchAtomConsole() {
  const data = _interopRequireDefault(require("../../nuclide-commons/patch-atom-console"));

  _patchAtomConsole = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _ipcClient() {
  const data = require("./ipc-client");

  _ipcClient = function () {
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
 * 
 * @format
 */

/* eslint-disable no-console */

/* eslint-disable nuclide-internal/no-commonjs */

/*
 * This file will be injected into an Atom process. It will start an IPC
 * client, find the parant Jest IPC server that spawned this process and say
 * "hey! i'm up and ready to run tests, send them over!"
 */
const ATOM_BUILTIN_MODULES = new Set(['atom', 'electron']);
process.on('uncaughtException', err => {
  console.error(err.stack);
  process.exit(1);
});

module.exports = async function (params) {
  (0, _patchAtomConsole().default)();
  const firstTestPath = params.testPaths[0]; // We pass server and worker IDs via a basename of non-existing file.
  // Yeah.. it's weird, i know! :(

  const {
    serverID,
    workerID
  } = (0, _utils().extractIPCIDsFromFilePath)(firstTestPath);
  const connection = await (0, _ipcClient().connectToIPCServer)({
    serverID,
    workerID
  });

  global.__buildAtomGlobal = () => params.buildAtomEnvironment({
    applicationDelegate: params.buildDefaultApplicationDelegate(),
    window,
    document: window.document,
    configDirPath: _os.default.tmpdir(),
    enablePersistence: true
  }); // We need to delete whatever is in `prepareStackTrace` to make source map work.
  // Right now Atom is overwriting it without an ability to reassign, so the only
  // option is to delete the whole thing. (https://fburl.com/cqp7mj01)


  delete Error.prepareStackTrace;
  return new Promise((resolve, reject) => {
    connection.onMessage(message => {
      try {
        const {
          messageType,
          data
        } = (0, _utils().parseMessage)(message);

        switch (messageType) {
          case _utils().MESSAGE_TYPES.RUN_TEST:
            {
              const testData = (0, _utils().parseJSON)(data);
              (0, _run_test().default)(testData.path, testData.globalConfig, testData.config, getResolver(testData.config, testData.rawModuleMap)).catch(error => {
                const testResult = (0, _utils().buildFailureTestResult)(testData.path, error, testData.config, testData.globalConfig);
                return testResult;
              }).then(result => {
                const msg = (0, _utils().makeMessage)({
                  messageType: _utils().MESSAGE_TYPES.TEST_RESULT,
                  data: JSON.stringify(result)
                });
                connection.send(msg);
              });
              break;
            }

          case _utils().MESSAGE_TYPES.SHUT_DOWN:
            {
              resolve();
              break;
            }
        }
      } catch (e) {
        console.error(e);
      }
    });
  }).catch(e => {
    console.error(e);
    throw e;
  });
}; // Atom has builtin modules that can't go through jest transforme/cache
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
    return wrapResolver(_jestRuntime().default.createResolver(config, new (_jestHasteMap().default.ModuleMap)(rawModuleMap)));
  } else {
    const name = config.name;

    if (!resolvers[name]) {
      resolvers[name] = wrapResolver(_jestRuntime().default.createResolver(config, _jestRuntime().default.createHasteMap(config).readModuleMap()));
    }

    return resolvers[name];
  }
};