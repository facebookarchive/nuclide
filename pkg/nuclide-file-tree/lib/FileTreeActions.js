'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _debounce;

function _load_debounce() {
  return _debounce = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _atom = require('atom');

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
  return _immutable = _interopRequireDefault(require('immutable'));
}

var _nuclideHgGitBridge;

function _load_nuclideHgGitBridge() {
  return _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');
}

var _nuclideHgRpc;

function _load_nuclideHgRpc() {
  return _nuclideHgRpc = require('../../nuclide-hg-rpc');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let instance;

/**
 * Implements the Flux pattern for our file tree. All state for the file tree will be kept in
 * FileTreeStore and the only way to update the store is through methods on FileTreeActions. The
 * dispatcher is a mechanism through which FileTreeActions interfaces with FileTreeStore.
 */
let FileTreeActions = class FileTreeActions {

  static getInstance() {
    if (!instance) {
      instance = new FileTreeActions();
    }
    return instance;
  }

  constructor() {
    this._dispatcher = (_FileTreeDispatcher || _load_FileTreeDispatcher()).default.getInstance();
    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    this._subscriptionForRepository = new (_immutable || _load_immutable()).default.Map();
  }

  setCwd(rootKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_CWD,
      rootKey: rootKey
    });
  }

  setRootKeys(rootKeys) {
    const existingRootKeySet = new (_immutable || _load_immutable()).default.Set(this._store.getRootKeys());
    const addedRootKeys = new (_immutable || _load_immutable()).default.Set(rootKeys).subtract(existingRootKeySet);
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_ROOT_KEYS,
      rootKeys: rootKeys
    });
    for (const rootKey of addedRootKeys) {
      this.expandNode(rootKey, rootKey);
    }
  }

  clearFilter() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.CLEAR_FILTER
    });
  }

  expandNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.EXPAND_NODE,
      rootKey: rootKey,
      nodeKey: nodeKey
    });
  }

  expandNodeDeep(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.EXPAND_NODE_DEEP,
      rootKey: rootKey,
      nodeKey: nodeKey
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
      nodeKey: nodeKey
    });
  }

  collapseNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.COLLAPSE_NODE,
      rootKey: rootKey,
      nodeKey: nodeKey
    });
  }

  collapseNodeDeep(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.COLLAPSE_NODE_DEEP,
      rootKey: rootKey,
      nodeKey: nodeKey
    });
  }

  setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_EXCLUDE_VCS_IGNORED_PATHS,
      excludeVcsIgnoredPaths: excludeVcsIgnoredPaths
    });
  }

  setHideIgnoredNames(hideIgnoredNames) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_HIDE_IGNORED_NAMES,
      hideIgnoredNames: hideIgnoredNames
    });
  }

  setIgnoredNames(ignoredNames) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_IGNORED_NAMES,
      ignoredNames: ignoredNames
    });
  }

  setTrackedNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_TRACKED_NODE,
      nodeKey: nodeKey,
      rootKey: rootKey
    });
  }

  clearTrackedNode() {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.CLEAR_TRACKED_NODE
    });
  }

  moveToNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_TO_NODE,
      nodeKey: nodeKey,
      rootKey: rootKey
    });
  }

  setUsePreviewTabs(usePreviewTabs) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_USE_PREVIEW_TABS,
      usePreviewTabs: usePreviewTabs
    });
  }

  setUsePrefixNav(usePrefixNav) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_USE_PREFIX_NAV,
      usePrefixNav: usePrefixNav
    });
  }

  confirmNode(rootKey, nodeKey) {
    let pending = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    const node = this._store.getNode(rootKey, nodeKey);
    if (node == null) {
      return;
    }
    if (node.isContainer) {
      if (node.isExpanded) {
        this._dispatcher.dispatch({
          actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.COLLAPSE_NODE,
          nodeKey: nodeKey,
          rootKey: rootKey
        });
      } else {
        this._dispatcher.dispatch({
          actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.EXPAND_NODE,
          nodeKey: nodeKey,
          rootKey: rootKey
        });
      }
    } else {
      atom.workspace.open((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(nodeKey), {
        activatePane: true,
        searchAllPanes: true,
        pending: true
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
    const pane = atom.workspace.getActivePane();
    atom.workspace.openURIInPane((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(nodeKey), pane.split(orientation, side));
  }

  setVcsStatuses(rootKey, vcsStatuses) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_VCS_STATUSES,
      rootKey: rootKey,
      vcsStatuses: vcsStatuses
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
  updateRepositories(rootDirectories) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const rootKeys = rootDirectories.map(function (directory) {
        return (_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey(directory.getPath());
      });
      const rootRepos = yield Promise.all(rootDirectories.map(function (directory) {
        return (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(directory.getPath());
      }));

      // t7114196: Given the current implementation of HgRepositoryClient, each root directory will
      // always correspond to a unique instance of HgRepositoryClient. Ideally, if multiple subfolders
      // of an Hg repo are used as project roots in Atom, only one HgRepositoryClient should be
      // created.

      // Group all of the root keys by their repository, excluding any that don't belong to a
      // repository.
      const rootKeysForRepository = (_immutable || _load_immutable()).default.List(rootKeys).groupBy(function (rootKey, index) {
        return rootRepos[index];
      }).filter(function (v, k) {
        return k != null;
      }).map(function (v) {
        return new (_immutable || _load_immutable()).default.Set(v);
      });

      const prevRepos = _this._store.getRepositories();

      // Let the store know we have some new repos!
      const nextRepos = new (_immutable || _load_immutable()).default.Set(rootKeysForRepository.keys());
      _this._dispatcher.dispatch({
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
      removedRepos.forEach(function (repo) {
        return _this._repositoryRemoved(repo, rootKeysForRepository);
      });

      // Create subscriptions for addedRepos.
      addedRepos.forEach(function (repo) {
        return _this._repositoryAdded(repo, rootKeysForRepository);
      });
    })();
  }

  updateWorkingSet(workingSet) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_WORKING_SET,
      workingSet: workingSet
    });
  }

  updateOpenFilesWorkingSet(openFilesWorkingSet) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_OPEN_FILES_WORKING_SET,
      openFilesWorkingSet: openFilesWorkingSet
    });
  }

  updateWorkingSetsStore(workingSetsStore) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_WORKING_SETS_STORE,
      workingSetsStore: workingSetsStore
    });
  }

  startEditingWorkingSet(editedWorkingSet) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.START_EDITING_WORKING_SET,
      editedWorkingSet: editedWorkingSet
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
      rootKey: rootKey,
      nodeKey: nodeKey
    });
  }

  uncheckNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.UNCHECK_NODE,
      rootKey: rootKey,
      nodeKey: nodeKey
    });
  }

  setDragHoveredNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_DRAG_HOVERED_NODE,
      rootKey: rootKey,
      nodeKey: nodeKey
    });
  }

  setSelectedNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_SELECTED_NODE,
      rootKey: rootKey,
      nodeKey: nodeKey
    });
  }

  setFocusedNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_FOCUSED_NODE,
      rootKey: rootKey,
      nodeKey: nodeKey
    });
  }

  addSelectedNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.ADD_SELECTED_NODE,
      rootKey: rootKey,
      nodeKey: nodeKey
    });
  }

  unselectNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.UNSELECT_NODE,
      rootKey: rootKey,
      nodeKey: nodeKey
    });
  }

  rangeSelectToNode(rootKey, nodeKey) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.RANGE_SELECT_TO_NODE,
      rootKey: rootKey,
      nodeKey: nodeKey
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
      rootKey: rootKey,
      nodeKey: nodeKey
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
      openFilesExpanded: openFilesExpanded
    });
  }

  setUncommittedChangesExpanded(uncommittedChangesExpanded) {
    this._dispatcher.dispatch({
      actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_UNCOMMITTED_CHANGES_EXPANDED,
      uncommittedChangesExpanded: uncommittedChangesExpanded
    });
  }

  _repositoryAdded(repo, rootKeysForRepository) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // We support HgRepositoryClient and GitRepositoryAsync objects.
      if (repo.getType() !== 'hg' && repo.getType() !== 'git' || repo.isDestroyed()) {
        return;
      }
      const statusCodeForPath = _this2._getCachedPathStatuses(repo);

      for (const rootKeyForRepo of rootKeysForRepository.get(repo)) {
        _this2.setVcsStatuses(rootKeyForRepo, statusCodeForPath);
      }
      // Now that the initial VCS statuses are set, subscribe to changes to the Repository so that the
      // VCS statuses are kept up to date.
      const debouncedChangeStatuses = (0, (_debounce || _load_debounce()).default)(_this2._onDidChangeStatusesForRepository.bind(_this2, repo, rootKeysForRepository),
      /* wait */1000,
      /* immediate */false);
      // Different repo types emit different events at individual and refresh updates.
      // Hence, the need to debounce and listen to both change types.
      const changeStatusesSubscriptions = new _atom.CompositeDisposable();
      changeStatusesSubscriptions.add(repo.onDidChangeStatuses(debouncedChangeStatuses), repo.onDidChangeStatus(debouncedChangeStatuses));
      _this2._subscriptionForRepository = _this2._subscriptionForRepository.set(repo, changeStatusesSubscriptions);
    })();
  }

  /**
   * Fetches a consistent object map from absolute file paths to
   * their corresponding `StatusCodeNumber` for easy representation with the file tree.
   */
  _getCachedPathStatuses(repo) {
    let relativeCodePaths;
    if (repo.getType() === 'hg') {
      const hgRepo = repo;
      // `hg` already comes from `HgRepositoryClient` in `StatusCodeNumber` format.
      relativeCodePaths = hgRepo.getCachedPathStatuses();
    } else if (repo.getType() === 'git') {
      const gitRepo = repo;
      const statuses = gitRepo.statuses;

      const internalGitRepo = gitRepo.getRepo();
      relativeCodePaths = {};
      // Transform `git` bit numbers to `StatusCodeNumber` format.

      const StatusCodeNumber = (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.StatusCodeNumber;

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
          (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn(`Unrecognized git status number ${ gitStatusNumber }`);
          statusCode = StatusCodeNumber.MODIFIED;
        }
        relativeCodePaths[relativePath] = statusCode;
      }
    } else {
      throw new Error(`Unsupported repository type: ${ repo.getType() }`);
    }
    const repoRoot = repo.getWorkingDirectory();
    const absoluteCodePaths = {};
    for (const relativePath in relativeCodePaths) {
      const absolutePath = (_nuclideUri || _load_nuclideUri()).default.join(repoRoot, relativePath);
      absoluteCodePaths[absolutePath] = relativeCodePaths[relativePath];
    }
    return absoluteCodePaths;
  }

  _onDidChangeStatusesForRepository(repo, rootKeysForRepository) {
    for (const rootKey of rootKeysForRepository.get(repo)) {
      this.setVcsStatuses(rootKey, this._getCachedPathStatuses(repo));
    }
  }

  _repositoryRemoved(repo) {
    const disposable = this._subscriptionForRepository.get(repo);
    if (!disposable) {
      // There is a small chance that the add/remove of the Repository could happen so quickly that
      // the entry for the repo in _subscriptionForRepository has not been set yet.
      // TODO: Report a soft error for this.
      return;
    }

    this._subscriptionForRepository = this._subscriptionForRepository.delete(repo);
    this.invalidateRemovedFolder();
    disposable.dispose();
  }

};


module.exports = FileTreeActions;