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

var _nuclideLogging = require('../../nuclide-logging');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _nuclideRemoteUri2 = _interopRequireDefault(_nuclideRemoteUri);

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
      var subscription = asyncRepo.onDidChangeStatus(
      // t8227570: If the user is a "nervous saver," many onDidChangeStatuses will get fired in
      // succession. We should probably explore debouncing this in HgRepositoryClient itself.
      (0, _nuclideCommons.debounce)(this._onDidChangeStatusesForRepository.bind(this, repo, rootKeysForRepository),
      /* wait */1000,
      /* immediate */false));

      this._subscriptionForRepository = this._subscriptionForRepository.set(repo, subscription);
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
        var StatusCodeNumber = _nuclideHgRepositoryBase.hgConstants.StatusCodeNumber;

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
            (0, _nuclideLogging.getLogger)().warn('Unrecognized git status number ' + gitStatusNumber);
            statusCode = StatusCodeNumber.MODIFIED;
          }
          relativeCodePaths[relativePath] = statusCode;
        }
      }
      var repoRoot = repo.getWorkingDirectory();
      var absoluteCodePaths = {};
      for (var relativePath in relativeCodePaths) {
        var absolutePath = _nuclideRemoteUri2['default'].join(repoRoot, relativePath);
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

      this._subscriptionForRepository = this._subscriptionForRepository['delete'](repo);
      disposable.dispose();
    }
  }]);

  return FileTreeActions;
})();

