/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow strict-local
 * @format
 */

/* This is the main file that Jest will specify in its config as
 * 'runner': 'path/to/this/file'
 */

/* eslint-disable rulesdir/no-commonjs */

import type {GlobalConfig, Test, TestResult, Watcher} from './types';

import {startServer} from './ipc-server';
import {makeUniqServerId} from './utils';

import AtomTestWorkerFarm from './AtomTestWorkerFarm';

class TestRunner {
  _globalConfig: GlobalConfig;

  constructor(globalConfig: GlobalConfig) {
    this._globalConfig = globalConfig;
  }

  async runTests(
    tests: Array<Test>,
    watcher: Watcher,
    onStart: Test => void,
    onResult: (Test, TestResult) => void,
    onFailure: (Test, Error) => void,
    options: {},
  ) {
    const serverID = makeUniqServerId();
    const ipcServer = await startServer({serverID});
    const concurrency = Math.min(tests.length, this._globalConfig.maxWorkers);
    const farm = new AtomTestWorkerFarm({
      serverID,
      ipcServer,
      globalConfig: this._globalConfig,
      concurrency,
    });
    await farm.start();

    await Promise.all(
      tests.map(test => {
        return farm
          .runTest(test, onStart)
          .then(testResult => onResult(test, testResult))
          .catch(error => onFailure(test, error));
      }),
    );

    ipcServer.stop();
    await farm.stop();
  }
}

module.exports = TestRunner;
