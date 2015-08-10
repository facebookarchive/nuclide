'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type TestRunner from './TestRunner';
import type TestRunnerControllerState from './TestRunnerController';

var {
  CompositeDisposable,
  Disposable,
} = require('atom');

var logger;
function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

class Activation {

  _controller: Object; // TODO: Should be `TestRunnerController`, but it is lazily required.
  _disposables: CompositeDisposable;
  _testRunners: Set<TestRunner>;

  constructor(state: ?TestRunnerControllerState) {
    this._testRunners = new Set();
    var TestRunnerController = require('./TestRunnerController');
    this._controller = new TestRunnerController(state, this._testRunners);
    this._disposables = new CompositeDisposable();
    this._disposables.add(
      atom.commands.add(
        'body',
        'nuclide-test-runner:toggle-panel',
        () => {
          this._controller.togglePanel();
        }
      )
    );
  }

  addTestRunner(testRunner: TestRunner): ?Disposable {
    if (this._testRunners.has(testRunner)) {
      getLogger().info(`Attempted to add test runner "${testRunner.label}" that was already added`);
      return;
    }

    this._testRunners.add(testRunner);
    this._controller.didUpdateTestRunners();

    return new Disposable(() => {
      this._testRunners.delete(testRunner);
      this._controller.didUpdateTestRunners();
    });
  }

  dispose(): void {
    this._disposables.dispose();
  }

  serialize(): Object {
    return this._controller.serialize();
  }

}

var activation: ?Activation;
module.exports = {

  activate(state: ?Object): void {
    if (!activation) {
      activation = new Activation(state);
    }
  },

  deactivate(): void {
    if (activation) {
      activation.dispose();
      activation = null;
    }
  },

  serialize(): Object {
    return activation ? activation.serialize() : {};
  },

  consumeTestRunner(testRunner: TestRunner): ?Disposable {
    if (activation) {
      return activation.addTestRunner(testRunner);
    }
  },

};
