var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _FileTreeConstants = require('./FileTreeConstants');

var _commons = require('../../commons');

var _atom = require('atom');

var _FileTreeDispatcher = require('./FileTreeDispatcher');

var _FileTreeDispatcher2 = _interopRequireDefault(_FileTreeDispatcher);

var _FileTreeHelpers = require('./FileTreeHelpers');

var _FileTreeHelpers2 = _interopRequireDefault(_FileTreeHelpers);

var _FileTreeStore = require('./FileTreeStore');

var _FileTreeStore2 = _interopRequireDefault(_FileTreeStore);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _hgGitBridge = require('../../hg-git-bridge');

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

    this._dispatcher = _FileTreeDispatcher2['default'].getInstance();
    this._store = _FileTreeStore2['default'].getInstance();
    this._subscriptionForRepository = new _immutable2['default'].Map();
  }

  _createClass(FileTreeActions, [{
    key: 'setRootKeys',
    value: function setRootKeys(rootKeys) {
      var existingRootKeySet = new _immutable2['default'].Set(this._store.getRootKeys());
      var addedRootKeys = new _immutable2['default'].Set(rootKeys).subtract(existingRootKeySet);
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_ROOT_KEYS,
        rootKeys: rootKeys
      });
      for (var rootKey of addedRootKeys) {
        this.expandNode(rootKey, rootKey);
      }
    }
  }, {
    key: 'expandNode',
    value: function expandNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.EXPAND_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'expandNodeDeep',
    value: function expandNodeDeep(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.EXPAND_NODE_DEEP,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'deleteSelectedNodes',
    value: function deleteSelectedNodes() {
      this._dispatcher.dispatch({ actionType: _FileTreeConstants.ActionType.DELETE_SELECTED_NODES });
    }

    // Makes sure a specific child exists for a given node. If it does not exist, temporarily
    // create it and initiate a fetch. This feature is exclusively for expanding to a node deep
    // in a tree.
  }, {
    key: 'ensureChildNode',
    value: function ensureChildNode(rootKey, nodeKey, childKey) {
      if (this._store.getChildKeys(rootKey, nodeKey).indexOf(childKey) !== -1) {
        return;
      }
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.CREATE_CHILD,
        rootKey: rootKey,
        nodeKey: nodeKey,
        childKey: childKey
      });
    }
  }, {
    key: 'collapseNode',
    value: function collapseNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.COLLAPSE_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'collapseNodeDeep',
    value: function collapseNodeDeep(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.COLLAPSE_NODE_DEEP,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'toggleSelectNode',
    value: function toggleSelectNode(rootKey, nodeKey) {
      var nodeKeys = this._store.getSelectedKeys(rootKey);
      if (nodeKeys.has(nodeKey)) {
        nodeKeys = nodeKeys['delete'](nodeKey);
      } else {
        nodeKeys = nodeKeys.add(nodeKey);
      }
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_SELECTED_NODES_FOR_ROOT,
        rootKey: rootKey,
        nodeKeys: nodeKeys
      });
    }
  }, {
    key: 'setExcludeVcsIgnoredPaths',
    value: function setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_EXCLUDE_VCS_IGNORED_PATHS,
        excludeVcsIgnoredPaths: excludeVcsIgnoredPaths
      });
    }
  }, {
    key: 'setHideIgnoredNames',
    value: function setHideIgnoredNames(hideIgnoredNames) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_HIDE_IGNORED_NAMES,
        hideIgnoredNames: hideIgnoredNames
      });
    }
  }, {
    key: 'setIgnoredNames',
    value: function setIgnoredNames(ignoredNames) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_IGNORED_NAMES,
        ignoredNames: ignoredNames
      });
    }
  }, {
    key: 'setTrackedNode',
    value: function setTrackedNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_TRACKED_NODE,
        nodeKey: nodeKey,
        rootKey: rootKey
      });
    }
  }, {
    key: 'setUsePreviewTabs',
    value: function setUsePreviewTabs(usePreviewTabs) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_USE_PREVIEW_TABS,
        usePreviewTabs: usePreviewTabs
      });
    }
  }, {
    key: 'setUsePrefixNav',
    value: function setUsePrefixNav(usePrefixNav) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_USE_PREFIX_NAV,
        usePrefixNav: usePrefixNav
      });
    }
  }, {
    key: 'selectSingleNode',
    value: function selectSingleNode(rootKey, nodeKey) {
      var selectedKeysByRoot = {};
      selectedKeysByRoot[rootKey] = new _immutable2['default'].Set([nodeKey]);
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_SELECTED_NODES_FOR_TREE,
        selectedKeysByRoot: selectedKeysByRoot
      });
    }
  }, {
    key: 'confirmNode',
    value: function confirmNode(rootKey, nodeKey) {
      var isDirectory = _FileTreeHelpers2['default'].isDirKey(nodeKey);
      if (isDirectory) {
        var actionType = this._store.isExpanded(rootKey, nodeKey) ? _FileTreeConstants.ActionType.COLLAPSE_NODE : _FileTreeConstants.ActionType.EXPAND_NODE;
        this._dispatcher.dispatch({
          actionType: actionType,
          nodeKey: nodeKey,
          rootKey: rootKey
        });
      } else {
        atom.workspace.open(_FileTreeHelpers2['default'].keyToPath(nodeKey), {
          activatePane: true,
          searchAllPanes: true
        });
      }
    }
  }, {
    key: 'keepPreviewTab',
    value: function keepPreviewTab() {
      var activePaneItem = atom.workspace.getActivePaneItem();
      if (activePaneItem != null) {
        atom.commands.dispatch(atom.views.getView(activePaneItem), 'tabs:keep-preview-tab');
      }
    }
  }, {
    key: 'openSelectedEntrySplit',
    value: function openSelectedEntrySplit(nodeKey, orientation, side) {
      var pane = atom.workspace.getActivePane();
      atom.workspace.openURIInPane(_FileTreeHelpers2['default'].keyToPath(nodeKey), pane.split(orientation, side));
    }
  }, {
    key: 'setVcsStatuses',
    value: function setVcsStatuses(rootKey, vcsStatuses) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_VCS_STATUSES,
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
        return _FileTreeHelpers2['default'].dirPathToKey(directory.getPath());
      });
      var rootRepos = yield Promise.all(rootDirectories.map(function (directory) {
        return (0, _hgGitBridge.repositoryForPath)(directory.getPath());
      }));

      // t7114196: Given the current implementation of HgRepositoryClient, each root directory will
      // always correspond to a unique instance of HgRepositoryClient. Ideally, if multiple subfolders
      // of an Hg repo are used as project roots in Atom, only one HgRepositoryClient should be
      // created.

      // Group all of the root keys by their repository, excluding any that don't belong to a
      // repository.
      var rootKeysForRepository = _immutable2['default'].List(rootKeys).groupBy(function (rootKey, index) {
        return rootRepos[index];
      }).filter(function (v, k) {
        return k != null;
      }).map(function (v) {
        return new _immutable2['default'].Set(v);
      });

      var prevRepos = this._store.getRepositories();

      // Let the store know we have some new repos!
      var nextRepos = new _immutable2['default'].Set(rootKeysForRepository.keys());
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_REPOSITORIES,
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
        actionType: _FileTreeConstants.ActionType.SET_WORKING_SET,
        workingSet: workingSet
      });
    }
  }, {
    key: 'updateOpenFilesWorkingSet',
    value: function updateOpenFilesWorkingSet(openFilesWorkingSet) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_OPEN_FILES_WORKING_SET,
        openFilesWorkingSet: openFilesWorkingSet
      });
    }
  }, {
    key: 'updateWorkingSetsStore',
    value: function updateWorkingSetsStore(workingSetsStore) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_WORKING_SETS_STORE,
        workingSetsStore: workingSetsStore
      });
    }
  }, {
    key: 'startEditingWorkingSet',
    value: function startEditingWorkingSet(editedWorkingSet) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.START_EDITING_WORKING_SET,
        editedWorkingSet: editedWorkingSet
      });
    }
  }, {
    key: 'finishEditingWorkingSet',
    value: function finishEditingWorkingSet() {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.FINISH_EDITING_WORKING_SET
      });
    }
  }, {
    key: 'checkNode',
    value: function checkNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.CHECK_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'uncheckNode',
    value: function uncheckNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.UNCHECK_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: '_repositoryAdded',
    value: _asyncToGenerator(function* (repo, rootKeysForRepository) {
      // For now, we only support HgRepository objects.
      if (repo.getType() !== 'hg') {
        return;
      }

      var hgRepo = repo;

      // At this point, we assume that repo is a Nuclide HgRepositoryClient.

      // First, get the output of `hg status` for the repository.

      var _require = require('../../hg-repository-base');

      var hgConstants = _require.hgConstants;

      // TODO(mbolin): Verify that all of this is set up correctly for remote files.
      var repoRoot = hgRepo.getWorkingDirectory();
      var statusCodeForPath = yield hgRepo.getStatuses([repoRoot], {
        hgStatusOption: hgConstants.HgStatusOption.ONLY_NON_IGNORED
      });

      // From the initial result of `hg status`, record the status code for every file in
      // statusCodeForPath in the statusesToReport map. If the file is modified, also mark every
      // parent directory (up to the repository root) of that file as modified, as well. For now, we
      // mark only new files, but not new directories.
      var statusesToReport = {};
      statusCodeForPath.forEach(function (statusCode, path) {
        if (hgRepo.isStatusModified(statusCode)) {
          statusesToReport[path] = statusCode;

          // For modified files, every parent directory should also be flagged as modified.
          var nodeKey = path;
          var keyForRepoRoot = _FileTreeHelpers2['default'].dirPathToKey(repoRoot);
          do {
            var parentKey = _FileTreeHelpers2['default'].getParentKey(nodeKey);
            if (parentKey == null) {
              break;
            }

            nodeKey = parentKey;
            if (statusesToReport.hasOwnProperty(nodeKey)) {
              // If there is already an entry for this parent file in the statusesToReport map, then
              // there is no reason to continue exploring ancestor directories.
              break;
            } else {
              statusesToReport[nodeKey] = hgConstants.StatusCodeNumber.MODIFIED;
            }
          } while (nodeKey !== keyForRepoRoot);
        } else if (statusCode === hgConstants.StatusCodeNumber.ADDED) {
          statusesToReport[path] = statusCode;
        }
      });
      for (var rootKeyForRepo of rootKeysForRepository.get(hgRepo)) {
        this.setVcsStatuses(rootKeyForRepo, statusesToReport);
      }

      // TODO: Call getStatuses with <visible_nodes, hgConstants.HgStatusOption.ONLY_IGNORED>
      // to determine which nodes in the tree need to be shown as ignored.

      // Now that the initial VCS statuses are set, subscribe to changes to the Repository so that the
      // VCS statuses are kept up to date.
      var subscription = hgRepo.onDidChangeStatuses(
      // t8227570: If the user is a "nervous saver," many onDidChangeStatuses will get fired in
      // succession. We should probably explore debouncing this in HgRepositoryClient itself.
      (0, _commons.debounce)(this._onDidChangeStatusesForRepository.bind(this, hgRepo, rootKeysForRepository),
      /* wait */1000,
      /* immediate */false));

      this._subscriptionForRepository = this._subscriptionForRepository.set(hgRepo, subscription);
    })
  }, {
    key: '_onDidChangeStatusesForRepository',
    value: function _onDidChangeStatusesForRepository(repo, rootKeysForRepository) {
      for (var rootKey of rootKeysForRepository.get(repo)) {
        var statusForNodeKey = {};
        for (var fileTreeNode of this._store.getVisibleNodes(rootKey)) {
          var nodeKey = fileTreeNode.nodeKey;

          statusForNodeKey[nodeKey] = fileTreeNode.isContainer ? repo.getDirectoryStatus(nodeKey) : statusForNodeKey[nodeKey] = repo.getCachedPathStatus(nodeKey);
        }
        this.setVcsStatuses(rootKey, statusForNodeKey);
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

      this._subscriptionForRepository = this._subscriptionForRepository['delete'](repo);
      disposable.dispose();
    }
  }]);

  return FileTreeActions;
})();

