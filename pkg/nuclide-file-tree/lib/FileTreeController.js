'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {ExportStoreData} from './FileTreeStore';

import {CompositeDisposable, Disposable} from 'atom';
import {EVENT_HANDLER_SELECTOR}  from './FileTreeConstants';
import FileSystemActions from './FileSystemActions';
import FileTreeActions from './FileTreeActions';
import FileTreeContextMenu from './FileTreeContextMenu';
import FileTreeHelpers from './FileTreeHelpers';
import {FileTreeStore} from './FileTreeStore';
import Immutable from 'immutable';
import {track} from '../../nuclide-analytics';
import {isTextEditor} from '../../nuclide-atom-helpers';

import os from 'os';
import shell from 'shell';

import invariant from 'assert';

import type {WorkingSet} from '../../nuclide-working-sets';
import type {WorkingSetsStore} from '../../nuclide-working-sets/lib/WorkingSetsStore';
import type {FileTreeNode} from './FileTreeNode';

export type FileTreeControllerState = {
  tree: ExportStoreData;
};

const VALID_FILTER_CHARS = '!#./0123456789:;?@ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '_abcdefghijklmnopqrstuvwxyz~';

class FileTreeController {
  _actions: FileTreeActions;
  _contextMenu: FileTreeContextMenu;
  _cwdApi: ?CwdApi;
  _cwdApiSubscription: ?IDisposable;
  _repositories: Immutable.Set<atom$Repository>;
  _store: FileTreeStore;
  _subscriptions: CompositeDisposable;
  _subscriptionForRepository: Immutable.Map<atom$Repository, IDisposable>;

