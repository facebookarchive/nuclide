/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @noflow
 */
'use strict';

/* eslint
  comma-dangle: [1, always-multiline],
  prefer-object-spread/prefer-object-spread: 0,
  nuclide-internal/no-commonjs: 0,
  */

const {Console} = require('console');
const electron = require('electron');
const invariant = require('assert');
const jestCLI = require('jest-cli');
const fs = require('fs');
const os = require('os');
const path = require('path');

const config = require('./jest.config.js');
const {getPackage, getPackageFile} = require('./AtomJestUtils');

const {ipcRenderer} = electron;
invariant(ipcRenderer != null);

module.exports = function(params) {
  const firstTestPath = params.testPaths[0];
  const cwd = path.dirname(getPackageFile(firstTestPath));
  // It's assumed that all of the tests belong to the same package.
  const pkg = getPackage(firstTestPath);
  if (pkg == null) {
    throw new Error(
      `Couldn't find a parent "package.json" for ${firstTestPath}`
    );
  }

  global.atom = params.buildAtomEnvironment({
    applicationDelegate: params.buildDefaultApplicationDelegate(),
    window,
    document: window.document,
    configDirPath: os.tmpdir(),
    enablePersistence: true,
  });

  if (params.headless) {
    // Patch `console` to output through the main process.
    global.console = new Console(
      /* stdout */ {
        write(chunk) {
          ipcRenderer.send('write-to-stdout', chunk);
        },
      },
      /* stderr */ {
        write(chunk) {
          ipcRenderer.send('write-to-stderr', chunk);
        },
      }
    );
  } else {
    try {
      // eslint-disable-next-line nuclide-internal/modules-dependencies
      require('nuclide-node-transpiler');
    } catch (e) {}
  }
  return jestCLI.runCLI(
    {
      outputFile: params.logFile,
      _: params.testPaths.map(testPath => fs.realpathSync(testPath)),
      cache: false,
      env: 'nuclide-jest/AtomJestEnvironment.js',
      runInBand: true,
      watch: params.headless ? process.env.JEST_WATCH != null : true,
      watchAll: params.headless ? process.env.JEST_WATCH_ALL != null : true,
      watchman: true,
      config: JSON.stringify(Object.assign(
        {},
        config,
        {
          reporters: params.headless ?
            ['default'] :
            [path.join(__dirname, 'atom-reporter.js')],
          setupTestFrameworkScriptFile: path.resolve(__dirname, 'atomSetup.js'),
        }
      )),
    },
    [cwd]
  ).then(response => response.results.success ? 0 : 1);
};