module.exports = FileTreeActions;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlQWN0aW9ucy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O2lDQWF5QixxQkFBcUI7O3VCQUN2QixlQUFlOztvQkFDYixNQUFNOztrQ0FDQSxzQkFBc0I7Ozs7K0JBQ3pCLG1CQUFtQjs7Ozs2QkFDckIsaUJBQWlCOzs7O3lCQUNyQixXQUFXOzs7OzJCQUNELHFCQUFxQjs7QUFPckQsSUFBSSxRQUFpQixZQUFBLENBQUM7Ozs7Ozs7O0lBT2hCLGVBQWU7ZUFBZixlQUFlOztXQUtELHVCQUFvQjtBQUNwQyxVQUFJLENBQUMsUUFBUSxFQUFFO0FBQ2IsZ0JBQVEsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO09BQ2xDO0FBQ0QsYUFBTyxRQUFRLENBQUM7S0FDakI7OztBQUVVLFdBWlAsZUFBZSxHQVlMOzBCQVpWLGVBQWU7O0FBYWpCLFFBQUksQ0FBQyxXQUFXLEdBQUcsZ0NBQW1CLFdBQVcsRUFBRSxDQUFDO0FBQ3BELFFBQUksQ0FBQyxNQUFNLEdBQUcsMkJBQWMsV0FBVyxFQUFFLENBQUM7QUFDMUMsUUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksdUJBQVUsR0FBRyxFQUFFLENBQUM7R0FDdkQ7O2VBaEJHLGVBQWU7O1dBa0JSLHFCQUFDLFFBQXVCLEVBQVE7QUFDekMsVUFBTSxrQkFBeUMsR0FBRyxJQUFJLHVCQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7QUFDL0YsVUFBTSxhQUFvQyxHQUN4QyxJQUFJLHVCQUFVLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUMzRCxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLDhCQUFXLGFBQWE7QUFDcEMsZ0JBQVEsRUFBUixRQUFRO09BQ1QsQ0FBQyxDQUFDO0FBQ0gsV0FBSyxJQUFNLE9BQU8sSUFBSSxhQUFhLEVBQUU7QUFDbkMsWUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7T0FDbkM7S0FDRjs7O1dBRVMsb0JBQUMsT0FBZSxFQUFFLE9BQWUsRUFBUTtBQUNqRCxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLDhCQUFXLFdBQVc7QUFDbEMsZUFBTyxFQUFQLE9BQU87QUFDUCxlQUFPLEVBQVAsT0FBTztPQUNSLENBQUMsQ0FBQztLQUNKOzs7V0FFYSx3QkFBQyxPQUFlLEVBQUUsT0FBZSxFQUFRO0FBQ3JELFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsOEJBQVcsZ0JBQWdCO0FBQ3ZDLGVBQU8sRUFBUCxPQUFPO0FBQ1AsZUFBTyxFQUFQLE9BQU87T0FDUixDQUFDLENBQUM7S0FDSjs7O1dBRWtCLCtCQUFTO0FBQzFCLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEVBQUMsVUFBVSxFQUFFLDhCQUFXLHFCQUFxQixFQUFDLENBQUMsQ0FBQztLQUMzRTs7Ozs7OztXQUtjLHlCQUFDLE9BQWUsRUFBRSxPQUFlLEVBQUUsUUFBZ0IsRUFBUTtBQUN4RSxVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDdkUsZUFBTztPQUNSO0FBQ0QsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSw4QkFBVyxZQUFZO0FBQ25DLGVBQU8sRUFBUCxPQUFPO0FBQ1AsZUFBTyxFQUFQLE9BQU87QUFDUCxnQkFBUSxFQUFSLFFBQVE7T0FDVCxDQUFDLENBQUM7S0FDSjs7O1dBRVcsc0JBQUMsT0FBZSxFQUFFLE9BQWUsRUFBUTtBQUNuRCxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLDhCQUFXLGFBQWE7QUFDcEMsZUFBTyxFQUFQLE9BQU87QUFDUCxlQUFPLEVBQVAsT0FBTztPQUNSLENBQUMsQ0FBQztLQUNKOzs7V0FFZSwwQkFBQyxPQUFlLEVBQUUsT0FBZSxFQUFRO0FBQ3ZELFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsOEJBQVcsa0JBQWtCO0FBQ3pDLGVBQU8sRUFBUCxPQUFPO0FBQ1AsZUFBTyxFQUFQLE9BQU87T0FDUixDQUFDLENBQUM7S0FDSjs7O1dBRWUsMEJBQUMsT0FBZSxFQUFFLE9BQWUsRUFBUTtBQUN2RCxVQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNwRCxVQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDekIsZ0JBQVEsR0FBRyxRQUFRLFVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUNyQyxNQUFNO0FBQ0wsZ0JBQVEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ2xDO0FBQ0QsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSw4QkFBVywyQkFBMkI7QUFDbEQsZUFBTyxFQUFQLE9BQU87QUFDUCxnQkFBUSxFQUFSLFFBQVE7T0FDVCxDQUFDLENBQUM7S0FDSjs7O1dBRXdCLG1DQUFDLHNCQUErQixFQUFRO0FBQy9ELFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsOEJBQVcsNkJBQTZCO0FBQ3BELDhCQUFzQixFQUF0QixzQkFBc0I7T0FDdkIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVrQiw2QkFBQyxnQkFBeUIsRUFBUTtBQUNuRCxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLDhCQUFXLHNCQUFzQjtBQUM3Qyx3QkFBZ0IsRUFBaEIsZ0JBQWdCO09BQ2pCLENBQUMsQ0FBQztLQUNKOzs7V0FFYyx5QkFBQyxZQUEyQixFQUFRO0FBQ2pELFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsOEJBQVcsaUJBQWlCO0FBQ3hDLG9CQUFZLEVBQVosWUFBWTtPQUNiLENBQUMsQ0FBQztLQUNKOzs7V0FFYSx3QkFBQyxPQUFlLEVBQUUsT0FBZSxFQUFRO0FBQ3JELFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsOEJBQVcsZ0JBQWdCO0FBQ3ZDLGVBQU8sRUFBUCxPQUFPO0FBQ1AsZUFBTyxFQUFQLE9BQU87T0FDUixDQUFDLENBQUM7S0FDSjs7O1dBRWdCLDJCQUFDLGNBQXVCLEVBQVE7QUFDL0MsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSw4QkFBVyxvQkFBb0I7QUFDM0Msc0JBQWMsRUFBZCxjQUFjO09BQ2YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVjLHlCQUFDLFlBQXFCLEVBQVE7QUFDM0MsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSw4QkFBVyxrQkFBa0I7QUFDekMsb0JBQVksRUFBWixZQUFZO09BQ2IsQ0FBQyxDQUFDO0tBQ0o7OztXQUVlLDBCQUFDLE9BQWUsRUFBRSxPQUFlLEVBQVE7QUFDdkQsVUFBTSxrQkFBa0IsR0FBRyxFQUFFLENBQUM7QUFDOUIsd0JBQWtCLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSx1QkFBVSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0FBQzNELFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsOEJBQVcsMkJBQTJCO0FBQ2xELDBCQUFrQixFQUFsQixrQkFBa0I7T0FDbkIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVVLHFCQUFDLE9BQWUsRUFBRSxPQUFlLEVBQVE7QUFDbEQsVUFBTSxXQUFXLEdBQUcsNkJBQWdCLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUN0RCxVQUFJLFdBQVcsRUFBRTtBQUNmLFlBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FDekQsOEJBQVcsYUFBYSxHQUN4Qiw4QkFBVyxXQUFXLENBQUM7QUFDekIsWUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsb0JBQVUsRUFBRSxVQUFVO0FBQ3RCLGlCQUFPLEVBQVAsT0FBTztBQUNQLGlCQUFPLEVBQVAsT0FBTztTQUNSLENBQUMsQ0FBQztPQUNKLE1BQU07QUFDTCxZQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FDakIsNkJBQWdCLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFDbEM7QUFDRSxzQkFBWSxFQUFFLElBQUk7QUFDbEIsd0JBQWMsRUFBRSxJQUFJO1NBQ3JCLENBQ0YsQ0FBQztPQUNIO0tBQ0Y7OztXQUVhLDBCQUFHO0FBQ2YsVUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0FBQzFELFVBQUksY0FBYyxJQUFJLElBQUksRUFBRTtBQUMxQixZQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO09BQ3JGO0tBQ0Y7OztXQUVxQixnQ0FDcEIsT0FBZSxFQUNmLFdBQXNDLEVBQ3RDLElBQXdCLEVBQ2xCO0FBQ04sVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUM1QyxVQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FDMUIsNkJBQWdCLFNBQVMsQ0FBQyxPQUFPLENBQUMsRUFDbEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQzlCLENBQUM7S0FDSDs7O1dBRWEsd0JBQUMsT0FBZSxFQUFFLFdBQXFDLEVBQVE7QUFDM0UsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSw4QkFBVyxnQkFBZ0I7QUFDdkMsZUFBTyxFQUFQLE9BQU87QUFDUCxtQkFBVyxFQUFYLFdBQVc7T0FDWixDQUFDLENBQUM7S0FDSjs7Ozs7Ozs2QkFLdUIsV0FBQyxlQUFzQyxFQUFpQjs7O0FBQzlFLFVBQU0sUUFBUSxHQUFHLGVBQWUsQ0FBQyxHQUFHLENBQ2xDLFVBQUEsU0FBUztlQUFJLDZCQUFnQixZQUFZLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQUEsQ0FDL0QsQ0FBQztBQUNGLFVBQU0sU0FBa0MsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FDOUUsVUFBQSxTQUFTO2VBQUksb0NBQWtCLFNBQVMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUFBLENBQ3BELENBQUMsQ0FBQzs7Ozs7Ozs7O0FBU0gsVUFBTSxxQkFBcUIsR0FBRyx1QkFBVSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQ25ELE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxLQUFLO2VBQUssU0FBUyxDQUFDLEtBQUssQ0FBQztPQUFBLENBQUMsQ0FDN0MsTUFBTSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7ZUFBSyxDQUFDLElBQUksSUFBSTtPQUFBLENBQUMsQ0FDM0IsR0FBRyxDQUFDLFVBQUEsQ0FBQztlQUFJLElBQUksdUJBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQztPQUFBLENBQUMsQ0FBQzs7QUFFbEMsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQzs7O0FBR2hELFVBQU0sU0FBeUMsR0FDN0MsSUFBSSx1QkFBVSxHQUFHLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUNsRCxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLDhCQUFXLGdCQUFnQjtBQUN2QyxvQkFBWSxFQUFFLFNBQVM7T0FDeEIsQ0FBQyxDQUFDOztBQUVILFVBQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDbkQsVUFBTSxVQUFVLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQzs7Ozs7Ozs7OztBQVdqRCxrQkFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUk7ZUFBSSxNQUFLLGtCQUFrQixDQUFDLElBQUksRUFBRSxxQkFBcUIsQ0FBQztPQUFBLENBQUMsQ0FBQzs7O0FBR25GLGdCQUFVLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtlQUFJLE1BQUssZ0JBQWdCLENBQUMsSUFBSSxFQUFFLHFCQUFxQixDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQ2hGOzs7V0FFZSwwQkFBQyxVQUFzQixFQUFRO0FBQzdDLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsOEJBQVcsZUFBZTtBQUN0QyxrQkFBVSxFQUFWLFVBQVU7T0FDWCxDQUFDLENBQUM7S0FDSjs7O1dBRXdCLG1DQUFDLG1CQUErQixFQUFRO0FBQy9ELFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsOEJBQVcsMEJBQTBCO0FBQ2pELDJCQUFtQixFQUFuQixtQkFBbUI7T0FDcEIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVxQixnQ0FBQyxnQkFBbUMsRUFBUTtBQUNoRSxVQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQztBQUN4QixrQkFBVSxFQUFFLDhCQUFXLHNCQUFzQjtBQUM3Qyx3QkFBZ0IsRUFBaEIsZ0JBQWdCO09BQ2pCLENBQUMsQ0FBQztLQUNKOzs7V0FFcUIsZ0NBQUMsZ0JBQTRCLEVBQVE7QUFDekQsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSw4QkFBVyx5QkFBeUI7QUFDaEQsd0JBQWdCLEVBQWhCLGdCQUFnQjtPQUNqQixDQUFDLENBQUM7S0FDSjs7O1dBRXNCLG1DQUFTO0FBQzlCLFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsOEJBQVcsMEJBQTBCO09BQ2xELENBQUMsQ0FBQztLQUNKOzs7V0FFUSxtQkFBQyxPQUFlLEVBQUUsT0FBZSxFQUFRO0FBQ2hELFVBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDO0FBQ3hCLGtCQUFVLEVBQUUsOEJBQVcsVUFBVTtBQUNqQyxlQUFPLEVBQVAsT0FBTztBQUNQLGVBQU8sRUFBUCxPQUFPO09BQ1IsQ0FBQyxDQUFDO0tBQ0o7OztXQUVVLHFCQUFDLE9BQWUsRUFBRSxPQUFlLEVBQVE7QUFDbEQsVUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUM7QUFDeEIsa0JBQVUsRUFBRSw4QkFBVyxZQUFZO0FBQ25DLGVBQU8sRUFBUCxPQUFPO0FBQ1AsZUFBTyxFQUFQLE9BQU87T0FDUixDQUFDLENBQUM7S0FDSjs7OzZCQUVxQixXQUNwQixJQUFxQixFQUNyQixxQkFBNEUsRUFDN0Q7O0FBRWYsVUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssSUFBSSxFQUFFO0FBQzNCLGVBQU87T0FDUjs7QUFFRCxVQUFNLE1BQU0sR0FBSyxJQUFJLEFBQTJCLENBQUM7Ozs7OztxQkFLM0IsT0FBTyxDQUFDLDBCQUEwQixDQUFDOztVQUFsRCxXQUFXLFlBQVgsV0FBVzs7O0FBRWxCLFVBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzlDLFVBQU0saUJBQWlCLEdBQUcsTUFBTSxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUU7QUFDN0Qsc0JBQWMsRUFBRSxXQUFXLENBQUMsY0FBYyxDQUFDLGdCQUFnQjtPQUM1RCxDQUFDLENBQUM7Ozs7OztBQU1ILFVBQU0sZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO0FBQzVCLHVCQUFpQixDQUFDLE9BQU8sQ0FBQyxVQUFDLFVBQVUsRUFBRSxJQUFJLEVBQUs7QUFDOUMsWUFBSSxNQUFNLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUU7QUFDdkMsMEJBQWdCLENBQUMsSUFBSSxDQUFDLEdBQUcsVUFBVSxDQUFDOzs7QUFHcEMsY0FBSSxPQUFlLEdBQUcsSUFBSSxDQUFDO0FBQzNCLGNBQU0sY0FBYyxHQUFHLDZCQUFnQixZQUFZLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUQsYUFBRztBQUNELGdCQUFNLFNBQVMsR0FBRyw2QkFBZ0IsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3hELGdCQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7QUFDckIsb0JBQU07YUFDUDs7QUFFRCxtQkFBTyxHQUFHLFNBQVMsQ0FBQztBQUNwQixnQkFBSSxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLEVBQUU7OztBQUc1QyxvQkFBTTthQUNQLE1BQU07QUFDTCw4QkFBZ0IsQ0FBQyxPQUFPLENBQUMsR0FBRyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDO2FBQ25FO1dBQ0YsUUFBUSxPQUFPLEtBQUssY0FBYyxFQUFFO1NBQ3RDLE1BQU0sSUFBSSxVQUFVLEtBQUssV0FBVyxDQUFDLGdCQUFnQixDQUFDLEtBQUssRUFBRTtBQUM1RCwwQkFBZ0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUM7U0FDckM7T0FDRixDQUFDLENBQUM7QUFDSCxXQUFLLElBQU0sY0FBYyxJQUFJLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRTtBQUM5RCxZQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO09BQ3ZEOzs7Ozs7O0FBT0QsVUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLG1CQUFtQjs7O0FBRzdDLDZCQUNFLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxxQkFBcUIsQ0FBQztnQkFDckUsSUFBSTtxQkFDQyxLQUFLLENBQ3RCLENBQ0YsQ0FBQzs7QUFFRixVQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7S0FDN0Y7OztXQUVnQywyQ0FDL0IsSUFBd0IsRUFDeEIscUJBQTRFLEVBQ3RFO0FBQ04sV0FBSyxJQUFNLE9BQU8sSUFBSSxxQkFBcUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDckQsWUFBTSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7QUFDNUIsYUFBSyxJQUFNLFlBQVksSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQUMsRUFBRTtjQUN4RCxPQUFPLEdBQUksWUFBWSxDQUF2QixPQUFPOztBQUNkLDBCQUFnQixDQUFDLE9BQU8sQ0FBQyxHQUFHLFlBQVksQ0FBQyxXQUFXLEdBQ2hELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsR0FDaEMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ25FO0FBQ0QsWUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztPQUNoRDtLQUNGOzs7V0FFaUIsNEJBQUMsSUFBcUIsRUFBRTtBQUN4QyxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdELFVBQUksQ0FBQyxVQUFVLEVBQUU7Ozs7QUFJZixlQUFPO09BQ1I7O0FBRUQsVUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQywwQkFBMEIsVUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9FLGdCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdEI7OztTQS9ZRyxlQUFlOzs7QUFtWnJCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IkZpbGVUcmVlQWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcblxuaW1wb3J0IHtBY3Rpb25UeXBlfSBmcm9tICcuL0ZpbGVUcmVlQ29uc3RhbnRzJztcbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBGaWxlVHJlZURpc3BhdGNoZXIgZnJvbSAnLi9GaWxlVHJlZURpc3BhdGNoZXInO1xuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQgRmlsZVRyZWVTdG9yZSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtyZXBvc2l0b3J5Rm9yUGF0aH0gZnJvbSAnLi4vLi4vaGctZ2l0LWJyaWRnZSc7XG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0fSBmcm9tICcuLi8uLi93b3JraW5nLXNldHMnO1xuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXRzU3RvcmV9IGZyb20gJy4uLy4uL3dvcmtpbmctc2V0cy9saWIvV29ya2luZ1NldHNTdG9yZSc7XG5cblxubGV0IGluc3RhbmNlOiA/T2JqZWN0O1xuXG4vKipcbiAqIEltcGxlbWVudHMgdGhlIEZsdXggcGF0dGVybiBmb3Igb3VyIGZpbGUgdHJlZS4gQWxsIHN0YXRlIGZvciB0aGUgZmlsZSB0cmVlIHdpbGwgYmUga2VwdCBpblxuICogRmlsZVRyZWVTdG9yZSBhbmQgdGhlIG9ubHkgd2F5IHRvIHVwZGF0ZSB0aGUgc3RvcmUgaXMgdGhyb3VnaCBtZXRob2RzIG9uIEZpbGVUcmVlQWN0aW9ucy4gVGhlXG4gKiBkaXNwYXRjaGVyIGlzIGEgbWVjaGFuaXNtIHRocm91Z2ggd2hpY2ggRmlsZVRyZWVBY3Rpb25zIGludGVyZmFjZXMgd2l0aCBGaWxlVHJlZVN0b3JlLlxuICovXG5jbGFzcyBGaWxlVHJlZUFjdGlvbnMge1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeTogSW1tdXRhYmxlLk1hcDxhdG9tJFJlcG9zaXRvcnksIERpc3Bvc2FibGU+O1xuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBGaWxlVHJlZUFjdGlvbnMge1xuICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgIGluc3RhbmNlID0gbmV3IEZpbGVUcmVlQWN0aW9ucygpO1xuICAgIH1cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gRmlsZVRyZWVEaXNwYXRjaGVyLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5fc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSA9IG5ldyBJbW11dGFibGUuTWFwKCk7XG4gIH1cblxuICBzZXRSb290S2V5cyhyb290S2V5czogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIGNvbnN0IGV4aXN0aW5nUm9vdEtleVNldDogSW1tdXRhYmxlLlNldDxzdHJpbmc+ID0gbmV3IEltbXV0YWJsZS5TZXQodGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKSk7XG4gICAgY29uc3QgYWRkZWRSb290S2V5czogSW1tdXRhYmxlLlNldDxzdHJpbmc+ID1cbiAgICAgIG5ldyBJbW11dGFibGUuU2V0KHJvb3RLZXlzKS5zdWJ0cmFjdChleGlzdGluZ1Jvb3RLZXlTZXQpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfUk9PVF9LRVlTLFxuICAgICAgcm9vdEtleXMsXG4gICAgfSk7XG4gICAgZm9yIChjb25zdCByb290S2V5IG9mIGFkZGVkUm9vdEtleXMpIHtcbiAgICAgIHRoaXMuZXhwYW5kTm9kZShyb290S2V5LCByb290S2V5KTtcbiAgICB9XG4gIH1cblxuICBleHBhbmROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkVYUEFORF9OT0RFLFxuICAgICAgcm9vdEtleSxcbiAgICAgIG5vZGVLZXksXG4gICAgfSk7XG4gIH1cblxuICBleHBhbmROb2RlRGVlcChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5FWFBBTkRfTk9ERV9ERUVQLFxuICAgICAgcm9vdEtleSxcbiAgICAgIG5vZGVLZXksXG4gICAgfSk7XG4gIH1cblxuICBkZWxldGVTZWxlY3RlZE5vZGVzKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe2FjdGlvblR5cGU6IEFjdGlvblR5cGUuREVMRVRFX1NFTEVDVEVEX05PREVTfSk7XG4gIH1cblxuICAvLyBNYWtlcyBzdXJlIGEgc3BlY2lmaWMgY2hpbGQgZXhpc3RzIGZvciBhIGdpdmVuIG5vZGUuIElmIGl0IGRvZXMgbm90IGV4aXN0LCB0ZW1wb3JhcmlseVxuICAvLyBjcmVhdGUgaXQgYW5kIGluaXRpYXRlIGEgZmV0Y2guIFRoaXMgZmVhdHVyZSBpcyBleGNsdXNpdmVseSBmb3IgZXhwYW5kaW5nIHRvIGEgbm9kZSBkZWVwXG4gIC8vIGluIGEgdHJlZS5cbiAgZW5zdXJlQ2hpbGROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nLCBjaGlsZEtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0b3JlLmdldENoaWxkS2V5cyhyb290S2V5LCBub2RlS2V5KS5pbmRleE9mKGNoaWxkS2V5KSAhPT0gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkNSRUFURV9DSElMRCxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgICAgY2hpbGRLZXksXG4gICAgfSk7XG4gIH1cblxuICBjb2xsYXBzZU5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuQ09MTEFQU0VfTk9ERSxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgY29sbGFwc2VOb2RlRGVlcChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5DT0xMQVBTRV9OT0RFX0RFRVAsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleSxcbiAgICB9KTtcbiAgfVxuXG4gIHRvZ2dsZVNlbGVjdE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBsZXQgbm9kZUtleXMgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZEtleXMocm9vdEtleSk7XG4gICAgaWYgKG5vZGVLZXlzLmhhcyhub2RlS2V5KSkge1xuICAgICAgbm9kZUtleXMgPSBub2RlS2V5cy5kZWxldGUobm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vZGVLZXlzID0gbm9kZUtleXMuYWRkKG5vZGVLZXkpO1xuICAgIH1cbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX1NFTEVDVEVEX05PREVTX0ZPUl9ST09ULFxuICAgICAgcm9vdEtleSxcbiAgICAgIG5vZGVLZXlzLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9FWENMVURFX1ZDU19JR05PUkVEX1BBVEhTLFxuICAgICAgZXhjbHVkZVZjc0lnbm9yZWRQYXRocyxcbiAgICB9KTtcbiAgfVxuXG4gIHNldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfSElERV9JR05PUkVEX05BTUVTLFxuICAgICAgaGlkZUlnbm9yZWROYW1lcyxcbiAgICB9KTtcbiAgfVxuXG4gIHNldElnbm9yZWROYW1lcyhpZ25vcmVkTmFtZXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX0lHTk9SRURfTkFNRVMsXG4gICAgICBpZ25vcmVkTmFtZXMsXG4gICAgfSk7XG4gIH1cblxuICBzZXRUcmFja2VkTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfVFJBQ0tFRF9OT0RFLFxuICAgICAgbm9kZUtleSxcbiAgICAgIHJvb3RLZXksXG4gICAgfSk7XG4gIH1cblxuICBzZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFiczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfVVNFX1BSRVZJRVdfVEFCUyxcbiAgICAgIHVzZVByZXZpZXdUYWJzLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0VXNlUHJlZml4TmF2KHVzZVByZWZpeE5hdjogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfVVNFX1BSRUZJWF9OQVYsXG4gICAgICB1c2VQcmVmaXhOYXYsXG4gICAgfSk7XG4gIH1cblxuICBzZWxlY3RTaW5nbGVOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZWN0ZWRLZXlzQnlSb290ID0ge307XG4gICAgc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RLZXldID0gbmV3IEltbXV0YWJsZS5TZXQoW25vZGVLZXldKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX1NFTEVDVEVEX05PREVTX0ZPUl9UUkVFLFxuICAgICAgc2VsZWN0ZWRLZXlzQnlSb290LFxuICAgIH0pO1xuICB9XG5cbiAgY29uZmlybU5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBpc0RpcmVjdG9yeSA9IEZpbGVUcmVlSGVscGVycy5pc0RpcktleShub2RlS2V5KTtcbiAgICBpZiAoaXNEaXJlY3RvcnkpIHtcbiAgICAgIGNvbnN0IGFjdGlvblR5cGUgPSB0aGlzLl9zdG9yZS5pc0V4cGFuZGVkKHJvb3RLZXksIG5vZGVLZXkpID9cbiAgICAgICAgQWN0aW9uVHlwZS5DT0xMQVBTRV9OT0RFIDpcbiAgICAgICAgQWN0aW9uVHlwZS5FWFBBTkRfTk9ERTtcbiAgICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb25UeXBlOiBhY3Rpb25UeXBlLFxuICAgICAgICBub2RlS2V5LFxuICAgICAgICByb290S2V5LFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oXG4gICAgICAgIEZpbGVUcmVlSGVscGVycy5rZXlUb1BhdGgobm9kZUtleSksXG4gICAgICAgIHtcbiAgICAgICAgICBhY3RpdmF0ZVBhbmU6IHRydWUsXG4gICAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAga2VlcFByZXZpZXdUYWIoKSB7XG4gICAgY29uc3QgYWN0aXZlUGFuZUl0ZW0gPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpO1xuICAgIGlmIChhY3RpdmVQYW5lSXRlbSAhPSBudWxsKSB7XG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhY3RpdmVQYW5lSXRlbSksICd0YWJzOmtlZXAtcHJldmlldy10YWInKTtcbiAgICB9XG4gIH1cblxuICBvcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KFxuICAgIG5vZGVLZXk6IHN0cmluZyxcbiAgICBvcmllbnRhdGlvbjogYXRvbSRQYW5lU3BsaXRPcmllbnRhdGlvbixcbiAgICBzaWRlOiBhdG9tJFBhbmVTcGxpdFNpZGVcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKTtcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lKFxuICAgICAgRmlsZVRyZWVIZWxwZXJzLmtleVRvUGF0aChub2RlS2V5KSxcbiAgICAgIHBhbmUuc3BsaXQob3JpZW50YXRpb24sIHNpZGUpXG4gICAgKTtcbiAgfVxuXG4gIHNldFZjc1N0YXR1c2VzKHJvb3RLZXk6IHN0cmluZywgdmNzU3RhdHVzZXM6IHtbcGF0aDogc3RyaW5nXTogbnVtYmVyfSk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfVkNTX1NUQVRVU0VTLFxuICAgICAgcm9vdEtleSxcbiAgICAgIHZjc1N0YXR1c2VzLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHJvb3QgcmVwb3NpdG9yaWVzIHRvIG1hdGNoIHRoZSBwcm92aWRlZCBkaXJlY3Rvcmllcy5cbiAgICovXG4gIGFzeW5jIHVwZGF0ZVJlcG9zaXRvcmllcyhyb290RGlyZWN0b3JpZXM6IEFycmF5PGF0b20kRGlyZWN0b3J5Pik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJvb3RLZXlzID0gcm9vdERpcmVjdG9yaWVzLm1hcChcbiAgICAgIGRpcmVjdG9yeSA9PiBGaWxlVHJlZUhlbHBlcnMuZGlyUGF0aFRvS2V5KGRpcmVjdG9yeS5nZXRQYXRoKCkpXG4gICAgKTtcbiAgICBjb25zdCByb290UmVwb3M6IEFycmF5PD9hdG9tJFJlcG9zaXRvcnk+ID0gYXdhaXQgUHJvbWlzZS5hbGwocm9vdERpcmVjdG9yaWVzLm1hcChcbiAgICAgIGRpcmVjdG9yeSA9PiByZXBvc2l0b3J5Rm9yUGF0aChkaXJlY3RvcnkuZ2V0UGF0aCgpKVxuICAgICkpO1xuXG4gICAgLy8gdDcxMTQxOTY6IEdpdmVuIHRoZSBjdXJyZW50IGltcGxlbWVudGF0aW9uIG9mIEhnUmVwb3NpdG9yeUNsaWVudCwgZWFjaCByb290IGRpcmVjdG9yeSB3aWxsXG4gICAgLy8gYWx3YXlzIGNvcnJlc3BvbmQgdG8gYSB1bmlxdWUgaW5zdGFuY2Ugb2YgSGdSZXBvc2l0b3J5Q2xpZW50LiBJZGVhbGx5LCBpZiBtdWx0aXBsZSBzdWJmb2xkZXJzXG4gICAgLy8gb2YgYW4gSGcgcmVwbyBhcmUgdXNlZCBhcyBwcm9qZWN0IHJvb3RzIGluIEF0b20sIG9ubHkgb25lIEhnUmVwb3NpdG9yeUNsaWVudCBzaG91bGQgYmVcbiAgICAvLyBjcmVhdGVkLlxuXG4gICAgLy8gR3JvdXAgYWxsIG9mIHRoZSByb290IGtleXMgYnkgdGhlaXIgcmVwb3NpdG9yeSwgZXhjbHVkaW5nIGFueSB0aGF0IGRvbid0IGJlbG9uZyB0byBhXG4gICAgLy8gcmVwb3NpdG9yeS5cbiAgICBjb25zdCByb290S2V5c0ZvclJlcG9zaXRvcnkgPSBJbW11dGFibGUuTGlzdChyb290S2V5cylcbiAgICAgIC5ncm91cEJ5KChyb290S2V5LCBpbmRleCkgPT4gcm9vdFJlcG9zW2luZGV4XSlcbiAgICAgIC5maWx0ZXIoKHYsIGspID0+IGsgIT0gbnVsbClcbiAgICAgIC5tYXAodiA9PiBuZXcgSW1tdXRhYmxlLlNldCh2KSk7XG5cbiAgICBjb25zdCBwcmV2UmVwb3MgPSB0aGlzLl9zdG9yZS5nZXRSZXBvc2l0b3JpZXMoKTtcblxuICAgIC8vIExldCB0aGUgc3RvcmUga25vdyB3ZSBoYXZlIHNvbWUgbmV3IHJlcG9zIVxuICAgIGNvbnN0IG5leHRSZXBvczogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+ID1cbiAgICAgIG5ldyBJbW11dGFibGUuU2V0KHJvb3RLZXlzRm9yUmVwb3NpdG9yeS5rZXlzKCkpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfUkVQT1NJVE9SSUVTLFxuICAgICAgcmVwb3NpdG9yaWVzOiBuZXh0UmVwb3MsXG4gICAgfSk7XG5cbiAgICBjb25zdCByZW1vdmVkUmVwb3MgPSBwcmV2UmVwb3Muc3VidHJhY3QobmV4dFJlcG9zKTtcbiAgICBjb25zdCBhZGRlZFJlcG9zID0gbmV4dFJlcG9zLnN1YnRyYWN0KHByZXZSZXBvcyk7XG5cblxuICAgIC8vIFRPRE86IFJld3JpdGUgYF9yZXBvc2l0b3J5QWRkZWRgIHRvIHJldHVybiB0aGUgc3Vic2NyaXB0aW9uIGluc3RlYWQgb2YgYWRkaW5nIGl0IHRvIGEgbWFwIGFzXG4gICAgLy8gICAgICAgYSBzaWRlIGVmZmVjdC4gVGhlIG1hcCBjYW4gYmUgY3JlYXRlZCBoZXJlIHdpdGggc29tZXRoaW5nIGxpa2VcbiAgICAvLyAgICAgICBgc3Vic2NyaXB0aW9ucyA9IEltbXV0YWJsZS5NYXAocmVwb3MpLm1hcCh0aGlzLl9yZXBvc2l0b3J5QWRkZWQpYC4gU2luY2VcbiAgICAvLyAgICAgICBgX3JlcG9zaXRvcnlBZGRlZGAgd2lsbCBubyBsb25nZXIgYmUgYWJvdXQgc2lkZSBlZmZlY3RzLCBpdCBzaG91bGQgdGhlbiBiZSByZW5hbWVkLlxuICAgIC8vICAgICAgIGBfcmVwb3NpdG9yeVJlbW92ZWRgIGNvdWxkIHByb2JhYmx5IGJlIGlubGluZWQgaGVyZS4gVGhhdCB3b3VsZCBsZWF2ZSB0aGlzIGZ1bmN0aW9uIGFzXG4gICAgLy8gICAgICAgdGhlIG9ubHkgb25lIGRvaW5nIHNpZGUtZWZmZWN0cy5cblxuICAgIC8vIFVuc3Vic2NyaWJlIGZyb20gcmVtb3ZlZFJlcG9zLlxuICAgIHJlbW92ZWRSZXBvcy5mb3JFYWNoKHJlcG8gPT4gdGhpcy5fcmVwb3NpdG9yeVJlbW92ZWQocmVwbywgcm9vdEtleXNGb3JSZXBvc2l0b3J5KSk7XG5cbiAgICAvLyBDcmVhdGUgc3Vic2NyaXB0aW9ucyBmb3IgYWRkZWRSZXBvcy5cbiAgICBhZGRlZFJlcG9zLmZvckVhY2gocmVwbyA9PiB0aGlzLl9yZXBvc2l0b3J5QWRkZWQocmVwbywgcm9vdEtleXNGb3JSZXBvc2l0b3J5KSk7XG4gIH1cblxuICB1cGRhdGVXb3JraW5nU2V0KHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX1dPUktJTkdfU0VULFxuICAgICAgd29ya2luZ1NldCxcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZU9wZW5GaWxlc1dvcmtpbmdTZXQob3BlbkZpbGVzV29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfT1BFTl9GSUxFU19XT1JLSU5HX1NFVCxcbiAgICAgIG9wZW5GaWxlc1dvcmtpbmdTZXQsXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVXb3JraW5nU2V0c1N0b3JlKHdvcmtpbmdTZXRzU3RvcmU6ID9Xb3JraW5nU2V0c1N0b3JlKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9XT1JLSU5HX1NFVFNfU1RPUkUsXG4gICAgICB3b3JraW5nU2V0c1N0b3JlLFxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRFZGl0aW5nV29ya2luZ1NldChlZGl0ZWRXb3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNUQVJUX0VESVRJTkdfV09SS0lOR19TRVQsXG4gICAgICBlZGl0ZWRXb3JraW5nU2V0LFxuICAgIH0pO1xuICB9XG5cbiAgZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkZJTklTSF9FRElUSU5HX1dPUktJTkdfU0VULFxuICAgIH0pO1xuICB9XG5cbiAgY2hlY2tOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkNIRUNLX05PREUsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleSxcbiAgICB9KTtcbiAgfVxuXG4gIHVuY2hlY2tOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlVOQ0hFQ0tfTk9ERSxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX3JlcG9zaXRvcnlBZGRlZChcbiAgICByZXBvOiBhdG9tJFJlcG9zaXRvcnksXG4gICAgcm9vdEtleXNGb3JSZXBvc2l0b3J5OiBJbW11dGFibGUuTWFwPGF0b20kUmVwb3NpdG9yeSwgSW1tdXRhYmxlLlNldDxzdHJpbmc+PixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gRm9yIG5vdywgd2Ugb25seSBzdXBwb3J0IEhnUmVwb3NpdG9yeSBvYmplY3RzLlxuICAgIGlmIChyZXBvLmdldFR5cGUoKSAhPT0gJ2hnJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGhnUmVwbyA9ICgocmVwbzogYW55KTogSGdSZXBvc2l0b3J5Q2xpZW50KTtcblxuICAgIC8vIEF0IHRoaXMgcG9pbnQsIHdlIGFzc3VtZSB0aGF0IHJlcG8gaXMgYSBOdWNsaWRlIEhnUmVwb3NpdG9yeUNsaWVudC5cblxuICAgIC8vIEZpcnN0LCBnZXQgdGhlIG91dHB1dCBvZiBgaGcgc3RhdHVzYCBmb3IgdGhlIHJlcG9zaXRvcnkuXG4gICAgY29uc3Qge2hnQ29uc3RhbnRzfSA9IHJlcXVpcmUoJy4uLy4uL2hnLXJlcG9zaXRvcnktYmFzZScpO1xuICAgIC8vIFRPRE8obWJvbGluKTogVmVyaWZ5IHRoYXQgYWxsIG9mIHRoaXMgaXMgc2V0IHVwIGNvcnJlY3RseSBmb3IgcmVtb3RlIGZpbGVzLlxuICAgIGNvbnN0IHJlcG9Sb290ID0gaGdSZXBvLmdldFdvcmtpbmdEaXJlY3RvcnkoKTtcbiAgICBjb25zdCBzdGF0dXNDb2RlRm9yUGF0aCA9IGF3YWl0IGhnUmVwby5nZXRTdGF0dXNlcyhbcmVwb1Jvb3RdLCB7XG4gICAgICBoZ1N0YXR1c09wdGlvbjogaGdDb25zdGFudHMuSGdTdGF0dXNPcHRpb24uT05MWV9OT05fSUdOT1JFRCxcbiAgICB9KTtcblxuICAgIC8vIEZyb20gdGhlIGluaXRpYWwgcmVzdWx0IG9mIGBoZyBzdGF0dXNgLCByZWNvcmQgdGhlIHN0YXR1cyBjb2RlIGZvciBldmVyeSBmaWxlIGluXG4gICAgLy8gc3RhdHVzQ29kZUZvclBhdGggaW4gdGhlIHN0YXR1c2VzVG9SZXBvcnQgbWFwLiBJZiB0aGUgZmlsZSBpcyBtb2RpZmllZCwgYWxzbyBtYXJrIGV2ZXJ5XG4gICAgLy8gcGFyZW50IGRpcmVjdG9yeSAodXAgdG8gdGhlIHJlcG9zaXRvcnkgcm9vdCkgb2YgdGhhdCBmaWxlIGFzIG1vZGlmaWVkLCBhcyB3ZWxsLiBGb3Igbm93LCB3ZVxuICAgIC8vIG1hcmsgb25seSBuZXcgZmlsZXMsIGJ1dCBub3QgbmV3IGRpcmVjdG9yaWVzLlxuICAgIGNvbnN0IHN0YXR1c2VzVG9SZXBvcnQgPSB7fTtcbiAgICBzdGF0dXNDb2RlRm9yUGF0aC5mb3JFYWNoKChzdGF0dXNDb2RlLCBwYXRoKSA9PiB7XG4gICAgICBpZiAoaGdSZXBvLmlzU3RhdHVzTW9kaWZpZWQoc3RhdHVzQ29kZSkpIHtcbiAgICAgICAgc3RhdHVzZXNUb1JlcG9ydFtwYXRoXSA9IHN0YXR1c0NvZGU7XG5cbiAgICAgICAgLy8gRm9yIG1vZGlmaWVkIGZpbGVzLCBldmVyeSBwYXJlbnQgZGlyZWN0b3J5IHNob3VsZCBhbHNvIGJlIGZsYWdnZWQgYXMgbW9kaWZpZWQuXG4gICAgICAgIGxldCBub2RlS2V5OiBzdHJpbmcgPSBwYXRoO1xuICAgICAgICBjb25zdCBrZXlGb3JSZXBvUm9vdCA9IEZpbGVUcmVlSGVscGVycy5kaXJQYXRoVG9LZXkocmVwb1Jvb3QpO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgY29uc3QgcGFyZW50S2V5ID0gRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShub2RlS2V5KTtcbiAgICAgICAgICBpZiAocGFyZW50S2V5ID09IG51bGwpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG5vZGVLZXkgPSBwYXJlbnRLZXk7XG4gICAgICAgICAgaWYgKHN0YXR1c2VzVG9SZXBvcnQuaGFzT3duUHJvcGVydHkobm9kZUtleSkpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZXJlIGlzIGFscmVhZHkgYW4gZW50cnkgZm9yIHRoaXMgcGFyZW50IGZpbGUgaW4gdGhlIHN0YXR1c2VzVG9SZXBvcnQgbWFwLCB0aGVuXG4gICAgICAgICAgICAvLyB0aGVyZSBpcyBubyByZWFzb24gdG8gY29udGludWUgZXhwbG9yaW5nIGFuY2VzdG9yIGRpcmVjdG9yaWVzLlxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN0YXR1c2VzVG9SZXBvcnRbbm9kZUtleV0gPSBoZ0NvbnN0YW50cy5TdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEO1xuICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAobm9kZUtleSAhPT0ga2V5Rm9yUmVwb1Jvb3QpO1xuICAgICAgfSBlbHNlIGlmIChzdGF0dXNDb2RlID09PSBoZ0NvbnN0YW50cy5TdGF0dXNDb2RlTnVtYmVyLkFEREVEKSB7XG4gICAgICAgIHN0YXR1c2VzVG9SZXBvcnRbcGF0aF0gPSBzdGF0dXNDb2RlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGZvciAoY29uc3Qgcm9vdEtleUZvclJlcG8gb2Ygcm9vdEtleXNGb3JSZXBvc2l0b3J5LmdldChoZ1JlcG8pKSB7XG4gICAgICB0aGlzLnNldFZjc1N0YXR1c2VzKHJvb3RLZXlGb3JSZXBvLCBzdGF0dXNlc1RvUmVwb3J0KTtcbiAgICB9XG5cbiAgICAvLyBUT0RPOiBDYWxsIGdldFN0YXR1c2VzIHdpdGggPHZpc2libGVfbm9kZXMsIGhnQ29uc3RhbnRzLkhnU3RhdHVzT3B0aW9uLk9OTFlfSUdOT1JFRD5cbiAgICAvLyB0byBkZXRlcm1pbmUgd2hpY2ggbm9kZXMgaW4gdGhlIHRyZWUgbmVlZCB0byBiZSBzaG93biBhcyBpZ25vcmVkLlxuXG4gICAgLy8gTm93IHRoYXQgdGhlIGluaXRpYWwgVkNTIHN0YXR1c2VzIGFyZSBzZXQsIHN1YnNjcmliZSB0byBjaGFuZ2VzIHRvIHRoZSBSZXBvc2l0b3J5IHNvIHRoYXQgdGhlXG4gICAgLy8gVkNTIHN0YXR1c2VzIGFyZSBrZXB0IHVwIHRvIGRhdGUuXG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gaGdSZXBvLm9uRGlkQ2hhbmdlU3RhdHVzZXMoXG4gICAgICAvLyB0ODIyNzU3MDogSWYgdGhlIHVzZXIgaXMgYSBcIm5lcnZvdXMgc2F2ZXIsXCIgbWFueSBvbkRpZENoYW5nZVN0YXR1c2VzIHdpbGwgZ2V0IGZpcmVkIGluXG4gICAgICAvLyBzdWNjZXNzaW9uLiBXZSBzaG91bGQgcHJvYmFibHkgZXhwbG9yZSBkZWJvdW5jaW5nIHRoaXMgaW4gSGdSZXBvc2l0b3J5Q2xpZW50IGl0c2VsZi5cbiAgICAgIGRlYm91bmNlKFxuICAgICAgICB0aGlzLl9vbkRpZENoYW5nZVN0YXR1c2VzRm9yUmVwb3NpdG9yeS5iaW5kKHRoaXMsIGhnUmVwbywgcm9vdEtleXNGb3JSZXBvc2l0b3J5KSxcbiAgICAgICAgLyogd2FpdCAqLyAxMDAwLFxuICAgICAgICAvKiBpbW1lZGlhdGUgKi8gZmFsc2UsXG4gICAgICApXG4gICAgKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnkgPSB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5LnNldChoZ1JlcG8sIHN1YnNjcmlwdGlvbik7XG4gIH1cblxuICBfb25EaWRDaGFuZ2VTdGF0dXNlc0ZvclJlcG9zaXRvcnkoXG4gICAgcmVwbzogSGdSZXBvc2l0b3J5Q2xpZW50LFxuICAgIHJvb3RLZXlzRm9yUmVwb3NpdG9yeTogSW1tdXRhYmxlLk1hcDxhdG9tJFJlcG9zaXRvcnksIEltbXV0YWJsZS5TZXQ8c3RyaW5nPj4sXG4gICk6IHZvaWQge1xuICAgIGZvciAoY29uc3Qgcm9vdEtleSBvZiByb290S2V5c0ZvclJlcG9zaXRvcnkuZ2V0KHJlcG8pKSB7XG4gICAgICBjb25zdCBzdGF0dXNGb3JOb2RlS2V5ID0ge307XG4gICAgICBmb3IgKGNvbnN0IGZpbGVUcmVlTm9kZSBvZiB0aGlzLl9zdG9yZS5nZXRWaXNpYmxlTm9kZXMocm9vdEtleSkpIHtcbiAgICAgICAgY29uc3Qge25vZGVLZXl9ID0gZmlsZVRyZWVOb2RlO1xuICAgICAgICBzdGF0dXNGb3JOb2RlS2V5W25vZGVLZXldID0gZmlsZVRyZWVOb2RlLmlzQ29udGFpbmVyXG4gICAgICAgICAgPyByZXBvLmdldERpcmVjdG9yeVN0YXR1cyhub2RlS2V5KVxuICAgICAgICAgIDogc3RhdHVzRm9yTm9kZUtleVtub2RlS2V5XSA9IHJlcG8uZ2V0Q2FjaGVkUGF0aFN0YXR1cyhub2RlS2V5KTtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2V0VmNzU3RhdHVzZXMocm9vdEtleSwgc3RhdHVzRm9yTm9kZUtleSk7XG4gICAgfVxuICB9XG5cbiAgX3JlcG9zaXRvcnlSZW1vdmVkKHJlcG86IGF0b20kUmVwb3NpdG9yeSkge1xuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5LmdldChyZXBvKTtcbiAgICBpZiAoIWRpc3Bvc2FibGUpIHtcbiAgICAgIC8vIFRoZXJlIGlzIGEgc21hbGwgY2hhbmNlIHRoYXQgdGhlIGFkZC9yZW1vdmUgb2YgdGhlIFJlcG9zaXRvcnkgY291bGQgaGFwcGVuIHNvIHF1aWNrbHkgdGhhdFxuICAgICAgLy8gdGhlIGVudHJ5IGZvciB0aGUgcmVwbyBpbiBfc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSBoYXMgbm90IGJlZW4gc2V0IHlldC5cbiAgICAgIC8vIFRPRE86IFJlcG9ydCBhIHNvZnQgZXJyb3IgZm9yIHRoaXMuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSA9IHRoaXMuX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnkuZGVsZXRlKHJlcG8pO1xuICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZUFjdGlvbnM7XG4iXX0=