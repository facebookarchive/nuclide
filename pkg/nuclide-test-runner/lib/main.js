'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type FileTreeContextMenu from '../../nuclide-file-tree/lib/FileTreeContextMenu';
import type {HomeFragments} from '../../nuclide-home-interfaces';
import type {DistractionFreeModeProvider} from '../../nuclide-distraction-free-mode';
import type {TestRunner} from './interfaces';
import type {TestRunnerController as TestRunnerControllerType} from './TestRunnerController';
import type {TestRunnerControllerState} from './TestRunnerController';

import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';

const FILE_TREE_CONTEXT_MENU_PRIORITY = 200;

let logger;
function getLogger() {
  if (!logger) {
    logger = require('../../nuclide-logging').getLogger();
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

  _controller: ?TestRunnerControllerType;
  _disposables: CompositeDisposable;
  _initialState: ?TestRunnerControllerState;
  _testRunners: Set<TestRunner>;

  constructor(state: ?TestRunnerControllerState) {
    this._initialState = state;
    this._testRunners = new Set();
    this._disposables = new CompositeDisposable();
    this._disposables.add(
      atom.commands.add(
        'atom-workspace',
        'nuclide-test-runner:toggle-panel',
        () => {
          this._getController().togglePanel();
        }
      )
    );
    // Listen for run events on files in the file tree
    this._disposables.add(
      atom.commands.add(
        '.tree-view .entry.file.list-item',
        'nuclide-test-runner:run-tests',
        event => {
          const target = ((event.currentTarget: any): HTMLElement).querySelector('.name');
          this._getController().runTests(target.dataset.path);
          // Ensure ancestors of this element don't attempt to run tests as well.
          event.stopPropagation();
        }
      )
    );
    // Listen for run events on directories in the file tree
    this._disposables.add(
      atom.commands.add(
        '.tree-view .entry.directory.list-nested-item',
        'nuclide-test-runner:run-tests',
        event => {
          const target = ((event.currentTarget: any): HTMLElement).querySelector('.name');
          this._getController().runTests(target.dataset.path);
          // Ensure ancestors of this element don't attempt to run tests as well.
          event.stopPropagation();
        }
      )
    );

    // The panel should be visible because of the last serialized state, initialize it immediately.
    if (state != null && state.panelVisible) {
      this._getController();
    }
  }

  addItemsToFileTreeContextMenu(contextMenu: FileTreeContextMenu): IDisposable {
    const fileItem = this._createRunTestsContextMenuItem(/* isForFile */ true, contextMenu);
    const directoryItem = this._createRunTestsContextMenuItem(/* isForFile */ false, contextMenu);

    // Create a separator menu item that displays if either the file or directory item displays.
    invariant(fileItem.shouldDisplay);
    const fileItemShouldDisplay = fileItem.shouldDisplay.bind(fileItem);
    invariant(directoryItem.shouldDisplay);
    const directoryItemShouldDisplay = directoryItem.shouldDisplay.bind(directoryItem);
    const separatorShouldDisplay = (event: MouseEvent) => {
      return fileItemShouldDisplay(event) || directoryItemShouldDisplay(event);
    };
    const separator = {
      type: 'separator',
      shouldDisplay: separatorShouldDisplay,
    };

    const menuItemSubscriptions = new CompositeDisposable();
    menuItemSubscriptions.add(
      contextMenu.addItemToTestSection(fileItem, FILE_TREE_CONTEXT_MENU_PRIORITY),
      contextMenu.addItemToTestSection(directoryItem, FILE_TREE_CONTEXT_MENU_PRIORITY + 1),
      contextMenu.addItemToTestSection(separator, FILE_TREE_CONTEXT_MENU_PRIORITY + 2),
    );
    this._disposables.add(menuItemSubscriptions);
    return menuItemSubscriptions;
  }

  addTestRunner(testRunner: TestRunner): ?Disposable {
    if (this._testRunners.has(testRunner)) {
      getLogger().info(`Attempted to add test runner "${testRunner.label}" that was already added`);
      return;
    }

    this._testRunners.add(testRunner);
    // Tell the controller to re-render only if it exists so test runner services won't force
    // construction if the panel is still invisible.
    //
    // TODO(rossallen): The control should be inverted here. The controller should listen for
    // changes rather than be told about them.
    if (this._controller != null) {
      this._getController().didUpdateTestRunners();
    }

    return new Disposable(() => {
      this._testRunners.delete(testRunner);
      // Tell the controller to re-render only if it exists so test runner services won't force
      // construction if the panel is still invisible.
      if (this._controller != null) {
        this._getController().didUpdateTestRunners();
      }
    });
  }

  getDistractionFreeModeProvider(): DistractionFreeModeProvider {
    return {
      name: 'nuclide-test-runner',
      isVisible: () => {
        return this._controller != null && this._controller.isVisible();
      },
      toggle: () => {
        this._getController().togglePanel();
      },
    };
  }

  dispose(): void {
    this._disposables.dispose();
  }

  serialize(): Object {
    return this._getController().serialize();
  }

  _createRunTestsContextMenuItem(
    isForFile: boolean,
    contextMenu: FileTreeContextMenu,
  ): atom$ContextMenuItem {
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
      created: function(event) {
        let target = (((event.target): any): HTMLElement);
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
      shouldDisplay: event => {
        // Don't show a testing option if there are no test runners.
        if (this._testRunners.size === 0) {
          return false;
        }

        if (!shouldDisplayItem(event)) {
          return false;
        }

        let target = (((event.target): any): HTMLElement);
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

  _getController() {
    let controller = this._controller;
    if (controller == null) {
      const {TestRunnerController} = require('./TestRunnerController');
      controller = new TestRunnerController(this._initialState, this._testRunners);
      this._controller = controller;
    }
    return controller;
  }

}

let activation: ?Activation;
let toolBar: ?any = null;

export function activate(state: ?Object): void {
  if (!activation) {
    activation = new Activation(state);
  }
}

export function deactivate(): void {
  if (activation) {
    activation.dispose();
    activation = null;
  }
  if (toolBar) {
    toolBar.removeItems();
  }
}

export function serialize(): Object {
  return activation ? activation.serialize() : {};
}

export function consumeTestRunner(testRunner: TestRunner): ?Disposable {
  if (activation) {
    return activation.addTestRunner(testRunner);
  }
}

export function addItemsToFileTreeContextMenu(contextMenu: FileTreeContextMenu): IDisposable {
  invariant(activation);
  return activation.addItemsToFileTreeContextMenu(contextMenu);
}

export function consumeToolBar(getToolBar: (group: string) => Object): void {
  toolBar = getToolBar('nuclide-test-runner');
  toolBar.addButton({
    icon: 'checklist',
    callback: 'nuclide-test-runner:toggle-panel',
    tooltip: 'Toggle Test Runner',
    priority: 400,
  });
}

export function getHomeFragments(): HomeFragments {
  return {
    feature: {
      title: 'Test Runner',
      icon: 'checklist',
      description: 'Run tests directly from Nuclide by right-mouse-clicking on the file.',
      command: 'nuclide-test-runner:toggle-panel',
    },
    priority: 2,
  };
}

export function getDistractionFreeModeProvider(): DistractionFreeModeProvider {
  invariant(activation != null);
  return activation.getDistractionFreeModeProvider();
}
