'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _FileTreeConstants;

function _load_FileTreeConstants() {
  return _FileTreeConstants = require('./FileTreeConstants');
}

var _FileSystemActions;

function _load_FileSystemActions() {
  return _FileSystemActions = _interopRequireDefault(require('./FileSystemActions'));
}

var _FileTreeActions;

function _load_FileTreeActions() {
  return _FileTreeActions = _interopRequireDefault(require('./FileTreeActions'));
}

var _FileTreeContextMenu;

function _load_FileTreeContextMenu() {
  return _FileTreeContextMenu = _interopRequireDefault(require('./FileTreeContextMenu'));
}

var _FileTreeHelpers;

function _load_FileTreeHelpers() {
  return _FileTreeHelpers = _interopRequireDefault(require('./FileTreeHelpers'));
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = require('./FileTreeStore');
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _goToLocation;

function _load_goToLocation() {
  return _goToLocation = require('nuclide-commons-atom/go-to-location');
}

var _getElementFilePath;

function _load_getElementFilePath() {
  return _getElementFilePath = _interopRequireDefault(require('../../commons-atom/getElementFilePath'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _Constants;

function _load_Constants() {
  return _Constants = require('./Constants');
}

var _atom = require('atom');

var _os = _interopRequireDefault(require('os'));

var _electron = require('electron');

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

const VALID_FILTER_CHARS = '!#./0123456789-:;?@ABCDEFGHIJKLMNOPQRSTUVWXYZ' + '_abcdefghijklmnopqrstuvwxyz~';
// $FlowFixMe(>=0.53.0) Flow suppress


class ProjectSelectionManager {

  constructor() {
    this._actions = (_FileTreeActions || _load_FileTreeActions()).default.getInstance();
    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
  }

  addExtraContent(content) {
    this._actions.addExtraProjectSelectionContent(content);
    return new _atom.Disposable(() => this._actions.removeExtraProjectSelectionContent(content));
  }

  getExtraContent() {
    return this._store.getExtraProjectSelectionContent();
  }
}

class FileTreeController {

  constructor(state) {
    this._actions = (_FileTreeActions || _load_FileTreeActions()).default.getInstance();
    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    this._projectSelectionManager = new ProjectSelectionManager();
    this._repositories = new (_immutable || _load_immutable()).default.Set();
    this._disposableForRepository = new (_immutable || _load_immutable()).default.Map();
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      if (this._cwdApiSubscription != null) {
        this._cwdApiSubscription.dispose();
      }
    });
    // Initial root directories
    this._updateRootDirectories();
    // Subsequent root directories updated on change
    this._disposables.add(atom.project.onDidChangePaths(() => this._updateRootDirectories()), atom.commands.add('atom-workspace', {
      'nuclide-file-tree:reveal-active-file': this._revealFile.bind(this),
      'nuclide-file-tree:recursive-collapse-all': this._collapseAll.bind(this),
      'nuclide-file-tree:add-file-relative': () => {
        (_FileSystemActions || _load_FileSystemActions()).default.openAddFileDialogRelative(this._openAndRevealFilePath.bind(this));
      }
    }));
    const letterKeyBindings = {
      'nuclide-file-tree:remove-letter': this._handleRemoveLetterKeypress.bind(this),
      'nuclide-file-tree:clear-filter': this._handleClearFilter.bind(this)
    };
    for (let i = 0, c = VALID_FILTER_CHARS.charCodeAt(0); i < VALID_FILTER_CHARS.length; i++, c = VALID_FILTER_CHARS.charCodeAt(i)) {
      const char = String.fromCharCode(c);
      letterKeyBindings[`nuclide-file-tree:go-to-letter-${char}`] = this._handlePrefixKeypress.bind(this, char);
    }
    this._disposables.add(atom.commands.add((_FileTreeConstants || _load_FileTreeConstants()).COMMANDS_SELECTOR, Object.assign({
      'core:move-down': this._moveDown.bind(this),
      'core:move-up': this._moveUp.bind(this),
      'core:move-to-top': this._moveToTop.bind(this),
      'core:move-to-bottom': this._moveToBottom.bind(this),
      'core:select-up': this._rangeSelectUp.bind(this),
      'core:select-down': this._rangeSelectDown.bind(this),
      'nuclide-file-tree:add-file': () => {
        (_FileSystemActions || _load_FileSystemActions()).default.openAddFileDialog(this._openAndRevealFilePath.bind(this));
      },
      'nuclide-file-tree:add-folder': () => {
        (_FileSystemActions || _load_FileSystemActions()).default.openAddFolderDialog(this._openAndRevealDirectoryPath.bind(this));
      },
      'nuclide-file-tree:collapse-directory': this._collapseSelection.bind(this,
      /* deep */false),
      'nuclide-file-tree:recursive-collapse-directory': this._collapseSelection.bind(this, true),
      'nuclide-file-tree:expand-directory': this._expandSelection.bind(this,
      /* deep */false),
      'nuclide-file-tree:recursive-expand-directory': this._expandSelection.bind(this, true),
      'nuclide-file-tree:open-selected-entry': this._openSelectedEntry.bind(this),
      'nuclide-file-tree:open-selected-entry-up': this._openSelectedEntrySplitUp.bind(this),
      'nuclide-file-tree:open-selected-entry-down': this._openSelectedEntrySplitDown.bind(this),
      'nuclide-file-tree:open-selected-entry-left': this._openSelectedEntrySplitLeft.bind(this),
      'nuclide-file-tree:open-selected-entry-right': this._openSelectedEntrySplitRight.bind(this),
      'nuclide-file-tree:remove': this._deleteSelection.bind(this),
      'core:delete': this._deleteSelection.bind(this),
      'nuclide-file-tree:remove-project-folder-selection': this._removeRootFolderSelection.bind(this),
      'nuclide-file-tree:rename-selection': () => (_FileSystemActions || _load_FileSystemActions()).default.openRenameDialog(),
      'nuclide-file-tree:duplicate-selection': () => {
        (_FileSystemActions || _load_FileSystemActions()).default.openDuplicateDialog(this._openAndRevealFilePaths.bind(this));
      },
      'nuclide-file-tree:copy-selection': this._copyFilenamesWithDir.bind(this),
      'nuclide-file-tree:paste-selection': () => (_FileSystemActions || _load_FileSystemActions()).default.openPasteDialog(),
      'nuclide-file-tree:search-in-directory': this._searchInDirectory.bind(this),
      'nuclide-file-tree:set-current-working-root': this._setCwdToSelection.bind(this)
    }, letterKeyBindings)), atom.commands.add('atom-workspace', {
      // eslint-disable-next-line nuclide-internal/atom-apis
      'file:copy-full-path': this._copyFullPath.bind(this),
      // eslint-disable-next-line nuclide-internal/atom-apis
      'file:show-in-file-manager': this._showInFileManager.bind(this)
    }));
    if (state != null) {
      this._store.loadData(state);
    }
    this._contextMenu = new (_FileTreeContextMenu || _load_FileTreeContextMenu()).default();
  }

  _moveUp() {
    this._actions.moveSelectionUp();
  }

  _moveDown() {
    this._actions.moveSelectionDown();
  }

  _moveToTop() {
    this._actions.moveSelectionToTop();
  }

  _moveToBottom() {
    this._actions.moveSelectionToBottom();
  }

  _rangeSelectUp() {
    this._actions.rangeSelectUp();
  }

  _rangeSelectDown() {
    this._actions.rangeSelectDown();
  }

  getContextMenu() {
    return this._contextMenu;
  }

  getProjectSelectionManager() {
    return this._projectSelectionManager;
  }

  _handleClearFilter() {
    this._store.clearFilter();
  }

  _handlePrefixKeypress(letter) {
    if (!this._store.usePrefixNav()) {
      return;
    }

    this._store.addFilterLetter(letter);
  }

  _handleRemoveLetterKeypress() {
    if (!this._store.usePrefixNav()) {
      return;
    }
    this._store.removeFilterLetter();
  }

  _openAndRevealFilePath(filePath) {
    if (filePath != null) {
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(filePath);
      this.revealNodeKey(filePath);
    }
  }

  _openAndRevealFilePaths(filePaths) {
    for (let i = 0; i < filePaths.length; i++) {
      (0, (_goToLocation || _load_goToLocation()).goToLocation)(filePaths[i]);
    }
    if (filePaths.length !== 0) {
      this.revealNodeKey(filePaths[filePaths.length - 1]);
    }
  }

  _openAndRevealDirectoryPath(path) {
    if (path != null) {
      this.revealNodeKey((_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey(path));
    }
  }

  _updateRootDirectories() {
    // If the remote-projects package hasn't loaded yet remote directories will be instantiated as
    // local directories but with invalid paths. We need to exclude those.
    const rootDirectories = atom.project.getDirectories().filter(directory => (_FileTreeHelpers || _load_FileTreeHelpers()).default.isValidDirectory(directory));
    const rootKeys = rootDirectories.map(directory => (_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey(directory.getPath()));
    this._actions.setRootKeys(rootKeys);
    this._actions.updateRepositories(rootDirectories);
  }

  _revealFile(event) {
    let path = (0, (_getElementFilePath || _load_getElementFilePath()).default)(event.target);

    if (path == null) {
      const editor = atom.workspace.getActiveTextEditor();
      path = editor != null ? editor.getPath() : null;
      if (path == null) {
        return;
      }
    }

    this.revealFilePath(path);
  }

  revealFilePath(filePath, showIfHidden = true) {
    if (showIfHidden) {
      // Ensure the file tree is visible before trying to reveal a file in it. Even if the currently
      // active pane is not an ordinary editor, we still at least want to show the tree.
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open((_Constants || _load_Constants()).WORKSPACE_VIEW_URI, { searchAllPanes: true });
      this._actions.setFoldersExpanded(true);
    }

    // flowlint-next-line sketchy-null-string:off
    if (!filePath) {
      return;
    }

    this.revealNodeKey(filePath);
  }

  revealNodeKey(nodeKey) {
    if (nodeKey == null) {
      return;
    }

    this._actions.ensureChildNode(nodeKey);
  }

  _setCwdToSelection() {
    const node = this._store.getSingleSelectedNode();
    if (node == null) {
      return;
    }
    const path = (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(node.uri);
    if (this._cwdApi != null) {
      this._cwdApi.setCwd(path);
    }
  }

  setCwdApi(cwdApi) {
    if (cwdApi == null) {
      this._actions.setCwd(null);
      this._cwdApiSubscription = null;
    } else {
      if (!(this._cwdApiSubscription == null)) {
        throw new Error('Invariant violation: "this._cwdApiSubscription == null"');
      }

      this._cwdApiSubscription = cwdApi.observeCwd(directory => {
        const path = directory == null ? null : directory.getPath();
        // flowlint-next-line sketchy-null-string:off
        const rootKey = path && (_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey(path);
        this._actions.setCwd(rootKey);
      });
    }

    this._cwdApi = cwdApi;
  }

  setRemoteProjectsService(service) {
    if (service != null) {
      // This is to workaround the initialization order problem between the
      // nuclide-remote-projects and nuclide-file-tree packages.
      // The file-tree starts up and restores its state, which can have a (remote) project root.
      // But at this point it's not a real directory. It is not present in
      // atom.project.getDirectories() and essentially it's a fake, but a useful one, as it has
      // the state (open folders, selection etc.) serialized in it. So we don't want to discard
      // it. In most cases, after a successful reconnect the real directory instance will be
      // added to the atom.project.directories and the previously fake root would become real.
      // The problem happens when the connection fails, or is canceled.
      // The fake root just stays in the file tree.
      // After remote projects have been reloaded, force a refresh to clear out the fake roots.
      this._disposables.add(service.waitForRemoteProjectReload(this._updateRootDirectories.bind(this)));
    }
    this._remoteProjectsService = service;
  }

  setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
    this._actions.setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths);
  }

  setHideIgnoredNames(hideIgnoredNames) {
    this._actions.setHideIgnoredNames(hideIgnoredNames);
  }

  setIgnoredNames(ignoredNames) {
    this._actions.setIgnoredNames(ignoredNames);
  }

  setUsePreviewTabs(usePreviewTabs) {
    this._actions.setUsePreviewTabs(usePreviewTabs);
  }

  setUsePrefixNav(usePrefixNav) {
    this._actions.setUsePrefixNav(usePrefixNav);
  }

  setAutoExpandSingleChild(autoExpandSingleChild) {
    this._store._setAutoExpandSingleChild(autoExpandSingleChild);
  }

  updateWorkingSet(workingSet) {
    this._actions.updateWorkingSet(workingSet);
  }

  updateWorkingSetsStore(workingSetsStore) {
    this._actions.updateWorkingSetsStore(workingSetsStore);
  }

  updateOpenFilesWorkingSet(openFilesWorkingSet) {
    this._actions.updateOpenFilesWorkingSet(openFilesWorkingSet);
  }

  /**
   * Collapses all selected directory nodes. If the selection is a single file or a single collapsed
   * directory, the selection is set to the directory's parent.
   */
  _collapseSelection(deep = false) {
    const selectedNodes = this._store.getSelectedNodes();
    const firstSelectedNode = selectedNodes.first();
    if (selectedNodes.size === 1 && !firstSelectedNode.isRoot && !(firstSelectedNode.isContainer && firstSelectedNode.isExpanded)) {
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

  _selectAndTrackNode(node) {
    this._actions.setSelectedNode(node.rootUri, node.uri);
  }

  _collapseAll() {
    const roots = this._store.roots;
    roots.forEach(root => this._actions.collapseNodeDeep(root.uri, root.uri));
  }

  _deleteSelection() {
    const nodes = this._store.getTargetNodes();
    if (nodes.size === 0) {
      return;
    }

    const rootPaths = nodes.filter(node => node.isRoot);
    if (rootPaths.size === 0) {
      const selectedPaths = nodes.map(node => {
        const nodePath = (_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(node.uri);
        const parentOfRoot = (_nuclideUri || _load_nuclideUri()).default.dirname(node.rootUri);

        return (_nuclideUri || _load_nuclideUri()).default.relative(parentOfRoot, nodePath);
      });
      const message = 'Are you sure you want to delete the following ' + (nodes.size > 1 ? 'items?' : 'item?');
      atom.confirm({
        buttons: {
          Delete: () => {
            this._actions.deleteSelectedNodes();
          },
          Cancel: () => {}
        },
        detailedMessage: `You are deleting:${_os.default.EOL}${selectedPaths.join(_os.default.EOL)}`,
        message
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
        message
      });
    }
  }

  /**
   * Expands all selected directory nodes.
   */
  _expandSelection(deep) {
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

  _openSelectedEntry() {
    this._handleClearFilter();
    const singleSelectedNode = this._store.getSingleSelectedNode();
    // Only perform the default action if a single node is selected.
    if (singleSelectedNode != null) {
      this._actions.confirmNode(singleSelectedNode.rootUri, singleSelectedNode.uri);
    }
  }

  _openSelectedEntrySplit(orientation, side) {
    const singleSelectedNode = this._store.getSingleTargetNode();
    // Only perform the default action if a single node is selected.
    if (singleSelectedNode != null && !singleSelectedNode.isContainer) {
      // for: is this feature used enough to justify uncollapsing?
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('filetree-split-file', {
        orientation,
        side
      });
      this._actions.openSelectedEntrySplit(singleSelectedNode.uri, orientation, side);
    }
  }

  _openSelectedEntrySplitUp() {
    this._openSelectedEntrySplit('vertical', 'before');
  }

  _openSelectedEntrySplitDown() {
    this._openSelectedEntrySplit('vertical', 'after');
  }

  _openSelectedEntrySplitLeft() {
    this._openSelectedEntrySplit('horizontal', 'before');
  }

  _openSelectedEntrySplitRight() {
    this._openSelectedEntrySplit('horizontal', 'after');
  }

  _removeRootFolderSelection() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const rootNode = _this._store.getSingleSelectedNode();
      if (rootNode != null && rootNode.isRoot) {
        // close all the files associated with the project before closing
        const projectEditors = atom.workspace.getTextEditors();

        const roots = _this._store.getRootKeys();
        for (const editor of projectEditors) {
          const path = editor.getPath();
          // if the path of the editor is not null AND
          // is part of the currently selected root that would be removed AND
          // is not part of any other open root, then close the file.
          if (path != null && path.startsWith(rootNode.uri) && roots.filter(function (root) {
            return path.startsWith(root);
          }).length === 1) {
            // eslint-disable-next-line no-await-in-loop
            const didDestroy = yield atom.workspace.paneForURI(path).destroyItem(editor);

            // Atom has a bug where, in some cases, destroyItem returns nonsense.
            // Luckily, in the case we care about, it returns a literal `false`,
            // so we check for that explictly.
            // https://github.com/atom/atom/issues/15157
            if (didDestroy === false) {
              return;
            }
          }
        }

        // actually close the project
        atom.project.removePath((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(rootNode.uri));
      }
    })();
  }

  _searchInDirectory(event) {
    const targetElement = event.target;
    // If the event was sent to the entire tree, rather then a single element - attempt to derive
    // the path to work on from the current selection.
    if (targetElement.classList.contains('nuclide-file-tree')) {
      const node = this._store.getSingleSelectedNode();
      if (node == null) {
        return;
      }

      let path = node.uri;
      if (!node.isContainer) {
        if (!node.parent) {
          throw new Error('Invariant violation: "node.parent"');
        }

        path = node.parent.uri;
      }

      // What we see here is an unfortunate example of "DOM as an API" paradigm :-(
      // Atom's handler for the "show-in-current-directory" command is context sensitive
      // and it derives the context from the custom "data-path" attribute. The attribute must
      // be present on a child of a closest element having a ".directory" class.
      // See: https://github.com/atom/find-and-replace/blob/v0.208.1/lib/project-find-view.js#L356-L360
      // We will just temporarily create a proper element for the event handler to work on
      // and remove it immediately afterwards.
      const temporaryElement = document.createElement('div');
      temporaryElement.classList.add('directory');
      const pathChild = document.createElement('div');
      pathChild.dataset.path = path;
      temporaryElement.appendChild(pathChild);

      // Must attach to the workspace-view, otherwise the handler won't be found
      const workspaceView = atom.views.getView(atom.workspace);
      workspaceView.appendChild(temporaryElement);

      atom.commands.dispatch(temporaryElement, 'project-find:show-in-current-directory');

      // Cleaning for the workspace-view
      workspaceView.removeChild(temporaryElement);
    } else {
      atom.commands.dispatch(targetElement, 'project-find:show-in-current-directory');
    }
  }

  _showInFileManager(event) {
    const path = (0, (_getElementFilePath || _load_getElementFilePath()).default)(event.target, true);
    if (path == null || (_nuclideUri || _load_nuclideUri()).default.isRemote(path)) {
      return;
    }
    _electron.shell.showItemInFolder(path);
  }

  _copyFilenamesWithDir(event) {
    const nodes = this._store.getSelectedNodes();
    const dirs = [];
    const files = [];
    for (const node of nodes) {
      const file = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getFileByKey(node.uri);
      if (file != null) {
        files.push(file);
      }
      const dir = (_FileTreeHelpers || _load_FileTreeHelpers()).default.getDirectoryByKey(node.uri);
      if (dir != null) {
        dirs.push(dir);
      }
    }
    const entries = dirs.concat(files);
    if (entries.length === 0) {
      // no valid files or directories found
      return;
    }
    const dirPath = entries[0].getParent().getPath();
    if (!entries.every(e => e.getParent().getPath() === dirPath)) {
      // only copy if all selected files are in the same directory
      return;
    }

    // copy this text in case user pastes into a text area
    const copyNames = entries.map(e => encodeURIComponent(e.getBaseName())).join();

    atom.clipboard.write(copyNames, {
      directory: (_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey(dirPath),
      filenames: files.map(f => f.getBaseName()),
      dirnames: dirs.map(f => f.getBaseName())
    });
  }

  _copyFullPath(event) {
    const path = (0, (_getElementFilePath || _load_getElementFilePath()).default)(event.target, true);
    if (path == null) {
      return;
    }
    const parsed = (_nuclideUri || _load_nuclideUri()).default.parse(path);
    atom.clipboard.write(parsed.path);
  }

  destroy() {
    this._disposables.dispose();
    for (const disposable of this._disposableForRepository.values()) {
      disposable.dispose();
    }
    this._store.reset();
    this._contextMenu.dispose();
  }

  serialize() {
    return this._store.exportData();
  }
}
exports.default = FileTreeController;