  constructor(state: ?FileTreeControllerState) {
    this._actions = FileTreeActions.getInstance();
    this._store = FileTreeStore.getInstance();
    this._repositories = new Immutable.Set();
    this._subscriptionForRepository = new Immutable.Map();
    this._subscriptions = new CompositeDisposable(
      new Disposable(() => {
        if (this._cwdApiSubscription != null) {
          this._cwdApiSubscription.dispose();
        }
      }),
    );
    // Initial root directories
    this._updateRootDirectories();
    // Subsequent root directories updated on change
    this._subscriptions.add(
      atom.project.onDidChangePaths(() => this._updateRootDirectories())
    );

    this._subscriptions.add(
      atom.commands.add('atom-workspace', {
        // Pass undefined so the default parameter gets used.
        // NOTE: This is specifically for use in Diff View, so don't expose a menu item.
        /* eslint-disable nuclide-internal/command-menu-items */
        'nuclide-file-tree:reveal-text-editor': this._revealTextEditor.bind(this),
        /* eslint-enable nuclide-internal/command-menu-items */
        'nuclide-file-tree:reveal-active-file': this.revealActiveFile.bind(this, undefined),
      })
    );
    const letterKeyBindings = {
      'nuclide-file-tree:remove-letter':
        this._handleRemoveLetterKeypress.bind(this),
      'nuclide-file-tree:clear-filter':
        this._handleClearFilter.bind(this),
    };
    for (let i = 0, c = VALID_FILTER_CHARS.charCodeAt(0);
         i < VALID_FILTER_CHARS.length;
         i++, c = VALID_FILTER_CHARS.charCodeAt(i)) {
      const char = String.fromCharCode(c);
      letterKeyBindings[`nuclide-file-tree:go-to-letter-${char}`] =
        this._handlePrefixKeypress.bind(this, char);
    }
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
          FileSystemActions.openDuplicateDialog(this._openAndRevealFilePath.bind(this));
        },
        'nuclide-file-tree:search-in-directory': this._searchInDirectory.bind(this),
        'nuclide-file-tree:show-in-file-manager': this._showInFileManager.bind(this),
        'nuclide-file-tree:set-current-working-root': this._setCwdToSelection.bind(this),
        ...letterKeyBindings,
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
  }

  _moveUp(): void {
    this._actions.moveSelectionUp();
  }

  _moveDown(): void {
    this._actions.moveSelectionDown();
  }

  _moveToTop(): void {
    this._actions.moveSelectionToTop();
  }

  _moveToBottom(): void {
    this._actions.moveSelectionToBottom();
  }

  getContextMenu(): FileTreeContextMenu {
    return this._contextMenu;
  }

  _handleClearFilter(): void {
    this._store.clearFilter();
  }

  _handlePrefixKeypress(letter: string): void {
    if (!this._store.usePrefixNav()) {
      return;
    }

    this._store.addFilterLetter(letter);
  }

  _handleRemoveLetterKeypress(): void {
    if (!this._store.usePrefixNav()) {
      return;
    }
    this._store.removeFilterLetter();
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

  _revealTextEditor(event: Event): void {
    const editorElement = ((event.target: any): atom$TextEditorElement);
    if (
      editorElement == null ||
      typeof editorElement.getModel !== 'function' ||
      !isTextEditor(editorElement.getModel())
    ) {
      return;
    }

    const filePath = editorElement.getModel().getPath();
    this._revealFilePath(filePath);
  }

  /**
   * Reveal the file that currently has focus in the file tree. If showIfHidden is false,
   * this will enqueue a pending reveal to be executed when the file tree is shown again.
   */
  revealActiveFile(showIfHidden?: boolean = true): void {
    const editor = atom.workspace.getActiveTextEditor();
    const filePath = editor != null ? editor.getPath() : null;
    this._revealFilePath(filePath, showIfHidden);
  }

  _revealFilePath(filePath: ?string, showIfHidden?: boolean = true): void {
    if (showIfHidden) {
      // Ensure the file tree is visible before trying to reveal a file in it. Even if the currently
      // active pane is not an ordinary editor, we still at least want to show the tree.
      atom.commands.dispatch(
        atom.views.getView(atom.workspace),
        'nuclide-file-tree:toggle',
        {display: true}
      );
    }

    if (!filePath) {
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
    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-file-tree:toggle',
      {display: true}
    );
    this.revealNodeKey(filePath);
  }

  revealNodeKey(nodeKey: ?string): void {
    if (nodeKey == null) {
      return;
    }

    this._actions.ensureChildNode(nodeKey);
  }

  _setCwdToSelection(): void {
    const node = this._store.getSingleSelectedNode();
    if (node == null) {
      return;
    }
    const path = FileTreeHelpers.keyToPath(node.uri);
    if (this._cwdApi != null) {
      this._cwdApi.setCwd(path);
    }
  }

  setCwdApi(cwdApi: ?CwdApi): void {
    if (cwdApi == null) {
      this._actions.setCwd(null);
      this._cwdApiSubscription = null;
    } else {
      invariant(this._cwdApiSubscription == null);
      this._cwdApiSubscription = cwdApi.observeCwd(directory => {
        const path = directory == null ? null : directory.getPath();
        const rootKey = path && FileTreeHelpers.dirPathToKey(path);
        this._actions.setCwd(rootKey);
      });
    }

    this._cwdApi = cwdApi;
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

  setUsePrefixNav(usePrefixNav: boolean): void {
    this._actions.setUsePrefixNav(usePrefixNav);
  }

  updateWorkingSet(workingSet: WorkingSet): void {
    this._actions.updateWorkingSet(workingSet);
  }

  updateWorkingSetsStore(workingSetsStore: ?WorkingSetsStore): void {
    this._actions.updateWorkingSetsStore(workingSetsStore);
  }

  updateOpenFilesWorkingSet(openFilesWorkingSet: WorkingSet): void {
    this._actions.updateOpenFilesWorkingSet(openFilesWorkingSet);
  }

  /**
   * Collapses all selected directory nodes. If the selection is a single file or a single collapsed
   * directory, the selection is set to the directory's parent.
   */
  _collapseSelection(deep: boolean = false): void {
    const selectedNodes = this._store.getSelectedNodes();
    const firstSelectedNode = selectedNodes.first();
    if (selectedNodes.size === 1 &&
      !firstSelectedNode.isRoot &&
      !(firstSelectedNode.isContainer && firstSelectedNode.isExpanded)) {
      /*
       * Select the parent of the selection if the following criteria are met:
       *   * Only 1 node is selected
       *   * The node is not a root
       *   * The node is not an expanded directory
      */

      const parent = firstSelectedNode.parent;
      this._selectAndTrackNode(parent);
    } else {
      selectedNodes.forEach(node => {
        // Only directories can be expanded. Skip non-directory nodes.
        if (!node.isContainer) {
          return;
        }

        if (deep) {
          this._actions.collapseNodeDeep(node.rootUri, node.uri);
        } else {
          this._actions.collapseNode(node.rootUri, node.uri);
        }
      });
    }
  }

  _selectAndTrackNode(node: FileTreeNode): void {
    this._actions.setSelectedNode(node.rootUri, node.uri);
  }

  _collapseAll(): void {
    const roots = this._store.roots;
    roots.forEach(root => this._actions.collapseNodeDeep(root.uri, root.uri));
  }

  _deleteSelection(): void {
    const nodes = this._store.getSelectedNodes();
    if (nodes.size === 0) {
      return;
    }

    const rootPaths = nodes.filter(node => node.isRoot);
    if (rootPaths.size === 0) {
      const selectedPaths = nodes.map(node => FileTreeHelpers.keyToPath(node.uri));
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
    this._handleClearFilter();

    this._store.getSelectedNodes().forEach(node => {
      // Only directories can be expanded. Skip non-directory nodes.
      if (!node.isContainer) {
        return;
      }

      if (deep) {
        this._actions.expandNodeDeep(node.rootUri, node.uri);
        this._actions.setTrackedNode(node.rootUri, node.uri);
      } else {
        if (node.isExpanded) {
          // Node is already expanded; move the selection to the first child.
          let firstChild = node.children.first();
          if (firstChild != null && !firstChild.shouldBeShown) {
            firstChild = firstChild.findNextShownSibling();
          }

          if (firstChild != null) {
            this._selectAndTrackNode(firstChild);
          }
        } else {
          this._actions.expandNode(node.rootUri, node.uri);
          this._actions.setTrackedNode(node.rootUri, node.uri);
        }
      }
    });
  }

  _openSelectedEntry(): void {
    this._handleClearFilter();
    const singleSelectedNode = this._store.getSingleSelectedNode();
    // Only perform the default action if a single node is selected.
    if (singleSelectedNode != null) {
      this._actions.confirmNode(singleSelectedNode.rootUri, singleSelectedNode.uri);
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
        singleSelectedNode.uri,
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
      // close all the files associated with the project before closing
      const projectEditors = atom.workspace.getTextEditors();
      const roots = this._store.getRootKeys();
      projectEditors.forEach(editor => {
        const path = editor.getPath();
        // if the path of the editor is not null AND
        // is part of the currently selected root that would be removed AND
        // is not part of any other open root, then close the file.
        if (
          path != null &&
          path.startsWith(rootNode.uri) &&
          roots.filter(root => path.startsWith(root)).length === 1
        ) {
          atom.workspace.paneForURI(path).destroyItem(editor);
        }
      });
      // actually close the project
      atom.project.removePath(FileTreeHelpers.keyToPath(rootNode.uri));
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
    shell.showItemInFolder(node.uri);
  }

  _copyFullPath(): void {
    const singleSelectedNode = this._store.getSingleSelectedNode();
    if (singleSelectedNode != null) {
      atom.clipboard.write(singleSelectedNode.localPath);
    }
  }

  destroy(): void {
    this._subscriptions.dispose();
    for (const disposable of this._subscriptionForRepository.values()) {
      disposable.dispose();
    }
    this._store.reset();
    this._contextMenu.dispose();
  }

  serialize(): FileTreeControllerState {
    return {
      tree: this._store.exportData(),
    };
  }
}

module.exports = FileTreeController;
