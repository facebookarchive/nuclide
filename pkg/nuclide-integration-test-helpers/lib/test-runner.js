Object.defineProperty(exports, '__esModule', {
  value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

// This file is transpiled by Atom - not by nuclide-node-transpiler.

var _temp2;

function _temp() {
  return _temp2 = _interopRequireDefault(require('temp'));
}

(_temp2 || _temp()).default.track();

// http://flight-manual.atom.io/hacking-atom/sections/writing-specs/#customizing-your-test-runner

// https://github.com/atom/atom/blob/v1.6.2/spec/jasmine-test-runner.coffee
exports.default = _asyncToGenerator(function* (params) {
  var statusCode = yield params.legacyTestRunner({
    logFile: params.logFile,
    headless: params.headless,
    testPaths: params.testPaths,
    buildAtomEnvironment: function buildAtomEnvironment(buildEnvParams) {
      // TODO(asuarez): Investigate if this is still needed.
      buildEnvParams.configDirPath = (_temp2 || _temp()).default.mkdirSync('atom_home');
      var atomGlobal = params.buildAtomEnvironment(buildEnvParams);

      jasmine.getEnv().beforeEach(function () {
        // Ensure 3rd-party packages are not installed via the
        // 'atom-package-deps' package when the 'nuclide' package is activated.
        // They are assumed to be already in ~/.atom/packages. js_test_runner.py
        // handles installing them during automated testing.
        atomGlobal.config.set('nuclide.installRecommendedPackages', false);
      });

      return atomGlobal;
    }
  });

  // Atom intercepts "process.exit" so we have to do our own manual cleanup.
  (_temp2 || _temp()).default.cleanupSync();

  return statusCode;
});
module.exports = exports.default;