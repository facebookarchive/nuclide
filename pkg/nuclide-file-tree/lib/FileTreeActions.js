var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _FileTreeConstants2;

function _FileTreeConstants() {
  return _FileTreeConstants2 = require('./FileTreeConstants');
}

var _commonsNodeDebounce2;

function _commonsNodeDebounce() {
  return _commonsNodeDebounce2 = _interopRequireDefault(require('../../commons-node/debounce'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _FileTreeDispatcher2;

function _FileTreeDispatcher() {
  return _FileTreeDispatcher2 = _interopRequireDefault(require('./FileTreeDispatcher'));
}

var _FileTreeHelpers2;

function _FileTreeHelpers() {
  return _FileTreeHelpers2 = _interopRequireDefault(require('./FileTreeHelpers'));
}

var _FileTreeStore2;

function _FileTreeStore() {
  return _FileTreeStore2 = require('./FileTreeStore');
}

var _immutable2;

function _immutable() {
  return _immutable2 = _interopRequireDefault(require('immutable'));
}

var _semver2;

function _semver() {
  return _semver2 = _interopRequireDefault(require('semver'));
}

var _nuclideHgGitBridge2;

function _nuclideHgGitBridge() {
  return _nuclideHgGitBridge2 = require('../../nuclide-hg-git-bridge');
}

var _nuclideHgRepositoryBase2;

function _nuclideHgRepositoryBase() {
  return _nuclideHgRepositoryBase2 = require('../../nuclide-hg-repository-base');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
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

    this._dispatcher = (_FileTreeDispatcher2 || _FileTreeDispatcher()).default.getInstance();
    this._store = (_FileTreeStore2 || _FileTreeStore()).FileTreeStore.getInstance();
    this._subscriptionForRepository = new (_immutable2 || _immutable()).default.Map();
  }

  _createClass(FileTreeActions, [{
    key: 'setCwd',
    value: function setCwd(rootKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_CWD,
        rootKey: rootKey
      });
    }
  }, {
    key: 'setRootKeys',
    value: function setRootKeys(rootKeys) {
      var existingRootKeySet = new (_immutable2 || _immutable()).default.Set(this._store.getRootKeys());
      var addedRootKeys = new (_immutable2 || _immutable()).default.Set(rootKeys).subtract(existingRootKeySet);
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_ROOT_KEYS,
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
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.CLEAR_FILTER
      });
    }
  }, {
    key: 'expandNode',
    value: function expandNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.EXPAND_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'expandNodeDeep',
    value: function expandNodeDeep(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.EXPAND_NODE_DEEP,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'deleteSelectedNodes',
    value: function deleteSelectedNodes() {
      this._dispatcher.dispatch({ actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.DELETE_SELECTED_NODES });
    }

    // Makes sure a specific child exists for a given node. If it does not exist, temporarily
    // create it and initiate a fetch. This feature is exclusively for expanding to a node deep
    // in a tree.
  }, {
    key: 'ensureChildNode',
    value: function ensureChildNode(nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.ENSURE_CHILD_NODE,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'collapseNode',
    value: function collapseNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.COLLAPSE_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'collapseNodeDeep',
    value: function collapseNodeDeep(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.COLLAPSE_NODE_DEEP,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'setExcludeVcsIgnoredPaths',
    value: function setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_EXCLUDE_VCS_IGNORED_PATHS,
        excludeVcsIgnoredPaths: excludeVcsIgnoredPaths
      });
    }
  }, {
    key: 'setHideIgnoredNames',
    value: function setHideIgnoredNames(hideIgnoredNames) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_HIDE_IGNORED_NAMES,
        hideIgnoredNames: hideIgnoredNames
      });
    }
  }, {
    key: 'setIgnoredNames',
    value: function setIgnoredNames(ignoredNames) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_IGNORED_NAMES,
        ignoredNames: ignoredNames
      });
    }
  }, {
    key: 'setTrackedNode',
    value: function setTrackedNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_TRACKED_NODE,
        nodeKey: nodeKey,
        rootKey: rootKey
      });
    }
  }, {
    key: 'moveToNode',
    value: function moveToNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.MOVE_TO_NODE,
        nodeKey: nodeKey,
        rootKey: rootKey
      });
    }
  }, {
    key: 'setUsePreviewTabs',
    value: function setUsePreviewTabs(usePreviewTabs) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_USE_PREVIEW_TABS,
        usePreviewTabs: usePreviewTabs
      });
    }
  }, {
    key: 'setUsePrefixNav',
    value: function setUsePrefixNav(usePrefixNav) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_USE_PREFIX_NAV,
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
        var actionType = node.isExpanded ? (_FileTreeConstants2 || _FileTreeConstants()).ActionType.COLLAPSE_NODE : (_FileTreeConstants2 || _FileTreeConstants()).ActionType.EXPAND_NODE;
        this._dispatcher.dispatch({
          actionType: actionType,
          nodeKey: nodeKey,
          rootKey: rootKey
        });
      } else {
        var openOptions = {
          activatePane: true,
          searchAllPanes: true
        };
        // TODO: Make the following the default once Nuclide only supports Atom v1.6.0+
        if ((_semver2 || _semver()).default.gte(atom.getVersion(), '1.6.0')) {
          openOptions = _extends({}, openOptions, { pending: true });
        }
        atom.workspace.open((_FileTreeHelpers2 || _FileTreeHelpers()).default.keyToPath(nodeKey), openOptions);
      }
    }
  }, {
    key: 'keepPreviewTab',
    value: function keepPreviewTab() {
      // TODO: Make the following the default once Nuclide only supports Atom v1.6.0+
      if ((_semver2 || _semver()).default.gte(atom.getVersion(), '1.6.0')) {
        var activePane = atom.workspace.getActivePane();
        if (activePane != null) {
          activePane.clearPendingItem();
        }
      } else {
        var activePaneItem = atom.workspace.getActivePaneItem();
        if (activePaneItem != null) {
          atom.commands.dispatch(atom.views.getView(activePaneItem), 'tabs:keep-preview-tab');
        }
      }
    }
  }, {
    key: 'openSelectedEntrySplit',
    value: function openSelectedEntrySplit(nodeKey, orientation, side) {
      var pane = atom.workspace.getActivePane();
      atom.workspace.openURIInPane((_FileTreeHelpers2 || _FileTreeHelpers()).default.keyToPath(nodeKey), pane.split(orientation, side));
    }
  }, {
    key: 'setVcsStatuses',
    value: function setVcsStatuses(rootKey, vcsStatuses) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_VCS_STATUSES,
        rootKey: rootKey,
        vcsStatuses: vcsStatuses
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
        return (_FileTreeHelpers2 || _FileTreeHelpers()).default.dirPathToKey(directory.getPath());
      });
      var rootRepos = yield Promise.all(rootDirectories.map(function (directory) {
        return (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(directory.getPath());
      }));

      // t7114196: Given the current implementation of HgRepositoryClient, each root directory will
      // always correspond to a unique instance of HgRepositoryClient. Ideally, if multiple subfolders
      // of an Hg repo are used as project roots in Atom, only one HgRepositoryClient should be
      // created.

      // Group all of the root keys by their repository, excluding any that don't belong to a
      // repository.
      var rootKeysForRepository = (_immutable2 || _immutable()).default.List(rootKeys).groupBy(function (rootKey, index) {
        return rootRepos[index];
      }).filter(function (v, k) {
        return k != null;
      }).map(function (v) {
        return new (_immutable2 || _immutable()).default.Set(v);
      });

      var prevRepos = this._store.getRepositories();

      // Let the store know we have some new repos!
      var nextRepos = new (_immutable2 || _immutable()).default.Set(rootKeysForRepository.keys());
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_REPOSITORIES,
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
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_WORKING_SET,
        workingSet: workingSet
      });
    }
  }, {
    key: 'updateOpenFilesWorkingSet',
    value: function updateOpenFilesWorkingSet(openFilesWorkingSet) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_OPEN_FILES_WORKING_SET,
        openFilesWorkingSet: openFilesWorkingSet
      });
    }
  }, {
    key: 'updateWorkingSetsStore',
    value: function updateWorkingSetsStore(workingSetsStore) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_WORKING_SETS_STORE,
        workingSetsStore: workingSetsStore
      });
    }
  }, {
    key: 'startEditingWorkingSet',
    value: function startEditingWorkingSet(editedWorkingSet) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.START_EDITING_WORKING_SET,
        editedWorkingSet: editedWorkingSet
      });
    }
  }, {
    key: 'finishEditingWorkingSet',
    value: function finishEditingWorkingSet() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.FINISH_EDITING_WORKING_SET
      });
    }
  }, {
    key: 'checkNode',
    value: function checkNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.CHECK_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'uncheckNode',
    value: function uncheckNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.UNCHECK_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'setDragHoveredNode',
    value: function setDragHoveredNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_DRAG_HOVERED_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'setSelectedNode',
    value: function setSelectedNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_SELECTED_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'setFocusedNode',
    value: function setFocusedNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_FOCUSED_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'addSelectedNode',
    value: function addSelectedNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.ADD_SELECTED_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'unselectNode',
    value: function unselectNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.UNSELECT_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'unhoverNode',
    value: function unhoverNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.UNHOVER_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'moveSelectionUp',
    value: function moveSelectionUp() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.MOVE_SELECTION_UP
      });
    }
  }, {
    key: 'moveSelectionDown',
    value: function moveSelectionDown() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.MOVE_SELECTION_DOWN
      });
    }
  }, {
    key: 'moveSelectionToTop',
    value: function moveSelectionToTop() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.MOVE_SELECTION_TO_TOP
      });
    }
  }, {
    key: 'moveSelectionToBottom',
    value: function moveSelectionToBottom() {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.MOVE_SELECTION_TO_BOTTOM
      });
    }
  }, {
    key: 'setOpenFilesExpanded',
    value: function setOpenFilesExpanded(openFilesExpanded) {
      this._dispatcher.dispatch({
        actionType: (_FileTreeConstants2 || _FileTreeConstants()).ActionType.SET_OPEN_FILES_EXPANDED,
        openFilesExpanded: openFilesExpanded
      });
    }
  }, {
    key: '_repositoryAdded',
    value: _asyncToGenerator(function* (repo, rootKeysForRepository) {
      // We support HgRepositoryClient and GitRepositoryAsync objects.
      if (repo.getType() !== 'hg' && repo.getType() !== 'git' || repo.async == null) {
        return;
      }
      var asyncRepo = repo.async;
      yield asyncRepo.refreshStatus();
      var statusCodeForPath = this._getCachedPathStatuses(repo);

      for (var rootKeyForRepo of rootKeysForRepository.get(repo)) {
        this.setVcsStatuses(rootKeyForRepo, statusCodeForPath);
      }
      // Now that the initial VCS statuses are set, subscribe to changes to the Repository so that the
      // VCS statuses are kept up to date.
      var debouncedChangeStatuses = (0, (_commonsNodeDebounce2 || _commonsNodeDebounce()).default)(this._onDidChangeStatusesForRepository.bind(this, repo, rootKeysForRepository),
      /* wait */1000,
      /* immediate */false);
      // Different repo types emit different events at individual and refresh updates.
      // Hence, the need to debounce and listen to both change types.
      var changeStatusesSubscriptions = new (_atom2 || _atom()).CompositeDisposable();
      changeStatusesSubscriptions.add(asyncRepo.onDidChangeStatuses(debouncedChangeStatuses), asyncRepo.onDidChangeStatus(debouncedChangeStatuses));
      this._subscriptionForRepository = this._subscriptionForRepository.set(repo, changeStatusesSubscriptions);
    })

    /**
     * Fetches a consistent object map from absolute file paths to
     * their corresponding `StatusCodeNumber` for easy representation with the file tree.
     */
  }, {
    key: '_getCachedPathStatuses',
    value: function _getCachedPathStatuses(repo) {
      var asyncRepo = repo.async;
      var statuses = asyncRepo.getCachedPathStatuses();
      var relativeCodePaths = undefined;
      if (asyncRepo.getType() === 'hg') {
        // `hg` already comes from `HgRepositoryClient` in `StatusCodeNumber` format.
        relativeCodePaths = statuses;
      } else {
        relativeCodePaths = {};
        // Transform `git` bit numbers to `StatusCodeNumber` format.

        var StatusCodeNumber = (_nuclideHgRepositoryBase2 || _nuclideHgRepositoryBase()).hgConstants.StatusCodeNumber;

        for (var relativePath in statuses) {
          var gitStatusNumber = statuses[relativePath];
          var statusCode = undefined;
          if (asyncRepo.isStatusNew(gitStatusNumber)) {
            statusCode = StatusCodeNumber.UNTRACKED;
          } else if (asyncRepo.isStatusStaged(gitStatusNumber)) {
            statusCode = StatusCodeNumber.ADDED;
          } else if (asyncRepo.isStatusModified(gitStatusNumber)) {
            statusCode = StatusCodeNumber.MODIFIED;
          } else if (asyncRepo.isStatusIgnored(gitStatusNumber)) {
            statusCode = StatusCodeNumber.IGNORED;
          } else if (asyncRepo.isStatusDeleted(gitStatusNumber)) {
            statusCode = StatusCodeNumber.REMOVED;
          } else {
            (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().warn('Unrecognized git status number ' + gitStatusNumber);
            statusCode = StatusCodeNumber.MODIFIED;
          }
          relativeCodePaths[relativePath] = statusCode;
        }
      }
      var repoRoot = repo.getWorkingDirectory();
      var absoluteCodePaths = {};
      for (var relativePath in relativeCodePaths) {
        var absolutePath = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(repoRoot, relativePath);
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
      disposable.dispose();
    }
  }]);

  return FileTreeActions;
})();

module.exports = FileTreeActions;