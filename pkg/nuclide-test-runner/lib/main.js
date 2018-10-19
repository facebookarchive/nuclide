"use strict";

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _destroyItemWhere() {
  const data = require("../../../modules/nuclide-commons-atom/destroyItemWhere");

  _destroyItemWhere = function () {
    return data;
  };

  return data;
}

function _TestRunnerController() {
  const data = require("./TestRunnerController");

  _TestRunnerController = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const logger = (0, _log4js().getLogger)('nuclide-test-runner');
const FILE_TREE_CONTEXT_MENU_PRIORITY = 200;
/**
 * Returns a string of length `length` + 1 by replacing extra characters in the middle of `str` with
 * an ellipsis character. Example:
 *
 *     > limitString('foobar', 4)
 *     'fo…ar'
 */

function limitString(str, length = 20) {
  const strLength = str.length;
  return strLength > length ? `${str.substring(0, length / 2)}…${str.substring(str.length - length / 2)}` : str;
}

class Activation {
  constructor() {
    this._testRunners = new Set();
    this._disposables = new (_UniversalDisposable().default)(); // Listen for run events on files in the file tree

    this._disposables.add(atom.commands.add('.tree-view .entry.file.list-item', 'nuclide-test-runner:run-tests', event => {
      const target = event.currentTarget.querySelector('.name');

      if (!(target != null)) {
        throw new Error("Invariant violation: \"target != null\"");
      }

      this.getController().runTests(target.dataset.path); // Ensure ancestors of this element don't attempt to run tests as well.

      event.stopPropagation();
    })); // Listen for run events on directories in the file tree


    this._disposables.add(atom.commands.add('.tree-view .entry.directory.list-nested-item', 'nuclide-test-runner:run-tests', event => {
      const target = event.currentTarget.querySelector('.name');

      if (!(target != null)) {
        throw new Error("Invariant violation: \"target != null\"");
      }

      this.getController().runTests(target.dataset.path); // Ensure ancestors of this element don't attempt to run tests as well.

      event.stopPropagation();
    })); // Listen for untargeted run-tests events


    this._disposables.add(atom.commands.add('atom-workspace', 'nuclide-test-runner:run-tests', event => {
      this.getController().runTests(); // Ensure ancestors of this element don't attempt to run tests as well.

      event.stopPropagation();
    }), this._registerCommandAndOpener());
  }

  addItemsToFileTreeContextMenu(contextMenu) {
    const fileItem = this._createRunTestsContextMenuItem(
    /* isForFile */
    true, contextMenu);

    const directoryItem = this._createRunTestsContextMenuItem(
    /* isForFile */
    false, contextMenu); // Create a separator menu item that displays if either the file or directory item displays.


    if (!fileItem.shouldDisplay) {
      throw new Error("Invariant violation: \"fileItem.shouldDisplay\"");
    }

    const fileItemShouldDisplay = fileItem.shouldDisplay.bind(fileItem);

    if (!directoryItem.shouldDisplay) {
      throw new Error("Invariant violation: \"directoryItem.shouldDisplay\"");
    }

    const directoryItemShouldDisplay = directoryItem.shouldDisplay.bind(directoryItem);

    const separatorShouldDisplay = event => {
      return fileItemShouldDisplay(event) || directoryItemShouldDisplay(event);
    };

    const separator = {
      type: 'separator',
      shouldDisplay: separatorShouldDisplay
    };
    const menuItemSubscriptions = new (_UniversalDisposable().default)();
    menuItemSubscriptions.add(contextMenu.addItemToTestSection(fileItem, FILE_TREE_CONTEXT_MENU_PRIORITY), contextMenu.addItemToTestSection(directoryItem, FILE_TREE_CONTEXT_MENU_PRIORITY + 1), contextMenu.addItemToTestSection(separator, FILE_TREE_CONTEXT_MENU_PRIORITY + 2));

    this._disposables.add(menuItemSubscriptions);

    return new (_UniversalDisposable().default)(() => this._disposables.remove(menuItemSubscriptions));
  }

  consumeTestRunner(testRunner) {
    if (this._testRunners.has(testRunner)) {
      logger.info(`Attempted to add test runner "${testRunner.label}" that was already added`);
      return;
    }

    this._testRunners.add(testRunner); // Tell the controller to re-render only if it exists so test runner services won't force
    // construction if the panel is still invisible.
    //
    // TODO(rossallen): The control should be inverted here. The controller should listen for
    // changes rather than be told about them.


    if (this._controller != null) {
      this.getController().didUpdateTestRunners();
    }

    return new (_UniversalDisposable().default)(() => {
      this._testRunners.delete(testRunner); // Tell the controller to re-render only if it exists so test runner services won't force
      // construction if the panel is still invisible.


      if (this._controller != null) {
        this.getController().didUpdateTestRunners();
      }
    });
  }

  consumeToolBar(getToolBar) {
    const toolBar = getToolBar('nuclide-test-runner');
    toolBar.addButton({
      icon: 'checklist',
      callback: 'nuclide-test-runner:toggle-panel',
      tooltip: 'Toggle Test Runner',
      priority: 600
    });
    const disposable = new (_UniversalDisposable().default)(() => {
      toolBar.removeItems();
    });

    this._disposables.add(disposable);

    return disposable;
  }

  dispose() {
    this._disposables.dispose();
  }

  _createRunTestsContextMenuItem(isForFile, contextMenu) {
    let label;
    let shouldDisplayItem;

    if (isForFile) {
      label = 'Run tests at';

      shouldDisplayItem = event => {
        const node = contextMenu.getSingleSelectedNode();
        return node != null && !node.isContainer;
      };
    } else {
      label = 'Run tests in';

      shouldDisplayItem = event => {
        const node = contextMenu.getSingleSelectedNode();
        return node != null && node.isContainer;
      };
    }

    return {
      // Intentionally **not** an arrow function because Atom sets the context when calling this and
      // allows dynamically setting values by assigning to `this`.
      created(event) {
        let target = event.target;

        if (target.dataset.name === undefined) {
          // If the event did not happen on the `name` span, search for it in the descendants.
          target = target.querySelector('.name');
        }

        if (!(target != null)) {
          throw new Error("Invariant violation: \"target != null\"");
        }

        if (target.dataset.name === undefined) {
          // If no necessary `.name` descendant is found, don't display a context menu.
          return;
        }

        const name = target.dataset.name;
        this.command = 'nuclide-test-runner:run-tests';
        this.label = `${label} '${limitString(name)}'`;
      },

      shouldDisplay: event => {
        // Don't show a testing option if there are no test runners.
        if (this._testRunners.size === 0) {
          return false;
        }

        if (!shouldDisplayItem(event)) {
          return false;
        }

        let target = event.target;

        if (target.dataset.name === undefined) {
          // If the event did not happen on the `name` span, search for it in the descendants.
          target = target.querySelector('.name');
        } // If no descendant has the necessary dataset to create this menu item, don't create
        // it.


        return target != null && target.dataset.name != null && target.dataset.path != null;
      }
    };
  }

  getController() {
    let controller = this._controller;

    if (controller == null) {
      controller = new (_TestRunnerController().TestRunnerController)(this._testRunners);
      this._controller = controller;
    }

    return controller;
  }

  _registerCommandAndOpener() {
    return new (_UniversalDisposable().default)(atom.workspace.addOpener(uri => {
      if (uri === _TestRunnerController().WORKSPACE_VIEW_URI) {
        const controller = this.getController();
        controller.reinitialize();
        return controller;
      }
    }), () => (0, _destroyItemWhere().destroyItemWhere)(item => item instanceof _TestRunnerController().TestRunnerController), atom.commands.add('atom-workspace', 'nuclide-test-runner:toggle-panel', () => {
      atom.workspace.toggle(_TestRunnerController().WORKSPACE_VIEW_URI);
    }));
  }

  deserializeTestRunnerPanelState() {
    return this.getController();
  }

}

(0, _createPackage().default)(module.exports, Activation);