"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _passesGK() {
  const data = require("../../commons-node/passesGK");

  _passesGK = function () {
    return data;
  };

  return data;
}

function _FileTreeDispatcher() {
  const data = require("./FileTreeDispatcher");

  _FileTreeDispatcher = function () {
    return data;
  };

  return data;
}

function _FileTreeHelpers() {
  const data = _interopRequireDefault(require("./FileTreeHelpers"));

  _FileTreeHelpers = function () {
    return data;
  };

  return data;
}

function _FileTreeStore() {
  const data = _interopRequireDefault(require("./FileTreeStore"));

  _FileTreeStore = function () {
    return data;
  };

  return data;
}

function Immutable() {
  const data = _interopRequireWildcard(require("immutable"));

  Immutable = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _nuclideVcsBase() {
  const data = require("../../nuclide-vcs-base");

  _nuclideVcsBase = function () {
    return data;
  };

  return data;
}

function _nuclideHgRpc() {
  const data = require("../../nuclide-hg-rpc");

  _nuclideHgRpc = function () {
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

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("./FileTreeSelectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function _Constants() {
  const data = require("./Constants");

  _Constants = function () {
    return data;
  };

  return data;
}

function _removeProjectPath() {
  const data = _interopRequireDefault(require("../../commons-atom/removeProjectPath"));

  _removeProjectPath = function () {
    return data;
  };

  return data;
}

function _systemInfo() {
  const data = require("../../commons-node/system-info");

  _systemInfo = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _goToLocation() {
  const data = require("../../../modules/nuclide-commons-atom/go-to-location");

  _goToLocation = function () {
    return data;
  };

  return data;
}

function _FileActionModal() {
  const data = require("../../nuclide-ui/FileActionModal");

  _FileActionModal = function () {
    return data;
  };

  return data;
}

function _FileTreeHgHelpers() {
  const data = _interopRequireDefault(require("./FileTreeHgHelpers"));

  _FileTreeHgHelpers = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _atom = require("atom");

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const logger = (0, _log4js().getLogger)('nuclide-file-tree');

/**
 * Implements the Flux pattern for our file tree. All state for the file tree will be kept in
 * FileTreeStore and the only way to update the store is through methods on FileTreeActions.
 */
class FileTreeActions {
  constructor(store) {
    this._store = store;
    this._disposableForRepository = Immutable().Map();
    this._disposables = new (_UniversalDisposable().default)(() => {
      if (this._cwdApiSubscription != null) {
        this._cwdApiSubscription.dispose();
      }
    });
  }

  setCwd(rootKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_CWD,
      rootKey
    });
  }

  setRootKeys(rootKeys) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_ROOT_KEYS,
      rootKeys
    });
  }

  clearFilter() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.CLEAR_FILTER
    });
  }

  addExtraProjectSelectionContent(content) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.ADD_EXTRA_PROJECT_SELECTION_CONTENT,
      content
    });
  }

  removeExtraProjectSelectionContent(content) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.REMOVE_EXTRA_PROJECT_SELECTION_CONTENT,
      content
    });
  }

  expandNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.EXPAND_NODE,
      rootKey,
      nodeKey
    });
  }

  expandNodeDeep(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.EXPAND_NODE_DEEP,
      rootKey,
      nodeKey
    });
  }

  deleteSelectedNodes() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.DELETE_SELECTED_NODES
    });
  } // Makes sure a specific child exists for a given node. If it does not exist, temporarily
  // create it and initiate a fetch. This feature is exclusively for expanding to a node deep
  // in a tree.


  ensureChildNode(nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.ENSURE_CHILD_NODE,
      nodeKey
    });
  }

  collapseNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.COLLAPSE_NODE,
      rootKey,
      nodeKey
    });
  }

  collapseNodeDeep(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.COLLAPSE_NODE_DEEP,
      rootKey,
      nodeKey
    });
  }

  setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_EXCLUDE_VCS_IGNORED_PATHS,
      excludeVcsIgnoredPaths
    });
  }

  setHideVcsIgnoredPaths(hideVcsIgnoredPaths) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_HIDE_VCS_IGNORED_PATHS,
      hideVcsIgnoredPaths
    });
  }

  setHideIgnoredNames(hideIgnoredNames) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_HIDE_IGNORED_NAMES,
      hideIgnoredNames
    });
  }

  setIsCalculatingChanges(isCalculatingChanges) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_IS_CALCULATING_CHANGES,
      isCalculatingChanges
    });
  }

  setIgnoredNames(ignoredNames) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_IGNORED_NAMES,
      ignoredNames
    });
  }

  setTrackedNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_TRACKED_NODE,
      nodeKey,
      rootKey
    });
  }

  clearTrackedNode() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.CLEAR_TRACKED_NODE
    });
  }

  clearTrackedNodeIfNotLoading() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.CLEAR_TRACKED_NODE_IF_NOT_LOADING
    });
  }

  startReorderDrag(draggedRootKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.START_REORDER_DRAG,
      draggedRootKey
    });
  }

  endReorderDrag() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.END_REORDER_DRAG
    });
  }

  reorderDragInto(dragTargetNodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.REORDER_DRAG_INTO,
      dragTargetNodeKey
    });
  }

  reorderRoots() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.REORDER_ROOTS
    });
  }

  moveToNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.MOVE_TO_NODE,
      nodeKey,
      rootKey
    });
  }

  setUsePreviewTabs(usePreviewTabs) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_USE_PREVIEW_TABS,
      usePreviewTabs
    });
  }

  setFocusEditorOnFileSelection(focusEditorOnFileSelection) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_FOCUS_EDITOR_ON_FILE_SELECTION,
      focusEditorOnFileSelection
    });
  }

  setUsePrefixNav(usePrefixNav) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_USE_PREFIX_NAV,
      usePrefixNav
    });
  }

  setAutoExpandSingleChild(autoExpandSingleChild) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_AUTO_EXPAND_SINGLE_CHILD,
      autoExpandSingleChild
    });
  }

  confirmNode(rootKey, nodeKey, pending = false) {
    const node = Selectors().getNode(this._store, rootKey, nodeKey);

    if (node == null) {
      return;
    }

    if (node.isContainer) {
      if (node.isExpanded) {
        this._store.dispatch({
          actionType: _FileTreeDispatcher().ActionTypes.COLLAPSE_NODE,
          nodeKey,
          rootKey
        });
      } else {
        this._store.dispatch({
          actionType: _FileTreeDispatcher().ActionTypes.EXPAND_NODE,
          nodeKey,
          rootKey
        });
      }
    } else {
      (0, _nuclideAnalytics().track)('file-tree-open-file', {
        uri: nodeKey
      }); // goToLocation doesn't support pending panes
      // eslint-disable-next-line nuclide-internal/atom-apis

      atom.workspace.open(_FileTreeHelpers().default.keyToPath(nodeKey), {
        activatePane: pending && node.conf.focusEditorOnFileSelection || !pending,
        searchAllPanes: true,
        pending
      });
    }
  }

  keepPreviewTab() {
    const activePane = atom.workspace.getActivePane();

    if (activePane != null) {
      activePane.clearPendingItem();
    }
  }

  openSelectedEntrySplit(nodeKey, orientation, side) {
    const pane = atom.workspace.getCenter().getActivePane();
    atom.workspace.openURIInPane(_FileTreeHelpers().default.keyToPath(nodeKey), pane.split(orientation, side));
  }

  setVcsStatuses(rootKey, vcsStatuses) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_VCS_STATUSES,
      rootKey,
      vcsStatuses
    });
  }

  invalidateRemovedFolder() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.INVALIDATE_REMOVED_FOLDER
    });
  }
  /**
   * Updates the root repositories to match the provided directories.
   */


  async updateRepositories(rootDirectories) {
    const rootKeys = rootDirectories.map(directory => _FileTreeHelpers().default.dirPathToKey(directory.getPath())); // $FlowFixMe

    const rootRepos = await Promise.all(rootDirectories.map(directory => (0, _nuclideVcsBase().repositoryForPath)(directory.getPath()))); // t7114196: Given the current implementation of HgRepositoryClient, each root directory will
    // always correspond to a unique instance of HgRepositoryClient. Ideally, if multiple subfolders
    // of an Hg repo are used as project roots in Atom, only one HgRepositoryClient should be
    // created.
    // Group all of the root keys by their repository, excluding any that don't belong to a
    // repository.

    const rootKeysForRepository = Immutable().Map(omitNullKeys(Immutable().List(rootKeys).groupBy((rootKey, index) => rootRepos[index])).map(v => Immutable().Set(v)));
    const prevRepos = Selectors().getRepositories(this._store); // Let the store know we have some new repos!

    const nextRepos = Immutable().Set(rootKeysForRepository.keys());

    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_REPOSITORIES,
      repositories: nextRepos
    });

    const removedRepos = prevRepos.subtract(nextRepos);
    const addedRepos = nextRepos.subtract(prevRepos); // TODO: Rewrite `_repositoryAdded` to return the subscription instead of adding it to a map as
    //       a side effect. The map can be created here with something like
    //       `subscriptions = Immutable.Map(repos).map(this._repositoryAdded)`. Since
    //       `_repositoryAdded` will no longer be about side effects, it should then be renamed.
    // Unsubscribe from removedRepos.

    removedRepos.forEach(repo => {
      const disposable = this._disposableForRepository.get(repo);

      if (disposable == null) {
        // There is a small chance that the add/remove of the Repository could happen so quickly that
        // the entry for the repo in _disposableForRepository has not been set yet.
        // TODO: Report a soft error for this.
        return;
      }

      this._disposableForRepository = this._disposableForRepository.delete(repo);
      this.invalidateRemovedFolder();
      disposable.dispose();
    }); // Create subscriptions for addedRepos.

    addedRepos.forEach(repo => {
      this._repositoryAdded(repo, rootKeysForRepository);
    });
  }

  updateWorkingSet(workingSet) {
    // TODO (T30814717): Make this the default behavior after some research.
    if ((0, _passesGK().isGkEnabled)('nuclide_projects') === true) {
      const prevWorkingSet = Selectors().getWorkingSet(this._store);
      const prevUris = new Set(prevWorkingSet.getUris());
      const nextUris = new Set(workingSet.getUris());
      const addedUris = (0, _collection().setDifference)(nextUris, prevUris); // Reveal all of the added paths. This is a little gross. The WorkingSetStore API will return
      // absolute paths (`/a/b/c`) for remote directories instead of `nuclide://` URIs. In other
      // words, we don't have enough information to know what paths to reveal. So we'll just try to
      // reveal the path in every root.

      addedUris.forEach(uri => {
        Selectors().getRootKeys(this._store).forEach(rootUri => {
          const filePath = _nuclideUri().default.resolve(rootUri, uri);

          const nodeKey = _FileTreeHelpers().default.dirPathToKey(filePath);

          this.revealFilePath(nodeKey, false);

          if (nextUris.size === 1) {
            // There's only a single URI in the working set, expand it.
            this.expandNode(rootUri, nodeKey);
          }
        });
      });
    }

    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_WORKING_SET,
      workingSet
    });
  }

  updateOpenFilesWorkingSet(openFilesWorkingSet) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_OPEN_FILES_WORKING_SET,
      openFilesWorkingSet
    });
  }

  updateWorkingSetsStore(workingSetsStore) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_WORKING_SETS_STORE,
      workingSetsStore
    });
  }

  startEditingWorkingSet(editedWorkingSet) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.START_EDITING_WORKING_SET,
      editedWorkingSet
    });
  }

  finishEditingWorkingSet() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.FINISH_EDITING_WORKING_SET
    });
  }

  checkNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.CHECK_NODE,
      rootKey,
      nodeKey
    });
  }

  uncheckNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.UNCHECK_NODE,
      rootKey,
      nodeKey
    });
  }

  setDragHoveredNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_DRAG_HOVERED_NODE,
      rootKey,
      nodeKey
    });
  }

  setSelectedNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_SELECTED_NODE,
      rootKey,
      nodeKey
    });
  }

  setFocusedNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_FOCUSED_NODE,
      rootKey,
      nodeKey
    });
  }

  addSelectedNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.ADD_SELECTED_NODE,
      rootKey,
      nodeKey
    });
  }

  unselectNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.UNSELECT_NODE,
      rootKey,
      nodeKey
    });
  }

  rangeSelectToNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.RANGE_SELECT_TO_NODE,
      rootKey,
      nodeKey
    });
  }

  rangeSelectUp() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.RANGE_SELECT_UP
    });
  }

  rangeSelectDown() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.RANGE_SELECT_DOWN
    });
  }

  unhoverNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.UNHOVER_NODE,
      rootKey,
      nodeKey
    });
  }

  moveSelectionUp() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.MOVE_SELECTION_UP
    });
  }

  moveSelectionDown() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.MOVE_SELECTION_DOWN
    });
  }

  moveSelectionToTop() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.MOVE_SELECTION_TO_TOP
    });
  }

  moveSelectionToBottom() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.MOVE_SELECTION_TO_BOTTOM
    });
  }

  setOpenFilesExpanded(openFilesExpanded) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_OPEN_FILES_EXPANDED,
      openFilesExpanded
    });
  }

  setUncommittedChangesExpanded(uncommittedChangesExpanded) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_UNCOMMITTED_CHANGES_EXPANDED,
      uncommittedChangesExpanded
    });
  }

  setFoldersExpanded(foldersExpanded) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_FOLDERS_EXPANDED,
      foldersExpanded
    });
  }

  setTargetNode(rootKey, nodeKey) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_TARGET_NODE,
      rootKey,
      nodeKey
    });
  }

  updateGeneratedStatus(filesToCheck) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.UPDATE_GENERATED_STATUS,
      filesToCheck
    });
  }

  addFilterLetter(letter) {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.ADD_FILTER_LETTER,
      letter
    });
  }

  removeFilterLetter() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.REMOVE_FILTER_LETTER
    });
  }

  reset() {
    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.RESET
    });
  }

  _repositoryAdded(repo, rootKeysForRepository) {
    // We support HgRepositoryClient and GitRepositoryAsync objects.
    // Observe the repository so that the VCS statuses are kept up to date.
    // This observer should fire off an initial value after we subscribe to it,
    let vcsChanges = _RxMin.Observable.empty();

    let vcsCalculating = _RxMin.Observable.of(false);

    if (repo.isDestroyed()) {// Don't observe anything on a destroyed repo.
    } else if (repo.getType() === 'git') {
      // Different repo types emit different events at individual and refresh updates.
      // Hence, the need to debounce and listen to both change types.
      vcsChanges = _RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(repo.onDidChangeStatus.bind(repo)), (0, _event().observableFromSubscribeFunction)(repo.onDidChangeStatuses.bind(repo))).let((0, _observable().fastDebounce)(1000)).startWith(null).map(() => this._getCachedPathStatusesForGitRepo(repo));
    } else if (repo.getType() === 'hg') {
      // We special-case the HgRepository because it offers up the
      // required observable directly, and because it actually allows us to pick
      const hgRepo = repo;

      const hgChanges = _FileTreeHelpers().default.observeUncommittedChangesKindConfigKey().map(kind => {
        switch (kind) {
          case 'Uncommitted changes':
            return hgRepo.observeUncommittedStatusChanges();

          case 'Head changes':
            return hgRepo.observeHeadStatusChanges();

          case 'Stack changes':
            return hgRepo.observeStackStatusChanges();

          default:
            kind;

            const error = _RxMin.Observable.throw(new Error('Unrecognized ShowUncommittedChangesKind config'));

            return {
              statusChanges: error,
              isCalculatingChanges: error
            };
        }
      }).share();

      vcsChanges = hgChanges.switchMap(c => c.statusChanges).distinctUntilChanged(_collection().mapEqual);
      vcsCalculating = hgChanges.switchMap(c => c.isCalculatingChanges);
    }

    const subscription = vcsChanges.subscribe(statusCodeForPath => {
      for (const rootKeyForRepo of (0, _nullthrows().default)(rootKeysForRepository.get(repo))) {
        this.setVcsStatuses(rootKeyForRepo, statusCodeForPath);
      }
    });
    const subscriptionCalculating = vcsCalculating.subscribe(isCalculatingChanges => {
      this.setIsCalculatingChanges(isCalculatingChanges);
    });
    this._disposableForRepository = this._disposableForRepository.set(repo, new (_UniversalDisposable().default)(subscription, subscriptionCalculating));
  }
  /**
   * Fetches a consistent object map from absolute file paths to
   * their corresponding `StatusCodeNumber` for easy representation with the file tree.
   */


  _getCachedPathStatusesForGitRepo(repo) {
    const gitRepo = repo;
    const {
      statuses
    } = gitRepo;
    const internalGitRepo = gitRepo.getRepo();
    const codePathStatuses = new Map();
    const repoRoot = repo.getWorkingDirectory(); // Transform `git` bit numbers to `StatusCodeNumber` format.

    const {
      StatusCodeNumber
    } = _nuclideHgRpc().hgConstants;

    for (const relativePath in statuses) {
      const gitStatusNumber = statuses[relativePath];
      let statusCode;

      if (internalGitRepo.isStatusNew(gitStatusNumber)) {
        statusCode = StatusCodeNumber.UNTRACKED;
      } else if (internalGitRepo.isStatusStaged(gitStatusNumber)) {
        statusCode = StatusCodeNumber.ADDED;
      } else if (internalGitRepo.isStatusModified(gitStatusNumber)) {
        statusCode = StatusCodeNumber.MODIFIED;
      } else if (internalGitRepo.isStatusIgnored(gitStatusNumber)) {
        statusCode = StatusCodeNumber.IGNORED;
      } else if (internalGitRepo.isStatusDeleted(gitStatusNumber)) {
        statusCode = StatusCodeNumber.REMOVED;
      } else {
        (0, _log4js().getLogger)('nuclide-file-tree').warn(`Unrecognized git status number ${gitStatusNumber}`);
        statusCode = StatusCodeNumber.MODIFIED;
      }

      codePathStatuses.set(_nuclideUri().default.join(repoRoot, relativePath), statusCode);
    }

    return codePathStatuses;
  }

  revealNodeKey(nodeKey) {
    if (nodeKey == null) {
      return;
    }

    this.ensureChildNode(nodeKey);
  }

  revealFilePath(filePath, showIfHidden = true) {
    if (showIfHidden) {
      // Ensure the file tree is visible before trying to reveal a file in it. Even if the currently
      // active pane is not an ordinary editor, we still at least want to show the tree.
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open(_Constants().WORKSPACE_VIEW_URI, {
        searchAllPanes: true
      });
      this.setFoldersExpanded(true);
    } // flowlint-next-line sketchy-null-string:off


    if (!filePath) {
      return;
    }

    this.revealNodeKey(filePath);
  }

  openAndRevealFilePath(filePath) {
    if (filePath != null) {
      (0, _goToLocation().goToLocation)(filePath);
      this.revealNodeKey(filePath);
    }
  }

  openAndRevealFilePaths(filePaths) {
    for (let i = 0; i < filePaths.length; i++) {
      (0, _goToLocation().goToLocation)(filePaths[i]);
    }

    if (filePaths.length !== 0) {
      this.revealNodeKey(filePaths[filePaths.length - 1]);
    }
  }

  openAndRevealDirectoryPath(path) {
    if (path != null) {
      this.revealNodeKey(_FileTreeHelpers().default.dirPathToKey(path));
    }
  }

  updateRootDirectories() {
    // If the remote-projects package hasn't loaded yet remote directories will be instantiated as
    // local directories but with invalid paths. We need to exclude those.
    const rootDirectories = atom.project.getDirectories().filter(directory => _FileTreeHelpers().default.isValidDirectory(directory));
    const rootKeys = rootDirectories.map(directory => _FileTreeHelpers().default.dirPathToKey(directory.getPath()));
    this.setRootKeys(rootKeys);
    this.updateRepositories(rootDirectories);
  }

  setCwdToSelection() {
    const node = Selectors().getSingleSelectedNode(this._store);

    if (node == null) {
      return;
    }

    const path = _FileTreeHelpers().default.keyToPath(node.uri);

    const cwdApi = Selectors().getCwdApi(this._store);

    if (cwdApi != null) {
      cwdApi.setCwd(path);
    }
  }

  setCwdApi(cwdApi) {
    if (cwdApi == null) {
      this.setCwd(null);
      this._cwdApiSubscription = null;
    } else {
      if (!(this._cwdApiSubscription == null)) {
        throw new Error("Invariant violation: \"this._cwdApiSubscription == null\"");
      }

      this._cwdApiSubscription = cwdApi.observeCwd(directory => {
        // flowlint-next-line sketchy-null-string:off
        const rootKey = directory && _FileTreeHelpers().default.dirPathToKey(directory);

        this.setCwd(rootKey);
      });
    }

    this._store.dispatch({
      actionType: _FileTreeDispatcher().ActionTypes.SET_CWD_API,
      cwdApi
    });
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
      this._disposables.add(service.waitForRemoteProjectReload(() => {
        this.updateRootDirectories();
      }));
    }
  }
  /**
   * Collapses all selected directory nodes. If the selection is a single file or a single collapsed
   * directory, the selection is set to the directory's parent.
   */


  collapseSelection(deep = false) {
    const selectedNodes = Selectors().getSelectedNodes(this._store);
    const firstSelectedNode = (0, _nullthrows().default)(selectedNodes.first());

    if (selectedNodes.size === 1 && !firstSelectedNode.isRoot && !(firstSelectedNode.isContainer && firstSelectedNode.isExpanded)) {
      /*
         * Select the parent of the selection if the following criteria are met:
         *   * Only 1 node is selected
         *   * The node is not a root
         *   * The node is not an expanded directory
        */
      const parent = (0, _nullthrows().default)(firstSelectedNode.parent);

      this._selectAndTrackNode(parent);
    } else {
      selectedNodes.forEach(node => {
        // Only directories can be expanded. Skip non-directory nodes.
        if (!node.isContainer) {
          return;
        }

        if (deep) {
          this.collapseNodeDeep(node.rootUri, node.uri);
        } else {
          this.collapseNode(node.rootUri, node.uri);
        }
      });
    }
  }

  _selectAndTrackNode(node) {
    this.setSelectedNode(node.rootUri, node.uri);
  }

  collapseAll() {
    const roots = this._store._roots;
    roots.forEach(root => this.collapseNodeDeep(root.uri, root.uri));
  }

  deleteSelection() {
    const nodes = Selectors().getTargetNodes(this._store);

    if (nodes.size === 0) {
      return;
    }

    const rootPaths = nodes.filter(node => node.isRoot);

    if (rootPaths.size === 0) {
      const selectedPaths = nodes.map(node => {
        const nodePath = _FileTreeHelpers().default.keyToPath(node.uri);

        const parentOfRoot = _nuclideUri().default.dirname(node.rootUri); // Fix Windows paths to avoid end of filename truncation


        return (0, _systemInfo().isRunningInWindows)() ? _nuclideUri().default.relative(parentOfRoot, nodePath).replace(/\//g, '\\') : _nuclideUri().default.relative(parentOfRoot, nodePath);
      });
      const message = 'Are you sure you want to delete the following ' + (nodes.size > 1 ? 'items?' : 'item?');
      atom.confirm({
        buttons: {
          Delete: () => {
            this.deleteSelectedNodes();
          },
          Cancel: () => {}
        },
        detailedMessage: `You are deleting:${_os.default.EOL}${selectedPaths.join(_os.default.EOL)}`,
        message
      });
    } else {
      let message;

      if (rootPaths.size === 1) {
        message = `The root directory '${(0, _nullthrows().default)(rootPaths.first()).name}' can't be removed.`;
      } else {
        const rootPathNames = rootPaths.map(node => `'${node.name}'`).join(', ');
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


  expandSelection(deep) {
    this.clearFilter();
    Selectors().getSelectedNodes(this._store).forEach(node => {
      // Only directories can be expanded. Skip non-directory nodes.
      if (!node.isContainer) {
        return;
      }

      if (deep) {
        this.expandNodeDeep(node.rootUri, node.uri);
        this.setTrackedNode(node.rootUri, node.uri);
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
          this.expandNode(node.rootUri, node.uri);
          this.setTrackedNode(node.rootUri, node.uri);
        }
      }
    });
  }

  openSelectedEntry() {
    this.clearFilter();
    const singleSelectedNode = Selectors().getSingleSelectedNode(this._store); // Only perform the default action if a single node is selected.

    if (singleSelectedNode != null) {
      this.confirmNode(singleSelectedNode.rootUri, singleSelectedNode.uri);
    }
  }

  _openSelectedEntrySplit(orientation, side) {
    const singleSelectedNode = Selectors().getSingleTargetNode(this._store); // Only perform the default action if a single node is selected.

    if (singleSelectedNode != null && !singleSelectedNode.isContainer) {
      // for: is this feature used enough to justify uncollapsing?
      (0, _nuclideAnalytics().track)('filetree-split-file', {
        orientation,
        side
      });
      this.openSelectedEntrySplit(singleSelectedNode.uri, orientation, side);
    }
  }

  openSelectedEntrySplitUp() {
    this._openSelectedEntrySplit('vertical', 'before');
  }

  openSelectedEntrySplitDown() {
    this._openSelectedEntrySplit('vertical', 'after');
  }

  openSelectedEntrySplitLeft() {
    this._openSelectedEntrySplit('horizontal', 'before');
  }

  openSelectedEntrySplitRight() {
    this._openSelectedEntrySplit('horizontal', 'after');
  }

  async removeRootFolderSelection() {
    const rootNode = Selectors().getSingleSelectedNode(this._store);

    if (rootNode != null && rootNode.isRoot) {
      logger.info('Removing project path via file tree', rootNode);
      await (0, _removeProjectPath().default)(rootNode.uri);
    }
  }

  copyFilenamesWithDir() {
    const nodes = Selectors().getSelectedNodes(this._store);
    const dirs = [];
    const files = [];

    for (const node of nodes) {
      const file = _FileTreeHelpers().default.getFileByKey(node.uri);

      if (file != null) {
        files.push(file);
      }

      const dir = _FileTreeHelpers().default.getDirectoryByKey(node.uri);

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
    } // copy this text in case user pastes into a text area


    const copyNames = entries.map(e => encodeURIComponent(e.getBaseName())).join();
    atom.clipboard.write(copyNames, {
      directory: _FileTreeHelpers().default.dirPathToKey(dirPath),
      filenames: files.map(f => f.getBaseName()),
      dirnames: dirs.map(f => f.getBaseName())
    });
  }

  openAddFolderDialog(onDidConfirm) {
    const node = getSelectedContainerNode(this._store);

    if (!node) {
      return;
    }

    openAddDialog('folder', node.localPath + '/', async (filePath, options) => {
      // Prevent submission of a blank field from creating a directory.
      if (filePath === '') {
        return;
      } // TODO: check if filePath is in rootKey and if not, find the rootKey it belongs to.


      const directory = _FileTreeHelpers().default.getDirectoryByKey(node.uri);

      if (directory == null) {
        return;
      }

      const {
        path
      } = _nuclideUri().default.parse(filePath);

      const basename = _nuclideUri().default.basename(path);

      const newDirectory = directory.getSubdirectory(basename);
      let created;

      try {
        created = await newDirectory.create();
      } catch (e) {
        atom.notifications.addError(`Could not create directory '${basename}': ${e.toString()}`);
        onDidConfirm(null);
        return;
      }

      if (!created) {
        atom.notifications.addError(`'${basename}' already exists.`);
        onDidConfirm(null);
      } else {
        onDidConfirm(newDirectory.getPath());
      }
    });
  }

  openAddFileDialog(onDidConfirm) {
    const node = getSelectedContainerNode(this._store);

    if (!node) {
      return;
    }

    return openAddFileDialogImpl(node, node.localPath, node.uri, onDidConfirm);
  }

  openAddFileDialogRelative(onDidConfirm) {
    const editor = atom.workspace.getActiveTextEditor();
    const filePath = editor != null ? editor.getPath() : null; // flowlint-next-line sketchy-null-string:off

    if (!filePath) {
      return;
    }

    const dirPath = _FileTreeHelpers().default.getParentKey(filePath);

    const rootNode = Selectors().getRootForPath(this._store, dirPath);

    if (rootNode) {
      const localPath = _nuclideUri().default.isRemote(dirPath) ? _nuclideUri().default.parse(dirPath).path : dirPath;
      return openAddFileDialogImpl(rootNode, _FileTreeHelpers().default.keyToPath(localPath), dirPath, onDidConfirm);
    }
  }

  openRenameDialog() {
    const targetNodes = Selectors().getTargetNodes(this._store);

    if (targetNodes.size !== 1) {
      // Can only rename one entry at a time.
      return;
    }

    const node = targetNodes.first();

    if (!(node != null)) {
      throw new Error("Invariant violation: \"node != null\"");
    }

    const nodePath = node.localPath;
    (0, _FileActionModal().openDialog)({
      iconClassName: 'icon-arrow-right',
      initialValue: _nuclideUri().default.basename(nodePath),
      message: node.isContainer ? React.createElement("span", null, "Enter the new path for the directory.") : React.createElement("span", null, "Enter the new path for the file."),
      onConfirm: (newBasename, options) => {
        renameNode(node, nodePath, newBasename).catch(error => {
          atom.notifications.addError(`Rename to ${newBasename} failed: ${error.message}`);
        });
      },
      onClose: _FileActionModal().closeDialog,
      selectBasename: true
    });
  }

  openDuplicateDialog(onDidConfirm) {
    const targetNodes = Selectors().getTargetNodes(this._store);
    this.openNextDuplicateDialog(targetNodes, onDidConfirm);
  }

  openNextDuplicateDialog(nodes, onDidConfirm) {
    const node = nodes.first();

    if (!(node != null)) {
      throw new Error("Invariant violation: \"node != null\"");
    }

    const nodePath = (0, _nullthrows().default)(node).localPath;

    let initialValue = _nuclideUri().default.basename(nodePath);

    const ext = _nuclideUri().default.extname(nodePath);

    initialValue = initialValue.substr(0, initialValue.length - ext.length) + '-copy' + ext;

    const hgRepository = _FileTreeHgHelpers().default.getHgRepositoryForNode(node);

    const additionalOptions = {}; // eslint-disable-next-line eqeqeq

    if (hgRepository !== null) {
      additionalOptions.addToVCS = 'Add the new file to version control.';
    }

    const dialogProps = {
      iconClassName: 'icon-arrow-right',
      initialValue,
      message: React.createElement("span", null, "Enter the new path for the duplicate."),
      onConfirm: (newBasename, options) => {
        const file = _FileTreeHelpers().default.getFileByKey(node.uri);

        if (file == null) {
          // TODO: Connection could have been lost for remote file.
          return;
        }

        duplicate(file, newBasename.trim(), Boolean(options.addToVCS), onDidConfirm).catch(error => {
          atom.notifications.addError(`Failed to duplicate '${file.getPath()}'`);
        });
      },
      onClose: () => {
        if (nodes.rest().count() > 0) {
          this.openNextDuplicateDialog(nodes.rest(), onDidConfirm);
        } else {
          (0, _FileActionModal().closeDialog)();
        }
      },
      selectBasename: true,
      additionalOptions
    };
    (0, _FileActionModal().openDialog)(dialogProps);
  }

  openPasteDialog() {
    const node = Selectors().getSingleSelectedNode(this._store);

    if (node == null) {
      // don't paste if unselected
      return;
    }

    let newPath = _FileTreeHelpers().default.getDirectoryByKey(node.uri);

    if (newPath == null) {
      // maybe it's a file?
      const file = _FileTreeHelpers().default.getFileByKey(node.uri);

      if (file == null) {
        // nope! do nothing if we can't find an entry
        return;
      }

      newPath = file.getParent();
    }

    const additionalOptions = {}; // eslint-disable-next-line eqeqeq

    if (_FileTreeHgHelpers().default.getHgRepositoryForNode(node) !== null) {
      additionalOptions.addToVCS = 'Add the new file(s) to version control.';
    }

    (0, _FileActionModal().openDialog)(Object.assign({
      iconClassName: 'icon-arrow-right'
    }, getPasteDialogProps(newPath), {
      onConfirm: (pasteDirPath, options) => {
        paste(pasteDirPath.trim(), Boolean(options.addToVCS)).catch(error => {
          atom.notifications.addError(`Failed to paste into '${pasteDirPath}': ${error}`);
        });
      },
      onClose: _FileActionModal().closeDialog,
      additionalOptions
    }));
  } // This is really weird. Eventually (when we switch to redux-observable) this won't be necessary
  // because subscriptions will be handled by the epics.


  dispose() {
    this._disposables.dispose();
  }

}
/**
 * A flow-friendly way of filtering out null keys.
 */


exports.default = FileTreeActions;

function omitNullKeys(map) {
  return map.filter((v, k) => k != null);
}

async function renameNode(node, nodePath, newBasename) {
  /*
   * Use `resolve` to strip trailing slashes because renaming a file to a name with a
   * trailing slash is an error.
   */
  let newPath = _nuclideUri().default.resolve( // Trim leading and trailing whitespace to prevent bad filenames.
  _nuclideUri().default.join(_nuclideUri().default.dirname(nodePath), newBasename.trim())); // Create a remote nuclide uri when the node being moved is remote.


  if (_nuclideUri().default.isRemote(node.uri)) {
    newPath = _nuclideUri().default.createRemoteUri(_nuclideUri().default.getHostname(node.uri), newPath);
  }

  await _FileTreeHgHelpers().default.renameNode(node, newPath);
}

async function duplicate(file, newBasename, addToVCS, onDidConfirm) {
  const directory = file.getParent();
  const newFile = directory.getFile(newBasename);
  return copy([{
    old: file.getPath(),
    new: newFile.getPath()
  }], addToVCS, onDidConfirm);
}

async function copy(copyPaths, addToVCS, onDidConfirm) {
  const copiedPaths = await Promise.all(copyPaths.filter(({
    old: oldPath,
    new: newPath
  }) => _nuclideUri().default.getHostnameOpt(oldPath) === _nuclideUri().default.getHostnameOpt(newPath)).map(async ({
    old: oldPath,
    new: newPath
  }) => {
    const service = (0, _nuclideRemoteConnection().getFileSystemServiceByNuclideUri)(newPath);
    const isFile = (await service.stat(oldPath)).isFile();
    const exists = isFile ? !(await service.copy(oldPath, newPath)) : !(await service.copyDir(oldPath, newPath));

    if (exists) {
      atom.notifications.addError(`'${newPath}' already exists.`);
      return [];
    } else {
      return [newPath];
    }
  }));
  const successfulPaths = [].concat(...copiedPaths);
  onDidConfirm(successfulPaths);

  if (successfulPaths.length !== 0) {
    const hgRepository = getHgRepositoryForPath(successfulPaths[0]);

    if (hgRepository != null && addToVCS) {
      try {
        // We are not recording the copy in mercurial on purpose, because most of the time
        // it's either templates or files that have greatly changed since duplicating.
        await hgRepository.addAll(successfulPaths);
      } catch (e) {
        const message = 'Paths were duplicated, but there was an error adding them to ' + 'version control.  Error: ' + e.toString();
        atom.notifications.addError(message);
        return;
      }
    }
  }
}

function getHgRepositoryForPath(filePath) {
  const repository = (0, _nuclideVcsBase().repositoryForPath)(filePath);

  if (repository != null && repository.getType() === 'hg') {
    return repository;
  }

  return null;
}

async function paste(newPath, addToVCS, onDidConfirm = () => {}) {
  const copyPaths = [];
  const cb = atom.clipboard.readWithMetadata();
  const oldDir = getDirectoryFromMetadata(cb.metadata);

  if (oldDir == null) {
    // bad source
    return;
  }

  const filenames = cb.text.split(',');

  const newFile = _FileTreeHelpers().default.getFileByKey(newPath);

  const newDir = _FileTreeHelpers().default.getDirectoryByKey(newPath);

  if (newFile == null && newDir == null) {
    // newPath doesn't resolve to a file or path
    atom.notifications.addError('Invalid target');
    return;
  } else if (filenames.length === 1) {
    const origFilePath = oldDir.getFile(cb.text).getPath();

    if (newFile != null) {
      // single file on clibboard; Path resolves to a file.
      // => copy old file into new file
      const destFilePath = newFile.getPath();
      copyPaths.push({
        old: origFilePath,
        new: destFilePath
      });
    } else if (newDir != null) {
      // single file on clibboard; Path resolves to a folder.
      // => copy old file into new newDir folder
      const destFilePath = newDir.getFile(cb.text).getPath();
      copyPaths.push({
        old: origFilePath,
        new: destFilePath
      });
    }
  } else {
    // multiple files in cb
    if (newDir == null) {
      atom.notifications.addError('Cannot rename when pasting multiple files');
      return;
    }

    filenames.forEach(encodedFilename => {
      const filename = decodeURIComponent(encodedFilename);
      const origFilePath = oldDir.getFile(filename).getPath();
      const destFilePath = newDir.getFile(filename).getPath();
      copyPaths.push({
        old: origFilePath,
        new: destFilePath
      });
    });
  }

  await copy(copyPaths, addToVCS, onDidConfirm);
}

function getDirectoryFromMetadata(cbMeta) {
  if (cbMeta == null || typeof cbMeta !== 'object' || cbMeta.directory == null || typeof cbMeta.directory !== 'string') {
    return null;
  }

  return _FileTreeHelpers().default.getDirectoryByKey(cbMeta.directory);
}

function openAddDialog(entryType, path, onConfirm, additionalOptions = {}) {
  (0, _FileActionModal().openDialog)({
    iconClassName: 'icon-file-add',
    message: React.createElement("span", null, "Enter the path for the new ", entryType, " in the root:", React.createElement("br", null), path),
    onConfirm,
    onClose: _FileActionModal().closeDialog,
    additionalOptions
  });
}

function openAddFileDialogImpl(rootNode, localPath, filePath, onDidConfirm) {
  const hgRepository = _FileTreeHgHelpers().default.getHgRepositoryForNode(rootNode);

  const additionalOptions = {};

  if (hgRepository != null) {
    additionalOptions.addToVCS = 'Add the new file to version control.';
  }

  openAddDialog('file', _nuclideUri().default.ensureTrailingSeparator(localPath), async (pathToCreate, options) => {
    // Prevent submission of a blank field from creating a file.
    if (pathToCreate === '') {
      return;
    } // TODO: check if pathToCreate is in rootKey and if not, find the rootKey it belongs to.


    const directory = _FileTreeHelpers().default.getDirectoryByKey(filePath);

    if (directory == null) {
      return;
    }

    const newFile = directory.getFile(pathToCreate);
    let created;

    try {
      created = await newFile.create();
    } catch (e) {
      atom.notifications.addError(`Could not create file '${newFile.getPath()}': ${e.toString()}`);
      onDidConfirm(null);
      return;
    }

    if (!created) {
      atom.notifications.addError(`'${pathToCreate}' already exists.`);
      onDidConfirm(null);
      return;
    }

    const newFilePath = newFile.getPath(); // Open a new text editor while VCS actions complete in the background.

    onDidConfirm(newFilePath);

    if (hgRepository != null && options.addToVCS === true) {
      try {
        await hgRepository.addAll([newFilePath]);
      } catch (e) {
        atom.notifications.addError(`Failed to add '${newFilePath}' to version control. Error: ${e.toString()}`);
      }
    }
  }, additionalOptions);
} // provide appropriate UI feedback depending on whether user
// has single or multiple files in the clipboard


function getPasteDialogProps(path) {
  const cb = atom.clipboard.readWithMetadata();
  const filenames = cb.text.split(',');

  if (filenames.length === 1) {
    return {
      initialValue: path.getFile(cb.text).getPath(),
      message: React.createElement("span", null, "Paste file from clipboard into")
    };
  } else {
    return {
      initialValue: _FileTreeHelpers().default.dirPathToKey(path.getPath()),
      message: React.createElement("span", null, "Paste files from clipboard into the following folder")
    };
  }
}

function getSelectedContainerNode(store) {
  /*
   * TODO: Choosing the last selected key is inexact when there is more than 1 root. The Set of
   * selected keys should be maintained as a flat list across all roots to maintain insertion
   * order.
   */
  const node = Selectors().getSelectedNodes(store).first();

  if (node) {
    return node.isContainer ? node : node.parent;
  }

  return null;
}