'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This file is transpiled by Atom - not by nuclide-node-transpiler.
// `require` is used here to avoid `import` hoisting load other issues.

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const invariant = require('assert');

// When chromiums verbosity is off, patch `console` to output through the main
// process. `--v=-3` is used by the CI.
if (process.argv.indexOf('--v=-3')) {
  var _require = require('console');

  const Console = _require.Console;

  const electron = require('electron');
  const ipcRenderer = electron.ipcRenderer;

  invariant(ipcRenderer != null);
  // https://github.com/nodejs/node/blob/v5.1.1/lib/console.js
  global.console = new Console(
  /* stdout */{
    write: function (chunk) {
      ipcRenderer.send('write-to-stdout', chunk);
    }
  },
  /* stderr */{
    write: function (chunk) {
      ipcRenderer.send('write-to-stderr', chunk);
    }
  });
}

require('../pkg/nuclide-node-transpiler');

const fs = require('fs');
const path = require('path');
const integrationTestsDir = path.join(__dirname, '../spec');

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (params) {
    const isIntegrationTest = params.testPaths.some(function (testPath) {
      return testPath.startsWith(integrationTestsDir);
    });
    const isApmTest = !isIntegrationTest;

    // It's assumed that all of the tests belong to the same package.
    const pkg = getPackage(params.testPaths[0]);
    if (pkg == null) {
      throw new Error(`Couldn't find a parent "package.json" for ${ params.testPaths[0] }`);
    }
    const nuclideConfig = pkg.nuclide && pkg.nuclide.config;

    const statusCode = yield params.legacyTestRunner({
      logFile: params.logFile,
      headless: params.headless,
      testPaths: params.testPaths,
      buildAtomEnvironment: function (buildEnvParams) {
        const atomGlobal = params.buildAtomEnvironment(buildEnvParams);

        if (isIntegrationTest) {
          jasmine.getEnv().beforeEach(() => {
            // If we're running integration tests in parallel, double the timeout.
            if (process.env.SANDCASTLE === '1') {
              jasmine.getEnv().defaultTimeoutInterval = 10000;
            }
            // `atom.confirm` blocks Atom and stops the integration tests.
            spyOn(atomGlobal, 'confirm');
            // Ensure 3rd-party packages are not installed via the
            // 'atom-package-deps' package when the 'nuclide' package is activated.
            // They are assumed to be already in ~/.atom/packages. js_test_runner.py
            // handles installing them during automated testing.
            atomGlobal.config.set('nuclide.installRecommendedPackages', false);
          });

          jasmine.getEnv().afterEach(() => {
            if (atomGlobal.confirm.calls.length) {
              const details = atomGlobal.confirm.argsForCall.map((args, i) => `call #${ i } with ${ JSON.stringify(args) }`);
              throw new Error('atom.confirm was called.\n' + details);
            }
          });
        }

        if (isApmTest && nuclideConfig) {
          jasmine.getEnv().beforeEach(() => {
            // Since the UP loader creates the config for all feature packages,
            // and it doesn't load for unit tests, it's necessary to manually
            // construct any default config that they define.
            Object.keys(nuclideConfig).forEach(key => {
              atomGlobal.config.setSchema(`nuclide.${ pkg.name }.${ key }`, nuclideConfig[key]);
            });
          });
        }

        return atomGlobal;
      }
    });

    yield new Promise(function (resolve) {
      // Atom intercepts "process.exit" so we have to do our own manual cleanup.
      const temp = require('temp');
      temp.cleanup(function (err, stats) {
        resolve();
        if (err && err.message !== 'not tracking') {
          // eslint-disable-next-line no-console
          console.log(`temp.cleanup() failed. ${ err }`);
        }
      });
    });

    return statusCode;
  });

  return function (_x) {
    return _ref.apply(this, arguments);
  };
})();

function getPackage(start) {
  let current = path.resolve(start);
  // eslint-disable-next-line no-constant-condition
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
module.exports = exports['default'];