/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

/* eslint-disable no-console */
/* eslint-disable rulesdir/no-commonjs */

/*
 * This file will be injected into an Atom process. It will start an IPC
 * client, find the parant Jest IPC server that spawned this process and say
 * "hey! i'm up and ready to run tests, send them over!"
 */
import type {IPCWorker} from './ipc-client';

import {ipcRenderer} from 'electron';

import {Console} from 'console';
import os from 'os';
import runTest from 'jest-runner/build/run_test';
import Runtime from 'jest-runtime';
import HasteMap from 'jest-haste-map';

import {
  parseMessage,
  MESSAGE_TYPES,
  parseJSON,
  makeMessage,
  buildFailureTestResult,
} from './utils';
import {connectToIPCServer} from './ipc-client';
import {extractIPCIDsFromFilePath} from './utils';

const redirectIO = () => {
  // Patch `console` to output through the main process.
  global.console = new Console(
    /* stdout */ {
      write(chunk) {
        // $FlowFixMe
        ipcRenderer.send('write-to-stdout', chunk);
      },
    },
    /* stderr */ {
      write(chunk) {
        // $FlowFixMe
        ipcRenderer.send('write-to-stderr', chunk);
      },
    },
  );
};

process.on('uncaughtException', err => {
  console.error(err.stack);
  process.exit(1);
});

export type AtomParams = {
  testPaths: Array<string>,
  buildAtomEnvironment: any,
  buildDefaultApplicationDelegate: any,
};

module.exports = async function(params: AtomParams) {
  redirectIO();
  const firstTestPath = params.testPaths[0];

  // We pass server and worker IDs via a basename of non-existing file.
  // Yeah.. it's weird, i know! :(
  const {serverID, workerID} = extractIPCIDsFromFilePath(firstTestPath);
  const connection: IPCWorker = await connectToIPCServer({serverID, workerID});

  global.atom = params.buildAtomEnvironment({
    applicationDelegate: params.buildDefaultApplicationDelegate(),
    window,
    document: window.document,
    configDirPath: os.tmpdir(),
    enablePersistence: true,
  });

  return new Promise((resolve, reject) => {
    connection.onMessage(message => {
      try {
        const {messageType, data} = parseMessage(message);

        switch (messageType) {
          case MESSAGE_TYPES.RUN_TEST: {
            const testData = parseJSON(data);
            runTest(
              testData.path,
              testData.globalConfig,
              testData.config,
              getResolver(testData.config, testData.rawModuleMap),
            )
              .catch(error => {
                const testResult = buildFailureTestResult(testData.path, error);
                console.error(error);
                return testResult;
              })
              .then(result => {
                const msg = makeMessage({
                  messageType: MESSAGE_TYPES.TEST_RESULT,
                  data: JSON.stringify(result),
                });
                connection.send(msg);
              });
            break;
          }
          case MESSAGE_TYPES.SHUT_DOWN: {
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
};

const resolvers = Object.create(null);
const getResolver = (config, rawModuleMap) => {
  // In watch mode, the raw module map with all haste modules is passed from
  // the test runner to the watch command. This is because jest-haste-map's
  // watch mode does not persist the haste map on disk after every file change.
  // To make this fast and consistent, we pass it from the TestRunner.
  if (rawModuleMap) {
    return Runtime.createResolver(config, new HasteMap.ModuleMap(rawModuleMap));
  } else {
    const name = config.name;
    if (!resolvers[name]) {
      resolvers[name] = Runtime.createResolver(
        config,
        Runtime.createHasteMap(config).readModuleMap(),
      );
    }
    return resolvers[name];
  }
};
