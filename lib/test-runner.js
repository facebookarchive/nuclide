Object.defineProperty(exports, '__esModule', {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This file is transpiled by Atom - not by nuclide-node-transpiler.
// `require` is used here to avoid `import` hoisting load other issues.

var invariant = require('assert');

// When chromiums verbosity is off, patch `console` to output through the main
// process. `--v=-3` is used by the CI.
if (process.argv.indexOf('--v=-3')) {
  (function () {
    var _require = require('console');

    var Console = _require.Console;

    var electron = require('electron');
    var ipcRenderer = electron.ipcRenderer;

    invariant(ipcRenderer != null);
    // https://github.com/nodejs/node/blob/v5.1.1/lib/console.js
    global.console = new Console(
    /* stdout */{ write: function write(chunk) {
        ipcRenderer.send('write-to-stdout', chunk);
      } },
    /* stderr */{ write: function write(chunk) {
        ipcRenderer.send('write-to-stderr', chunk);
      } });
  })();
}

// Patch Atom's transpiler to ensure that our transforms are applied to tests:
require('./internal/atom-babel-compiler-patcher');

var fs = require('fs');
var path = require('path');
var integrationTestsDir = path.join(__dirname, '../spec');

exports.default = _asyncToGenerator(function* (params) {
  var isIntegrationTest = params.testPaths.some(function (testPath) {
    return testPath.startsWith(integrationTestsDir);
  });
  var isApmTest = !isIntegrationTest;

  // It's assumed that all of the tests belong to the same package.
  var pkg = getPackage(params.testPaths[0]);
  if (pkg == null) {
    throw new Error('Couldn\'t find a parent "package.json" for ' + params.testPaths[0]);
  }
  var nuclideConfig = pkg.nuclide && pkg.nuclide.config;

  var statusCode = yield params.legacyTestRunner({
    logFile: params.logFile,
    headless: params.headless,
    testPaths: params.testPaths,
    buildAtomEnvironment: function buildAtomEnvironment(buildEnvParams) {
      var atomGlobal = params.buildAtomEnvironment(buildEnvParams);

      if (isIntegrationTest) {
        jasmine.getEnv().beforeEach(function () {
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

        jasmine.getEnv().afterEach(function () {
          if (atomGlobal.confirm.calls.length) {
            var details = atomGlobal.confirm.argsForCall.map(function (args, i) {
              return 'call #' + i + ' with ' + JSON.stringify(args);
            });
            throw new Error('atom.confirm was called.\n' + details);
          }
        });
      }

      if (isApmTest && nuclideConfig) {
        jasmine.getEnv().beforeEach(function () {
          // Since the UP loader creates the config for all feature packages,
          // and it doesn't load for unit tests, it's necessary to manually
          // construct any default config that they define.
          Object.keys(nuclideConfig).forEach(function (key) {
            atomGlobal.config.setSchema('nuclide.' + pkg.name + '.' + key, nuclideConfig[key]);
          });
        });
      }

      return atomGlobal;
    }
  });

  yield new Promise(function (resolve) {
    // Atom intercepts "process.exit" so we have to do our own manual cleanup.
    var temp = require('temp');
    temp.cleanup(function (err, stats) {
      resolve();
      if (err && err.message !== 'not tracking') {
        // eslint-disable-next-line no-console
        console.log('temp.cleanup() failed. ' + err);
      }
    });
  });

  return statusCode;
});

function getPackage(start) {
  var current = path.resolve(start);
  // eslint-disable-next-line no-constant-condition
  while (true) {
    var filename = path.join(current, 'package.json');
    if (fs.existsSync(filename)) {
      return JSON.parse(fs.readFileSync(filename, 'utf8'));
    } else {
      var next = path.join(current, '..');
      if (next === current) {
        return null;
      } else {
        current = next;
      }
    }
  }
}
module.exports = exports.default;