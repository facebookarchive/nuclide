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

import {CompositeDisposable} from 'atom';
import {EVENT_HANDLER_SELECTOR}  from './FileTreeConstants';
import FileSystemActions from './FileSystemActions';
import FileTree from '../components/FileTree';
import FileTreeActions from './FileTreeActions';
import FileTreeContextMenu from './FileTreeContextMenu';
import FileTreeHelpers from './FileTreeHelpers';
import FileTreeStore from './FileTreeStore';
import Immutable from 'immutable';
import {PanelComponent} from '../../ui/panel';
import {React} from 'react-for-atom';
import {track} from '../../analytics';

import os from 'os';
import shell from 'shell';

import invariant from 'assert';

const {PropTypes} = React;

type FileTreeNodeData = {
  nodeKey: string,
  rootKey: string,
};

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
  _fileTreePanel: FileTreePanel;
  _panelElement: HTMLElement;
  _repositories: Immutable.Set<atom$Repository>;
  _store: FileTreeStore;
  _subscriptions: CompositeDisposable;
  _subscriptionForRepository: Immutable.Map<atom$Repository, atom$Disposable>;
  /**
   * True if a reveal was requested while the file tree is hidden. If so, we should apply it when
   * the tree is shown.
   */
  _revealActiveFilePending: boolean;

  static INITIAL_WIDTH = 240;

  constructor(state: ?FileTreeControllerState) {
    const {panel} = {
      panel: {width: FileTreeController.INITIAL_WIDTH},
      ...state,
    };

    // show the file tree by default
    this._isVisible = panel.isVisible != null ? panel.isVisible : true;
    this._actions = FileTreeActions.getInstance();
    this._store = FileTreeStore.getInstance();
    this._repositories = new Immutable.Set();
    this._subscriptionForRepository = new Immutable.Map();
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
        // Pass undefined so the default parameter gets used.
        'nuclide-file-tree:reveal-active-file': this.revealActiveFile.bind(this, undefined),
        'nuclide-file-tree:toggle': this.toggleVisibility.bind(this),
        'nuclide-file-tree:toggle-focus': this.toggleTreeFocus.bind(this),
      })
    );
    this._subscriptions.add(
      atom.commands.add(EVENT_HANDLER_SELECTOR, {
        'core:move-down': this._moveDown.bind(this),
        'core:move-up': this._moveUp.bind(this),
        'core:move-to-top': this._moveToTop.bind(this),
        'core:move-to-bottom': this._moveToBottom.bind(this),
        'nuclide-file-tree:add-file': () => {
          FileSystemActions.openAddFileDialog(this._openAndRevealFilePath.bind(this));
        },
        'nuclide-file-tree:add-folder': () => {
          FileSystemActions.openAddFolderDialog(this._openAndRevealDirectoryPath.bind(this));
        },
        'nuclide-file-tree:collapse-directory': this._collapseSelection.bind(this, /*deep*/ false),
        'nuclide-file-tree:recursive-collapse-directory': this._collapseSelection.bind(this, true),
        'nuclide-file-tree:recursive-collapse-all': this._collapseAll.bind(this),
        'nuclide-file-tree:copy-full-path': this._copyFullPath.bind(this),
        'nuclide-file-tree:expand-directory': this._expandSelection.bind(this, /*deep*/ false),
        'nuclide-file-tree:recursive-expand-directory': this._expandSelection.bind(this, true),
        'nuclide-file-tree:open-selected-entry': this._openSelectedEntry.bind(this),
        'nuclide-file-tree:open-selected-entry-up':
          this._openSelectedEntrySplitUp.bind(this),
        'nuclide-file-tree:open-selected-entry-down':
          this._openSelectedEntrySplitDown.bind(this),
        'nuclide-file-tree:open-selected-entry-left':
          this._openSelectedEntrySplitLeft.bind(this),
        'nuclide-file-tree:open-selected-entry-right':
          this._openSelectedEntrySplitRight.bind(this),
        'nuclide-file-tree:remove': this._deleteSelection.bind(this),
        'nuclide-file-tree:remove-project-folder-selection':
          this._removeRootFolderSelection.bind(this),
        'nuclide-file-tree:rename-selection': () => FileSystemActions.openRenameDialog(),
        'nuclide-file-tree:duplicate-selection': () => {
          FileSystemActions.openDuplicateDialog(this.revealNodeKey.bind(this));
        },
        'nuclide-file-tree:search-in-directory': this._searchInDirectory.bind(this),
        'nuclide-file-tree:show-in-file-manager': this._showInFileManager.bind(this),
      })
    );
    this._subscriptions.add(
      atom.commands.add('[is="tabs-tab"]', {
        'nuclide-file-tree:reveal-tab-file': this._revealTabFileOnClick.bind(this),
      })
    );
    if (state && state.tree) {
      this._store.loadData(state.tree);
    }
    this._contextMenu = new FileTreeContextMenu();

    this._revealActiveFilePending = false;
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
    this._fileTreePanel = React.render(
      <FileTreePanel
        initialWidth={initialWidth}
        store={this._store}
      />,
      this._panelElement,
    );
  }

  _openAndRevealFilePath(filePath: ?string): void {
    if (filePath != null) {
      atom.workspace.open(filePath);
      this.revealNodeKey(filePath);
    }
  }

  _openAndRevealDirectoryPath(path: ?string): void {
    if (path != null) {
      this.revealNodeKey(FileTreeHelpers.dirPathToKey(path));
    }
  }

  _updateRootDirectories(): void {
    // If the remote-projects package hasn't loaded yet remote directories will be instantiated as
    // local directories but with invalid paths. We need to exclude those.
    const rootDirectories = atom.project.getDirectories().filter(directory => (
      FileTreeHelpers.isValidDirectory(directory)
    ));
    const rootKeys = rootDirectories.map(
      directory => FileTreeHelpers.dirPathToKey(directory.getPath())
    );
    this._actions.setRootKeys(rootKeys);
    this._actions.updateRepositories(rootDirectories);
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
    this._fileTreePanel.getFileTree().focus();
  }

  /**
   * Returns `true` if the file tree DOM node has focus, otherwise `false`.
   */
  _treeHasFocus(): boolean {
    const fileTree = this._fileTreePanel.getFileTree();
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
    const willBeVisible = !this._isVisible;
    this._setVisibility(willBeVisible);
    if (willBeVisible && this._revealActiveFilePending) {
      this.revealActiveFile();
      this._revealActiveFilePending = false;
    }
  }

  /**
   * Reveal the file that currently has focus in the file tree. If showIfHidden is false,
   * this will enqueue a pending reveal to be executed when the file tree is shown again.
   */
  revealActiveFile(showIfHidden?: boolean = true): void {
    const editor = atom.workspace.getActiveTextEditor();
    const file = editor ? editor.getBuffer().file : null;
    const filePath = file ? file.getPath() : null;

    if (showIfHidden) {
      // Ensure the file tree is visible before trying to reveal a file in it. Even if the currently
      // active pane is not an ordinary editor, we still at least want to show the tree.
      this._setVisibility(true);
    }

    if (!filePath) {
      return;
    }

    // If we are not showing the tree as part of this action, and it is currently hidden, this
    // reveal will take effect when the tree is shown.
    if (!showIfHidden && !this._isVisible) {
      this._revealActiveFilePending = true;
      return;
    }

    this.revealNodeKey(filePath);
  }

  /**
   * Reveal the file of a given tab based on the path stored on the DOM.
   * This method is meant to be triggered by the context-menu click.
   */
  _revealTabFileOnClick(event: Event): void {
    const tab = ((event.currentTarget: any): Element);
    const title = tab.querySelector('.title[data-path]');
    if (!title) {
      // can only reveal it if we find the file path
      return;
    }

    const filePath = title.dataset.path;
    this._setVisibility(true);
    this.revealNodeKey(filePath);
  }

  revealNodeKey(nodeKey: ?string): void {
    if (!nodeKey) {
      return;
    }
    const rootKey: ?string = this._store.getRootForKey(nodeKey);
    if (!rootKey) {
      return;
    }
    const stack = [];
    let key = nodeKey;
    while (key != null && key !== rootKey) {
      stack.push(key);
      key = FileTreeHelpers.getParentKey(key);
    }
    // We want the stack to be [parentKey, ..., nodeKey].
    stack.reverse();
    stack.forEach((childKey, i) => {
      const parentKey = (i === 0) ? rootKey : stack[i - 1];
      this._actions.ensureChildNode(rootKey, parentKey, childKey);
      this._actions.expandNode(rootKey, parentKey);
    });
    this._selectAndTrackNode(rootKey, nodeKey);
  }

  setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths: boolean): void {
    this._actions.setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths);
  }

  setHideIgnoredNames(hideIgnoredNames: boolean): void {
    this._actions.setHideIgnoredNames(hideIgnoredNames);
  }

  setIgnoredNames(ignoredNames: Array<string>): void {
    this._actions.setIgnoredNames(ignoredNames);
  }

  setUsePreviewTabs(usePreviewTabs: boolean): void {
    this._actions.setUsePreviewTabs(usePreviewTabs);
  }

  /**
   * Collapses all selected directory nodes. If the selection is a single file or a single collapsed
   * directory, the selection is set to the directory's parent.
   */
  _collapseSelection(deep: boolean = false): void {
    const selectedNodes = this._store.getSelectedNodes();
    const firstSelectedNode = selectedNodes.first();
    if (selectedNodes.size === 1
      && !firstSelectedNode.isRoot
      && !(firstSelectedNode.isContainer && firstSelectedNode.isExpanded())) {
      /*
       * Select the parent of the selection if the following criteria are met:
       *   * Only 1 node is selected
       *   * The node is not a root
       *   * The node is not an expanded directory
       */
      this.revealNodeKey(FileTreeHelpers.getParentKey(firstSelectedNode.nodeKey));
    } else {
      selectedNodes.forEach(node => {
        // Only directories can be expanded. Skip non-directory nodes.
        if (!node.isContainer) {
          return;
        }

        if (deep) {
          this._actions.collapseNodeDeep(node.rootKey, node.nodeKey);
        } else {
          this._actions.collapseNode(node.rootKey, node.nodeKey);
        }
      });
    }
  }

  _collapseAll(): void {
    const rootKeys = this._store.getRootKeys();
    rootKeys.forEach(rootKey => this._actions.collapseNodeDeep(rootKey, rootKey));
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
          (nodes.size > 1 ? 'items?' : 'item?');
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
  _expandSelection(deep: boolean): void {
    this._store.getSelectedNodes().forEach(node => {
      // Only directories can be expanded. Skip non-directory nodes.
      if (!node.isContainer) {
        return;
      }

      if (deep) {
        this._actions.expandNodeDeep(node.rootKey, node.nodeKey);
      } else {
        this._actions.expandNode(node.rootKey, node.nodeKey);
      }
    });
  }

  _moveDown(): void {
    if (this._store.isEmpty()) {
      return;
    }

    const lastSelectedKey = this._store.getSelectedKeys().last();
    if (lastSelectedKey == null) {
      // There is no selection yet, so move to the top of the tree.
      this._moveToTop();
      return;
    }

    let parentKey;
    let rootKey;
    let siblingKeys;
    const isRoot = this._store.isRootKey(lastSelectedKey);
    if (isRoot) {
      rootKey = lastSelectedKey;
      // Other roots are this root's siblings
      siblingKeys = this._store.getRootKeys();
    } else {
      parentKey = FileTreeHelpers.getParentKey(lastSelectedKey);
      rootKey = this._store.getRootForKey(lastSelectedKey);

      invariant(rootKey && parentKey);
      siblingKeys = this._store.getCachedChildKeys(rootKey, parentKey);
    }

    // If the root does not exist or if this is expected to have a parent but doesn't (roots do
    // not have parents), nothing can be done. Exit.
    if (rootKey == null || (!isRoot && parentKey == null)) {
      return;
    }

    const children = this._store.getCachedChildKeys(rootKey, lastSelectedKey);
    if (
      FileTreeHelpers.isDirKey(lastSelectedKey) &&
      this._store.isExpanded(rootKey, lastSelectedKey) &&
      children.length > 0
    ) {
      // Directory is expanded and it has children. Select first child. Exit.
      this._selectAndTrackNode(rootKey, children[0]);
    } else {
      const index = siblingKeys.indexOf(lastSelectedKey);
      const maxIndex = siblingKeys.length - 1;

      if (index < maxIndex) {
        const nextSiblingKey = siblingKeys[index + 1];

        if (isRoot) {
          // If the next selected item is another root, set `rootKey` to it so trackAndSelect finds
          // that [rootKey, rootKey] tuple.
          rootKey = nextSiblingKey;
        }

        // This has a next sibling.
        this._selectAndTrackNode(rootKey, siblingKeys[index + 1]);
      } else {
        const nearestAncestorSibling = this._findNearestAncestorSibling(rootKey, lastSelectedKey);

        // If this is the bottommost node of the tree, there won't be anything to select.
        // Void return signifies no next node was found.
        if (nearestAncestorSibling != null) {
          this._selectAndTrackNode(nearestAncestorSibling.rootKey, nearestAncestorSibling.nodeKey);
        }
      }
    }
  }

  _moveUp(): void {
    if (this._store.isEmpty()) {
      return;
    }

    const lastSelectedKey = this._store.getSelectedKeys().last();
    if (lastSelectedKey == null) {
      // There is no selection. Move to the bottom of the tree.
      this._moveToBottom();
      return;
    }

    let parentKey;
    let rootKey;
    let siblingKeys;
    const isRoot = this._store.isRootKey(lastSelectedKey);
    if (isRoot) {
      rootKey = lastSelectedKey;
      // Other roots are this root's siblings
      siblingKeys = this._store.getRootKeys();
    } else {
      parentKey = FileTreeHelpers.getParentKey(lastSelectedKey);
      rootKey = this._store.getRootForKey(lastSelectedKey);

      invariant(rootKey && parentKey);
      siblingKeys = this._store.getCachedChildKeys(rootKey, parentKey);
    }

    // If the root does not exist or if this is expected to have a parent but doesn't (roots do
    // not have parents), nothing can be done. Exit.
    if (rootKey == null || (!isRoot && parentKey == null)) {
      return;
    }

    const index = siblingKeys.indexOf(lastSelectedKey);
    if (index === 0) {
      if (!isRoot && parentKey != null) {
        // This is the first child. It has a parent. Select the parent.
        this._selectAndTrackNode(rootKey, parentKey);
      }
      // This is the root and/or the top of the tree (has no parent). Nothing else to traverse.
      // Exit.
    } else {
      const previousSiblingKey = siblingKeys[index - 1];

      if (isRoot) {
        // If traversing up to a different root, the rootKey must become that new root to check
        // expanded keys in it.
        rootKey = previousSiblingKey;
      }

      this._selectAndTrackNode(
        rootKey,
        this._findLowermostDescendantKey(rootKey, previousSiblingKey)
      );
    }
  }

  _moveToTop(): void {
    if (this._store.isEmpty()) {
      return;
    }

    const rootKeys = this._store.getRootKeys();
    this._selectAndTrackNode(rootKeys[0], rootKeys[0]);
  }

  _moveToBottom(): void {
    if (this._store.isEmpty()) {
      return;
    }

    // Select the lowermost descendant of the last root node.
    const rootKeys = this._store.getRootKeys();
    const lastRootKey = rootKeys[rootKeys.length - 1];
    this._selectAndTrackNode(
      lastRootKey,
      this._findLowermostDescendantKey(lastRootKey, lastRootKey)
    );
  }

  /*
   * Returns the lowermost descendant when considered in file system order with expandable
   * directories. For example:
   *
   *   A >
   *     B >
   *     C >
   *       E.txt
   *     D.foo
   *
   *   > _findLowermostDescendantKey(A)
   *   D.foo
   *
   * Though A has more deeply-nested descendants than D.foo, like E.txt, D.foo is lowermost when
   * considered in file system order.
   */
  _findLowermostDescendantKey(rootKey: string, nodeKey: string): string {
    if (!(FileTreeHelpers.isDirKey(nodeKey) && this._store.isExpanded(rootKey, nodeKey))) {
      // If `nodeKey` is not an expanded directory there are no more descendants to traverse. Return
      // the `nodeKey`.
      return nodeKey;
    }

    const childKeys = this._store.getCachedChildKeys(rootKey, nodeKey);
    if (childKeys.length === 0) {
      // If the directory has no children, the directory itself is the lowermost descendant.
      return nodeKey;
    }

    // There's at least one child. Recurse down the last child.
    return this._findLowermostDescendantKey(rootKey, childKeys[childKeys.length - 1]);
  }

  /*
   * Returns the nearest "ancestor sibling" when considered in file system order with expandable
   * directories. For example:
   *
   *   A >
   *     B >
   *       C >
   *         E.txt
   *   D.foo
   *
   *   > _findNearestAncestorSibling(E.txt)
   *   D.foo
   */
  _findNearestAncestorSibling(rootKey: string, nodeKey: string): ?FileTreeNodeData {
    let parentKey;
    let siblingKeys;
    const isRoot = rootKey === nodeKey;
    if (isRoot) {
      // `rootKey === nodeKey` means this has recursed to a root. `nodeKey` is a root key.
      siblingKeys = this._store.getRootKeys();
    } else {
      parentKey = FileTreeHelpers.getParentKey(nodeKey);

      invariant(rootKey && parentKey);
      siblingKeys = this._store.getCachedChildKeys(rootKey, parentKey);
    }

    const index = siblingKeys.indexOf(nodeKey);
    if (index < (siblingKeys.length - 1)) {
      const nextSibling = siblingKeys[index + 1];
      // If traversing across roots, the next sibling is also the next root. Return it as the next
      // root key as well as the next node key.
      return isRoot
        ? {nodeKey: nextSibling, rootKey: nextSibling}
        : {nodeKey: nextSibling, rootKey};
    } else if (parentKey != null) {
      // There is a parent to recurse. Return its nearest ancestor sibling.
      return this._findNearestAncestorSibling(rootKey, parentKey);
    } else {
      // If `parentKey` is null, nodeKey is a root and has more parents to recurse. Return `null` to
      // signify no appropriate key was found.
      return null;
    }
  }

  _openSelectedEntry(): void {
    const singleSelectedNode = this._store.getSingleSelectedNode();
    // Only perform the default action if a single node is selected.
    if (singleSelectedNode != null) {
      this._actions.confirmNode(singleSelectedNode.rootKey, singleSelectedNode.nodeKey);
    }
  }

  _openSelectedEntrySplit(orientation: atom$PaneSplitOrientation, side: atom$PaneSplitSide): void {
    const singleSelectedNode = this._store.getSingleSelectedNode();
    // Only perform the default action if a single node is selected.
    if (singleSelectedNode != null && !singleSelectedNode.isContainer) {
      // for: is this feature used enough to justify uncollapsing?
      track('filetree-split-file', {
        orientation,
        side,
      });
      this._actions.openSelectedEntrySplit(
        singleSelectedNode.nodeKey,
        orientation,
        side,
      );
    }
  }

  _openSelectedEntrySplitUp(): void {
    this._openSelectedEntrySplit('vertical', 'before');
  }

  _openSelectedEntrySplitDown(): void {
    this._openSelectedEntrySplit('vertical', 'after');
  }

  _openSelectedEntrySplitLeft(): void {
    this._openSelectedEntrySplit('horizontal', 'before');
  }

  _openSelectedEntrySplitRight(): void {
    this._openSelectedEntrySplit('horizontal', 'after');
  }

  _removeRootFolderSelection(): void {
    const rootNode = this._store.getSingleSelectedNode();
    if (rootNode != null && rootNode.isRoot) {
      atom.project.removePath(rootNode.nodePath);
    }
  }

  _searchInDirectory(event: Event): void {
    // Dispatch a command to show the `ProjectFindView`. This opens the view and focuses the search
    // box.
    atom.commands.dispatch(
      ((event.target: any): HTMLElement),
      'project-find:show-in-current-directory'
    );
  }

  _showInFileManager(): void {
    const node = this._store.getSingleSelectedNode();
    if (node == null) {
      // Only allow revealing a single directory/file at a time. Return otherwise.
      return;
    }
    shell.showItemInFolder(node.nodePath);
  }

  _selectAndTrackNode(rootKey: string, nodeKey: string): void {
    // Select the node before tracking it because setting a new selection clears the tracked node.
    this._actions.selectSingleNode(rootKey, nodeKey);
    this._actions.setTrackedNode(rootKey, nodeKey);
  }

  _copyFullPath(): void {
    const singleSelectedNode = this._store.getSingleSelectedNode();
    if (singleSelectedNode != null) {
      atom.clipboard.write(singleSelectedNode.getLocalPath());
    }
  }

  destroy(): void {
    this._subscriptions.dispose();
    for (const disposable of this._subscriptionForRepository.values()) {
      disposable.dispose();
    }
    this._store.reset();
    React.unmountComponentAtNode(this._panelElement);
    this._panel.destroy();
    this._contextMenu.dispose();
  }

  serialize(): FileTreeControllerState {
    return {
      panel: {
        isVisible: this._isVisible,
        width: this._fileTreePanel.getLength(),
      },
      tree: this._store.exportData(),
    };
  }
}

class FileTreePanel extends React.Component {
  static propTypes = {
    initialWidth: PropTypes.number,
    store: PropTypes.instanceOf(FileTreeStore).isRequired,
  };

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

  getLength(): number {
    return this.refs['panel'].getLength();
  }
}

module.exports = FileTreeController;
