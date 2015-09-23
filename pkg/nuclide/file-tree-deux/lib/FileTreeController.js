'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ExportStoreData} from './FileTreeStore';

var INITIAL_WIDTH = 240;

var {CompositeDisposable} = require('atom');
var FileSystemActions = require('./FileSystemActions');
var FileTree = require('../components/FileTree');
var FileTreeActions = require('./FileTreeActions');
var {EVENT_HANDLER_SELECTOR} = require('./FileTreeConstants');
var FileTreeContextMenu = require('./FileTreeContextMenu');
var FileTreeHelpers = require('./FileTreeHelpers');
var FileTreeStore = require('./FileTreeStore');
var {PanelComponent} = require('nuclide-panel');
var React = require('react-for-atom');

var os = require('os');
var pathUtil = require('path');
var shell = require('shell');

export type FileTreeControllerState = {
  panel: {
    isVisible: ?boolean;
    width: number;
  };
  tree: ExportStoreData;
};

class FileTreeController {
  _actions: FileTreeActions;
  _contextMenu: FileTreeContextMenu;
  _isVisible: boolean;
  _panel: atom$Panel;
  _panelComponent: PanelComponent;
  _panelElement: HTMLElement;
  _store: FileTreeStore;
  _subscriptions: CompositeDisposable;

  constructor(state: ?FileTreeControllerState) {
    var {panel} = {
      ...{panel: {width: INITIAL_WIDTH}},
      ...state,
    };

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
    this._render(panel.width);
    // Subsequent renders happen on changes to data store
    this._subscriptions.add(
      this._store.subscribe(() => this._render())
    );
    this._subscriptions.add(
      atom.commands.add('atom-workspace', {
        'nuclide-file-tree-deux:reveal-active-file': this.revealActiveFile.bind(this),
        'nuclide-file-tree-deux:toggle': this.toggleVisibility.bind(this),
        'nuclide-file-tree-deux:toggle-focus': this.toggleTreeFocus.bind(this),
      })
    );
    this._subscriptions.add(
      // TODO: Move to normal menu/ directory when 'nuclide-file-tree' is fully replaced.
      atom.contextMenu.add({
        'atom-pane[data-active-item-path] atom-text-editor': [
          {command: 'nuclide-file-tree-deux:reveal-active-file', label: 'Reveal in File Tree'},
        ],
      })
    );
    var packagePath = atom.packages.resolvePackagePath('nuclide-file-tree-deux');
    if (packagePath != null) {
      // Load this package's keymap outside the normal activate/deactive lifecycle so its keymaps
      // are loaded only when users enable this package via its config.
      //
      // TODO: Move to normal keymaps/ directory when 'nuclide-file-tree' is fully replaced.
      atom.keymaps.loadKeymap(pathUtil.join(packagePath, 'config', 'keymap.cson'));
    }
    this._subscriptions.add(
      atom.commands.add(EVENT_HANDLER_SELECTOR, {
        'nuclide-file-tree-deux:add-file': () => {
          FileSystemActions.openAddFileDialog(this._openAndRevealFilePath.bind(this));
        },
        'nuclide-file-tree-deux:add-folder': () => FileSystemActions.openAddFolderDialog(),
        'nuclide-file-tree-deux:collapse-directory': this._collapseSelection.bind(this),
        'nuclide-file-tree-deux:copy-full-path': this._copyFullPath.bind(this),
        'nuclide-file-tree-deux:expand-directory': this._expandSelection.bind(this),
        'nuclide-file-tree-deux:remove': this._deleteSelection.bind(this),
        'nuclide-file-tree-deux:remove-project-folder-selection':
          this._removeRootFolderSelection.bind(this),
        'nuclide-file-tree-deux:rename-selection': () => FileSystemActions.openRenameDialog(),
        'nuclide-file-tree-deux:search-in-directory': this._searchInDirectory.bind(this),
        'nuclide-file-tree-deux:show-in-file-manager': this._showInFileManager.bind(this),
      })
    );
    if (state && state.tree) {
      this._store.loadData(state.tree);
    }
    this._contextMenu = new FileTreeContextMenu();
  }

  _initializePanel(): void {
    this._panelElement = document.createElement('div');
    this._panelElement.style.height = '100%';
    this._panel = atom.workspace.addLeftPanel({
      item: this._panelElement,
      visible: this._isVisible,
    });
  }

  _render(initialWidth?: ?number): void {
    this._panelComponent = React.render(
      <FileTreePanel store={this._store} initialWidth={initialWidth} />,
      this._panelElement,
    );
  }

