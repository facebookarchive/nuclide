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
//# sourceMappingURL=data:application/json;base64,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QWN0aW9ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcblxuaW1wb3J0IHtBY3Rpb25UeXBlfSBmcm9tICcuL0ZpbGVUcmVlQ29uc3RhbnRzJztcbmltcG9ydCB7ZGVib3VuY2V9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCBGaWxlVHJlZURpc3BhdGNoZXIgZnJvbSAnLi9GaWxlVHJlZURpc3BhdGNoZXInO1xuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQgRmlsZVRyZWVTdG9yZSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtyZXBvc2l0b3J5Rm9yUGF0aH0gZnJvbSAnLi4vLi4vaGctZ2l0LWJyaWRnZSc7XG5cbmltcG9ydCB0eXBlIHtIZ1JlcG9zaXRvcnlDbGllbnR9IGZyb20gJy4uLy4uL2hnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0fSBmcm9tICcuLi8uLi93b3JraW5nLXNldHMnO1xuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXRzU3RvcmV9IGZyb20gJy4uLy4uL3dvcmtpbmctc2V0cy9saWIvV29ya2luZ1NldHNTdG9yZSc7XG5cblxubGV0IGluc3RhbmNlOiA/T2JqZWN0O1xuXG4vKipcbiAqIEltcGxlbWVudHMgdGhlIEZsdXggcGF0dGVybiBmb3Igb3VyIGZpbGUgdHJlZS4gQWxsIHN0YXRlIGZvciB0aGUgZmlsZSB0cmVlIHdpbGwgYmUga2VwdCBpblxuICogRmlsZVRyZWVTdG9yZSBhbmQgdGhlIG9ubHkgd2F5IHRvIHVwZGF0ZSB0aGUgc3RvcmUgaXMgdGhyb3VnaCBtZXRob2RzIG9uIEZpbGVUcmVlQWN0aW9ucy4gVGhlXG4gKiBkaXNwYXRjaGVyIGlzIGEgbWVjaGFuaXNtIHRocm91Z2ggd2hpY2ggRmlsZVRyZWVBY3Rpb25zIGludGVyZmFjZXMgd2l0aCBGaWxlVHJlZVN0b3JlLlxuICovXG5jbGFzcyBGaWxlVHJlZUFjdGlvbnMge1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeTogSW1tdXRhYmxlLk1hcDxhdG9tJFJlcG9zaXRvcnksIERpc3Bvc2FibGU+O1xuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBGaWxlVHJlZUFjdGlvbnMge1xuICAgIGlmICghaW5zdGFuY2UpIHtcbiAgICAgIGluc3RhbmNlID0gbmV3IEZpbGVUcmVlQWN0aW9ucygpO1xuICAgIH1cbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyID0gRmlsZVRyZWVEaXNwYXRjaGVyLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5fc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSA9IG5ldyBJbW11dGFibGUuTWFwKCk7XG4gIH1cblxuICBzZXRDd2Qocm9vdEtleTogP3N0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfQ1dELFxuICAgICAgcm9vdEtleSxcbiAgICB9KTtcbiAgfVxuXG4gIHNldFJvb3RLZXlzKHJvb3RLZXlzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgY29uc3QgZXhpc3RpbmdSb290S2V5U2V0OiBJbW11dGFibGUuU2V0PHN0cmluZz4gPSBuZXcgSW1tdXRhYmxlLlNldCh0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpKTtcbiAgICBjb25zdCBhZGRlZFJvb3RLZXlzOiBJbW11dGFibGUuU2V0PHN0cmluZz4gPVxuICAgICAgbmV3IEltbXV0YWJsZS5TZXQocm9vdEtleXMpLnN1YnRyYWN0KGV4aXN0aW5nUm9vdEtleVNldCk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9ST09UX0tFWVMsXG4gICAgICByb290S2V5cyxcbiAgICB9KTtcbiAgICBmb3IgKGNvbnN0IHJvb3RLZXkgb2YgYWRkZWRSb290S2V5cykge1xuICAgICAgdGhpcy5leHBhbmROb2RlKHJvb3RLZXksIHJvb3RLZXkpO1xuICAgIH1cbiAgfVxuXG4gIGV4cGFuZE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuRVhQQU5EX05PREUsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleSxcbiAgICB9KTtcbiAgfVxuXG4gIGV4cGFuZE5vZGVEZWVwKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkVYUEFORF9OT0RFX0RFRVAsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleSxcbiAgICB9KTtcbiAgfVxuXG4gIGRlbGV0ZVNlbGVjdGVkTm9kZXMoKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7YWN0aW9uVHlwZTogQWN0aW9uVHlwZS5ERUxFVEVfU0VMRUNURURfTk9ERVN9KTtcbiAgfVxuXG4gIC8vIE1ha2VzIHN1cmUgYSBzcGVjaWZpYyBjaGlsZCBleGlzdHMgZm9yIGEgZ2l2ZW4gbm9kZS4gSWYgaXQgZG9lcyBub3QgZXhpc3QsIHRlbXBvcmFyaWx5XG4gIC8vIGNyZWF0ZSBpdCBhbmQgaW5pdGlhdGUgYSBmZXRjaC4gVGhpcyBmZWF0dXJlIGlzIGV4Y2x1c2l2ZWx5IGZvciBleHBhbmRpbmcgdG8gYSBub2RlIGRlZXBcbiAgLy8gaW4gYSB0cmVlLlxuICBlbnN1cmVDaGlsZE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcsIGNoaWxkS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuZ2V0Q2hpbGRLZXlzKHJvb3RLZXksIG5vZGVLZXkpLmluZGV4T2YoY2hpbGRLZXkpICE9PSAtMSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuQ1JFQVRFX0NISUxELFxuICAgICAgcm9vdEtleSxcbiAgICAgIG5vZGVLZXksXG4gICAgICBjaGlsZEtleSxcbiAgICB9KTtcbiAgfVxuXG4gIGNvbGxhcHNlTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5DT0xMQVBTRV9OT0RFLFxuICAgICAgcm9vdEtleSxcbiAgICAgIG5vZGVLZXksXG4gICAgfSk7XG4gIH1cblxuICBjb2xsYXBzZU5vZGVEZWVwKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLkNPTExBUFNFX05PREVfREVFUCxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgdG9nZ2xlU2VsZWN0Tm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGxldCBub2RlS2V5cyA9IHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkS2V5cyhyb290S2V5KTtcbiAgICBpZiAobm9kZUtleXMuaGFzKG5vZGVLZXkpKSB7XG4gICAgICBub2RlS2V5cyA9IG5vZGVLZXlzLmRlbGV0ZShub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbm9kZUtleXMgPSBub2RlS2V5cy5hZGQobm9kZUtleSk7XG4gICAgfVxuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfU0VMRUNURURfTk9ERVNfRk9SX1JPT1QsXG4gICAgICByb290S2V5LFxuICAgICAgbm9kZUtleXMsXG4gICAgfSk7XG4gIH1cblxuICBzZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX0VYQ0xVREVfVkNTX0lHTk9SRURfUEFUSFMsXG4gICAgICBleGNsdWRlVmNzSWdub3JlZFBhdGhzLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9ISURFX0lHTk9SRURfTkFNRVMsXG4gICAgICBoaWRlSWdub3JlZE5hbWVzLFxuICAgIH0pO1xuICB9XG5cbiAgc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfSUdOT1JFRF9OQU1FUyxcbiAgICAgIGlnbm9yZWROYW1lcyxcbiAgICB9KTtcbiAgfVxuXG4gIHNldFRyYWNrZWROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9UUkFDS0VEX05PREUsXG4gICAgICBub2RlS2V5LFxuICAgICAgcm9vdEtleSxcbiAgICB9KTtcbiAgfVxuXG4gIHNldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9VU0VfUFJFVklFV19UQUJTLFxuICAgICAgdXNlUHJldmlld1RhYnMsXG4gICAgfSk7XG4gIH1cblxuICBzZXRVc2VQcmVmaXhOYXYodXNlUHJlZml4TmF2OiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9VU0VfUFJFRklYX05BVixcbiAgICAgIHVzZVByZWZpeE5hdixcbiAgICB9KTtcbiAgfVxuXG4gIHNlbGVjdFNpbmdsZU5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxlY3RlZEtleXNCeVJvb3QgPSB7fTtcbiAgICBzZWxlY3RlZEtleXNCeVJvb3Rbcm9vdEtleV0gPSBuZXcgSW1tdXRhYmxlLlNldChbbm9kZUtleV0pO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfU0VMRUNURURfTk9ERVNfRk9SX1RSRUUsXG4gICAgICBzZWxlY3RlZEtleXNCeVJvb3QsXG4gICAgfSk7XG4gIH1cblxuICBjb25maXJtTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGlzRGlyZWN0b3J5ID0gRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KG5vZGVLZXkpO1xuICAgIGlmIChpc0RpcmVjdG9yeSkge1xuICAgICAgY29uc3QgYWN0aW9uVHlwZSA9IHRoaXMuX3N0b3JlLmlzRXhwYW5kZWQocm9vdEtleSwgbm9kZUtleSkgP1xuICAgICAgICBBY3Rpb25UeXBlLkNPTExBUFNFX05PREUgOlxuICAgICAgICBBY3Rpb25UeXBlLkVYUEFORF9OT0RFO1xuICAgICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICAgIGFjdGlvblR5cGU6IGFjdGlvblR5cGUsXG4gICAgICAgIG5vZGVLZXksXG4gICAgICAgIHJvb3RLZXksXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihcbiAgICAgICAgRmlsZVRyZWVIZWxwZXJzLmtleVRvUGF0aChub2RlS2V5KSxcbiAgICAgICAge1xuICAgICAgICAgIGFjdGl2YXRlUGFuZTogdHJ1ZSxcbiAgICAgICAgICBzZWFyY2hBbGxQYW5lczogdHJ1ZSxcbiAgICAgICAgfVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBrZWVwUHJldmlld1RhYigpIHtcbiAgICBjb25zdCBhY3RpdmVQYW5lSXRlbSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCk7XG4gICAgaWYgKGFjdGl2ZVBhbmVJdGVtICE9IG51bGwpIHtcbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGFjdGl2ZVBhbmVJdGVtKSwgJ3RhYnM6a2VlcC1wcmV2aWV3LXRhYicpO1xuICAgIH1cbiAgfVxuXG4gIG9wZW5TZWxlY3RlZEVudHJ5U3BsaXQoXG4gICAgbm9kZUtleTogc3RyaW5nLFxuICAgIG9yaWVudGF0aW9uOiBhdG9tJFBhbmVTcGxpdE9yaWVudGF0aW9uLFxuICAgIHNpZGU6IGF0b20kUGFuZVNwbGl0U2lkZVxuICApOiB2b2lkIHtcbiAgICBjb25zdCBwYW5lID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpO1xuICAgIGF0b20ud29ya3NwYWNlLm9wZW5VUklJblBhbmUoXG4gICAgICBGaWxlVHJlZUhlbHBlcnMua2V5VG9QYXRoKG5vZGVLZXkpLFxuICAgICAgcGFuZS5zcGxpdChvcmllbnRhdGlvbiwgc2lkZSlcbiAgICApO1xuICB9XG5cbiAgc2V0VmNzU3RhdHVzZXMocm9vdEtleTogc3RyaW5nLCB2Y3NTdGF0dXNlczoge1twYXRoOiBzdHJpbmddOiBudW1iZXJ9KTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9WQ1NfU1RBVFVTRVMsXG4gICAgICByb290S2V5LFxuICAgICAgdmNzU3RhdHVzZXMsXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgcm9vdCByZXBvc2l0b3JpZXMgdG8gbWF0Y2ggdGhlIHByb3ZpZGVkIGRpcmVjdG9yaWVzLlxuICAgKi9cbiAgYXN5bmMgdXBkYXRlUmVwb3NpdG9yaWVzKHJvb3REaXJlY3RvcmllczogQXJyYXk8YXRvbSREaXJlY3Rvcnk+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3Qgcm9vdEtleXMgPSByb290RGlyZWN0b3JpZXMubWFwKFxuICAgICAgZGlyZWN0b3J5ID0+IEZpbGVUcmVlSGVscGVycy5kaXJQYXRoVG9LZXkoZGlyZWN0b3J5LmdldFBhdGgoKSlcbiAgICApO1xuICAgIGNvbnN0IHJvb3RSZXBvczogQXJyYXk8P2F0b20kUmVwb3NpdG9yeT4gPSBhd2FpdCBQcm9taXNlLmFsbChyb290RGlyZWN0b3JpZXMubWFwKFxuICAgICAgZGlyZWN0b3J5ID0+IHJlcG9zaXRvcnlGb3JQYXRoKGRpcmVjdG9yeS5nZXRQYXRoKCkpXG4gICAgKSk7XG5cbiAgICAvLyB0NzExNDE5NjogR2l2ZW4gdGhlIGN1cnJlbnQgaW1wbGVtZW50YXRpb24gb2YgSGdSZXBvc2l0b3J5Q2xpZW50LCBlYWNoIHJvb3QgZGlyZWN0b3J5IHdpbGxcbiAgICAvLyBhbHdheXMgY29ycmVzcG9uZCB0byBhIHVuaXF1ZSBpbnN0YW5jZSBvZiBIZ1JlcG9zaXRvcnlDbGllbnQuIElkZWFsbHksIGlmIG11bHRpcGxlIHN1YmZvbGRlcnNcbiAgICAvLyBvZiBhbiBIZyByZXBvIGFyZSB1c2VkIGFzIHByb2plY3Qgcm9vdHMgaW4gQXRvbSwgb25seSBvbmUgSGdSZXBvc2l0b3J5Q2xpZW50IHNob3VsZCBiZVxuICAgIC8vIGNyZWF0ZWQuXG5cbiAgICAvLyBHcm91cCBhbGwgb2YgdGhlIHJvb3Qga2V5cyBieSB0aGVpciByZXBvc2l0b3J5LCBleGNsdWRpbmcgYW55IHRoYXQgZG9uJ3QgYmVsb25nIHRvIGFcbiAgICAvLyByZXBvc2l0b3J5LlxuICAgIGNvbnN0IHJvb3RLZXlzRm9yUmVwb3NpdG9yeSA9IEltbXV0YWJsZS5MaXN0KHJvb3RLZXlzKVxuICAgICAgLmdyb3VwQnkoKHJvb3RLZXksIGluZGV4KSA9PiByb290UmVwb3NbaW5kZXhdKVxuICAgICAgLmZpbHRlcigodiwgaykgPT4gayAhPSBudWxsKVxuICAgICAgLm1hcCh2ID0+IG5ldyBJbW11dGFibGUuU2V0KHYpKTtcblxuICAgIGNvbnN0IHByZXZSZXBvcyA9IHRoaXMuX3N0b3JlLmdldFJlcG9zaXRvcmllcygpO1xuXG4gICAgLy8gTGV0IHRoZSBzdG9yZSBrbm93IHdlIGhhdmUgc29tZSBuZXcgcmVwb3MhXG4gICAgY29uc3QgbmV4dFJlcG9zOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT4gPVxuICAgICAgbmV3IEltbXV0YWJsZS5TZXQocm9vdEtleXNGb3JSZXBvc2l0b3J5LmtleXMoKSk7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9SRVBPU0lUT1JJRVMsXG4gICAgICByZXBvc2l0b3JpZXM6IG5leHRSZXBvcyxcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlbW92ZWRSZXBvcyA9IHByZXZSZXBvcy5zdWJ0cmFjdChuZXh0UmVwb3MpO1xuICAgIGNvbnN0IGFkZGVkUmVwb3MgPSBuZXh0UmVwb3Muc3VidHJhY3QocHJldlJlcG9zKTtcblxuXG4gICAgLy8gVE9ETzogUmV3cml0ZSBgX3JlcG9zaXRvcnlBZGRlZGAgdG8gcmV0dXJuIHRoZSBzdWJzY3JpcHRpb24gaW5zdGVhZCBvZiBhZGRpbmcgaXQgdG8gYSBtYXAgYXNcbiAgICAvLyAgICAgICBhIHNpZGUgZWZmZWN0LiBUaGUgbWFwIGNhbiBiZSBjcmVhdGVkIGhlcmUgd2l0aCBzb21ldGhpbmcgbGlrZVxuICAgIC8vICAgICAgIGBzdWJzY3JpcHRpb25zID0gSW1tdXRhYmxlLk1hcChyZXBvcykubWFwKHRoaXMuX3JlcG9zaXRvcnlBZGRlZClgLiBTaW5jZVxuICAgIC8vICAgICAgIGBfcmVwb3NpdG9yeUFkZGVkYCB3aWxsIG5vIGxvbmdlciBiZSBhYm91dCBzaWRlIGVmZmVjdHMsIGl0IHNob3VsZCB0aGVuIGJlIHJlbmFtZWQuXG4gICAgLy8gICAgICAgYF9yZXBvc2l0b3J5UmVtb3ZlZGAgY291bGQgcHJvYmFibHkgYmUgaW5saW5lZCBoZXJlLiBUaGF0IHdvdWxkIGxlYXZlIHRoaXMgZnVuY3Rpb24gYXNcbiAgICAvLyAgICAgICB0aGUgb25seSBvbmUgZG9pbmcgc2lkZS1lZmZlY3RzLlxuXG4gICAgLy8gVW5zdWJzY3JpYmUgZnJvbSByZW1vdmVkUmVwb3MuXG4gICAgcmVtb3ZlZFJlcG9zLmZvckVhY2gocmVwbyA9PiB0aGlzLl9yZXBvc2l0b3J5UmVtb3ZlZChyZXBvLCByb290S2V5c0ZvclJlcG9zaXRvcnkpKTtcblxuICAgIC8vIENyZWF0ZSBzdWJzY3JpcHRpb25zIGZvciBhZGRlZFJlcG9zLlxuICAgIGFkZGVkUmVwb3MuZm9yRWFjaChyZXBvID0+IHRoaXMuX3JlcG9zaXRvcnlBZGRlZChyZXBvLCByb290S2V5c0ZvclJlcG9zaXRvcnkpKTtcbiAgfVxuXG4gIHVwZGF0ZVdvcmtpbmdTZXQod29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogQWN0aW9uVHlwZS5TRVRfV09SS0lOR19TRVQsXG4gICAgICB3b3JraW5nU2V0LFxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlT3BlbkZpbGVzV29ya2luZ1NldChvcGVuRmlsZXNXb3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBBY3Rpb25UeXBlLlNFVF9PUEVOX0ZJTEVTX1dPUktJTkdfU0VULFxuICAgICAgb3BlbkZpbGVzV29ya2luZ1NldCxcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVdvcmtpbmdTZXRzU3RvcmUod29ya2luZ1NldHNTdG9yZTogP1dvcmtpbmdTZXRzU3RvcmUpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU0VUX1dPUktJTkdfU0VUU19TVE9SRSxcbiAgICAgIHdvcmtpbmdTZXRzU3RvcmUsXG4gICAgfSk7XG4gIH1cblxuICBzdGFydEVkaXRpbmdXb3JraW5nU2V0KGVkaXRlZFdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuU1RBUlRfRURJVElOR19XT1JLSU5HX1NFVCxcbiAgICAgIGVkaXRlZFdvcmtpbmdTZXQsXG4gICAgfSk7XG4gIH1cblxuICBmaW5pc2hFZGl0aW5nV29ya2luZ1NldCgpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuRklOSVNIX0VESVRJTkdfV09SS0lOR19TRVQsXG4gICAgfSk7XG4gIH1cblxuICBjaGVja05vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuQ0hFQ0tfTk9ERSxcbiAgICAgIHJvb3RLZXksXG4gICAgICBub2RlS2V5LFxuICAgIH0pO1xuICB9XG5cbiAgdW5jaGVja05vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IEFjdGlvblR5cGUuVU5DSEVDS19OT0RFLFxuICAgICAgcm9vdEtleSxcbiAgICAgIG5vZGVLZXksXG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBfcmVwb3NpdG9yeUFkZGVkKFxuICAgIHJlcG86IGF0b20kUmVwb3NpdG9yeSxcbiAgICByb290S2V5c0ZvclJlcG9zaXRvcnk6IEltbXV0YWJsZS5NYXA8YXRvbSRSZXBvc2l0b3J5LCBJbW11dGFibGUuU2V0PHN0cmluZz4+LFxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAvLyBGb3Igbm93LCB3ZSBvbmx5IHN1cHBvcnQgSGdSZXBvc2l0b3J5IG9iamVjdHMuXG4gICAgaWYgKHJlcG8uZ2V0VHlwZSgpICE9PSAnaGcnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaGdSZXBvID0gKChyZXBvOiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuXG4gICAgLy8gQXQgdGhpcyBwb2ludCwgd2UgYXNzdW1lIHRoYXQgcmVwbyBpcyBhIE51Y2xpZGUgSGdSZXBvc2l0b3J5Q2xpZW50LlxuXG4gICAgLy8gRmlyc3QsIGdldCB0aGUgb3V0cHV0IG9mIGBoZyBzdGF0dXNgIGZvciB0aGUgcmVwb3NpdG9yeS5cbiAgICBjb25zdCB7aGdDb25zdGFudHN9ID0gcmVxdWlyZSgnLi4vLi4vaGctcmVwb3NpdG9yeS1iYXNlJyk7XG4gICAgLy8gVE9ETyhtYm9saW4pOiBWZXJpZnkgdGhhdCBhbGwgb2YgdGhpcyBpcyBzZXQgdXAgY29ycmVjdGx5IGZvciByZW1vdGUgZmlsZXMuXG4gICAgY29uc3QgcmVwb1Jvb3QgPSBoZ1JlcG8uZ2V0V29ya2luZ0RpcmVjdG9yeSgpO1xuICAgIGNvbnN0IHN0YXR1c0NvZGVGb3JQYXRoID0gYXdhaXQgaGdSZXBvLmdldFN0YXR1c2VzKFtyZXBvUm9vdF0sIHtcbiAgICAgIGhnU3RhdHVzT3B0aW9uOiBoZ0NvbnN0YW50cy5IZ1N0YXR1c09wdGlvbi5PTkxZX05PTl9JR05PUkVELFxuICAgIH0pO1xuXG4gICAgLy8gRnJvbSB0aGUgaW5pdGlhbCByZXN1bHQgb2YgYGhnIHN0YXR1c2AsIHJlY29yZCB0aGUgc3RhdHVzIGNvZGUgZm9yIGV2ZXJ5IGZpbGUgaW5cbiAgICAvLyBzdGF0dXNDb2RlRm9yUGF0aCBpbiB0aGUgc3RhdHVzZXNUb1JlcG9ydCBtYXAuIElmIHRoZSBmaWxlIGlzIG1vZGlmaWVkLCBhbHNvIG1hcmsgZXZlcnlcbiAgICAvLyBwYXJlbnQgZGlyZWN0b3J5ICh1cCB0byB0aGUgcmVwb3NpdG9yeSByb290KSBvZiB0aGF0IGZpbGUgYXMgbW9kaWZpZWQsIGFzIHdlbGwuIEZvciBub3csIHdlXG4gICAgLy8gbWFyayBvbmx5IG5ldyBmaWxlcywgYnV0IG5vdCBuZXcgZGlyZWN0b3JpZXMuXG4gICAgY29uc3Qgc3RhdHVzZXNUb1JlcG9ydCA9IHt9O1xuICAgIHN0YXR1c0NvZGVGb3JQYXRoLmZvckVhY2goKHN0YXR1c0NvZGUsIHBhdGgpID0+IHtcbiAgICAgIGlmIChoZ1JlcG8uaXNTdGF0dXNNb2RpZmllZChzdGF0dXNDb2RlKSkge1xuICAgICAgICBzdGF0dXNlc1RvUmVwb3J0W3BhdGhdID0gc3RhdHVzQ29kZTtcblxuICAgICAgICAvLyBGb3IgbW9kaWZpZWQgZmlsZXMsIGV2ZXJ5IHBhcmVudCBkaXJlY3Rvcnkgc2hvdWxkIGFsc28gYmUgZmxhZ2dlZCBhcyBtb2RpZmllZC5cbiAgICAgICAgbGV0IG5vZGVLZXk6IHN0cmluZyA9IHBhdGg7XG4gICAgICAgIGNvbnN0IGtleUZvclJlcG9Sb290ID0gRmlsZVRyZWVIZWxwZXJzLmRpclBhdGhUb0tleShyZXBvUm9vdCk7XG4gICAgICAgIGRvIHtcbiAgICAgICAgICBjb25zdCBwYXJlbnRLZXkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KG5vZGVLZXkpO1xuICAgICAgICAgIGlmIChwYXJlbnRLZXkgPT0gbnVsbCkge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbm9kZUtleSA9IHBhcmVudEtleTtcbiAgICAgICAgICBpZiAoc3RhdHVzZXNUb1JlcG9ydC5oYXNPd25Qcm9wZXJ0eShub2RlS2V5KSkge1xuICAgICAgICAgICAgLy8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhbiBlbnRyeSBmb3IgdGhpcyBwYXJlbnQgZmlsZSBpbiB0aGUgc3RhdHVzZXNUb1JlcG9ydCBtYXAsIHRoZW5cbiAgICAgICAgICAgIC8vIHRoZXJlIGlzIG5vIHJlYXNvbiB0byBjb250aW51ZSBleHBsb3JpbmcgYW5jZXN0b3IgZGlyZWN0b3JpZXMuXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdHVzZXNUb1JlcG9ydFtub2RlS2V5XSA9IGhnQ29uc3RhbnRzLlN0YXR1c0NvZGVOdW1iZXIuTU9ESUZJRUQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IHdoaWxlIChub2RlS2V5ICE9PSBrZXlGb3JSZXBvUm9vdCk7XG4gICAgICB9IGVsc2UgaWYgKHN0YXR1c0NvZGUgPT09IGhnQ29uc3RhbnRzLlN0YXR1c0NvZGVOdW1iZXIuQURERUQpIHtcbiAgICAgICAgc3RhdHVzZXNUb1JlcG9ydFtwYXRoXSA9IHN0YXR1c0NvZGU7XG4gICAgICB9XG4gICAgfSk7XG4gICAgZm9yIChjb25zdCByb290S2V5Rm9yUmVwbyBvZiByb290S2V5c0ZvclJlcG9zaXRvcnkuZ2V0KGhnUmVwbykpIHtcbiAgICAgIHRoaXMuc2V0VmNzU3RhdHVzZXMocm9vdEtleUZvclJlcG8sIHN0YXR1c2VzVG9SZXBvcnQpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IENhbGwgZ2V0U3RhdHVzZXMgd2l0aCA8dmlzaWJsZV9ub2RlcywgaGdDb25zdGFudHMuSGdTdGF0dXNPcHRpb24uT05MWV9JR05PUkVEPlxuICAgIC8vIHRvIGRldGVybWluZSB3aGljaCBub2RlcyBpbiB0aGUgdHJlZSBuZWVkIHRvIGJlIHNob3duIGFzIGlnbm9yZWQuXG5cbiAgICAvLyBOb3cgdGhhdCB0aGUgaW5pdGlhbCBWQ1Mgc3RhdHVzZXMgYXJlIHNldCwgc3Vic2NyaWJlIHRvIGNoYW5nZXMgdG8gdGhlIFJlcG9zaXRvcnkgc28gdGhhdCB0aGVcbiAgICAvLyBWQ1Mgc3RhdHVzZXMgYXJlIGtlcHQgdXAgdG8gZGF0ZS5cbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBoZ1JlcG8ub25EaWRDaGFuZ2VTdGF0dXNlcyhcbiAgICAgIC8vIHQ4MjI3NTcwOiBJZiB0aGUgdXNlciBpcyBhIFwibmVydm91cyBzYXZlcixcIiBtYW55IG9uRGlkQ2hhbmdlU3RhdHVzZXMgd2lsbCBnZXQgZmlyZWQgaW5cbiAgICAgIC8vIHN1Y2Nlc3Npb24uIFdlIHNob3VsZCBwcm9iYWJseSBleHBsb3JlIGRlYm91bmNpbmcgdGhpcyBpbiBIZ1JlcG9zaXRvcnlDbGllbnQgaXRzZWxmLlxuICAgICAgZGVib3VuY2UoXG4gICAgICAgIHRoaXMuX29uRGlkQ2hhbmdlU3RhdHVzZXNGb3JSZXBvc2l0b3J5LmJpbmQodGhpcywgaGdSZXBvLCByb290S2V5c0ZvclJlcG9zaXRvcnkpLFxuICAgICAgICAvKiB3YWl0ICovIDEwMDAsXG4gICAgICAgIC8qIGltbWVkaWF0ZSAqLyBmYWxzZSxcbiAgICAgIClcbiAgICApO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSA9IHRoaXMuX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnkuc2V0KGhnUmVwbywgc3Vic2NyaXB0aW9uKTtcbiAgfVxuXG4gIF9vbkRpZENoYW5nZVN0YXR1c2VzRm9yUmVwb3NpdG9yeShcbiAgICByZXBvOiBIZ1JlcG9zaXRvcnlDbGllbnQsXG4gICAgcm9vdEtleXNGb3JSZXBvc2l0b3J5OiBJbW11dGFibGUuTWFwPGF0b20kUmVwb3NpdG9yeSwgSW1tdXRhYmxlLlNldDxzdHJpbmc+PixcbiAgKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCByb290S2V5IG9mIHJvb3RLZXlzRm9yUmVwb3NpdG9yeS5nZXQocmVwbykpIHtcbiAgICAgIGNvbnN0IHN0YXR1c0Zvck5vZGVLZXkgPSB7fTtcbiAgICAgIGZvciAoY29uc3QgZmlsZVRyZWVOb2RlIG9mIHRoaXMuX3N0b3JlLmdldFZpc2libGVOb2Rlcyhyb290S2V5KSkge1xuICAgICAgICBjb25zdCB7bm9kZUtleX0gPSBmaWxlVHJlZU5vZGU7XG4gICAgICAgIHN0YXR1c0Zvck5vZGVLZXlbbm9kZUtleV0gPSBmaWxlVHJlZU5vZGUuaXNDb250YWluZXJcbiAgICAgICAgICA/IHJlcG8uZ2V0RGlyZWN0b3J5U3RhdHVzKG5vZGVLZXkpXG4gICAgICAgICAgOiBzdGF0dXNGb3JOb2RlS2V5W25vZGVLZXldID0gcmVwby5nZXRDYWNoZWRQYXRoU3RhdHVzKG5vZGVLZXkpO1xuICAgICAgfVxuICAgICAgdGhpcy5zZXRWY3NTdGF0dXNlcyhyb290S2V5LCBzdGF0dXNGb3JOb2RlS2V5KTtcbiAgICB9XG4gIH1cblxuICBfcmVwb3NpdG9yeVJlbW92ZWQocmVwbzogYXRvbSRSZXBvc2l0b3J5KSB7XG4gICAgY29uc3QgZGlzcG9zYWJsZSA9IHRoaXMuX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnkuZ2V0KHJlcG8pO1xuICAgIGlmICghZGlzcG9zYWJsZSkge1xuICAgICAgLy8gVGhlcmUgaXMgYSBzbWFsbCBjaGFuY2UgdGhhdCB0aGUgYWRkL3JlbW92ZSBvZiB0aGUgUmVwb3NpdG9yeSBjb3VsZCBoYXBwZW4gc28gcXVpY2tseSB0aGF0XG4gICAgICAvLyB0aGUgZW50cnkgZm9yIHRoZSByZXBvIGluIF9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5IGhhcyBub3QgYmVlbiBzZXQgeWV0LlxuICAgICAgLy8gVE9ETzogUmVwb3J0IGEgc29mdCBlcnJvciBmb3IgdGhpcy5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5ID0gdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeS5kZWxldGUocmVwbyk7XG4gICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlQWN0aW9ucztcbiJdfQ==