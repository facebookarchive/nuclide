'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {CompositeDisposable} = require('atom');
var FileTree = require('../components/FileTree');
var FileTreeActions = require('./FileTreeActions');
var FileTreeHelpers = require('./FileTreeHelpers');
var FileTreeStore = require('./FileTreeStore');
var {PanelComponent} = require('nuclide-panel');
var React = require('react-for-atom');

var pathUtil = require('path');

export type FileTreeRootDirectoryState = {
  basePath: string;
  isRemote: boolean;
  expandedKeys: Array<string>;
  selectedKeys: Array<string>;
};

export type FileTreeControllerState = {
  panel: {
    isVisible: ?boolean;
  };
  tree: {
    roots: Array<FileTreeRootDirectoryState>
  };
};

class FileTreeController {
  _actions: FileTreeActions;
  _isVisible: boolean;
  _panel: PanelComponent;
  _panelElement: HTMLElement;
  _store: FileTreeStore;
  _subscriptions: CompositeDisposable;

  constructor(state: ?FileTreeControllerState) {
    var panel = state && state.panel || {};
    // show the file tree by default
    this._isVisible = panel.isVisible != null ? panel.isVisible : true;
    this._actions = FileTreeActions.getInstance();
    this._store = FileTreeStore.getInstance();
    this._subscriptions = new CompositeDisposable();
    // Initial root directories
    this._updateRootDirectories();
    // Subsequent root directories updated on change
    this._subscriptions.add(
      atom.project.onDidChangePaths(() => this._updateRootDirectories())
    );
    this._initializePanel();
    // Initial render
    this._render();
    // Subsequent renders happen on changes to data store
    this._subscriptions.add(
      this._store.subscribe(() => this._render())
    );
    this._subscriptions.add(atom.commands.add(
      'atom-workspace',
      {
        'nuclide-file-tree-deux:toggle': () => this.toggleVisibility(),
        'nuclide-file-tree-deux:reveal-active-file': () => this.revealActiveFile(),
      }
    ));
    // Load this package's keymap outside the normal activate/deactive lifecycle so its keymaps are
    // loaded only when users enable this package via its config.
    //
    // TODO: Move to normal keymaps/ directory when 'nuclide-file-tree' is fully replaced.
    atom.keymaps.loadKeymap(
      pathUtil.join(
        atom.packages.resolvePackagePath('nuclide-file-tree-deux'),
        'config',
        'keymap.cson'
      )
    );
  }

  _initializePanel(): void {
    this._panelElement = document.createElement('div');
    this._panelElement.style.height = '100%';
    this._panel = atom.workspace.addLeftPanel({
      item: this._panelElement,
      visible: this._isVisible,
    });
  }

  _render(): void {
    React.render(
      <PanelComponent dock="left"><FileTree /></PanelComponent>,
      this._panelElement
    );
  }

  _updateRootDirectories(): void {
    // If the remote-projects package hasn't loaded yet remote directories will be instantiated as
    // local directories but with invalid paths. We need to exclude those.
    var rootDirectories = atom.project.getDirectories().filter(directory => (
      FileTreeHelpers.isValidDirectory(directory)
    ));
    var rootKeys = rootDirectories.map(
      directory => FileTreeHelpers.dirPathToKey(directory.getPath())
    );
    this._actions.setRootKeys(rootKeys);
  }

  _setVisibility(shouldBeVisible: boolean): void {
    if (shouldBeVisible) {
      this._panel.show();
    } else {
      this._panel.hide();
    }
    this._isVisible = shouldBeVisible;
  }

  toggleVisibility(): void {
    this._setVisibility(!this._isVisible);
  }

  revealActiveFile(): void {
    var editor = atom.workspace.getActiveTextEditor();
    var file = editor ? editor.getBuffer().file : null;
    if (!file) {
      return;
    }
    var nodeKey: string = file.getPath();
    var rootKey: string = this._store.getRootForKey(nodeKey);
    if (!rootKey) {
      return;
    }
    var stack = [];
    var key = nodeKey;
    while (key !== rootKey) {
      stack.push(key);
      key = FileTreeHelpers.getParentKey(key);
    }
    // We want the stack to be [parentKey, ..., nodeKey].
    stack.reverse();
    stack.forEach((childKey, i) => {
      var parentKey = (i === 0) ? rootKey : stack[i - 1];
      this._actions.ensureChildNode(rootKey, parentKey, childKey);
      this._actions.expandNode(rootKey, parentKey);
    });
    this._actions.selectSingleNode(rootKey, nodeKey);
  }

  destroy(): void {
    this._subscriptions.dispose();
    this._store.reset();
    React.unmountComponentAtNode(this._panelElement);
    this._panel.destroy();
  }

  serialize(): FileTreeControllerState {
    return {
      panel: {
        isVisible: this._isVisible,
      },
      tree: {
        roots: [],
      },
    };
  }
}

module.exports = FileTreeController;