  _openAndRevealFilePath(filePath: ?string): void {
    if (filePath != null) {
      atom.workspace.open(filePath);
      this.revealNodeKey(filePath);
    }
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
      this.focusTree();
    } else {
      if (this._treeHasFocus()) {
        // If the file tree has focus, blur it because it will be hidden when the panel is hidden.
        this.blurTree();
      }
      this._panel.hide();
    }
    this._isVisible = shouldBeVisible;
  }

  /**
   * "Blurs" the tree, which is done by activating the active pane in
   * [Atom's tree-view]{@link https://github.com/atom/tree-view/blob/v0.188.0/lib/tree-view.coffee#L187}.
   */
  blurTree(): void {
    atom.workspace.getActivePane().activate();
  }

  focusTree(): void {
    this._panelComponent.getFileTree().focus();
  }

  /**
   * Returns `true` if the file tree DOM node has focus, otherwise `false`.
   */
  _treeHasFocus(): boolean {
    const fileTree = this._panelComponent.getFileTree();
    return fileTree.hasFocus();
  }

  /**
   * Focuses the tree if it does not have focus, blurs the tree if it does have focus.
   */
  toggleTreeFocus(): void {
    if (this._treeHasFocus()) {
      this.blurTree();
    } else {
      this.focusTree();
    }
  }

  toggleVisibility(): void {
    this._setVisibility(!this._isVisible);
  }

  revealActiveFile(): void {
    // Ensure the file tree is visible before trying to reveal a file in it.
    this._setVisibility(true);

    var editor = atom.workspace.getActiveTextEditor();
    var file = editor ? editor.getBuffer().file : null;
    if (!file) {
      return;
    }
    this.revealNodeKey(file.getPath());
  }

  revealNodeKey(nodeKey: ?string): void {
    if (!nodeKey) {
      return;
    }
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
    this._actions.setTrackedNode(rootKey, nodeKey);
  }

  /**
   * Collapses all selected directory nodes. If the selection is a single directory and it is
   * already collapsed, the selection is set to the directory's parent.
   */
  _collapseSelection(): void {
    const selectedNodes = this._store.getSelectedNodes();
    const firstSelectedNode = selectedNodes.first();
    if (selectedNodes.size === 1
      && firstSelectedNode.isContainer
      && !firstSelectedNode.isExpanded()
      && !firstSelectedNode.isRoot) {
      /*
       * Select the parent of the selection if the following criteria are met:
       *   * Only 1 node is selected
       *   * The node is a directory
       *   * The node is collapsed
       *   * The node is not a root
       */
      this.revealNodeKey(FileTreeHelpers.getParentKey(firstSelectedNode.nodeKey));
    } else {
      selectedNodes.forEach(node => {
        // Only directories can be expanded. Skip non-directory nodes.
        if (!node.isContainer) {
          return;
        }

        this._actions.collapseNode(node.rootKey, node.nodeKey);
      });
    }
  }

  _deleteSelection(): void {
    const nodes = this._store.getSelectedNodes();
    if (nodes.size === 0) {
      return;
    }

    const rootPaths = nodes.filter(node => node.isRoot);
    if (rootPaths.size === 0) {
      const selectedPaths = nodes.map(node => node.nodePath);
      const message = 'Are you sure you want to delete the following ' +
          (nodes.length > 1 ? 'items?' : 'item?');
      atom.confirm({
        buttons: {
          'Delete': () => { this._actions.deleteSelectedNodes(); },
          'Cancel': () => {},
        },
        detailedMessage: `You are deleting:${os.EOL}${selectedPaths.join(os.EOL)}`,
        message,
      });
    } else {
      let message;
      if (rootPaths.size === 1) {
        message = `The root directory '${rootPaths.first().nodeName}' can't be removed.`;
      } else {
        const rootPathNames = rootPaths.map(node => `'${node.nodeName}'`).join(', ');
        message = `The root directories ${rootPathNames} can't be removed.`;
      }

      atom.confirm({
        buttons: ['OK'],
        message,
      });
    }
  }

  /**
   * Expands all selected directory nodes.
   */
  _expandSelection(): void {
    this._store.getSelectedNodes().forEach(node => {
      // Only directories can be expanded. Skip non-directory nodes.
      if (!node.isContainer) {
        return;
      }

      this._actions.expandNode(node.rootKey, node.nodeKey);
    });
  }

  _removeRootFolderSelection(): void {
    var rootKey = this._store.getFocusedRootKey();
    if (rootKey) {
      var rootPath = FileTreeHelpers.keyToPath(rootKey);
      atom.project.removePath(rootPath);
    }
  }

  _searchInDirectory(event: Event): void {
    // Dispatch a command to show the `ProjectFindView`. This opens the view and focuses the search
    // box.
    atom.commands.dispatch((event.target: HTMLElement), 'project-find:show-in-current-directory');
  }

  _showInFileManager(): void {
    var node = this._store.getSingleSelectedNode();
    if (node == null) {
      // Only allow revealing a single directory/file at a time. Return otherwise.
      return;
    }
    shell.showItemInFolder(node.nodePath);
  }

  _copyFullPath(): void {
    var rootKey = this._store.getFocusedRootKey();
    var nodeKey = rootKey ? this._store.getSelectedKeys(rootKey).first() : null;
    if (rootKey != null && nodeKey != null) {
      var node = this._store.getNode(rootKey, nodeKey);
      atom.clipboard.write(node.getLocalPath());
    }
  }

  destroy(): void {
    this._subscriptions.dispose();
    this._store.reset();
    React.unmountComponentAtNode(this._panelElement);
    this._panel.destroy();
    this._contextMenu.dispose();
  }

  serialize(): FileTreeControllerState {
    return {
      panel: {
        isVisible: this._isVisible,
        width: this._panelComponent.getLength(),
      },
      tree: this._store.exportData(),
    };
  }
}

class FileTreePanel extends React.Component {
  render() {
    return (
      <PanelComponent
        dock="left"
        initialLength={this.props.initialWidth}
        ref="panel">
        <FileTree store={this.props.store} />
      </PanelComponent>
    );
  }

  getFileTree(): FileTree {
    return this.refs['panel'].getChildComponent();
  }
}

var {PropTypes} = React;
FileTreePanel.propTypes = {
  initialWidth: PropTypes.number,
  store: PropTypes.instanceOf(FileTreeStore).isRequired,
};

module.exports = FileTreeController;