module.exports = FileTreeActions;
//# sourceMappingURL=data:application/json;base64,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Q0FBQztTQUM5QztPQUNGO0FBQ0QsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDNUMsVUFBTSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7QUFDN0IsV0FBSyxJQUFNLFlBQVksSUFBSSxpQkFBaUIsRUFBRTtBQUM1QyxZQUFNLFlBQVksR0FBRyw4QkFBVSxJQUFJLENBQUMsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBQzVELHlCQUFpQixDQUFDLFlBQVksQ0FBQyxHQUFHLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDO09BQ25FO0FBQ0QsYUFBTyxpQkFBaUIsQ0FBQztLQUMxQjs7O1dBRWdDLDJDQUMvQixJQUE2QyxFQUM3QyxxQkFBNEUsRUFDdEU7QUFDTixXQUFLLElBQU0sT0FBTyxJQUFJLHFCQUFxQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNyRCxZQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztPQUNqRTtLQUNGOzs7V0FFaUIsNEJBQUMsSUFBcUIsRUFBRTtBQUN4QyxVQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdELFVBQUksQ0FBQyxVQUFVLEVBQUU7Ozs7QUFJZixlQUFPO09BQ1I7O0FBRUQsVUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksQ0FBQywwQkFBMEIsVUFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9FLGdCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDdEI7OztTQWxiRyxlQUFlOzs7QUFzYnJCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDIiwiZmlsZSI6IkZpbGVUcmVlQWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcblxuaW1wb3J0IHtBY3Rpb25UeXBlfSBmcm9tICcuL0ZpbGVUcmVlQ29uc3RhbnRzJztcbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge0Rpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IEZpbGVUcmVlRGlzcGF0Y2hlciBmcm9tICcuL0ZpbGVUcmVlRGlzcGF0Y2hlcic7XG5pbXBvcnQgRmlsZVRyZWVIZWxwZXJzIGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcbmltcG9ydCB7RmlsZVRyZWVTdG9yZX0gZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCBzZW12ZXIgZnJvbSAnc2VtdmVyJztcbmltcG9ydCB7cmVwb3NpdG9yeUZvclBhdGh9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctZ2l0LWJyaWRnZSc7XG5pbXBvcnQge2hnQ29uc3RhbnRzfSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktYmFzZSc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcbmltcG9ydCByZW1vdGVVcmkgZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuaW1wb3J0IHR5cGUge1xuICBIZ1JlcG9zaXRvcnlDbGllbnQsXG4gIEhnUmVwb3NpdG9yeUNsaWVudEFzeW5jLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtTdGF0dXNDb2RlTnVtYmVyVmFsdWV9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9IZ1NlcnZpY2UnO1xuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXR9IGZyb20gJy4uLy4uL251Y2xpZGUtd29ya2luZy1zZXRzJztcbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuLi8uLi9udWNsaWRlLXdvcmtpbmctc2V0cy9saWIvV29ya2luZ1NldHNTdG9yZSc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcblxuXG5sZXQgaW5zdGFuY2U6ID9PYmplY3Q7XG5cbi8qKlxuICogSW1wbGVtZW50cyB0aGUgRmx1eCBwYXR0ZXJuIGZvciBvdXIgZmlsZSB0cmVlLiBBbGwgc3RhdGUgZm9yIHRoZSBmaWxlIHRyZWUgd2lsbCBiZSBrZXB0IGluXG4gKiBGaWxlVHJlZVN0b3JlIGFuZCB0aGUgb25seSB3YXkgdG8gdXBkYXRlIHRoZSBzdG9yZSBpcyB0aHJvdWdoIG1ldGhvZHMgb24gRmlsZVRyZWVBY3Rpb25zLiBUaGVcbiAqIGRpc3BhdGNoZXIgaXMgYSBtZWNoYW5pc20gdGhyb3VnaCB3aGljaCBGaWxlVHJlZUFjdGlvbnMgaW50ZXJmYWNlcyB3aXRoIEZpbGVUcmVlU3RvcmUuXG4gKi9cbmNsYXNzIEZpbGVUcmVlQWN0aW9ucyB7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5OiBJbW11dGFibGUuTWFwPGF0b20kUmVwb3NpdG9yeSwgRGlzcG9zYWJsZT47XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKCk6IEZpbGVUcmVlQWN0aW9ucyB7XG4gICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgaW5zdGFuY2UgPSBuZXcgRmlsZVRyZWVBY3Rpb25zKCk7XG4gICAgfVxuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBGaWxlVHJlZURpc3BhdGNoZXIuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLl9zdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5ID0gbmV3IEltbXV0YWJsZS5NYXAoKTtcbiAgfVxuXG4gIHNldEN3ZChyb290S2V5OiA/c3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9DV0QsXG4gICAgICByb290S2V5LFxuICAgIH0pO1xuICB9XG5cbiAgc2V0Um9vdEtleXMocm9vdEtleXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICBjb25zdCBleGlzdGluZ1Jvb3RLZXlTZXQ6IEltbXV0YWJsZS5TZXQ8c3RyaW5nPiA9IG5ldyBJbW11dGFibGUuU2V0KHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCkpO1xuICAgIGNvbnN0IGFkZGVkUm9vdEtleXM6IEltbXV0YWJsZS5TZXQ8c3RyaW5nPiA9XG4gICAgICBuZXcgSW1tdXRhYmxlLlNldChyb290S2V5cykuc3VidHJhY3QoZXhpc3RpbmdSb290S2V5U2V0KTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX1JPT1RfS0VZUyxcbiAgICAgIHJvb3RLZXlzLFxuICAgIH0pO1xuICAgIGZvciAoY29uc3Qgcm9vdEtleSBvZiBhZGRlZFJvb3RLZXlzKSB7XG4gICAgICB0aGlzLmV4cGFuZE5vZGUocm9vdEtleSwgcm9vdEtleSk7XG4gICAgfVxuICB9XG5cbiAgZXhwYW5kTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5FWFBBTkRfTk9ERSxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kTm9kZURlZXAocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuRVhQQU5EX05PREVfREVFUCxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgZGVsZXRlU2VsZWN0ZWROb2RlcygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkRFTEVURV9TRUxFQ1RFRF9OT0RFU30pO1xuICB9XG5cbiAgLy8gTWFrZXMgc3VyZSBhIHNwZWNpZmljIGNoaWxkIGV4aXN0cyBmb3IgYSBnaXZlbiBub2RlLiBJZiBpdCBkb2VzIG5vdCBleGlzdCwgdGVtcG9yYXJpbHlcbiAgLy8gY3JlYXRlIGl0IGFuZCBpbml0aWF0ZSBhIGZldGNoLiBUaGlzIGZlYXR1cmUgaXMgZXhjbHVzaXZlbHkgZm9yIGV4cGFuZGluZyB0byBhIG5vZGUgZGVlcFxuICAvLyBpbiBhIHRyZWUuXG4gIGVuc3VyZUNoaWxkTm9kZShub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuRU5TVVJFX0NISUxEX05PREUsXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgY29sbGFwc2VOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkNPTExBUFNFX05PREUsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbGxhcHNlTm9kZURlZXAocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuQ09MTEFQU0VfTk9ERV9ERUVQLFxuICAgICAgcm9vdEtleSxcbiAgICAgIG5vZGVLZXksXG4gICAgfSk7XG4gIH1cblxuICBzZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX0VYQ0xVREVfVkNTX0lHTk9SRURfUEFUSFMsXG4gICAgICBleGNsdWRlVmNzSWdub3JlZFBhdGhzLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9ISURFX0lHTk9SRURfTkFNRVMsXG4gICAgICBoaWRlSWdub3JlZE5hbWVzLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfSUdOT1JFRF9OQU1FUyxcbiAgICAgIGlnbm9yZWROYW1lcyxcbiAgICB9KTtcbiAgfVxuXG4gIHNldFRyYWNrZWROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9UUkFDS0VEX05PREUsXG4gICAgICBub2RlS2V5LFxuICAgICAgcm9vdEtleSxcbiAgICB9KTtcbiAgfVxuXG4gIHNldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9VU0VfUFJFVklFV19UQUJTLFxuICAgICAgdXNlUHJldmlld1RhYnMsXG4gICAgfSk7XG4gIH1cblxuICBzZXRVc2VQcmVmaXhOYXYodXNlUHJlZml4TmF2OiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9VU0VfUFJFRklYX05BVixcbiAgICAgIHVzZVByZWZpeE5hdixcbiAgICB9KTtcbiAgfVxuXG4gIGNvbmZpcm1Ob2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nLCBwZW5kaW5nOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fc3RvcmUuZ2V0Tm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChub2RlLmlzQ29udGFpbmVyKSB7XG4gICAgICBjb25zdCBhY3Rpb25UeXBlID0gbm9kZS5pc0V4cGFuZGVkID9cbiAgICAgICAgQWN0aW9uVHlwZS5DT0xMQVBTRV9OT0RFIDpcbiAgICAgICAgQWN0aW9uVHlwZS5FWFBBTkRfTk9ERTtcbiAgICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb25UeXBlOiBhY3Rpb25UeXBlLFxuICAgICAgICBub2RlS2V5LFxuICAgICAgICByb290S2V5LFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBvcGVuT3B0aW9ucyA9IHtcbiAgICAgICAgYWN0aXZhdGVQYW5lOiB0cnVlLFxuICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAgIH07XG4gICAgICAvLyBUT0RPOiBNYWtlIHRoZSBmb2xsb3dpbmcgdGhlIGRlZmF1bHQgb25jZSBOdWNsaWRlIG9ubHkgc3VwcG9ydHMgQXRvbSB2MS42LjArXG4gICAgICBpZiAoc2VtdmVyLmd0ZShhdG9tLmdldFZlcnNpb24oKSwgJzEuNi4wJykpIHtcbiAgICAgICAgb3Blbk9wdGlvbnMgPSB7Li4ub3Blbk9wdGlvbnMsIHBlbmRpbmc6IHRydWV9O1xuICAgICAgfVxuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihGaWxlVHJlZUhlbHBlcnMua2V5VG9QYXRoKG5vZGVLZXkpLCBvcGVuT3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAga2VlcFByZXZpZXdUYWIoKSB7XG4gICAgLy8gVE9ETzogTWFrZSB0aGUgZm9sbG93aW5nIHRoZSBkZWZhdWx0IG9uY2UgTnVjbGlkZSBvbmx5IHN1cHBvcnRzIEF0b20gdjEuNi4wK1xuICAgIGlmIChzZW12ZXIuZ3RlKGF0b20uZ2V0VmVyc2lvbigpLCAnMS42LjAnKSkge1xuICAgICAgY29uc3QgYWN0aXZlUGFuZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKTtcbiAgICAgIGlmIChhY3RpdmVQYW5lICE9IG51bGwpIHtcbiAgICAgICAgYWN0aXZlUGFuZS5jbGVhclBlbmRpbmdJdGVtKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGFjdGl2ZVBhbmVJdGVtID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKTtcbiAgICAgIGlmIChhY3RpdmVQYW5lSXRlbSAhPSBudWxsKSB7XG4gICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGFjdGl2ZVBhbmVJdGVtKSwgJ3RhYnM6a2VlcC1wcmV2aWV3LXRhYicpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG9wZW5TZWxlY3RlZEVudHJ5U3BsaXQoXG4gICAgbm9kZUtleTogc3RyaW5nLFxuICAgIG9yaWVudGF0aW9uOiBhdG9tJFBhbmVTcGxpdE9yaWVudGF0aW9uLFxuICAgIHNpZGU6IGF0b20kUGFuZVNwbGl0U2lkZVxuICApOiB2b2lkIHtcbiAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpO1xuICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUoXG4gICAgICBGaWxlVHJlZUhlbHBlcnMua2V5VG9QYXRoKG5vZGVLZXkpLFxuICAgICAgcGFuZS5zcGxpdChvcmllbnRhdGlvbiwgc2lkZSlcbiAgICApO1xuICB9XG5cbiAgc2V0VmNzU3RhdHVzZXMocm9vdEtleTogc3RyaW5nLCB2Y3NTdGF0dXNlczoge1twYXRoOiBzdHJpbmddOiBTdGF0dXNDb2RlTnVtYmVyVmFsdWV9KTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9WQ1NfU1RBVFVTRVMsXG4gICAgICByb290S2V5LFxuICAgICAgdmNzU3RhdHVzZXMsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgcm9vdCByZXBvc2l0b3JpZXMgdG8gbWF0Y2ggdGhlIHByb3ZpZGVkIGRpcmVjdG9yaWVzLlxuICAgKi9cbiAgYXN5bmMgdXBkYXRlUmVwb3NpdG9yaWVzKHJvb3REaXJlY3RvcmllczogQXJyYXk8YXRvbSREaXJlY3Rvcnk+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgcm9vdEtleXMgPSByb290RGlyZWN0b3JpZXMubWFwKFxuICAgICAgZGlyZWN0b3J5ID0+IEZpbGVUcmVlSGVscGVycy5kaXJQYXRoVG9LZXkoZGlyZWN0b3J5LmdldFBhdGgoKSlcbiAgICApO1xuICAgIGNvbnN0IHJvb3RSZXBvczogQXJyYXk8P2F0b20kUmVwb3NpdG9yeT4gPSBhd2FpdCBQcm9taXNlLmFsbChyb290RGlyZWN0b3JpZXMubWFwKFxuICAgICAgZGlyZWN0b3J5ID0+IHJlcG9zaXRvcnlGb3JQYXRoKGRpcmVjdG9yeS5nZXRQYXRoKCkpXG4gICAgKSk7XG5cbiAgICAvLyB0NzExNDE5NjogR2l2ZW4gdGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb24gb2YgSGdSZXBvc2l0b3J5Q2xpZW50LCBlYWNoIHJvb3QgZGlyZWN0b3J5IHdpbGxcbiAgICAvLyBhbHdheXMgY29ycmVzcG9uZCB0byBhIHVuaXF1ZSBpbnN0YW5jZSBvZiBIZ1JlcG9zaXRvcnlDbGllbnQuIElkZWFsbHksIGlmIG11bHRpcGxlIHN1YmZvbGRlcnNcbiAgICAvLyBvZiBhbiBIZyByZXBvIGFyZSB1c2VkIGFzIHByb2plY3Qgcm9vdHMgaW4gQXRvbSwgb25seSBvbmUgSGdSZXBvc2l0b3J5Q2xpZW50IHNob3VsZCBiZVxuICAgIC8vIGNyZWF0ZWQuXG5cbiAgICAvLyBHcm91cCBhbGwgb2YgdGhlIHJvb3Qga2V5cyBieSB0aGVpciByZXBvc2l0b3J5LCBleGNsdWRpbmcgYW55IHRoYXQgZG9uJ3QgYmVsb25nIHRvIGFcbiAgICAvLyByZXBvc2l0b3J5LlxuICAgIGNvbnN0IHJvb3RLZXlzRm9yUmVwb3NpdG9yeSA9IEltbXV0YWJsZS5MaXN0KHJvb3RLZXlzKVxuICAgICAgLmdyb3VwQnkoKHJvb3RLZXksIGluZGV4KSA9PiByb290UmVwb3NbaW5kZXhdKVxuICAgICAgLmZpbHRlcigodiwgaykgPT4gayAhPSBudWxsKVxuICAgICAgLm1hcCh2ID0+IG5ldyBJbW11dGFibGUuU2V0KHYpKTtcblxuICAgIGNvbnN0IHByZXZSZXBvcyA9IHRoaXMuX3N0b3JlLmdldFJlcG9zaXRvcmllcygpO1xuXG4gICAgLy8gTGV0IHRoZSBzdG9yZSBrbm93IHdlIGhhdmUgc29tZSBuZXcgcmVwb3MhXG4gICAgY29uc3QgbmV4dFJlcG9zOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT4gPVxuICAgICAgbmV3IEltbXV0YWJsZS5TZXQocm9vdEtleXNGb3JSZXBvc2l0b3J5LmtleXMoKSk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9SRVBPU0lUT1JJRVMsXG4gICAgICByZXBvc2l0b3JpZXM6IG5leHRSZXBvcyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlbW92ZWRSZXBvcyA9IHByZXZSZXBvcy5zdWJ0cmFjdChuZXh0UmVwb3MpO1xuICAgIGNvbnN0IGFkZGVkUmVwb3MgPSBuZXh0UmVwb3Muc3VidHJhY3QocHJldlJlcG9zKTtcblxuXG4gICAgLy8gVE9ETzogUmV3cml0ZSBgX3JlcG9zaXRvcnlBZGRlZGAgdG8gcmV0dXJuIHRoZSBzdWJzY3JpcHRpb24gaW5zdGVhZCBvZiBhZGRpbmcgaXQgdG8gYSBtYXAgYXNcbiAgICAvLyAgICAgICBhIHNpZGUgZWZmZWN0LiBUaGUgbWFwIGNhbiBiZSBjcmVhdGVkIGhlcmUgd2l0aCBzb21ldGhpbmcgbGlrZVxuICAgIC8vICAgICAgIGBzdWJzY3JpcHRpb25zID0gSW1tdXRhYmxlLk1hcChyZXBvcykubWFwKHRoaXMuX3JlcG9zaXRvcnlBZGRlZClgLiBTaW5jZVxuICAgIC8vICAgICAgIGBfcmVwb3NpdG9yeUFkZGVkYCB3aWxsIG5vIGxvbmdlciBiZSBhYm91dCBzaWRlIGVmZmVjdHMsIGl0IHNob3VsZCB0aGVuIGJlIHJlbmFtZWQuXG4gICAgLy8gICAgICAgYF9yZXBvc2l0b3J5UmVtb3ZlZGAgY291bGQgcHJvYmFibHkgYmUgaW5saW5lZCBoZXJlLiBUaGF0IHdvdWxkIGxlYXZlIHRoaXMgZnVuY3Rpb24gYXNcbiAgICAvLyAgICAgICB0aGUgb25seSBvbmUgZG9pbmcgc2lkZS1lZmZlY3RzLlxuXG4gICAgLy8gVW5zdWJzY3JpYmUgZnJvbSByZW1vdmVkUmVwb3MuXG4gICAgcmVtb3ZlZFJlcG9zLmZvckVhY2gocmVwbyA9PiB0aGlzLl9yZXBvc2l0b3J5UmVtb3ZlZChyZXBvLCByb290S2V5c0ZvclJlcG9zaXRvcnkpKTtcblxuICAgIC8vIENyZWF0ZSBzdWJzY3JpcHRpb25zIGZvciBhZGRlZFJlcG9zLlxuICAgIGFkZGVkUmVwb3MuZm9yRWFjaChyZXBvID0+IHRoaXMuX3JlcG9zaXRvcnlBZGRlZChyZXBvLCByb290S2V5c0ZvclJlcG9zaXRvcnkpKTtcbiAgfVxuXG4gIHVwZGF0ZVdvcmtpbmdTZXQod29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfV09SS0lOR19TRVQsXG4gICAgICB3b3JraW5nU2V0LFxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlT3BlbkZpbGVzV29ya2luZ1NldChvcGVuRmlsZXNXb3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9PUEVOX0ZJTEVTX1dPUktJTkdfU0VULFxuICAgICAgb3BlbkZpbGVzV29ya2luZ1NldCxcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVdvcmtpbmdTZXRzU3RvcmUod29ya2luZ1NldHNTdG9yZTogP1dvcmtpbmdTZXRzU3RvcmUpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX1dPUktJTkdfU0VUU19TVE9SRSxcbiAgICAgIHdvcmtpbmdTZXRzU3RvcmUsXG4gICAgfSk7XG4gIH1cblxuICBzdGFydEVkaXRpbmdXb3JraW5nU2V0KGVkaXRlZFdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU1RBUlRfRURJVElOR19XT1JLSU5HX1NFVCxcbiAgICAgIGVkaXRlZFdvcmtpbmdTZXQsXG4gICAgfSk7XG4gIH1cblxuICBmaW5pc2hFZGl0aW5nV29ya2luZ1NldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuRklOSVNIX0VESVRJTkdfV09SS0lOR19TRVQsXG4gICAgfSk7XG4gIH1cblxuICBjaGVja05vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuQ0hFQ0tfTk9ERSxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgdW5jaGVja05vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuVU5DSEVDS19OT0RFLFxuICAgICAgcm9vdEtleSxcbiAgICAgIG5vZGVLZXksXG4gICAgfSk7XG4gIH1cblxuICBzZXRTZWxlY3RlZE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX1NFTEVDVEVEX05PREUsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleSxcbiAgICB9KTtcbiAgfVxuXG4gIGFkZFNlbGVjdGVkTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5BRERfU0VMRUNURURfTk9ERSxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgdW5zZWxlY3ROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlVOU0VMRUNUX05PREUsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleSxcbiAgICB9KTtcbiAgfVxuXG4gIG1vdmVTZWxlY3Rpb25VcCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuTU9WRV9TRUxFQ1RJT05fVVAsXG4gICAgfSk7XG4gIH1cblxuICBtb3ZlU2VsZWN0aW9uRG93bigpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuTU9WRV9TRUxFQ1RJT05fRE9XTixcbiAgICB9KTtcbiAgfVxuXG4gIG1vdmVTZWxlY3Rpb25Ub1RvcCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuTU9WRV9TRUxFQ1RJT05fVE9fVE9QLFxuICAgIH0pO1xuICB9XG5cbiAgbW92ZVNlbGVjdGlvblRvQm90dG9tKCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5NT1ZFX1NFTEVDVElPTl9UT19CT1RUT00sXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfcmVwb3NpdG9yeUFkZGVkKFxuICAgIHJlcG86IGF0b20kR2l0UmVwb3NpdG9yeSB8IEhnUmVwb3NpdG9yeUNsaWVudCxcbiAgICByb290S2V5c0ZvclJlcG9zaXRvcnk6IEltbXV0YWJsZS5NYXA8YXRvbSRSZXBvc2l0b3J5LCBJbW11dGFibGUuU2V0PHN0cmluZz4+LFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBXZSBzdXBwb3J0IEhnUmVwb3NpdG9yeUNsaWVudCBhbmQgR2l0UmVwb3NpdG9yeUFzeW5jIG9iamVjdHMuXG4gICAgaWYgKChyZXBvLmdldFR5cGUoKSAhPT0gJ2hnJyAmJiByZXBvLmdldFR5cGUoKSAhPT0gJ2dpdCcpIHx8IHJlcG8uYXN5bmMgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBhc3luY1JlcG86IGF0b20kR2l0UmVwb3NpdG9yeUFzeW5jIHwgSGdSZXBvc2l0b3J5Q2xpZW50QXN5bmMgPSAocmVwbzogYW55KS5hc3luYztcbiAgICBhd2FpdCBhc3luY1JlcG8ucmVmcmVzaFN0YXR1cygpO1xuICAgIGNvbnN0IHN0YXR1c0NvZGVGb3JQYXRoID0gdGhpcy5fZ2V0Q2FjaGVkUGF0aFN0YXR1c2VzKHJlcG8pO1xuXG4gICAgZm9yIChjb25zdCByb290S2V5Rm9yUmVwbyBvZiByb290S2V5c0ZvclJlcG9zaXRvcnkuZ2V0KHJlcG8pKSB7XG4gICAgICB0aGlzLnNldFZjc1N0YXR1c2VzKHJvb3RLZXlGb3JSZXBvLCBzdGF0dXNDb2RlRm9yUGF0aCk7XG4gICAgfVxuICAgIC8vIE5vdyB0aGF0IHRoZSBpbml0aWFsIFZDUyBzdGF0dXNlcyBhcmUgc2V0LCBzdWJzY3JpYmUgdG8gY2hhbmdlcyB0byB0aGUgUmVwb3NpdG9yeSBzbyB0aGF0IHRoZVxuICAgIC8vIFZDUyBzdGF0dXNlcyBhcmUga2VwdCB1cCB0byBkYXRlLlxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IGFzeW5jUmVwby5vbkRpZENoYW5nZVN0YXR1cyhcbiAgICAgIC8vIHQ4MjI3NTcwOiBJZiB0aGUgdXNlciBpcyBhIFwibmVydm91cyBzYXZlcixcIiBtYW55IG9uRGlkQ2hhbmdlU3RhdHVzZXMgd2lsbCBnZXQgZmlyZWQgaW5cbiAgICAgIC8vIHN1Y2Nlc3Npb24uIFdlIHNob3VsZCBwcm9iYWJseSBleHBsb3JlIGRlYm91bmNpbmcgdGhpcyBpbiBIZ1JlcG9zaXRvcnlDbGllbnQgaXRzZWxmLlxuICAgICAgZGVib3VuY2UoXG4gICAgICAgIHRoaXMuX29uRGlkQ2hhbmdlU3RhdHVzZXNGb3JSZXBvc2l0b3J5LmJpbmQodGhpcywgcmVwbywgcm9vdEtleXNGb3JSZXBvc2l0b3J5KSxcbiAgICAgICAgLyogd2FpdCAqLyAxMDAwLFxuICAgICAgICAvKiBpbW1lZGlhdGUgKi8gZmFsc2UsXG4gICAgICApLFxuICAgICk7XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5ID0gdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeS5zZXQocmVwbywgc3Vic2NyaXB0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaGVzIGEgY29uc2lzdGVudCBvYmplY3QgbWFwIGZyb20gYWJzb2x1dGUgZmlsZSBwYXRocyB0b1xuICAgKiB0aGVpciBjb3JyZXNwb25kaW5nIGBTdGF0dXNDb2RlTnVtYmVyYCBmb3IgZWFzeSByZXByZXNlbnRhdGlvbiB3aXRoIHRoZSBmaWxlIHRyZWUuXG4gICAqL1xuICBfZ2V0Q2FjaGVkUGF0aFN0YXR1c2VzKFxuICAgIHJlcG86IGF0b20kR2l0UmVwb3NpdG9yeSB8IEhnUmVwb3NpdG9yeUNsaWVudCxcbiAgKToge1tmaWxlUGF0aDogTnVjbGlkZVVyaV06IFN0YXR1c0NvZGVOdW1iZXJWYWx1ZX0ge1xuICAgIGNvbnN0IGFzeW5jUmVwbzogYXRvbSRHaXRSZXBvc2l0b3J5QXN5bmMgfCBIZ1JlcG9zaXRvcnlDbGllbnRBc3luYyA9IChyZXBvOiBhbnkpLmFzeW5jO1xuICAgIGNvbnN0IHN0YXR1c2VzID0gYXN5bmNSZXBvLmdldENhY2hlZFBhdGhTdGF0dXNlcygpO1xuICAgIGxldCByZWxhdGl2ZUNvZGVQYXRocztcbiAgICBpZiAoYXN5bmNSZXBvLmdldFR5cGUoKSA9PT0gJ2hnJykge1xuICAgICAgLy8gYGhnYCBhbHJlYWR5IGNvbWVzIGZyb20gYEhnUmVwb3NpdG9yeUNsaWVudGAgaW4gYFN0YXR1c0NvZGVOdW1iZXJgIGZvcm1hdC5cbiAgICAgIHJlbGF0aXZlQ29kZVBhdGhzID0gc3RhdHVzZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlbGF0aXZlQ29kZVBhdGhzID0ge307XG4gICAgICAvLyBUcmFuc2Zvcm0gYGdpdGAgYml0IG51bWJlcnMgdG8gYFN0YXR1c0NvZGVOdW1iZXJgIGZvcm1hdC5cbiAgICAgIGNvbnN0IHtTdGF0dXNDb2RlTnVtYmVyfSA9IGhnQ29uc3RhbnRzO1xuICAgICAgZm9yIChjb25zdCByZWxhdGl2ZVBhdGggaW4gc3RhdHVzZXMpIHtcbiAgICAgICAgY29uc3QgZ2l0U3RhdHVzTnVtYmVyID0gc3RhdHVzZXNbcmVsYXRpdmVQYXRoXTtcbiAgICAgICAgbGV0IHN0YXR1c0NvZGU7XG4gICAgICAgIGlmIChhc3luY1JlcG8uaXNTdGF0dXNOZXcoZ2l0U3RhdHVzTnVtYmVyKSkge1xuICAgICAgICAgIHN0YXR1c0NvZGUgPSBTdGF0dXNDb2RlTnVtYmVyLlVOVFJBQ0tFRDtcbiAgICAgICAgfSBlbHNlIGlmIChhc3luY1JlcG8uaXNTdGF0dXNTdGFnZWQoZ2l0U3RhdHVzTnVtYmVyKSkge1xuICAgICAgICAgIHN0YXR1c0NvZGUgPSBTdGF0dXNDb2RlTnVtYmVyLkFEREVEO1xuICAgICAgICB9IGVsc2UgaWYgKGFzeW5jUmVwby5pc1N0YXR1c01vZGlmaWVkKGdpdFN0YXR1c051bWJlcikpIHtcbiAgICAgICAgICBzdGF0dXNDb2RlID0gU3RhdHVzQ29kZU51bWJlci5NT0RJRklFRDtcbiAgICAgICAgfSBlbHNlIGlmIChhc3luY1JlcG8uaXNTdGF0dXNJZ25vcmVkKGdpdFN0YXR1c051bWJlcikpIHtcbiAgICAgICAgICBzdGF0dXNDb2RlID0gU3RhdHVzQ29kZU51bWJlci5JR05PUkVEO1xuICAgICAgICB9IGVsc2UgaWYgKGFzeW5jUmVwby5pc1N0YXR1c0RlbGV0ZWQoZ2l0U3RhdHVzTnVtYmVyKSkge1xuICAgICAgICAgIHN0YXR1c0NvZGUgPSBTdGF0dXNDb2RlTnVtYmVyLlJFTU9WRUQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZ2V0TG9nZ2VyKCkud2FybihgVW5yZWNvZ25pemVkIGdpdCBzdGF0dXMgbnVtYmVyICR7Z2l0U3RhdHVzTnVtYmVyfWApO1xuICAgICAgICAgIHN0YXR1c0NvZGUgPSBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVEO1xuICAgICAgICB9XG4gICAgICAgIHJlbGF0aXZlQ29kZVBhdGhzW3JlbGF0aXZlUGF0aF0gPSBzdGF0dXNDb2RlO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25zdCByZXBvUm9vdCA9IHJlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpO1xuICAgIGNvbnN0IGFic29sdXRlQ29kZVBhdGhzID0ge307XG4gICAgZm9yIChjb25zdCByZWxhdGl2ZVBhdGggaW4gcmVsYXRpdmVDb2RlUGF0aHMpIHtcbiAgICAgIGNvbnN0IGFic29sdXRlUGF0aCA9IHJlbW90ZVVyaS5qb2luKHJlcG9Sb290LCByZWxhdGl2ZVBhdGgpO1xuICAgICAgYWJzb2x1dGVDb2RlUGF0aHNbYWJzb2x1dGVQYXRoXSA9IHJlbGF0aXZlQ29kZVBhdGhzW3JlbGF0aXZlUGF0aF07XG4gICAgfVxuICAgIHJldHVybiBhYnNvbHV0ZUNvZGVQYXRocztcbiAgfVxuXG4gIF9vbkRpZENoYW5nZVN0YXR1c2VzRm9yUmVwb3NpdG9yeShcbiAgICByZXBvOiBhdG9tJEdpdFJlcG9zaXRvcnkgfCBIZ1JlcG9zaXRvcnlDbGllbnQsXG4gICAgcm9vdEtleXNGb3JSZXBvc2l0b3J5OiBJbW11dGFibGUuTWFwPGF0b20kUmVwb3NpdG9yeSwgSW1tdXRhYmxlLlNldDxzdHJpbmc+PixcbiAgKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCByb290S2V5IG9mIHJvb3RLZXlzRm9yUmVwb3NpdG9yeS5nZXQocmVwbykpIHtcbiAgICAgIHRoaXMuc2V0VmNzU3RhdHVzZXMocm9vdEtleSwgdGhpcy5fZ2V0Q2FjaGVkUGF0aFN0YXR1c2VzKHJlcG8pKTtcbiAgICB9XG4gIH1cblxuICBfcmVwb3NpdG9yeVJlbW92ZWQocmVwbzogYXRvbSRSZXBvc2l0b3J5KSB7XG4gICAgY29uc3QgZGlzcG9zYWJsZSA9IHRoaXMuX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnkuZ2V0KHJlcG8pO1xuICAgIGlmICghZGlzcG9zYWJsZSkge1xuICAgICAgLy8gVGhlcmUgaXMgYSBzbWFsbCBjaGFuY2UgdGhhdCB0aGUgYWRkL3JlbW92ZSBvZiB0aGUgUmVwb3NpdG9yeSBjb3VsZCBoYXBwZW4gc28gcXVpY2tseSB0aGF0XG4gICAgICAvLyB0aGUgZW50cnkgZm9yIHRoZSByZXBvIGluIF9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5IGhhcyBub3QgYmVlbiBzZXQgeWV0LlxuICAgICAgLy8gVE9ETzogUmVwb3J0IGEgc29mdCBlcnJvciBmb3IgdGhpcy5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5ID0gdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeS5kZWxldGUocmVwbyk7XG4gICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlQWN0aW9ucztcbiJdfQ==