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
var FileTreeActions = require('./FileTreeActions');
var FileTreeStore = require('./FileTreeStore');
var {PanelComponent} = require('nuclide-panel');
var React = require('react-for-atom');

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
      }
    ));
  }

  _initializePanel(): void {
    this._panelElement = document.createElement('div');
    this._panel = atom.workspace.addLeftPanel({
      item: this._panelElement,
      visible: this._isVisible,
    });
  }

  _render(): void {
    React.render(
      <PanelComponent dock="left">{this._renderFileTree()}</PanelComponent>,
      this._panelElement
    );
  }

  _renderFileTree(): ReactElement {
    var rootDirectories: Array<atom$Directory> = this._store.getRootDirectories();
    if (rootDirectories.length === 0) {
      return <div>No project root</div>;
    }
    return (
      <div>
        {rootDirectories.map((directory) => (
          <div key={directory.getPath()}>{directory.getBaseName()}</div>
        ))}
      </div>
    );
  }

  _updateRootDirectories(): void {
    // If the remote-projects package hasn't loaded yet remote directories will be instantiated as
    // local directories but with invalid paths. We need to exclude those.
    var rootDirectories = atom.project.getDirectories().filter(directory => (
      !isLocalFile(directory) || isFullyQualifiedLocalPath(directory.getPath())
    ));
    this._actions.setRootDirectories(rootDirectories);
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

  destroy(): void {
    this._subscriptions.dispose();
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

function isLocalFile(entry: atom$File | atom$Directory): boolean {
  return !('getLocalPath' in entry);
}

function isFullyQualifiedLocalPath(path: string): boolean {
  return path.charAt(0) === '/';
}

module.exports = FileTreeController;
