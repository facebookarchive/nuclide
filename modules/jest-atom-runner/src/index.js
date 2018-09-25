"use strict";

function _ipcServer() {
  const data = require("./ipc-server");

  _ipcServer = function () {
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

function _AtomTestWorkerFarm() {
  const data = _interopRequireDefault(require("./AtomTestWorkerFarm"));

  _AtomTestWorkerFarm = function () {
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

/* This is the main file that Jest will specify in its config as
 * 'runner': 'path/to/this/file'
 */

/* eslint-disable nuclide-internal/no-commonjs */
// Share ipc server and farm between multiple runs, so we don't restart
// the whole thing in watch mode every time. (it steals window focus when
// atom launches)
let ipcServerPromise;
let serverID;
let farm;
let cleanupRegistered = false;

class TestRunner {
  constructor(globalConfig) {
    this._globalConfig = globalConfig;
    serverID = serverID || (serverID = (0, _utils().makeUniqServerId)());
    ipcServerPromise || (ipcServerPromise = (0, _ipcServer().startServer)({
      serverID: this._serverID
    }));
  }

  async runTests(tests, watcher, onStart, onResult, onFailure, options) {
    const isWatch = this._globalConfig.watch || this._globalConfig.watchAll;
    const concurrency = isWatch ? // spawning multiple atoms in watch mode is weird,
    // they all try to steal focus from the current window
    1 : Math.min(tests.length, this._globalConfig.maxWorkers);
    const ipcServer = await ipcServerPromise;

    if (!farm) {
      farm = new (_AtomTestWorkerFarm().default)({
        serverID: this._serverID,
        ipcServer: await ipcServer,
        globalConfig: this._globalConfig,
        concurrency
      });
      await farm.start();
    }

    const cleanup = async () => {
      farm.stop();
      ipcServer.stop();
    };

    if (!cleanupRegistered) {
      cleanupRegistered = true;
      process.on('exit', cleanup);
      process.on('SIGINT', cleanup);
      process.on('SIGUSR1', cleanup);
      process.on('SIGUSR2', cleanup);
      process.on('uncaughtException', cleanup);
    }

    await Promise.all(tests.map(test => {
      return farm.runTest(test, onStart).then(testResult => onResult(test, testResult)).catch(error => onFailure(test, error));
    }));

    if (!isWatch) {
      cleanup();
    }
  }

}

module.exports = TestRunner;