'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _FileTreeDispatcher;

function _load_FileTreeDispatcher() {
  return _FileTreeDispatcher = _interopRequireDefault(require('./FileTreeDispatcher'));
}

var _FileTreeDispatcher2;

function _load_FileTreeDispatcher2() {
  return _FileTreeDispatcher2 = require('./FileTreeDispatcher');
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
  return _immutable = _interopRequireWildcard(require('immutable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../../nuclide-vcs-base');
}

var _nuclideHgRpc;

function _load_nuclideHgRpc() {
  return _nuclideHgRpc = require('../../nuclide-hg-rpc');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _event;

function _load_event() {
  return _event = require('../../../modules/nuclide-commons/event');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _collection;

function _load_collection() {
  return _collection = require('../../../modules/nuclide-commons/collection');
}

var _observable;

function _load_observable() {
  return _observable = require('../../../modules/nuclide-commons/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// $FlowFixMe(>=0.53.0) Flow suppress
let instance;

/**
 * Implements the Flux pattern for our file tree. All state for the file tree will be kept in
 * FileTreeStore and the only way to update the store is through methods on FileTreeActions. The
 * dispatcher is a mechanism through which FileTreeActions interfaces with FileTreeStore.
 */
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

class FileTreeActions {

  static getInstance() {
    if (!instance) {
      instance = new FileTreeActions();
    }
    return instance;
  }

  constructor() {
    this._dispatcher = (_FileTreeDispatcher || _load_FileTreeDispatcher()).default.getInstance();
    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    this._disposableForRepository = (_immutable || _load_immutable()).Map();
  }

  setCwd(rootKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_CWD,
      rootKey
    });
  }

  setRootKeys(rootKeys) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_ROOT_KEYS,
      rootKeys
    });
  }

  clearFilter() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.CLEAR_FILTER
    });
  }

  addExtraProjectSelectionContent(content) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.ADD_EXTRA_PROJECT_SELECTION_CONTENT,
      content
    });
  }

  removeExtraProjectSelectionContent(content) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.REMOVE_EXTRA_PROJECT_SELECTION_CONTENT,
      content
    });
  }

  expandNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.EXPAND_NODE,
      rootKey,
      nodeKey
    });
  }

  expandNodeDeep(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.EXPAND_NODE_DEEP,
      rootKey,
      nodeKey
    });
  }

  deleteSelectedNodes() {
    this._dispatcher.dispatch({ actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.DELETE_SELECTED_NODES });
  }

  // Makes sure a specific child exists for a given node. If it does not exist, temporarily
  // create it and initiate a fetch. This feature is exclusively for expanding to a node deep
  // in a tree.
  ensureChildNode(nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.ENSURE_CHILD_NODE,
      nodeKey
    });
  }

  collapseNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.COLLAPSE_NODE,
      rootKey,
      nodeKey
    });
  }

  collapseNodeDeep(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.COLLAPSE_NODE_DEEP,
      rootKey,
      nodeKey
    });
  }

  setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_EXCLUDE_VCS_IGNORED_PATHS,
      excludeVcsIgnoredPaths
    });
  }

  setHideVcsIgnoredPaths(hideVcsIgnoredPaths) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_HIDE_VCS_IGNORED_PATHS,
      hideVcsIgnoredPaths
    });
  }

  setHideIgnoredNames(hideIgnoredNames) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_HIDE_IGNORED_NAMES,
      hideIgnoredNames
    });
  }

  setIsCalculatingChanges(isCalculatingChanges) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_IS_CALCULATING_CHANGES,
      isCalculatingChanges
    });
  }

  setIgnoredNames(ignoredNames) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_IGNORED_NAMES,
      ignoredNames
    });
  }

  setTrackedNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_TRACKED_NODE,
      nodeKey,
      rootKey
    });
  }

  clearTrackedNode() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.CLEAR_TRACKED_NODE
    });
  }

  clearTrackedNodeIfNotLoading() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.CLEAR_TRACKED_NODE_IF_NOT_LOADING
    });
  }

  startReorderDrag(draggedRootKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.START_REORDER_DRAG,
      draggedRootKey
    });
  }

  endReorderDrag() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.END_REORDER_DRAG
    });
  }

  reorderDragInto(dragTargetNodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.REORDER_DRAG_INTO,
      dragTargetNodeKey
    });
  }

  reorderRoots() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.REORDER_ROOTS
    });
  }

  moveToNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_TO_NODE,
      nodeKey,
      rootKey
    });
  }

  setUsePreviewTabs(usePreviewTabs) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_USE_PREVIEW_TABS,
      usePreviewTabs
    });
  }

  setFocusEditorOnFileSelection(focusEditorOnFileSelection) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_FOCUS_EDITOR_ON_FILE_SELECTION,
      focusEditorOnFileSelection
    });
  }

  setUsePrefixNav(usePrefixNav) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_USE_PREFIX_NAV,
      usePrefixNav
    });
  }

  setAutoExpandSingleChild(autoExpandSingleChild) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_AUTO_EXPAND_SINGLE_CHILD,
      autoExpandSingleChild
    });
  }

  confirmNode(rootKey, nodeKey, pending = false) {
    const node = this._store.getNode(rootKey, nodeKey);
    if (node == null) {
      return;
    }
    if (node.isContainer) {
      if (node.isExpanded) {
        this._dispatcher.dispatch({
          actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.COLLAPSE_NODE,
          nodeKey,
          rootKey
        });
      } else {
        this._dispatcher.dispatch({
          actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.EXPAND_NODE,
          nodeKey,
          rootKey
        });
      }
    } else {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('file-tree-open-file', { uri: nodeKey });
      // goToLocation doesn't support pending panes
      // eslint-disable-next-line nuclide-internal/atom-apis
      atom.workspace.open((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(nodeKey), {
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
    atom.workspace.openURIInPane((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(nodeKey), pane.split(orientation, side));
  }

  setVcsStatuses(rootKey, vcsStatuses) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_VCS_STATUSES,
      rootKey,
      vcsStatuses
    });
  }

  invalidateRemovedFolder() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.INVALIDATE_REMOVED_FOLDER
    });
  }

  /**
   * Updates the root repositories to match the provided directories.
   */
  async updateRepositories(rootDirectories) {
    const rootKeys = rootDirectories.map(directory => (_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey(directory.getPath()));
    // $FlowFixMe
    const rootRepos = await Promise.all(rootDirectories.map(directory => (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(directory.getPath())));

    // t7114196: Given the current implementation of HgRepositoryClient, each root directory will
    // always correspond to a unique instance of HgRepositoryClient. Ideally, if multiple subfolders
    // of an Hg repo are used as project roots in Atom, only one HgRepositoryClient should be
    // created.

    // Group all of the root keys by their repository, excluding any that don't belong to a
    // repository.
    const rootKeysForRepository = (_immutable || _load_immutable()).Map(omitNullKeys((_immutable || _load_immutable()).List(rootKeys).groupBy((rootKey, index) => rootRepos[index])).map(v => (_immutable || _load_immutable()).Set(v)));

    const prevRepos = this._store.getRepositories();

    // Let the store know we have some new repos!
    const nextRepos = (_immutable || _load_immutable()).Set(rootKeysForRepository.keys());
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_REPOSITORIES,
      repositories: nextRepos
    });

    const removedRepos = prevRepos.subtract(nextRepos);
    const addedRepos = nextRepos.subtract(prevRepos);

    // TODO: Rewrite `_repositoryAdded` to return the subscription instead of adding it to a map as
    //       a side effect. The map can be created here with something like
    //       `subscriptions = Immutable.Map(repos).map(this._repositoryAdded)`. Since
    //       `_repositoryAdded` will no longer be about side effects, it should then be renamed.
    //       `_repositoryRemoved` could probably be inlined here. That would leave this function as
    //       the only one doing side-effects.

    // Unsubscribe from removedRepos.
    removedRepos.forEach(repo => this._repositoryRemoved(repo));

    // Create subscriptions for addedRepos.
    addedRepos.forEach(repo => this._repositoryAdded(repo, rootKeysForRepository));
  }

  updateWorkingSet(workingSet) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_WORKING_SET,
      workingSet
    });
  }

  updateOpenFilesWorkingSet(openFilesWorkingSet) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_OPEN_FILES_WORKING_SET,
      openFilesWorkingSet
    });
  }

  updateWorkingSetsStore(workingSetsStore) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_WORKING_SETS_STORE,
      workingSetsStore
    });
  }

  startEditingWorkingSet(editedWorkingSet) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.START_EDITING_WORKING_SET,
      editedWorkingSet
    });
  }

  finishEditingWorkingSet() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.FINISH_EDITING_WORKING_SET
    });
  }

  checkNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.CHECK_NODE,
      rootKey,
      nodeKey
    });
  }

  uncheckNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.UNCHECK_NODE,
      rootKey,
      nodeKey
    });
  }

  setDragHoveredNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_DRAG_HOVERED_NODE,
      rootKey,
      nodeKey
    });
  }

  setSelectedNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_SELECTED_NODE,
      rootKey,
      nodeKey
    });
  }

  setFocusedNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_FOCUSED_NODE,
      rootKey,
      nodeKey
    });
  }

  addSelectedNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.ADD_SELECTED_NODE,
      rootKey,
      nodeKey
    });
  }

  unselectNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.UNSELECT_NODE,
      rootKey,
      nodeKey
    });
  }

  rangeSelectToNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.RANGE_SELECT_TO_NODE,
      rootKey,
      nodeKey
    });
  }

  rangeSelectUp() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.RANGE_SELECT_UP
    });
  }

  rangeSelectDown() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.RANGE_SELECT_DOWN
    });
  }

  unhoverNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.UNHOVER_NODE,
      rootKey,
      nodeKey
    });
  }

  moveSelectionUp() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_SELECTION_UP
    });
  }

  moveSelectionDown() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_SELECTION_DOWN
    });
  }

  moveSelectionToTop() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_SELECTION_TO_TOP
    });
  }

  moveSelectionToBottom() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_SELECTION_TO_BOTTOM
    });
  }

  setOpenFilesExpanded(openFilesExpanded) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_OPEN_FILES_EXPANDED,
      openFilesExpanded
    });
  }

  setUncommittedChangesExpanded(uncommittedChangesExpanded) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_UNCOMMITTED_CHANGES_EXPANDED,
      uncommittedChangesExpanded
    });
  }

  setFoldersExpanded(foldersExpanded) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_FOLDERS_EXPANDED,
      foldersExpanded
    });
  }

  setTargetNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_TARGET_NODE,
      rootKey,
      nodeKey
    });
  }

  updateGeneratedStatus(filesToCheck) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.UPDATE_GENERATED_STATUS,
      filesToCheck
    });
  }

  async _repositoryAdded(repo, rootKeysForRepository) {
    // We support HgRepositoryClient and GitRepositoryAsync objects.

    // Observe the repository so that the VCS statuses are kept up to date.
    // This observer should fire off an initial value after we subscribe to it,
    let vcsChanges = _rxjsBundlesRxMinJs.Observable.empty();
    let vcsCalculating = _rxjsBundlesRxMinJs.Observable.of(false);

    if (repo.isDestroyed()) {
      // Don't observe anything on a destroyed repo.
    } else if (repo.getType() === 'git') {
      // Different repo types emit different events at individual and refresh updates.
      // Hence, the need to debounce and listen to both change types.
      vcsChanges = _rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(repo.onDidChangeStatus.bind(repo)), (0, (_event || _load_event()).observableFromSubscribeFunction)(repo.onDidChangeStatuses.bind(repo))).let((0, (_observable || _load_observable()).fastDebounce)(1000)).startWith(null).map(() => this._getCachedPathStatusesForGitRepo(repo));
    } else if (repo.getType() === 'hg') {
      // We special-case the HgRepository because it offers up the
      // required observable directly, and because it actually allows us to pick
      const hgRepo = repo;

      const hgChanges = (_FileTreeHelpers || _load_FileTreeHelpers()).default.observeUncommittedChangesKindConfigKey().map(kind => {
        switch (kind) {
          case 'Uncommitted changes':
            return hgRepo.observeUncommittedStatusChanges();
          case 'Head changes':
            return hgRepo.observeHeadStatusChanges();
          case 'Stack changes':
            return hgRepo.observeStackStatusChanges();
          default:
            kind;
            const error = _rxjsBundlesRxMinJs.Observable.throw(new Error('Unrecognized ShowUncommittedChangesKind config'));
            return { statusChanges: error, isCalculatingChanges: error };
        }
      }).share();

      vcsChanges = hgChanges.switchMap(c => c.statusChanges).distinctUntilChanged((_collection || _load_collection()).mapEqual);
      vcsCalculating = hgChanges.switchMap(c => c.isCalculatingChanges);
    }

    const subscription = vcsChanges.subscribe(statusCodeForPath => {
      for (const rootKeyForRepo of (0, (_nullthrows || _load_nullthrows()).default)(rootKeysForRepository.get(repo))) {
        this.setVcsStatuses(rootKeyForRepo, statusCodeForPath);
      }
    });

    const subscriptionCalculating = vcsCalculating.subscribe(isCalculatingChanges => {
      this.setIsCalculatingChanges(isCalculatingChanges);
    });

    this._disposableForRepository = this._disposableForRepository.set(repo, new (_UniversalDisposable || _load_UniversalDisposable()).default(subscription, subscriptionCalculating));
  }

  /**
   * Fetches a consistent object map from absolute file paths to
   * their corresponding `StatusCodeNumber` for easy representation with the file tree.
   */
  _getCachedPathStatusesForGitRepo(repo) {
    const gitRepo = repo;
    const { statuses } = gitRepo;
    const internalGitRepo = gitRepo.getRepo();
    const codePathStatuses = new Map();
    const repoRoot = repo.getWorkingDirectory();
    // Transform `git` bit numbers to `StatusCodeNumber` format.
    const { StatusCodeNumber } = (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants;
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
        (0, (_log4js || _load_log4js()).getLogger)('nuclide-file-tree').warn(`Unrecognized git status number ${gitStatusNumber}`);
        statusCode = StatusCodeNumber.MODIFIED;
      }
      codePathStatuses.set((_nuclideUri || _load_nuclideUri()).default.join(repoRoot, relativePath), statusCode);
    }

    return codePathStatuses;
  }

  _repositoryRemoved(repo) {
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
  }
}

exports.default = FileTreeActions; /**
                                    * A flow-friendly way of filtering out null keys.
                                    */

function omitNullKeys(map) {
  return map.filter((v, k) => k != null);
}