'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type TestRunnerControllerState from './TestRunnerController';
import type {HomeFragments} from 'nuclide-home-interfaces';
import type {TestRunner} from 'nuclide-test-runner-interfaces';

const {
  CompositeDisposable,
  Disposable,
} = require('atom');

let logger;
function getLogger() {
  if (!logger) {
    logger = require('nuclide-logging').getLogger();
  }
  return logger;
}

/**
 * Returns a string of length `length` + 1 by replacing extra characters in the middle of `str` with
 * an ellipsis character. Example:
 *
 *     > limitString('foobar', 4)
 *     'fo…ar'
 */
function limitString(str: string, length?: number = 20): string {
  const strLength = str.length;
  return (strLength > length) ?
    `${str.substring(0, length / 2)}…${str.substring(str.length - length / 2)}` :
    str;
}

class Activation {

  _controller: Object; // TODO: Should be `TestRunnerController`, but it is lazily required.
  _disposables: CompositeDisposable;
  _testRunners: Set<TestRunner>;

  constructor(state: ?TestRunnerControllerState) {
    this._testRunners = new Set();
    const TestRunnerController = require('./TestRunnerController');
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
    // Listen for run events on files in the file tree
    this._disposables.add(
      atom.commands.add(
        '.entry.file.list-item',
        'nuclide-test-runner:run-tests',
        (event) => {
          const target = event.currentTarget.querySelector('.name');
          this._controller.runTests(target.dataset.path);
        }
      )
    );
    // Listen for run events on directories in the file tree
    this._disposables.add(
      atom.commands.add(
        '.entry.directory.list-item',
        'nuclide-test-runner:run-tests',
        (event) => {
          const target = event.currentTarget.querySelector('.name');
          this._controller.runTests(target.dataset.path);
        }
      )
    );
    this._disposables.add(
      atom.contextMenu.add({
        '.entry.directory.list-item': [
          {type: 'separator'},
          this._createRunTestsContextMenuItem('Run tests in'),
          {type: 'separator'},
        ],
        '.entry.file.list-item': [
          {type: 'separator'},
          this._createRunTestsContextMenuItem('Run tests at'),
          {type: 'separator'},
        ],
      })
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

  _createRunTestsContextMenuItem(label: string): Object {
    return {
      // Intentionally **not** an arrow function because Atom sets the context when calling this and
      // allows dynamically setting values by assigning to `this`.
      created: function(event) {
        let target = event.target;
        if (target.dataset.name === undefined) {
          // If the event did not happen on the `name` span, search for it in the descendants.
          target = target.querySelector('.name');
        }
        if (target.dataset.name === undefined) {
          // If no necessary `.name` descendant is found, don't display a context menu.
          return false;
        }
        const name = target.dataset.name;
        this.command = 'nuclide-test-runner:run-tests';
        this.label = `${label} '${limitString(name)}'`;
      },
      shouldDisplay: (event) => {
        // Don't show a testing option if there are no test runners.
        if (this._testRunners.size === 0) {
          return false;
        }

        let target = event.target;
        if (target.dataset.name === undefined) {
          // If the event did not happen on the `name` span, search for it in the descendants.
          target = target.querySelector('.name');
        }
        // If no descendant has the necessary dataset to create this menu item, don't create
        // it.
        return target != null && target.dataset.name != null && target.dataset.path != null;
      },
    };
  }

}

let activation: ?Activation;
let toolBar: ?any = null;

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
    if (toolBar) {
      toolBar.removeItems();
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

  consumeToolBar(getToolBar: (group: string) => Object): void {
    toolBar = getToolBar('nuclide-test-runner');
    toolBar.addButton({
      icon: 'checklist',
      callback: 'nuclide-test-runner:toggle-panel',
      tooltip: 'Toggle Test Runner',
      priority: 400,
    });
  },

  getHomeFragments(): HomeFragments {
    return {
      feature: {
        title: 'Test Runner',
        icon: 'checklist',
        description: 'Run tests directly from Nuclide by right-mouse-clicking on the file.',
        command: 'nuclide-test-runner:toggle-panel',
      },
      priority: 2,
    };
  },

};
