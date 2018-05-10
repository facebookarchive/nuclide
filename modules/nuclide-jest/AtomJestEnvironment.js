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

// Slightly derived from https://github.com/nhunzaker/jest-electron-environment
// which is licensed MIT.

const mock = require('jest-mock');
const {FakeTimers, installCommonGlobals} = require('jest-util');

class AtomJestEnvironment {
  constructor(config) {
    const global = (this.global = window);
    installCommonGlobals(global, config.globals);
    this.moduleMocker = new mock.ModuleMocker(global);
    this.fakeTimers = new FakeTimers({
      config,
      global,
      moduleMocker: this.moduleMocker,
    });
  }

  setup() {
    this.global.atom = global.atom;
    return Promise.resolve();
  }

  teardown() {
    return Promise.resolve();
  }

  runScript(script) {
    return script.runInThisContext();
  }
}

module.exports = AtomJestEnvironment;
