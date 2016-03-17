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

var _FileTreeStore2 = _interopRequireDefault(_FileTreeStore);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');

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
      var preview = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

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
          searchAllPanes: true,
          preview: preview
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
    key: '_repositoryAdded',
    value: _asyncToGenerator(function* (repo, rootKeysForRepository) {
      // For now, we only support HgRepository objects.
      if (repo.getType() !== 'hg') {
        return;
      }

      var hgRepo = repo;

      // At this point, we assume that repo is a Nuclide HgRepositoryClient.

      // First, get the output of `hg status` for the repository.

      var _require = require('../../nuclide-hg-repository-base');

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
      (0, _nuclideCommons.debounce)(this._onDidChangeStatusesForRepository.bind(this, hgRepo, rootKeysForRepository),
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
//# sourceMappingURL=data:application/json;base64,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QixNQUFNLENBQUMsT0FBTyxHQUFHLGVBQWUsQ0FBQyIsImZpbGUiOiJGaWxlVHJlZUFjdGlvbnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5cbmltcG9ydCB7QWN0aW9uVHlwZX0gZnJvbSAnLi9GaWxlVHJlZUNvbnN0YW50cyc7XG5pbXBvcnQge2RlYm91bmNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBGaWxlVHJlZURpc3BhdGNoZXIgZnJvbSAnLi9GaWxlVHJlZURpc3BhdGNoZXInO1xuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQgRmlsZVRyZWVTdG9yZSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtyZXBvc2l0b3J5Rm9yUGF0aH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1naXQtYnJpZGdlJztcblxuaW1wb3J0IHR5cGUge0hnUmVwb3NpdG9yeUNsaWVudH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWNsaWVudCc7XG5pbXBvcnQgdHlwZSB7V29ya2luZ1NldH0gZnJvbSAnLi4vLi4vbnVjbGlkZS13b3JraW5nLXNldHMnO1xuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXRzU3RvcmV9IGZyb20gJy4uLy4uL251Y2xpZGUtd29ya2luZy1zZXRzL2xpYi9Xb3JraW5nU2V0c1N0b3JlJztcblxuXG5sZXQgaW5zdGFuY2U6ID9PYmplY3Q7XG5cbi8qKlxuICogSW1wbGVtZW50cyB0aGUgRmx1eCBwYXR0ZXJuIGZvciBvdXIgZmlsZSB0cmVlLiBBbGwgc3RhdGUgZm9yIHRoZSBmaWxlIHRyZWUgd2lsbCBiZSBrZXB0IGluXG4gKiBGaWxlVHJlZVN0b3JlIGFuZCB0aGUgb25seSB3YXkgdG8gdXBkYXRlIHRoZSBzdG9yZSBpcyB0aHJvdWdoIG1ldGhvZHMgb24gRmlsZVRyZWVBY3Rpb25zLiBUaGVcbiAqIGRpc3BhdGNoZXIgaXMgYSBtZWNoYW5pc20gdGhyb3VnaCB3aGljaCBGaWxlVHJlZUFjdGlvbnMgaW50ZXJmYWNlcyB3aXRoIEZpbGVUcmVlU3RvcmUuXG4gKi9cbmNsYXNzIEZpbGVUcmVlQWN0aW9ucyB7XG4gIF9kaXNwYXRjaGVyOiBEaXNwYXRjaGVyO1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5OiBJbW11dGFibGUuTWFwPGF0b20kUmVwb3NpdG9yeSwgRGlzcG9zYWJsZT47XG5cbiAgc3RhdGljIGdldEluc3RhbmNlKCk6IEZpbGVUcmVlQWN0aW9ucyB7XG4gICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgaW5zdGFuY2UgPSBuZXcgRmlsZVRyZWVBY3Rpb25zKCk7XG4gICAgfVxuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBGaWxlVHJlZURpc3BhdGNoZXIuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLl9zdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5ID0gbmV3IEltbXV0YWJsZS5NYXAoKTtcbiAgfVxuXG4gIHNldEN3ZChyb290S2V5OiA/c3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9DV0QsXG4gICAgICByb290S2V5LFxuICAgIH0pO1xuICB9XG5cbiAgc2V0Um9vdEtleXMocm9vdEtleXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICBjb25zdCBleGlzdGluZ1Jvb3RLZXlTZXQ6IEltbXV0YWJsZS5TZXQ8c3RyaW5nPiA9IG5ldyBJbW11dGFibGUuU2V0KHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCkpO1xuICAgIGNvbnN0IGFkZGVkUm9vdEtleXM6IEltbXV0YWJsZS5TZXQ8c3RyaW5nPiA9XG4gICAgICBuZXcgSW1tdXRhYmxlLlNldChyb290S2V5cykuc3VidHJhY3QoZXhpc3RpbmdSb290S2V5U2V0KTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX1JPT1RfS0VZUyxcbiAgICAgIHJvb3RLZXlzLFxuICAgIH0pO1xuICAgIGZvciAoY29uc3Qgcm9vdEtleSBvZiBhZGRlZFJvb3RLZXlzKSB7XG4gICAgICB0aGlzLmV4cGFuZE5vZGUocm9vdEtleSwgcm9vdEtleSk7XG4gICAgfVxuICB9XG5cbiAgZXhwYW5kTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5FWFBBTkRfTk9ERSxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgZXhwYW5kTm9kZURlZXAocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuRVhQQU5EX05PREVfREVFUCxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgZGVsZXRlU2VsZWN0ZWROb2RlcygpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHthY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkRFTEVURV9TRUxFQ1RFRF9OT0RFU30pO1xuICB9XG5cbiAgLy8gTWFrZXMgc3VyZSBhIHNwZWNpZmljIGNoaWxkIGV4aXN0cyBmb3IgYSBnaXZlbiBub2RlLiBJZiBpdCBkb2VzIG5vdCBleGlzdCwgdGVtcG9yYXJpbHlcbiAgLy8gY3JlYXRlIGl0IGFuZCBpbml0aWF0ZSBhIGZldGNoLiBUaGlzIGZlYXR1cmUgaXMgZXhjbHVzaXZlbHkgZm9yIGV4cGFuZGluZyB0byBhIG5vZGUgZGVlcFxuICAvLyBpbiBhIHRyZWUuXG4gIGVuc3VyZUNoaWxkTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZywgY2hpbGRLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5nZXRDaGlsZEtleXMocm9vdEtleSwgbm9kZUtleSkuaW5kZXhPZihjaGlsZEtleSkgIT09IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5DUkVBVEVfQ0hJTEQsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleSxcbiAgICAgIGNoaWxkS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgY29sbGFwc2VOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkNPTExBUFNFX05PREUsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbGxhcHNlTm9kZURlZXAocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuQ09MTEFQU0VfTk9ERV9ERUVQLFxuICAgICAgcm9vdEtleSxcbiAgICAgIG5vZGVLZXksXG4gICAgfSk7XG4gIH1cblxuICB0b2dnbGVTZWxlY3ROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IG5vZGVLZXlzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXkpO1xuICAgIGlmIChub2RlS2V5cy5oYXMobm9kZUtleSkpIHtcbiAgICAgIG5vZGVLZXlzID0gbm9kZUtleXMuZGVsZXRlKG5vZGVLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlS2V5cyA9IG5vZGVLZXlzLmFkZChub2RlS2V5KTtcbiAgICB9XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9TRUxFQ1RFRF9OT0RFU19GT1JfUk9PVCxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5cyxcbiAgICB9KTtcbiAgfVxuXG4gIHNldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfRVhDTFVERV9WQ1NfSUdOT1JFRF9QQVRIUyxcbiAgICAgIGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMsXG4gICAgfSk7XG4gIH1cblxuICBzZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX0hJREVfSUdOT1JFRF9OQU1FUyxcbiAgICAgIGhpZGVJZ25vcmVkTmFtZXMsXG4gICAgfSk7XG4gIH1cblxuICBzZXRJZ25vcmVkTmFtZXMoaWdub3JlZE5hbWVzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9JR05PUkVEX05BTUVTLFxuICAgICAgaWdub3JlZE5hbWVzLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0VHJhY2tlZE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX1RSQUNLRURfTk9ERSxcbiAgICAgIG5vZGVLZXksXG4gICAgICByb290S2V5LFxuICAgIH0pO1xuICB9XG5cbiAgc2V0VXNlUHJldmlld1RhYnModXNlUHJldmlld1RhYnM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX1VTRV9QUkVWSUVXX1RBQlMsXG4gICAgICB1c2VQcmV2aWV3VGFicyxcbiAgICB9KTtcbiAgfVxuXG4gIHNldFVzZVByZWZpeE5hdih1c2VQcmVmaXhOYXY6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX1VTRV9QUkVGSVhfTkFWLFxuICAgICAgdXNlUHJlZml4TmF2LFxuICAgIH0pO1xuICB9XG5cbiAgc2VsZWN0U2luZ2xlTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHNlbGVjdGVkS2V5c0J5Um9vdCA9IHt9O1xuICAgIHNlbGVjdGVkS2V5c0J5Um9vdFtyb290S2V5XSA9IG5ldyBJbW11dGFibGUuU2V0KFtub2RlS2V5XSk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9TRUxFQ1RFRF9OT0RFU19GT1JfVFJFRSxcbiAgICAgIHNlbGVjdGVkS2V5c0J5Um9vdCxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbmZpcm1Ob2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nLCBwcmV2aWV3OiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBpc0RpcmVjdG9yeSA9IEZpbGVUcmVlSGVscGVycy5pc0RpcktleShub2RlS2V5KTtcbiAgICBpZiAoaXNEaXJlY3RvcnkpIHtcbiAgICAgIGNvbnN0IGFjdGlvblR5cGUgPSB0aGlzLl9zdG9yZS5pc0V4cGFuZGVkKHJvb3RLZXksIG5vZGVLZXkpID9cbiAgICAgICAgQWN0aW9uVHlwZS5DT0xMQVBTRV9OT0RFIDpcbiAgICAgICAgQWN0aW9uVHlwZS5FWFBBTkRfTk9ERTtcbiAgICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgICBhY3Rpb25UeXBlOiBhY3Rpb25UeXBlLFxuICAgICAgICBub2RlS2V5LFxuICAgICAgICByb290S2V5LFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oXG4gICAgICAgIEZpbGVUcmVlSGVscGVycy5rZXlUb1BhdGgobm9kZUtleSksXG4gICAgICAgIHtcbiAgICAgICAgICBhY3RpdmF0ZVBhbmU6IHRydWUsXG4gICAgICAgICAgc2VhcmNoQWxsUGFuZXM6IHRydWUsXG4gICAgICAgICAgcHJldmlldyxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBrZWVwUHJldmlld1RhYigpIHtcbiAgICBjb25zdCBhY3RpdmVQYW5lSXRlbSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCk7XG4gICAgaWYgKGFjdGl2ZVBhbmVJdGVtICE9IG51bGwpIHtcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGFjdGl2ZVBhbmVJdGVtKSwgJ3RhYnM6a2VlcC1wcmV2aWV3LXRhYicpO1xuICAgIH1cbiAgfVxuXG4gIG9wZW5TZWxlY3RlZEVudHJ5U3BsaXQoXG4gICAgbm9kZUtleTogc3RyaW5nLFxuICAgIG9yaWVudGF0aW9uOiBhdG9tJFBhbmVTcGxpdE9yaWVudGF0aW9uLFxuICAgIHNpZGU6IGF0b20kUGFuZVNwbGl0U2lkZVxuICApOiB2b2lkIHtcbiAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpO1xuICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUoXG4gICAgICBGaWxlVHJlZUhlbHBlcnMua2V5VG9QYXRoKG5vZGVLZXkpLFxuICAgICAgcGFuZS5zcGxpdChvcmllbnRhdGlvbiwgc2lkZSlcbiAgICApO1xuICB9XG5cbiAgc2V0VmNzU3RhdHVzZXMocm9vdEtleTogc3RyaW5nLCB2Y3NTdGF0dXNlczoge1twYXRoOiBzdHJpbmddOiBudW1iZXJ9KTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9WQ1NfU1RBVFVTRVMsXG4gICAgICByb290S2V5LFxuICAgICAgdmNzU3RhdHVzZXMsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgcm9vdCByZXBvc2l0b3JpZXMgdG8gbWF0Y2ggdGhlIHByb3ZpZGVkIGRpcmVjdG9yaWVzLlxuICAgKi9cbiAgYXN5bmMgdXBkYXRlUmVwb3NpdG9yaWVzKHJvb3REaXJlY3RvcmllczogQXJyYXk8YXRvbSREaXJlY3Rvcnk+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgcm9vdEtleXMgPSByb290RGlyZWN0b3JpZXMubWFwKFxuICAgICAgZGlyZWN0b3J5ID0+IEZpbGVUcmVlSGVscGVycy5kaXJQYXRoVG9LZXkoZGlyZWN0b3J5LmdldFBhdGgoKSlcbiAgICApO1xuICAgIGNvbnN0IHJvb3RSZXBvczogQXJyYXk8P2F0b20kUmVwb3NpdG9yeT4gPSBhd2FpdCBQcm9taXNlLmFsbChyb290RGlyZWN0b3JpZXMubWFwKFxuICAgICAgZGlyZWN0b3J5ID0+IHJlcG9zaXRvcnlGb3JQYXRoKGRpcmVjdG9yeS5nZXRQYXRoKCkpXG4gICAgKSk7XG5cbiAgICAvLyB0NzExNDE5NjogR2l2ZW4gdGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb24gb2YgSGdSZXBvc2l0b3J5Q2xpZW50LCBlYWNoIHJvb3QgZGlyZWN0b3J5IHdpbGxcbiAgICAvLyBhbHdheXMgY29ycmVzcG9uZCB0byBhIHVuaXF1ZSBpbnN0YW5jZSBvZiBIZ1JlcG9zaXRvcnlDbGllbnQuIElkZWFsbHksIGlmIG11bHRpcGxlIHN1YmZvbGRlcnNcbiAgICAvLyBvZiBhbiBIZyByZXBvIGFyZSB1c2VkIGFzIHByb2plY3Qgcm9vdHMgaW4gQXRvbSwgb25seSBvbmUgSGdSZXBvc2l0b3J5Q2xpZW50IHNob3VsZCBiZVxuICAgIC8vIGNyZWF0ZWQuXG5cbiAgICAvLyBHcm91cCBhbGwgb2YgdGhlIHJvb3Qga2V5cyBieSB0aGVpciByZXBvc2l0b3J5LCBleGNsdWRpbmcgYW55IHRoYXQgZG9uJ3QgYmVsb25nIHRvIGFcbiAgICAvLyByZXBvc2l0b3J5LlxuICAgIGNvbnN0IHJvb3RLZXlzRm9yUmVwb3NpdG9yeSA9IEltbXV0YWJsZS5MaXN0KHJvb3RLZXlzKVxuICAgICAgLmdyb3VwQnkoKHJvb3RLZXksIGluZGV4KSA9PiByb290UmVwb3NbaW5kZXhdKVxuICAgICAgLmZpbHRlcigodiwgaykgPT4gayAhPSBudWxsKVxuICAgICAgLm1hcCh2ID0+IG5ldyBJbW11dGFibGUuU2V0KHYpKTtcblxuICAgIGNvbnN0IHByZXZSZXBvcyA9IHRoaXMuX3N0b3JlLmdldFJlcG9zaXRvcmllcygpO1xuXG4gICAgLy8gTGV0IHRoZSBzdG9yZSBrbm93IHdlIGhhdmUgc29tZSBuZXcgcmVwb3MhXG4gICAgY29uc3QgbmV4dFJlcG9zOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT4gPVxuICAgICAgbmV3IEltbXV0YWJsZS5TZXQocm9vdEtleXNGb3JSZXBvc2l0b3J5LmtleXMoKSk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9SRVBPU0lUT1JJRVMsXG4gICAgICByZXBvc2l0b3JpZXM6IG5leHRSZXBvcyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlbW92ZWRSZXBvcyA9IHByZXZSZXBvcy5zdWJ0cmFjdChuZXh0UmVwb3MpO1xuICAgIGNvbnN0IGFkZGVkUmVwb3MgPSBuZXh0UmVwb3Muc3VidHJhY3QocHJldlJlcG9zKTtcblxuXG4gICAgLy8gVE9ETzogUmV3cml0ZSBgX3JlcG9zaXRvcnlBZGRlZGAgdG8gcmV0dXJuIHRoZSBzdWJzY3JpcHRpb24gaW5zdGVhZCBvZiBhZGRpbmcgaXQgdG8gYSBtYXAgYXNcbiAgICAvLyAgICAgICBhIHNpZGUgZWZmZWN0LiBUaGUgbWFwIGNhbiBiZSBjcmVhdGVkIGhlcmUgd2l0aCBzb21ldGhpbmcgbGlrZVxuICAgIC8vICAgICAgIGBzdWJzY3JpcHRpb25zID0gSW1tdXRhYmxlLk1hcChyZXBvcykubWFwKHRoaXMuX3JlcG9zaXRvcnlBZGRlZClgLiBTaW5jZVxuICAgIC8vICAgICAgIGBfcmVwb3NpdG9yeUFkZGVkYCB3aWxsIG5vIGxvbmdlciBiZSBhYm91dCBzaWRlIGVmZmVjdHMsIGl0IHNob3VsZCB0aGVuIGJlIHJlbmFtZWQuXG4gICAgLy8gICAgICAgYF9yZXBvc2l0b3J5UmVtb3ZlZGAgY291bGQgcHJvYmFibHkgYmUgaW5saW5lZCBoZXJlLiBUaGF0IHdvdWxkIGxlYXZlIHRoaXMgZnVuY3Rpb24gYXNcbiAgICAvLyAgICAgICB0aGUgb25seSBvbmUgZG9pbmcgc2lkZS1lZmZlY3RzLlxuXG4gICAgLy8gVW5zdWJzY3JpYmUgZnJvbSByZW1vdmVkUmVwb3MuXG4gICAgcmVtb3ZlZFJlcG9zLmZvckVhY2gocmVwbyA9PiB0aGlzLl9yZXBvc2l0b3J5UmVtb3ZlZChyZXBvLCByb290S2V5c0ZvclJlcG9zaXRvcnkpKTtcblxuICAgIC8vIENyZWF0ZSBzdWJzY3JpcHRpb25zIGZvciBhZGRlZFJlcG9zLlxuICAgIGFkZGVkUmVwb3MuZm9yRWFjaChyZXBvID0+IHRoaXMuX3JlcG9zaXRvcnlBZGRlZChyZXBvLCByb290S2V5c0ZvclJlcG9zaXRvcnkpKTtcbiAgfVxuXG4gIHVwZGF0ZVdvcmtpbmdTZXQod29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfV09SS0lOR19TRVQsXG4gICAgICB3b3JraW5nU2V0LFxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlT3BlbkZpbGVzV29ya2luZ1NldChvcGVuRmlsZXNXb3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9PUEVOX0ZJTEVTX1dPUktJTkdfU0VULFxuICAgICAgb3BlbkZpbGVzV29ya2luZ1NldCxcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVdvcmtpbmdTZXRzU3RvcmUod29ya2luZ1NldHNTdG9yZTogP1dvcmtpbmdTZXRzU3RvcmUpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX1dPUktJTkdfU0VUU19TVE9SRSxcbiAgICAgIHdvcmtpbmdTZXRzU3RvcmUsXG4gICAgfSk7XG4gIH1cblxuICBzdGFydEVkaXRpbmdXb3JraW5nU2V0KGVkaXRlZFdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU1RBUlRfRURJVElOR19XT1JLSU5HX1NFVCxcbiAgICAgIGVkaXRlZFdvcmtpbmdTZXQsXG4gICAgfSk7XG4gIH1cblxuICBmaW5pc2hFZGl0aW5nV29ya2luZ1NldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuRklOSVNIX0VESVRJTkdfV09SS0lOR19TRVQsXG4gICAgfSk7XG4gIH1cblxuICBjaGVja05vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuQ0hFQ0tfTk9ERSxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgdW5jaGVja05vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuVU5DSEVDS19OT0RFLFxuICAgICAgcm9vdEtleSxcbiAgICAgIG5vZGVLZXksXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfcmVwb3NpdG9yeUFkZGVkKFxuICAgIHJlcG86IGF0b20kUmVwb3NpdG9yeSxcbiAgICByb290S2V5c0ZvclJlcG9zaXRvcnk6IEltbXV0YWJsZS5NYXA8YXRvbSRSZXBvc2l0b3J5LCBJbW11dGFibGUuU2V0PHN0cmluZz4+LFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBGb3Igbm93LCB3ZSBvbmx5IHN1cHBvcnQgSGdSZXBvc2l0b3J5IG9iamVjdHMuXG4gICAgaWYgKHJlcG8uZ2V0VHlwZSgpICE9PSAnaGcnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaGdSZXBvID0gKChyZXBvOiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuXG4gICAgLy8gQXQgdGhpcyBwb2ludCwgd2UgYXNzdW1lIHRoYXQgcmVwbyBpcyBhIE51Y2xpZGUgSGdSZXBvc2l0b3J5Q2xpZW50LlxuXG4gICAgLy8gRmlyc3QsIGdldCB0aGUgb3V0cHV0IG9mIGBoZyBzdGF0dXNgIGZvciB0aGUgcmVwb3NpdG9yeS5cbiAgICBjb25zdCB7aGdDb25zdGFudHN9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1oZy1yZXBvc2l0b3J5LWJhc2UnKTtcbiAgICAvLyBUT0RPKG1ib2xpbik6IFZlcmlmeSB0aGF0IGFsbCBvZiB0aGlzIGlzIHNldCB1cCBjb3JyZWN0bHkgZm9yIHJlbW90ZSBmaWxlcy5cbiAgICBjb25zdCByZXBvUm9vdCA9IGhnUmVwby5nZXRXb3JraW5nRGlyZWN0b3J5KCk7XG4gICAgY29uc3Qgc3RhdHVzQ29kZUZvclBhdGggPSBhd2FpdCBoZ1JlcG8uZ2V0U3RhdHVzZXMoW3JlcG9Sb290XSwge1xuICAgICAgaGdTdGF0dXNPcHRpb246IGhnQ29uc3RhbnRzLkhnU3RhdHVzT3B0aW9uLk9OTFlfTk9OX0lHTk9SRUQsXG4gICAgfSk7XG5cbiAgICAvLyBGcm9tIHRoZSBpbml0aWFsIHJlc3VsdCBvZiBgaGcgc3RhdHVzYCwgcmVjb3JkIHRoZSBzdGF0dXMgY29kZSBmb3IgZXZlcnkgZmlsZSBpblxuICAgIC8vIHN0YXR1c0NvZGVGb3JQYXRoIGluIHRoZSBzdGF0dXNlc1RvUmVwb3J0IG1hcC4gSWYgdGhlIGZpbGUgaXMgbW9kaWZpZWQsIGFsc28gbWFyayBldmVyeVxuICAgIC8vIHBhcmVudCBkaXJlY3RvcnkgKHVwIHRvIHRoZSByZXBvc2l0b3J5IHJvb3QpIG9mIHRoYXQgZmlsZSBhcyBtb2RpZmllZCwgYXMgd2VsbC4gRm9yIG5vdywgd2VcbiAgICAvLyBtYXJrIG9ubHkgbmV3IGZpbGVzLCBidXQgbm90IG5ldyBkaXJlY3Rvcmllcy5cbiAgICBjb25zdCBzdGF0dXNlc1RvUmVwb3J0ID0ge307XG4gICAgc3RhdHVzQ29kZUZvclBhdGguZm9yRWFjaCgoc3RhdHVzQ29kZSwgcGF0aCkgPT4ge1xuICAgICAgaWYgKGhnUmVwby5pc1N0YXR1c01vZGlmaWVkKHN0YXR1c0NvZGUpKSB7XG4gICAgICAgIHN0YXR1c2VzVG9SZXBvcnRbcGF0aF0gPSBzdGF0dXNDb2RlO1xuXG4gICAgICAgIC8vIEZvciBtb2RpZmllZCBmaWxlcywgZXZlcnkgcGFyZW50IGRpcmVjdG9yeSBzaG91bGQgYWxzbyBiZSBmbGFnZ2VkIGFzIG1vZGlmaWVkLlxuICAgICAgICBsZXQgbm9kZUtleTogc3RyaW5nID0gcGF0aDtcbiAgICAgICAgY29uc3Qga2V5Rm9yUmVwb1Jvb3QgPSBGaWxlVHJlZUhlbHBlcnMuZGlyUGF0aFRvS2V5KHJlcG9Sb290KTtcbiAgICAgICAgZG8ge1xuICAgICAgICAgIGNvbnN0IHBhcmVudEtleSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkobm9kZUtleSk7XG4gICAgICAgICAgaWYgKHBhcmVudEtleSA9PSBudWxsKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBub2RlS2V5ID0gcGFyZW50S2V5O1xuICAgICAgICAgIGlmIChzdGF0dXNlc1RvUmVwb3J0Lmhhc093blByb3BlcnR5KG5vZGVLZXkpKSB7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhbHJlYWR5IGFuIGVudHJ5IGZvciB0aGlzIHBhcmVudCBmaWxlIGluIHRoZSBzdGF0dXNlc1RvUmVwb3J0IG1hcCwgdGhlblxuICAgICAgICAgICAgLy8gdGhlcmUgaXMgbm8gcmVhc29uIHRvIGNvbnRpbnVlIGV4cGxvcmluZyBhbmNlc3RvciBkaXJlY3Rvcmllcy5cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGF0dXNlc1RvUmVwb3J0W25vZGVLZXldID0gaGdDb25zdGFudHMuU3RhdHVzQ29kZU51bWJlci5NT0RJRklFRDtcbiAgICAgICAgICB9XG4gICAgICAgIH0gd2hpbGUgKG5vZGVLZXkgIT09IGtleUZvclJlcG9Sb290KTtcbiAgICAgIH0gZWxzZSBpZiAoc3RhdHVzQ29kZSA9PT0gaGdDb25zdGFudHMuU3RhdHVzQ29kZU51bWJlci5BRERFRCkge1xuICAgICAgICBzdGF0dXNlc1RvUmVwb3J0W3BhdGhdID0gc3RhdHVzQ29kZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBmb3IgKGNvbnN0IHJvb3RLZXlGb3JSZXBvIG9mIHJvb3RLZXlzRm9yUmVwb3NpdG9yeS5nZXQoaGdSZXBvKSkge1xuICAgICAgdGhpcy5zZXRWY3NTdGF0dXNlcyhyb290S2V5Rm9yUmVwbywgc3RhdHVzZXNUb1JlcG9ydCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETzogQ2FsbCBnZXRTdGF0dXNlcyB3aXRoIDx2aXNpYmxlX25vZGVzLCBoZ0NvbnN0YW50cy5IZ1N0YXR1c09wdGlvbi5PTkxZX0lHTk9SRUQ+XG4gICAgLy8gdG8gZGV0ZXJtaW5lIHdoaWNoIG5vZGVzIGluIHRoZSB0cmVlIG5lZWQgdG8gYmUgc2hvd24gYXMgaWdub3JlZC5cblxuICAgIC8vIE5vdyB0aGF0IHRoZSBpbml0aWFsIFZDUyBzdGF0dXNlcyBhcmUgc2V0LCBzdWJzY3JpYmUgdG8gY2hhbmdlcyB0byB0aGUgUmVwb3NpdG9yeSBzbyB0aGF0IHRoZVxuICAgIC8vIFZDUyBzdGF0dXNlcyBhcmUga2VwdCB1cCB0byBkYXRlLlxuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IGhnUmVwby5vbkRpZENoYW5nZVN0YXR1c2VzKFxuICAgICAgLy8gdDgyMjc1NzA6IElmIHRoZSB1c2VyIGlzIGEgXCJuZXJ2b3VzIHNhdmVyLFwiIG1hbnkgb25EaWRDaGFuZ2VTdGF0dXNlcyB3aWxsIGdldCBmaXJlZCBpblxuICAgICAgLy8gc3VjY2Vzc2lvbi4gV2Ugc2hvdWxkIHByb2JhYmx5IGV4cGxvcmUgZGVib3VuY2luZyB0aGlzIGluIEhnUmVwb3NpdG9yeUNsaWVudCBpdHNlbGYuXG4gICAgICBkZWJvdW5jZShcbiAgICAgICAgdGhpcy5fb25EaWRDaGFuZ2VTdGF0dXNlc0ZvclJlcG9zaXRvcnkuYmluZCh0aGlzLCBoZ1JlcG8sIHJvb3RLZXlzRm9yUmVwb3NpdG9yeSksXG4gICAgICAgIC8qIHdhaXQgKi8gMTAwMCxcbiAgICAgICAgLyogaW1tZWRpYXRlICovIGZhbHNlLFxuICAgICAgKVxuICAgICk7XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5ID0gdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeS5zZXQoaGdSZXBvLCBzdWJzY3JpcHRpb24pO1xuICB9XG5cbiAgX29uRGlkQ2hhbmdlU3RhdHVzZXNGb3JSZXBvc2l0b3J5KFxuICAgIHJlcG86IEhnUmVwb3NpdG9yeUNsaWVudCxcbiAgICByb290S2V5c0ZvclJlcG9zaXRvcnk6IEltbXV0YWJsZS5NYXA8YXRvbSRSZXBvc2l0b3J5LCBJbW11dGFibGUuU2V0PHN0cmluZz4+LFxuICApOiB2b2lkIHtcbiAgICBmb3IgKGNvbnN0IHJvb3RLZXkgb2Ygcm9vdEtleXNGb3JSZXBvc2l0b3J5LmdldChyZXBvKSkge1xuICAgICAgY29uc3Qgc3RhdHVzRm9yTm9kZUtleSA9IHt9O1xuICAgICAgZm9yIChjb25zdCBmaWxlVHJlZU5vZGUgb2YgdGhpcy5fc3RvcmUuZ2V0VmlzaWJsZU5vZGVzKHJvb3RLZXkpKSB7XG4gICAgICAgIGNvbnN0IHtub2RlS2V5fSA9IGZpbGVUcmVlTm9kZTtcbiAgICAgICAgc3RhdHVzRm9yTm9kZUtleVtub2RlS2V5XSA9IGZpbGVUcmVlTm9kZS5pc0NvbnRhaW5lclxuICAgICAgICAgID8gcmVwby5nZXREaXJlY3RvcnlTdGF0dXMobm9kZUtleSlcbiAgICAgICAgICA6IHN0YXR1c0Zvck5vZGVLZXlbbm9kZUtleV0gPSByZXBvLmdldENhY2hlZFBhdGhTdGF0dXMobm9kZUtleSk7XG4gICAgICB9XG4gICAgICB0aGlzLnNldFZjc1N0YXR1c2VzKHJvb3RLZXksIHN0YXR1c0Zvck5vZGVLZXkpO1xuICAgIH1cbiAgfVxuXG4gIF9yZXBvc2l0b3J5UmVtb3ZlZChyZXBvOiBhdG9tJFJlcG9zaXRvcnkpIHtcbiAgICBjb25zdCBkaXNwb3NhYmxlID0gdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeS5nZXQocmVwbyk7XG4gICAgaWYgKCFkaXNwb3NhYmxlKSB7XG4gICAgICAvLyBUaGVyZSBpcyBhIHNtYWxsIGNoYW5jZSB0aGF0IHRoZSBhZGQvcmVtb3ZlIG9mIHRoZSBSZXBvc2l0b3J5IGNvdWxkIGhhcHBlbiBzbyBxdWlja2x5IHRoYXRcbiAgICAgIC8vIHRoZSBlbnRyeSBmb3IgdGhlIHJlcG8gaW4gX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnkgaGFzIG5vdCBiZWVuIHNldCB5ZXQuXG4gICAgICAvLyBUT0RPOiBSZXBvcnQgYSBzb2Z0IGVycm9yIGZvciB0aGlzLlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnkgPSB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5LmRlbGV0ZShyZXBvKTtcbiAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVRyZWVBY3Rpb25zO1xuIl19