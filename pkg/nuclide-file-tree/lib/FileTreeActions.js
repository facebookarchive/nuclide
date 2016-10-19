var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeDebounce;

function _load_commonsNodeDebounce() {
  return _commonsNodeDebounce = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

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

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var instance = undefined;

/**
 * Implements the Flux pattern for our file tree. All state for the file tree will be kept in
 * FileTreeStore and the only way to update the store is through methods on FileTreeActions. The
 * dispatcher is a mechanism through which FileTreeActions interfaces with FileTreeStore.
 */

var FileTreeActions = (function () {
  _createClass(FileTreeActions, null, [{
    key: 'getInstance',
    value: function getInstance() {
      if (!instance) {
        instance = new FileTreeActions();
      }
      return instance;
    }
  }]);

  function FileTreeActions() {
    _classCallCheck(this, FileTreeActions);

    this._dispatcher = (_FileTreeDispatcher || _load_FileTreeDispatcher()).default.getInstance();
    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    this._subscriptionForRepository = new (_immutable || _load_immutable()).default.Map();
  }

  _createClass(FileTreeActions, [{
    key: 'setCwd',
    value: function setCwd(rootKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_CWD,
        rootKey: rootKey
      });
    }
  }, {
    key: 'setRootKeys',
    value: function setRootKeys(rootKeys) {
      var existingRootKeySet = new (_immutable || _load_immutable()).default.Set(this._store.getRootKeys());
      var addedRootKeys = new (_immutable || _load_immutable()).default.Set(rootKeys).subtract(existingRootKeySet);
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_ROOT_KEYS,
        rootKeys: rootKeys
      });
      for (var rootKey of addedRootKeys) {
        this.expandNode(rootKey, rootKey);
      }
    }
  }, {
    key: 'clearFilter',
    value: function clearFilter() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.CLEAR_FILTER
      });
    }
  }, {
    key: 'expandNode',
    value: function expandNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.EXPAND_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'expandNodeDeep',
    value: function expandNodeDeep(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.EXPAND_NODE_DEEP,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'deleteSelectedNodes',
    value: function deleteSelectedNodes() {
      this._dispatcher.dispatch({ actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.DELETE_SELECTED_NODES });
    }

    // Makes sure a specific child exists for a given node. If it does not exist, temporarily
    // create it and initiate a fetch. This feature is exclusively for expanding to a node deep
    // in a tree.
  }, {
    key: 'ensureChildNode',
    value: function ensureChildNode(nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.ENSURE_CHILD_NODE,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'collapseNode',
    value: function collapseNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.COLLAPSE_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'collapseNodeDeep',
    value: function collapseNodeDeep(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.COLLAPSE_NODE_DEEP,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'setExcludeVcsIgnoredPaths',
    value: function setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_EXCLUDE_VCS_IGNORED_PATHS,
        excludeVcsIgnoredPaths: excludeVcsIgnoredPaths
      });
    }
  }, {
    key: 'setHideIgnoredNames',
    value: function setHideIgnoredNames(hideIgnoredNames) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_HIDE_IGNORED_NAMES,
        hideIgnoredNames: hideIgnoredNames
      });
    }
  }, {
    key: 'setIgnoredNames',
    value: function setIgnoredNames(ignoredNames) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_IGNORED_NAMES,
        ignoredNames: ignoredNames
      });
    }
  }, {
    key: 'setTrackedNode',
    value: function setTrackedNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_TRACKED_NODE,
        nodeKey: nodeKey,
        rootKey: rootKey
      });
    }
  }, {
    key: 'clearTrackedNode',
    value: function clearTrackedNode() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.CLEAR_TRACKED_NODE
      });
    }
  }, {
    key: 'moveToNode',
    value: function moveToNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_TO_NODE,
        nodeKey: nodeKey,
        rootKey: rootKey
      });
    }
  }, {
    key: 'setUsePreviewTabs',
    value: function setUsePreviewTabs(usePreviewTabs) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_USE_PREVIEW_TABS,
        usePreviewTabs: usePreviewTabs
      });
    }
  }, {
    key: 'setUsePrefixNav',
    value: function setUsePrefixNav(usePrefixNav) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_USE_PREFIX_NAV,
        usePrefixNav: usePrefixNav
      });
    }
  }, {
    key: 'confirmNode',
    value: function confirmNode(rootKey, nodeKey) {
      var pending = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var node = this._store.getNode(rootKey, nodeKey);
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
  }, {
    key: 'keepPreviewTab',
    value: function keepPreviewTab() {
      var activePane = atom.workspace.getActivePane();
      if (activePane != null) {
        activePane.clearPendingItem();
      }
    }
  }, {
    key: 'openSelectedEntrySplit',
    value: function openSelectedEntrySplit(nodeKey, orientation, side) {
      var pane = atom.workspace.getActivePane();
      atom.workspace.openURIInPane((_FileTreeHelpers || _load_FileTreeHelpers()).default.keyToPath(nodeKey), pane.split(orientation, side));
    }
  }, {
    key: 'setVcsStatuses',
    value: function setVcsStatuses(rootKey, vcsStatuses) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_VCS_STATUSES,
        rootKey: rootKey,
        vcsStatuses: vcsStatuses
      });
    }
  }, {
    key: 'invalidateRemovedFolder',
    value: function invalidateRemovedFolder() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.INVALIDATE_REMOVED_FOLDER
      });
    }

    /**
     * Updates the root repositories to match the provided directories.
     */
  }, {
    key: 'updateRepositories',
    value: _asyncToGenerator(function* (rootDirectories) {
      var _this = this;

      var rootKeys = rootDirectories.map(function (directory) {
        return (_FileTreeHelpers || _load_FileTreeHelpers()).default.dirPathToKey(directory.getPath());
      });
      var rootRepos = yield Promise.all(rootDirectories.map(function (directory) {
        return (0, (_nuclideHgGitBridge || _load_nuclideHgGitBridge()).repositoryForPath)(directory.getPath());
      }));

      // t7114196: Given the current implementation of HgRepositoryClient, each root directory will
      // always correspond to a unique instance of HgRepositoryClient. Ideally, if multiple subfolders
      // of an Hg repo are used as project roots in Atom, only one HgRepositoryClient should be
      // created.

      // Group all of the root keys by their repository, excluding any that don't belong to a
      // repository.
      var rootKeysForRepository = (_immutable || _load_immutable()).default.List(rootKeys).groupBy(function (rootKey, index) {
        return rootRepos[index];
      }).filter(function (v, k) {
        return k != null;
      }).map(function (v) {
        return new (_immutable || _load_immutable()).default.Set(v);
      });

      var prevRepos = this._store.getRepositories();

      // Let the store know we have some new repos!
      var nextRepos = new (_immutable || _load_immutable()).default.Set(rootKeysForRepository.keys());
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_REPOSITORIES,
        repositories: nextRepos
      });

      var removedRepos = prevRepos.subtract(nextRepos);
      var addedRepos = nextRepos.subtract(prevRepos);

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
    })
  }, {
    key: 'updateWorkingSet',
    value: function updateWorkingSet(workingSet) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_WORKING_SET,
        workingSet: workingSet
      });
    }
  }, {
    key: 'updateOpenFilesWorkingSet',
    value: function updateOpenFilesWorkingSet(openFilesWorkingSet) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_OPEN_FILES_WORKING_SET,
        openFilesWorkingSet: openFilesWorkingSet
      });
    }
  }, {
    key: 'updateWorkingSetsStore',
    value: function updateWorkingSetsStore(workingSetsStore) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_WORKING_SETS_STORE,
        workingSetsStore: workingSetsStore
      });
    }
  }, {
    key: 'startEditingWorkingSet',
    value: function startEditingWorkingSet(editedWorkingSet) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.START_EDITING_WORKING_SET,
        editedWorkingSet: editedWorkingSet
      });
    }
  }, {
    key: 'finishEditingWorkingSet',
    value: function finishEditingWorkingSet() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.FINISH_EDITING_WORKING_SET
      });
    }
  }, {
    key: 'checkNode',
    value: function checkNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.CHECK_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'uncheckNode',
    value: function uncheckNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.UNCHECK_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'setDragHoveredNode',
    value: function setDragHoveredNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_DRAG_HOVERED_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'setSelectedNode',
    value: function setSelectedNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_SELECTED_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'setFocusedNode',
    value: function setFocusedNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_FOCUSED_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'addSelectedNode',
    value: function addSelectedNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.ADD_SELECTED_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'unselectNode',
    value: function unselectNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.UNSELECT_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'rangeSelectToNode',
    value: function rangeSelectToNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.RANGE_SELECT_TO_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'rangeSelectUp',
    value: function rangeSelectUp() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.RANGE_SELECT_UP
      });
    }
  }, {
    key: 'rangeSelectDown',
    value: function rangeSelectDown() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.RANGE_SELECT_DOWN
      });
    }
  }, {
    key: 'unhoverNode',
    value: function unhoverNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.UNHOVER_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'moveSelectionUp',
    value: function moveSelectionUp() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_SELECTION_UP
      });
    }
  }, {
    key: 'moveSelectionDown',
    value: function moveSelectionDown() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_SELECTION_DOWN
      });
    }
  }, {
    key: 'moveSelectionToTop',
    value: function moveSelectionToTop() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_SELECTION_TO_TOP
      });
    }
  }, {
    key: 'moveSelectionToBottom',
    value: function moveSelectionToBottom() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.MOVE_SELECTION_TO_BOTTOM
      });
    }
  }, {
    key: 'setOpenFilesExpanded',
    value: function setOpenFilesExpanded(openFilesExpanded) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_OPEN_FILES_EXPANDED,
        openFilesExpanded: openFilesExpanded
      });
    }
  }, {
    key: 'setUncommittedChangesExpanded',
    value: function setUncommittedChangesExpanded(uncommittedChangesExpanded) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeDispatcher2 || _load_FileTreeDispatcher2()).ActionTypes.SET_UNCOMMITTED_CHANGES_EXPANDED,
        uncommittedChangesExpanded: uncommittedChangesExpanded
      });
    }
  }, {
    key: '_repositoryAdded',
    value: _asyncToGenerator(function* (repo, rootKeysForRepository) {
      // We support HgRepositoryClient and GitRepositoryAsync objects.
      if (repo.getType() !== 'hg' && repo.getType() !== 'git' || repo.isDestroyed()) {
        return;
      }
      var statusCodeForPath = this._getCachedPathStatuses(repo);

      for (var rootKeyForRepo of rootKeysForRepository.get(repo)) {
        this.setVcsStatuses(rootKeyForRepo, statusCodeForPath);
      }
      // Now that the initial VCS statuses are set, subscribe to changes to the Repository so that the
      // VCS statuses are kept up to date.
      var debouncedChangeStatuses = (0, (_commonsNodeDebounce || _load_commonsNodeDebounce()).default)(this._onDidChangeStatusesForRepository.bind(this, repo, rootKeysForRepository),
      /* wait */1000,
      /* immediate */false);
      // Different repo types emit different events at individual and refresh updates.
      // Hence, the need to debounce and listen to both change types.
      var changeStatusesSubscriptions = new (_atom || _load_atom()).CompositeDisposable();
      changeStatusesSubscriptions.add(repo.onDidChangeStatuses(debouncedChangeStatuses), repo.onDidChangeStatus(debouncedChangeStatuses));
      this._subscriptionForRepository = this._subscriptionForRepository.set(repo, changeStatusesSubscriptions);
    })

    /**
     * Fetches a consistent object map from absolute file paths to
     * their corresponding `StatusCodeNumber` for easy representation with the file tree.
     */
  }, {
    key: '_getCachedPathStatuses',
    value: function _getCachedPathStatuses(repo) {
      var relativeCodePaths = undefined;
      if (repo.getType() === 'hg') {
        var hgRepo = repo;
        // `hg` already comes from `HgRepositoryClient` in `StatusCodeNumber` format.
        relativeCodePaths = hgRepo.getCachedPathStatuses();
      } else if (repo.getType() === 'git') {
        var gitRepo = repo;
        var statuses = gitRepo.statuses;

        var internalGitRepo = gitRepo.getRepo();
        relativeCodePaths = {};
        // Transform `git` bit numbers to `StatusCodeNumber` format.

        var StatusCodeNumber = (_nuclideHgRpc || _load_nuclideHgRpc()).hgConstants.StatusCodeNumber;

        for (var relativePath in statuses) {
          var gitStatusNumber = statuses[relativePath];
          var statusCode = undefined;
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
            (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().warn('Unrecognized git status number ' + gitStatusNumber);
            statusCode = StatusCodeNumber.MODIFIED;
          }
          relativeCodePaths[relativePath] = statusCode;
        }
      } else {
        throw new Error('Unsupported repository type: ' + repo.getType());
      }
      var repoRoot = repo.getWorkingDirectory();
      var absoluteCodePaths = {};
      for (var relativePath in relativeCodePaths) {
        var absolutePath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(repoRoot, relativePath);
        absoluteCodePaths[absolutePath] = relativeCodePaths[relativePath];
      }
      return absoluteCodePaths;
    }
  }, {
    key: '_onDidChangeStatusesForRepository',
    value: function _onDidChangeStatusesForRepository(repo, rootKeysForRepository) {
      for (var rootKey of rootKeysForRepository.get(repo)) {
        this.setVcsStatuses(rootKey, this._getCachedPathStatuses(repo));
      }
    }
  }, {
    key: '_repositoryRemoved',
    value: function _repositoryRemoved(repo) {
      var disposable = this._subscriptionForRepository.get(repo);
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
  }]);

  return FileTreeActions;
})();

module.exports = FileTreeActions;