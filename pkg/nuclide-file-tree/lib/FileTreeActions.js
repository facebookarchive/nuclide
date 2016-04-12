var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _nuclideCommons = require('../../nuclide-commons');

var _atom = require('atom');

var _FileTreeDispatcher = require('./FileTreeDispatcher');

var _FileTreeDispatcher2 = _interopRequireDefault(_FileTreeDispatcher);

var _FileTreeHelpers = require('./FileTreeHelpers');

var _FileTreeHelpers2 = _interopRequireDefault(_FileTreeHelpers);

var _FileTreeStore = require('./FileTreeStore');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _semver = require('semver');

var _semver2 = _interopRequireDefault(_semver);

var _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');

var _nuclideHgRepositoryBase = require('../../nuclide-hg-repository-base');

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
    this._store = _FileTreeStore.FileTreeStore.getInstance();
    this._subscriptionForRepository = new _immutable2['default'].Map();
  }

  _createClass(FileTreeActions, [{
    key: 'setCwd',
    value: function setCwd(rootKey) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_CWD,
        rootKey: rootKey
      });
    }
  }, {
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
    value: function ensureChildNode(nodeKey) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.ENSURE_CHILD_NODE,
        nodeKey: nodeKey
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
    key: 'confirmNode',
    value: function confirmNode(rootKey, nodeKey) {
      var pending = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var node = this._store.getNode(rootKey, nodeKey);
      if (node == null) {
        return;
      }
      if (node.isContainer) {
        var actionType = node.isExpanded ? _FileTreeConstants.ActionType.COLLAPSE_NODE : _FileTreeConstants.ActionType.EXPAND_NODE;
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
        if (_semver2['default'].gte(atom.getVersion(), '1.6.0')) {
          openOptions = _extends({}, openOptions, { pending: true });
        }
        atom.workspace.open(_FileTreeHelpers2['default'].keyToPath(nodeKey), openOptions);
      }
    }
  }, {
    key: 'keepPreviewTab',
    value: function keepPreviewTab() {
      // TODO: Make the following the default once Nuclide only supports Atom v1.6.0+
      if (_semver2['default'].gte(atom.getVersion(), '1.6.0')) {
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
        return (0, _nuclideHgGitBridge.repositoryForPath)(directory.getPath());
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
    key: 'setSelectedNode',
    value: function setSelectedNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.SET_SELECTED_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'addSelectedNode',
    value: function addSelectedNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.ADD_SELECTED_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'unselectNode',
    value: function unselectNode(rootKey, nodeKey) {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.UNSELECT_NODE,
        rootKey: rootKey,
        nodeKey: nodeKey
      });
    }
  }, {
    key: 'moveSelectionUp',
    value: function moveSelectionUp() {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.MOVE_SELECTION_UP
      });
    }
  }, {
    key: 'moveSelectionDown',
    value: function moveSelectionDown() {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.MOVE_SELECTION_DOWN
      });
    }
  }, {
    key: 'moveSelectionToTop',
    value: function moveSelectionToTop() {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.MOVE_SELECTION_TO_TOP
      });
    }
  }, {
    key: 'moveSelectionToBottom',
    value: function moveSelectionToBottom() {
      this._dispatcher.dispatch({
        actionType: _FileTreeConstants.ActionType.MOVE_SELECTION_TO_BOTTOM
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
      // TODO(mbolin): Verify that all of this is set up correctly for remote files.
      var repoRoot = hgRepo.getWorkingDirectory();
      var repoProjects = atom.project.getPaths().filter(function (projPath) {
        return projPath.startsWith(repoRoot);
      });

      var statusCodeForPath = yield hgRepo.getStatuses(repoProjects, {
        hgStatusOption: _nuclideHgRepositoryBase.hgConstants.HgStatusOption.ONLY_NON_IGNORED
      });

      for (var rootKeyForRepo of rootKeysForRepository.get(hgRepo)) {
        this.setVcsStatuses(rootKeyForRepo, statusCodeForPath);
      }

      // Now that the initial VCS statuses are set, subscribe to changes to the Repository so that the
      // VCS statuses are kept up to date.
      var subscription = hgRepo.onDidChangeStatuses(
      // t8227570: If the user is a "nervous saver," many onDidChangeStatuses will get fired in
      // succession. We should probably explore debouncing this in HgRepositoryClient itself.
      (0, _nuclideCommons.debounce)(this._onDidChangeStatusesForRepository.bind(this, hgRepo, rootKeysForRepository),
      /* wait */1000,
      /* immediate */false));

      this._subscriptionForRepository = this._subscriptionForRepository.set(hgRepo, subscription);
    })
  }, {
    key: '_onDidChangeStatusesForRepository',
    value: function _onDidChangeStatusesForRepository(repo, rootKeysForRepository) {
      for (var rootKey of rootKeysForRepository.get(repo)) {
        this.setVcsStatuses(rootKey, repo.getAllPathStatuses());
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
//# sourceMappingURL=data:application/json;base64,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Ozs7V0FFZ0MsMkNBQy9CLElBQXdCLEVBQ3hCLHFCQUE0RSxFQUN0RTtBQUNOLFdBQUssSUFBTSxPQUFPLElBQUkscUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQ3JELFlBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7T0FDekQ7S0FDRjs7O1dBRWlCLDRCQUFDLElBQXFCLEVBQUU7QUFDeEMsVUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3RCxVQUFJLENBQUMsVUFBVSxFQUFFOzs7O0FBSWYsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLENBQUMsMEJBQTBCLFVBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvRSxnQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3RCOzs7U0EvWUcsZUFBZTs7O0FBbVpyQixNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJGaWxlVHJlZUFjdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5cbmltcG9ydCB7QWN0aW9uVHlwZX0gZnJvbSAnLi9GaWxlVHJlZUNvbnN0YW50cyc7XG5pbXBvcnQge2RlYm91bmNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBGaWxlVHJlZURpc3BhdGNoZXIgZnJvbSAnLi9GaWxlVHJlZURpc3BhdGNoZXInO1xuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQge0ZpbGVUcmVlU3RvcmV9IGZyb20gJy4vRmlsZVRyZWVTdG9yZSc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQgc2VtdmVyIGZyb20gJ3NlbXZlcic7XG5pbXBvcnQge3JlcG9zaXRvcnlGb3JQYXRofSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLWdpdC1icmlkZ2UnO1xuaW1wb3J0IHtoZ0NvbnN0YW50c30gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWJhc2UnO1xuXG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5Q2xpZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtTdGF0dXNDb2RlTnVtYmVyVmFsdWV9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXR9IGZyb20gJy4uLy4uL251Y2xpZGUtd29ya2luZy1zZXRzJztcbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuLi8uLi9udWNsaWRlLXdvcmtpbmctc2V0cy9saWIvV29ya2luZ1NldHNTdG9yZSc7XG5cblxubGV0IGluc3RhbmNlOiA/T2JqZWN0O1xuXG4vKipcbiAqIEltcGxlbWVudHMgdGhlIEZsdXggcGF0dGVybiBmb3Igb3VyIGZpbGUgdHJlZS4gQWxsIHN0YXRlIGZvciB0aGUgZmlsZSB0cmVlIHdpbGwgYmUga2VwdCBpblxuICogRmlsZVRyZWVTdG9yZSBhbmQgdGhlIG9ubHkgd2F5IHRvIHVwZGF0ZSB0aGUgc3RvcmUgaXMgdGhyb3VnaCBtZXRob2RzIG9uIEZpbGVUcmVlQWN0aW9ucy4gVGhlXG4gKiBkaXNwYXRjaGVyIGlzIGEgbWVjaGFuaXNtIHRocm91Z2ggd2hpY2ggRmlsZVRyZWVBY3Rpb25zIGludGVyZmFjZXMgd2l0aCBGaWxlVHJlZVN0b3JlLlxuICovXG5jbGFzcyBGaWxlVHJlZUFjdGlvbnMge1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeTogSW1tdXRhYmxlLk1hcDxhdG9tJFJlcG9zaXRvcnksIERpc3Bvc2FibGU+O1xuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBGaWxlVHJlZUFjdGlvbnMge1xuICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgIGluc3RhbmNlID0gbmV3IEZpbGVUcmVlQWN0aW9ucygpO1xuICAgIH1cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gRmlsZVRyZWVEaXNwYXRjaGVyLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5fc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSA9IG5ldyBJbW11dGFibGUuTWFwKCk7XG4gIH1cblxuICBzZXRDd2Qocm9vdEtleTogP3N0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfQ1dELFxuICAgICAgcm9vdEtleSxcbiAgICB9KTtcbiAgfVxuXG4gIHNldFJvb3RLZXlzKHJvb3RLZXlzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgY29uc3QgZXhpc3RpbmdSb290S2V5U2V0OiBJbW11dGFibGUuU2V0PHN0cmluZz4gPSBuZXcgSW1tdXRhYmxlLlNldCh0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpKTtcbiAgICBjb25zdCBhZGRlZFJvb3RLZXlzOiBJbW11dGFibGUuU2V0PHN0cmluZz4gPVxuICAgICAgbmV3IEltbXV0YWJsZS5TZXQocm9vdEtleXMpLnN1YnRyYWN0KGV4aXN0aW5nUm9vdEtleVNldCk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9ST09UX0tFWVMsXG4gICAgICByb290S2V5cyxcbiAgICB9KTtcbiAgICBmb3IgKGNvbnN0IHJvb3RLZXkgb2YgYWRkZWRSb290S2V5cykge1xuICAgICAgdGhpcy5leHBhbmROb2RlKHJvb3RLZXksIHJvb3RLZXkpO1xuICAgIH1cbiAgfVxuXG4gIGV4cGFuZE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuRVhQQU5EX05PREUsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleSxcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZE5vZGVEZWVwKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkVYUEFORF9OT0RFX0RFRVAsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleSxcbiAgICB9KTtcbiAgfVxuXG4gIGRlbGV0ZVNlbGVjdGVkTm9kZXMoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uVHlwZTogQWN0aW9uVHlwZS5ERUxFVEVfU0VMRUNURURfTk9ERVN9KTtcbiAgfVxuXG4gIC8vIE1ha2VzIHN1cmUgYSBzcGVjaWZpYyBjaGlsZCBleGlzdHMgZm9yIGEgZ2l2ZW4gbm9kZS4gSWYgaXQgZG9lcyBub3QgZXhpc3QsIHRlbXBvcmFyaWx5XG4gIC8vIGNyZWF0ZSBpdCBhbmQgaW5pdGlhdGUgYSBmZXRjaC4gVGhpcyBmZWF0dXJlIGlzIGV4Y2x1c2l2ZWx5IGZvciBleHBhbmRpbmcgdG8gYSBub2RlIGRlZXBcbiAgLy8gaW4gYSB0cmVlLlxuICBlbnN1cmVDaGlsZE5vZGUobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkVOU1VSRV9DSElMRF9OT0RFLFxuICAgICAgbm9kZUtleSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbGxhcHNlTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5DT0xMQVBTRV9OT0RFLFxuICAgICAgcm9vdEtleSxcbiAgICAgIG5vZGVLZXksXG4gICAgfSk7XG4gIH1cblxuICBjb2xsYXBzZU5vZGVEZWVwKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkNPTExBUFNFX05PREVfREVFUCxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9FWENMVURFX1ZDU19JR05PUkVEX1BBVEhTLFxuICAgICAgZXhjbHVkZVZjc0lnbm9yZWRQYXRocyxcbiAgICB9KTtcbiAgfVxuXG4gIHNldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfSElERV9JR05PUkVEX05BTUVTLFxuICAgICAgaGlkZUlnbm9yZWROYW1lcyxcbiAgICB9KTtcbiAgfVxuXG4gIHNldElnbm9yZWROYW1lcyhpZ25vcmVkTmFtZXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX0lHTk9SRURfTkFNRVMsXG4gICAgICBpZ25vcmVkTmFtZXMsXG4gICAgfSk7XG4gIH1cblxuICBzZXRUcmFja2VkTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfVFJBQ0tFRF9OT0RFLFxuICAgICAgbm9kZUtleSxcbiAgICAgIHJvb3RLZXksXG4gICAgfSk7XG4gIH1cblxuICBzZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFiczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfVVNFX1BSRVZJRVdfVEFCUyxcbiAgICAgIHVzZVByZXZpZXdUYWJzLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0VXNlUHJlZml4TmF2KHVzZVByZWZpeE5hdjogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfVVNFX1BSRUZJWF9OQVYsXG4gICAgICB1c2VQcmVmaXhOYXYsXG4gICAgfSk7XG4gIH1cblxuICBjb25maXJtTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZywgcGVuZGluZzogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldE5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gICAgaWYgKG5vZGUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAobm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgY29uc3QgYWN0aW9uVHlwZSA9IG5vZGUuaXNFeHBhbmRlZCA/XG4gICAgICAgIEFjdGlvblR5cGUuQ09MTEFQU0VfTk9ERSA6XG4gICAgICAgIEFjdGlvblR5cGUuRVhQQU5EX05PREU7XG4gICAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgICAgYWN0aW9uVHlwZTogYWN0aW9uVHlwZSxcbiAgICAgICAgbm9kZUtleSxcbiAgICAgICAgcm9vdEtleSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgb3Blbk9wdGlvbnMgPSB7XG4gICAgICAgIGFjdGl2YXRlUGFuZTogdHJ1ZSxcbiAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgICB9O1xuICAgICAgLy8gVE9ETzogTWFrZSB0aGUgZm9sbG93aW5nIHRoZSBkZWZhdWx0IG9uY2UgTnVjbGlkZSBvbmx5IHN1cHBvcnRzIEF0b20gdjEuNi4wK1xuICAgICAgaWYgKHNlbXZlci5ndGUoYXRvbS5nZXRWZXJzaW9uKCksICcxLjYuMCcpKSB7XG4gICAgICAgIG9wZW5PcHRpb25zID0gey4uLm9wZW5PcHRpb25zLCBwZW5kaW5nOiB0cnVlfTtcbiAgICAgIH1cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oRmlsZVRyZWVIZWxwZXJzLmtleVRvUGF0aChub2RlS2V5KSwgb3Blbk9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIGtlZXBQcmV2aWV3VGFiKCkge1xuICAgIC8vIFRPRE86IE1ha2UgdGhlIGZvbGxvd2luZyB0aGUgZGVmYXVsdCBvbmNlIE51Y2xpZGUgb25seSBzdXBwb3J0cyBBdG9tIHYxLjYuMCtcbiAgICBpZiAoc2VtdmVyLmd0ZShhdG9tLmdldFZlcnNpb24oKSwgJzEuNi4wJykpIHtcbiAgICAgIGNvbnN0IGFjdGl2ZVBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCk7XG4gICAgICBpZiAoYWN0aXZlUGFuZSAhPSBudWxsKSB7XG4gICAgICAgIGFjdGl2ZVBhbmUuY2xlYXJQZW5kaW5nSXRlbSgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBhY3RpdmVQYW5lSXRlbSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCk7XG4gICAgICBpZiAoYWN0aXZlUGFuZUl0ZW0gIT0gbnVsbCkge1xuICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKGF0b20udmlld3MuZ2V0VmlldyhhY3RpdmVQYW5lSXRlbSksICd0YWJzOmtlZXAtcHJldmlldy10YWInKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KFxuICAgIG5vZGVLZXk6IHN0cmluZyxcbiAgICBvcmllbnRhdGlvbjogYXRvbSRQYW5lU3BsaXRPcmllbnRhdGlvbixcbiAgICBzaWRlOiBhdG9tJFBhbmVTcGxpdFNpZGVcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgcGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKTtcbiAgICBhdG9tLndvcmtzcGFjZS5vcGVuVVJJSW5QYW5lKFxuICAgICAgRmlsZVRyZWVIZWxwZXJzLmtleVRvUGF0aChub2RlS2V5KSxcbiAgICAgIHBhbmUuc3BsaXQob3JpZW50YXRpb24sIHNpZGUpXG4gICAgKTtcbiAgfVxuXG4gIHNldFZjc1N0YXR1c2VzKHJvb3RLZXk6IHN0cmluZywgdmNzU3RhdHVzZXM6IHtbcGF0aDogc3RyaW5nXTogU3RhdHVzQ29kZU51bWJlclZhbHVlfSk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfVkNTX1NUQVRVU0VTLFxuICAgICAgcm9vdEtleSxcbiAgICAgIHZjc1N0YXR1c2VzLFxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZGF0ZXMgdGhlIHJvb3QgcmVwb3NpdG9yaWVzIHRvIG1hdGNoIHRoZSBwcm92aWRlZCBkaXJlY3Rvcmllcy5cbiAgICovXG4gIGFzeW5jIHVwZGF0ZVJlcG9zaXRvcmllcyhyb290RGlyZWN0b3JpZXM6IEFycmF5PGF0b20kRGlyZWN0b3J5Pik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHJvb3RLZXlzID0gcm9vdERpcmVjdG9yaWVzLm1hcChcbiAgICAgIGRpcmVjdG9yeSA9PiBGaWxlVHJlZUhlbHBlcnMuZGlyUGF0aFRvS2V5KGRpcmVjdG9yeS5nZXRQYXRoKCkpXG4gICAgKTtcbiAgICBjb25zdCByb290UmVwb3M6IEFycmF5PD9hdG9tJFJlcG9zaXRvcnk+ID0gYXdhaXQgUHJvbWlzZS5hbGwocm9vdERpcmVjdG9yaWVzLm1hcChcbiAgICAgIGRpcmVjdG9yeSA9PiByZXBvc2l0b3J5Rm9yUGF0aChkaXJlY3RvcnkuZ2V0UGF0aCgpKVxuICAgICkpO1xuXG4gICAgLy8gdDcxMTQxOTY6IEdpdmVuIHRoZSBjdXJyZW50IGltcGxlbWVudGF0aW9uIG9mIEhnUmVwb3NpdG9yeUNsaWVudCwgZWFjaCByb290IGRpcmVjdG9yeSB3aWxsXG4gICAgLy8gYWx3YXlzIGNvcnJlc3BvbmQgdG8gYSB1bmlxdWUgaW5zdGFuY2Ugb2YgSGdSZXBvc2l0b3J5Q2xpZW50LiBJZGVhbGx5LCBpZiBtdWx0aXBsZSBzdWJmb2xkZXJzXG4gICAgLy8gb2YgYW4gSGcgcmVwbyBhcmUgdXNlZCBhcyBwcm9qZWN0IHJvb3RzIGluIEF0b20sIG9ubHkgb25lIEhnUmVwb3NpdG9yeUNsaWVudCBzaG91bGQgYmVcbiAgICAvLyBjcmVhdGVkLlxuXG4gICAgLy8gR3JvdXAgYWxsIG9mIHRoZSByb290IGtleXMgYnkgdGhlaXIgcmVwb3NpdG9yeSwgZXhjbHVkaW5nIGFueSB0aGF0IGRvbid0IGJlbG9uZyB0byBhXG4gICAgLy8gcmVwb3NpdG9yeS5cbiAgICBjb25zdCByb290S2V5c0ZvclJlcG9zaXRvcnkgPSBJbW11dGFibGUuTGlzdChyb290S2V5cylcbiAgICAgIC5ncm91cEJ5KChyb290S2V5LCBpbmRleCkgPT4gcm9vdFJlcG9zW2luZGV4XSlcbiAgICAgIC5maWx0ZXIoKHYsIGspID0+IGsgIT0gbnVsbClcbiAgICAgIC5tYXAodiA9PiBuZXcgSW1tdXRhYmxlLlNldCh2KSk7XG5cbiAgICBjb25zdCBwcmV2UmVwb3MgPSB0aGlzLl9zdG9yZS5nZXRSZXBvc2l0b3JpZXMoKTtcblxuICAgIC8vIExldCB0aGUgc3RvcmUga25vdyB3ZSBoYXZlIHNvbWUgbmV3IHJlcG9zIVxuICAgIGNvbnN0IG5leHRSZXBvczogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+ID1cbiAgICAgIG5ldyBJbW11dGFibGUuU2V0KHJvb3RLZXlzRm9yUmVwb3NpdG9yeS5rZXlzKCkpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfUkVQT1NJVE9SSUVTLFxuICAgICAgcmVwb3NpdG9yaWVzOiBuZXh0UmVwb3MsXG4gICAgfSk7XG5cbiAgICBjb25zdCByZW1vdmVkUmVwb3MgPSBwcmV2UmVwb3Muc3VidHJhY3QobmV4dFJlcG9zKTtcbiAgICBjb25zdCBhZGRlZFJlcG9zID0gbmV4dFJlcG9zLnN1YnRyYWN0KHByZXZSZXBvcyk7XG5cblxuICAgIC8vIFRPRE86IFJld3JpdGUgYF9yZXBvc2l0b3J5QWRkZWRgIHRvIHJldHVybiB0aGUgc3Vic2NyaXB0aW9uIGluc3RlYWQgb2YgYWRkaW5nIGl0IHRvIGEgbWFwIGFzXG4gICAgLy8gICAgICAgYSBzaWRlIGVmZmVjdC4gVGhlIG1hcCBjYW4gYmUgY3JlYXRlZCBoZXJlIHdpdGggc29tZXRoaW5nIGxpa2VcbiAgICAvLyAgICAgICBgc3Vic2NyaXB0aW9ucyA9IEltbXV0YWJsZS5NYXAocmVwb3MpLm1hcCh0aGlzLl9yZXBvc2l0b3J5QWRkZWQpYC4gU2luY2VcbiAgICAvLyAgICAgICBgX3JlcG9zaXRvcnlBZGRlZGAgd2lsbCBubyBsb25nZXIgYmUgYWJvdXQgc2lkZSBlZmZlY3RzLCBpdCBzaG91bGQgdGhlbiBiZSByZW5hbWVkLlxuICAgIC8vICAgICAgIGBfcmVwb3NpdG9yeVJlbW92ZWRgIGNvdWxkIHByb2JhYmx5IGJlIGlubGluZWQgaGVyZS4gVGhhdCB3b3VsZCBsZWF2ZSB0aGlzIGZ1bmN0aW9uIGFzXG4gICAgLy8gICAgICAgdGhlIG9ubHkgb25lIGRvaW5nIHNpZGUtZWZmZWN0cy5cblxuICAgIC8vIFVuc3Vic2NyaWJlIGZyb20gcmVtb3ZlZFJlcG9zLlxuICAgIHJlbW92ZWRSZXBvcy5mb3JFYWNoKHJlcG8gPT4gdGhpcy5fcmVwb3NpdG9yeVJlbW92ZWQocmVwbywgcm9vdEtleXNGb3JSZXBvc2l0b3J5KSk7XG5cbiAgICAvLyBDcmVhdGUgc3Vic2NyaXB0aW9ucyBmb3IgYWRkZWRSZXBvcy5cbiAgICBhZGRlZFJlcG9zLmZvckVhY2gocmVwbyA9PiB0aGlzLl9yZXBvc2l0b3J5QWRkZWQocmVwbywgcm9vdEtleXNGb3JSZXBvc2l0b3J5KSk7XG4gIH1cblxuICB1cGRhdGVXb3JraW5nU2V0KHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX1dPUktJTkdfU0VULFxuICAgICAgd29ya2luZ1NldCxcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZU9wZW5GaWxlc1dvcmtpbmdTZXQob3BlbkZpbGVzV29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfT1BFTl9GSUxFU19XT1JLSU5HX1NFVCxcbiAgICAgIG9wZW5GaWxlc1dvcmtpbmdTZXQsXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVXb3JraW5nU2V0c1N0b3JlKHdvcmtpbmdTZXRzU3RvcmU6ID9Xb3JraW5nU2V0c1N0b3JlKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9XT1JLSU5HX1NFVFNfU1RPUkUsXG4gICAgICB3b3JraW5nU2V0c1N0b3JlLFxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnRFZGl0aW5nV29ya2luZ1NldChlZGl0ZWRXb3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNUQVJUX0VESVRJTkdfV09SS0lOR19TRVQsXG4gICAgICBlZGl0ZWRXb3JraW5nU2V0LFxuICAgIH0pO1xuICB9XG5cbiAgZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkZJTklTSF9FRElUSU5HX1dPUktJTkdfU0VULFxuICAgIH0pO1xuICB9XG5cbiAgY2hlY2tOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkNIRUNLX05PREUsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleSxcbiAgICB9KTtcbiAgfVxuXG4gIHVuY2hlY2tOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlVOQ0hFQ0tfTk9ERSxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgc2V0U2VsZWN0ZWROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9TRUxFQ1RFRF9OT0RFLFxuICAgICAgcm9vdEtleSxcbiAgICAgIG5vZGVLZXksXG4gICAgfSk7XG4gIH1cblxuICBhZGRTZWxlY3RlZE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuQUREX1NFTEVDVEVEX05PREUsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleSxcbiAgICB9KTtcbiAgfVxuXG4gIHVuc2VsZWN0Tm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5VTlNFTEVDVF9OT0RFLFxuICAgICAgcm9vdEtleSxcbiAgICAgIG5vZGVLZXksXG4gICAgfSk7XG4gIH1cblxuICBtb3ZlU2VsZWN0aW9uVXAoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLk1PVkVfU0VMRUNUSU9OX1VQLFxuICAgIH0pO1xuICB9XG5cbiAgbW92ZVNlbGVjdGlvbkRvd24oKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLk1PVkVfU0VMRUNUSU9OX0RPV04sXG4gICAgfSk7XG4gIH1cblxuICBtb3ZlU2VsZWN0aW9uVG9Ub3AoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLk1PVkVfU0VMRUNUSU9OX1RPX1RPUCxcbiAgICB9KTtcbiAgfVxuXG4gIG1vdmVTZWxlY3Rpb25Ub0JvdHRvbSgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuTU9WRV9TRUxFQ1RJT05fVE9fQk9UVE9NLFxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX3JlcG9zaXRvcnlBZGRlZChcbiAgICByZXBvOiBhdG9tJFJlcG9zaXRvcnksXG4gICAgcm9vdEtleXNGb3JSZXBvc2l0b3J5OiBJbW11dGFibGUuTWFwPGF0b20kUmVwb3NpdG9yeSwgSW1tdXRhYmxlLlNldDxzdHJpbmc+PixcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gRm9yIG5vdywgd2Ugb25seSBzdXBwb3J0IEhnUmVwb3NpdG9yeSBvYmplY3RzLlxuICAgIGlmIChyZXBvLmdldFR5cGUoKSAhPT0gJ2hnJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGhnUmVwbyA9ICgocmVwbzogYW55KTogSGdSZXBvc2l0b3J5Q2xpZW50KTtcblxuICAgIC8vIEF0IHRoaXMgcG9pbnQsIHdlIGFzc3VtZSB0aGF0IHJlcG8gaXMgYSBOdWNsaWRlIEhnUmVwb3NpdG9yeUNsaWVudC5cblxuICAgIC8vIEZpcnN0LCBnZXQgdGhlIG91dHB1dCBvZiBgaGcgc3RhdHVzYCBmb3IgdGhlIHJlcG9zaXRvcnkuXG4gICAgLy8gVE9ETyhtYm9saW4pOiBWZXJpZnkgdGhhdCBhbGwgb2YgdGhpcyBpcyBzZXQgdXAgY29ycmVjdGx5IGZvciByZW1vdGUgZmlsZXMuXG4gICAgY29uc3QgcmVwb1Jvb3QgPSBoZ1JlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpO1xuICAgIGNvbnN0IHJlcG9Qcm9qZWN0cyA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpLmZpbHRlcihwcm9qUGF0aCA9PiBwcm9qUGF0aC5zdGFydHNXaXRoKHJlcG9Sb290KSk7XG5cbiAgICBjb25zdCBzdGF0dXNDb2RlRm9yUGF0aCA9IGF3YWl0IGhnUmVwby5nZXRTdGF0dXNlcyhyZXBvUHJvamVjdHMsIHtcbiAgICAgIGhnU3RhdHVzT3B0aW9uOiBoZ0NvbnN0YW50cy5IZ1N0YXR1c09wdGlvbi5PTkxZX05PTl9JR05PUkVELFxuICAgIH0pO1xuXG4gICAgZm9yIChjb25zdCByb290S2V5Rm9yUmVwbyBvZiByb290S2V5c0ZvclJlcG9zaXRvcnkuZ2V0KGhnUmVwbykpIHtcbiAgICAgIHRoaXMuc2V0VmNzU3RhdHVzZXMocm9vdEtleUZvclJlcG8sIHN0YXR1c0NvZGVGb3JQYXRoKTtcbiAgICB9XG5cbiAgICAvLyBOb3cgdGhhdCB0aGUgaW5pdGlhbCBWQ1Mgc3RhdHVzZXMgYXJlIHNldCwgc3Vic2NyaWJlIHRvIGNoYW5nZXMgdG8gdGhlIFJlcG9zaXRvcnkgc28gdGhhdCB0aGVcbiAgICAvLyBWQ1Mgc3RhdHVzZXMgYXJlIGtlcHQgdXAgdG8gZGF0ZS5cbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBoZ1JlcG8ub25EaWRDaGFuZ2VTdGF0dXNlcyhcbiAgICAgIC8vIHQ4MjI3NTcwOiBJZiB0aGUgdXNlciBpcyBhIFwibmVydm91cyBzYXZlcixcIiBtYW55IG9uRGlkQ2hhbmdlU3RhdHVzZXMgd2lsbCBnZXQgZmlyZWQgaW5cbiAgICAgIC8vIHN1Y2Nlc3Npb24uIFdlIHNob3VsZCBwcm9iYWJseSBleHBsb3JlIGRlYm91bmNpbmcgdGhpcyBpbiBIZ1JlcG9zaXRvcnlDbGllbnQgaXRzZWxmLlxuICAgICAgZGVib3VuY2UoXG4gICAgICAgIHRoaXMuX29uRGlkQ2hhbmdlU3RhdHVzZXNGb3JSZXBvc2l0b3J5LmJpbmQodGhpcywgaGdSZXBvLCByb290S2V5c0ZvclJlcG9zaXRvcnkpLFxuICAgICAgICAvKiB3YWl0ICovIDEwMDAsXG4gICAgICAgIC8qIGltbWVkaWF0ZSAqLyBmYWxzZSxcbiAgICAgIClcbiAgICApO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSA9IHRoaXMuX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnkuc2V0KGhnUmVwbywgc3Vic2NyaXB0aW9uKTtcbiAgfVxuXG4gIF9vbkRpZENoYW5nZVN0YXR1c2VzRm9yUmVwb3NpdG9yeShcbiAgICByZXBvOiBIZ1JlcG9zaXRvcnlDbGllbnQsXG4gICAgcm9vdEtleXNGb3JSZXBvc2l0b3J5OiBJbW11dGFibGUuTWFwPGF0b20kUmVwb3NpdG9yeSwgSW1tdXRhYmxlLlNldDxzdHJpbmc+PixcbiAgKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCByb290S2V5IG9mIHJvb3RLZXlzRm9yUmVwb3NpdG9yeS5nZXQocmVwbykpIHtcbiAgICAgIHRoaXMuc2V0VmNzU3RhdHVzZXMocm9vdEtleSwgcmVwby5nZXRBbGxQYXRoU3RhdHVzZXMoKSk7XG4gICAgfVxuICB9XG5cbiAgX3JlcG9zaXRvcnlSZW1vdmVkKHJlcG86IGF0b20kUmVwb3NpdG9yeSkge1xuICAgIGNvbnN0IGRpc3Bvc2FibGUgPSB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5LmdldChyZXBvKTtcbiAgICBpZiAoIWRpc3Bvc2FibGUpIHtcbiAgICAgIC8vIFRoZXJlIGlzIGEgc21hbGwgY2hhbmNlIHRoYXQgdGhlIGFkZC9yZW1vdmUgb2YgdGhlIFJlcG9zaXRvcnkgY291bGQgaGFwcGVuIHNvIHF1aWNrbHkgdGhhdFxuICAgICAgLy8gdGhlIGVudHJ5IGZvciB0aGUgcmVwbyBpbiBfc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSBoYXMgbm90IGJlZW4gc2V0IHlldC5cbiAgICAgIC8vIFRPRE86IFJlcG9ydCBhIHNvZnQgZXJyb3IgZm9yIHRoaXMuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSA9IHRoaXMuX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnkuZGVsZXRlKHJlcG8pO1xuICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZUFjdGlvbnM7XG4iXX0=