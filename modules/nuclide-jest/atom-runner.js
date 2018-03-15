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
  rulesdir/no-commonjs: 0,
  */

const {Console} = require('console');
const electron = require('electron');
const invariant = require('assert');
const fs = require('fs');
// eslint-disable-next-line rulesdir/no-unresolved
const jestCLI = require('jest-cli');
const os = require('os');

// eslint-disable-next-line rulesdir/prefer-nuclide-uri
const path = require('path');

const config = require('./jest.config.js');

const {ipcRenderer} = electron;
invariant(ipcRenderer != null);

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

module.exports = function(params) {
  // It's assumed that all of the tests belong to the same package.
  const pkg = getPackage(params.testPaths[0]);
  if (pkg == null) {
    throw new Error(
      `Couldn't find a parent "package.json" for ${params.testPaths[0]}`
    );
  }

  global.atom = params.buildAtomEnvironment({
    applicationDelegate: params.buildDefaultApplicationDelegate(),
    window,
    document: window.document,
    configDirPath: os.tmpdir(),
    enablePersistence: true,
  });

  return jestCLI.runCLI(
    {
      outputFile: params.logFile,
      _: params.testPaths,
      cache: false,
      env: 'nuclide-jest/AtomJestEnvironment.js',
      config: JSON.stringify(config),
    },
    [process.cwd()]
  ).then(response => response.results.success ? 0 : 1);
};

function getPackage(start) {
  let current = path.resolve(start);
  while (true) {
    const filename = path.join(current, 'package.json');
    if (fs.existsSync(filename)) {
      return JSON.parse(fs.readFileSync(filename, 'utf8'));
    } else {
      const next = path.join(current, '..');
      if (next === current) {
        return null;
      } else {
        current = next;
      }
    }
  }
}
