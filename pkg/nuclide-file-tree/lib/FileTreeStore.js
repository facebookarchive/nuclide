Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _FileTreeDispatcher = require('./FileTreeDispatcher');

var _FileTreeDispatcher2 = _interopRequireDefault(_FileTreeDispatcher);

var _FileTreeHelpers = require('./FileTreeHelpers');

var _FileTreeHelpers2 = _interopRequireDefault(_FileTreeHelpers);

var _FileTreeNode = require('./FileTreeNode');

var _FileTreeNode2 = _interopRequireDefault(_FileTreeNode);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _FileTreeConstants = require('./FileTreeConstants');

var _atom = require('atom');

var _minimatch = require('minimatch');

var _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');

var _nuclideHgRepositoryBaseLibHgConstants = require('../../nuclide-hg-repository-base/lib/hg-constants');

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideLogging = require('../../nuclide-logging');

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

var _lodashMemoize = require('lodash.memoize');

var _lodashMemoize2 = _interopRequireDefault(_lodashMemoize);

var _nuclideWorkingSets = require('../../nuclide-working-sets');

// Used to ensure the version we serialized is the same version we are deserializing.
var VERSION = 1;

var instance = undefined;

/**
 * Implements the Flux pattern for our file tree. All state for the file tree will be kept in
 * FileTreeStore and the only way to update the store is through methods on FileTreeActions. The
 * dispatcher is a mechanism through which FileTreeActions interfaces with FileTreeStore.
 */

var FileTreeStore = (function () {
  _createClass(FileTreeStore, null, [{
    key: 'getInstance',
    value: function getInstance() {
      if (!instance) {
        instance = new FileTreeStore();
      }
      return instance;
    }
  }]);

  function FileTreeStore() {
    var _this = this;

    _classCallCheck(this, FileTreeStore);

    this._data = this._getDefaults();
    this._dispatcher = _FileTreeDispatcher2['default'].getInstance();
    this._emitter = new _atom.Emitter();
    this._dispatcher.register(function (payload) {
      return _this._onDispatch(payload);
    });
    this._logger = (0, _nuclideLogging.getLogger)();
    this._repositoryForPath = (0, _lodashMemoize2['default'])(this._repositoryForPath);
  }

  // A helper to delete a property in an object using shallow copy rather than mutation

  /**
   * TODO: Move to a [serialization class][1] and use the built-in versioning mechanism. This might
   * need to be done one level higher within main.js.
   *
   * [1]: https://atom.io/docs/latest/behind-atom-serialization-in-atom
   */

  _createClass(FileTreeStore, [{
    key: 'exportData',
    value: function exportData() {
      var data = this._data;
      // Grab the child keys of only the expanded nodes.
      var childKeyMap = {};
      Object.keys(data.expandedKeysByRoot).forEach(function (rootKey) {
        var expandedKeySet = data.expandedKeysByRoot[rootKey];
        for (var _nodeKey of expandedKeySet) {
          childKeyMap[_nodeKey] = data.childKeyMap[_nodeKey];
        }
      });
      return {
        version: VERSION,
        childKeyMap: childKeyMap,
        expandedKeysByRoot: mapValues(data.expandedKeysByRoot, function (keySet) {
          return keySet.toArray();
        }),
        rootKeys: data.rootKeys,
        selectedKeysByRoot: mapValues(data.selectedKeysByRoot, function (keySet) {
          return keySet.toArray();
        })
      };
    }

    /**
     * Imports store data from a previous export.
     */
  }, {
    key: 'loadData',
    value: function loadData(data) {
      var _this2 = this;

      // Ensure we are not trying to load data from an earlier version of this package.
      if (data.version !== VERSION) {
        return;
      }
      this._data = _extends({}, this._getDefaults(), {
        childKeyMap: data.childKeyMap,
        expandedKeysByRoot: mapValues(data.expandedKeysByRoot, function (keys) {
          return new _immutable2['default'].Set(keys);
        }),
        rootKeys: data.rootKeys,
        selectedKeysByRoot: mapValues(data.selectedKeysByRoot, function (keys) {
          return new _immutable2['default'].OrderedSet(keys);
        })
      });
      Object.keys(data.childKeyMap).forEach(function (nodeKey) {
        _this2._addSubscription(nodeKey);
        _this2._fetchChildKeys(nodeKey);
      });
    }
  }, {
    key: '_setExcludeVcsIgnoredPaths',
    value: function _setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
      this._set('excludeVcsIgnoredPaths', excludeVcsIgnoredPaths);
    }
  }, {
    key: '_setHideIgnoredNames',
    value: function _setHideIgnoredNames(hideIgnoredNames) {
      this._set('hideIgnoredNames', hideIgnoredNames);
    }

    /**
     * Given a list of names to ignore, compile them into minimatch patterns and
     * update the store with them.
     */
  }, {
    key: '_setIgnoredNames',
    value: function _setIgnoredNames(ignoredNames) {
      var ignoredPatterns = _immutable2['default'].Set(ignoredNames).map(function (ignoredName) {
        if (ignoredName === '') {
          return null;
        }
        try {
          return new _minimatch.Minimatch(ignoredName, { matchBase: true, dot: true });
        } catch (error) {
          atom.notifications.addWarning('Error parsing pattern \'' + ignoredName + '\' from "Settings" > "Ignored Names"', { detail: error.message });
          return null;
        }
      }).filter(function (pattern) {
        return pattern != null;
      });
      this._set('ignoredPatterns', ignoredPatterns);
    }
  }, {
    key: '_getDefaults',
    value: function _getDefaults() {
      return {
        cwdKey: null,
        childKeyMap: {},
        isDirtyMap: {},
        expandedKeysByRoot: {},
        trackedNode: null,
        previouslyExpanded: {},
        isLoadingMap: {},
        rootKeys: [],
        selectedKeysByRoot: {},
        subscriptionMap: {},
        vcsStatusesByRoot: {},
        ignoredPatterns: _immutable2['default'].Set(),
        hideIgnoredNames: true,
        excludeVcsIgnoredPaths: true,
        usePreviewTabs: false,
        usePrefixNav: true,
        repositories: _immutable2['default'].Set(),
        workingSet: new _nuclideWorkingSets.WorkingSet(),
        openFilesWorkingSet: new _nuclideWorkingSets.WorkingSet(),
        workingSetsStore: null,
        isEditingWorkingSet: false,
        editedWorkingSet: new _nuclideWorkingSets.WorkingSet()
      };
    }
  }, {
    key: '_onDispatch',
    value: function _onDispatch(payload) {
      switch (payload.actionType) {
        case _FileTreeConstants.ActionType.DELETE_SELECTED_NODES:
          this._deleteSelectedNodes()['catch'](function (error) {
            atom.notifications.addError('Deleting nodes failed with an error: ' + error.toString());
          });
          break;
        case _FileTreeConstants.ActionType.SET_CWD:
          this._setCwdKey(payload.rootKey);
          break;
        case _FileTreeConstants.ActionType.SET_TRACKED_NODE:
          this._setTrackedNode(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.SET_ROOT_KEYS:
          this._setRootKeys(payload.rootKeys);
          break;
        case _FileTreeConstants.ActionType.EXPAND_NODE:
          this._expandNode(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.EXPAND_NODE_DEEP:
          this._expandNodeDeep(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.COLLAPSE_NODE:
          this._collapseNode(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.SET_EXCLUDE_VCS_IGNORED_PATHS:
          this._setExcludeVcsIgnoredPaths(payload.excludeVcsIgnoredPaths);
          break;
        case _FileTreeConstants.ActionType.SET_USE_PREVIEW_TABS:
          this._setUsePreviewTabs(payload.usePreviewTabs);
          break;
        case _FileTreeConstants.ActionType.SET_USE_PREFIX_NAV:
          this._setUsePrefixNav(payload.usePrefixNav);
          break;
        case _FileTreeConstants.ActionType.COLLAPSE_NODE_DEEP:
          this._purgeDirectoryWithinARoot(payload.rootKey, payload.nodeKey, /* unselect */false);
          break;
        case _FileTreeConstants.ActionType.SET_HIDE_IGNORED_NAMES:
          this._setHideIgnoredNames(payload.hideIgnoredNames);
          break;
        case _FileTreeConstants.ActionType.SET_IGNORED_NAMES:
          this._setIgnoredNames(payload.ignoredNames);
          break;
        case _FileTreeConstants.ActionType.SET_SELECTED_NODES_FOR_ROOT:
          this._setSelectedKeys(payload.rootKey, payload.nodeKeys);
          break;
        case _FileTreeConstants.ActionType.SET_SELECTED_NODES_FOR_TREE:
          this._setSelectedKeysByRoot(payload.selectedKeysByRoot);
          break;
        case _FileTreeConstants.ActionType.CREATE_CHILD:
          this._createChild(payload.nodeKey, payload.childKey);
          break;
        case _FileTreeConstants.ActionType.SET_VCS_STATUSES:
          this._setVcsStatuses(payload.rootKey, payload.vcsStatuses);
          break;
        case _FileTreeConstants.ActionType.SET_REPOSITORIES:
          this._setRepositories(payload.repositories);
          break;
        case _FileTreeConstants.ActionType.SET_WORKING_SET:
          this._setWorkingSet(payload.workingSet);
          break;
        case _FileTreeConstants.ActionType.SET_OPEN_FILES_WORKING_SET:
          this._setOpenFilesWorkingSet(payload.openFilesWorkingSet);
          break;
        case _FileTreeConstants.ActionType.SET_WORKING_SETS_STORE:
          this._setWorkingSetsStore(payload.workingSetsStore);
          break;
        case _FileTreeConstants.ActionType.START_EDITING_WORKING_SET:
          this._startEditingWorkingSet(payload.editedWorkingSet);
          break;
        case _FileTreeConstants.ActionType.FINISH_EDITING_WORKING_SET:
          this._finishEditingWorkingSet();
          break;
        case _FileTreeConstants.ActionType.CHECK_NODE:
          this._checkNode(payload.rootKey, payload.nodeKey);
          break;
        case _FileTreeConstants.ActionType.UNCHECK_NODE:
          this._uncheckNode(payload.rootKey, payload.nodeKey);
          break;
      }
    }

    /**
     * This is a private method because in Flux we should never externally write to the data store.
     * Only by receiving actions (from dispatcher) should the data store be changed.
     * Note: `_set` can be called multiple times within one iteration of an event loop without
     * thrashing the UI because we are using setImmediate to batch change notifications, effectively
     * letting our views re-render once for multiple consecutive writes.
     */
  }, {
    key: '_set',
    value: function _set(key, value) {
      var _this3 = this;

      var flush = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      var oldData = this._data;
      // Immutability for the win!
      var newData = setProperty(this._data, key, value);
      if (newData !== oldData) {
        this._data = newData;
        clearImmediate(this._timer);
        if (flush) {
          // If `flush` is true, emit the change immediately.
          this._emitter.emit('change');
        } else {
          // If not flushing, de-bounce to prevent successive updates in the same event loop.
          this._timer = setImmediate(function () {
            _this3._emitter.emit('change');
          });
        }
      }
    }
  }, {
    key: 'getTrackedNode',
    value: function getTrackedNode() {
      return this._data.trackedNode;
    }
  }, {
    key: 'getRepositories',
    value: function getRepositories() {
      return this._data.repositories;
    }
  }, {
    key: 'getWorkingSet',
    value: function getWorkingSet() {
      return this._data.workingSet;
    }
  }, {
    key: 'getOpenFilesWorkingSet',
    value: function getOpenFilesWorkingSet() {
      return this._data.openFilesWorkingSet;
    }
  }, {
    key: 'getWorkingSetsStore',
    value: function getWorkingSetsStore() {
      return this._data.workingSetsStore;
    }
  }, {
    key: 'getRootKeys',
    value: function getRootKeys() {
      return this._data.rootKeys;
    }

    /**
     * Returns the key of the *first* root node containing the given node.
     */
  }, {
    key: 'getRootForKey',
    value: function getRootForKey(nodeKey) {
      return _nuclideCommons.array.find(this._data.rootKeys, function (rootKey) {
        return nodeKey.startsWith(rootKey);
      });
    }

    /**
     * Returns true if the store has no data, i.e. no roots, no children.
     */
  }, {
    key: 'isEmpty',
    value: function isEmpty() {
      return this.getRootKeys().length === 0;
    }

    /**
     * Note: We actually don't need rootKey (implementation detail) but we take it for consistency.
     */
  }, {
    key: 'isLoading',
    value: function isLoading(rootKey, nodeKey) {
      return !!this._getLoading(nodeKey);
    }
  }, {
    key: 'isExpanded',
    value: function isExpanded(rootKey, nodeKey) {
      return this._getExpandedKeys(rootKey).has(nodeKey);
    }
  }, {
    key: 'isRootKey',
    value: function isRootKey(nodeKey) {
      return this._data.rootKeys.indexOf(nodeKey) !== -1;
    }
  }, {
    key: 'isSelected',
    value: function isSelected(rootKey, nodeKey) {
      return this.getSelectedKeys(rootKey).has(nodeKey);
    }
  }, {
    key: '_setVcsStatuses',
    value: function _setVcsStatuses(rootKey, vcsStatuses) {
      var immutableVcsStatuses = new _immutable2['default'].Map(vcsStatuses);
      if (!_immutable2['default'].is(immutableVcsStatuses, this._data.vcsStatusesByRoot[rootKey])) {
        this._set('vcsStatusesByRoot', setProperty(this._data.vcsStatusesByRoot, rootKey, immutableVcsStatuses));
      }
    }
  }, {
    key: 'getVcsStatusCode',
    value: function getVcsStatusCode(rootKey, nodeKey) {
      var map = this._data.vcsStatusesByRoot[rootKey];
      if (map) {
        return map.get(nodeKey);
      } else {
        return null;
      }
    }
  }, {
    key: '_setUsePreviewTabs',
    value: function _setUsePreviewTabs(usePreviewTabs) {
      this._set('usePreviewTabs', usePreviewTabs);
    }
  }, {
    key: '_setUsePrefixNav',
    value: function _setUsePrefixNav(usePrefixNav) {
      this._set('usePrefixNav', usePrefixNav);
    }
  }, {
    key: 'usePreviewTabs',
    value: function usePreviewTabs() {
      return this._data.usePreviewTabs;
    }
  }, {
    key: 'usePrefixNav',
    value: function usePrefixNav() {
      return this._data.usePrefixNav;
    }

    /**
     * Returns known child keys for the given `nodeKey` but does not queue a fetch for missing
     * children like `::getChildKeys`.
     */
  }, {
    key: 'getCachedChildKeys',
    value: function getCachedChildKeys(rootKey, nodeKey) {
      return this._omitHiddenPaths(this._data.childKeyMap[nodeKey] || []);
    }

    /**
     * The node child keys may either be available immediately (cached), or
     * require an async fetch. If all of the children are needed it's easier to
     * return as promise, to make the caller oblivious to the way children were
     * fetched.
     */
  }, {
    key: 'promiseNodeChildKeys',
    value: function promiseNodeChildKeys(rootKey, nodeKey) {
      var _this4 = this;

      var cachedChildKeys = this.getChildKeys(rootKey, nodeKey);
      if (cachedChildKeys.length) {
        return Promise.resolve(cachedChildKeys);
      }

      var promise = this._getLoading(nodeKey) || Promise.resolve();
      return promise.then(function () {
        return _this4.getCachedChildKeys(rootKey, nodeKey);
      });
    }

    /**
     * Returns known child keys for the given `nodeKey` and queues a fetch if children are missing.
     */
  }, {
    key: 'getChildKeys',
    value: function getChildKeys(rootKey, nodeKey) {
      var childKeys = this._data.childKeyMap[nodeKey];
      if (childKeys == null || this._data.isDirtyMap[nodeKey]) {
        this._fetchChildKeys(nodeKey);
      } else {
        /*
         * If no data needs to be fetched, wipe out the scrolling state because subsequent updates
         * should no longer scroll the tree. The node will have already been flushed to the view and
         * scrolled to.
         */
        this._checkTrackedNode();
      }
      return this._omitHiddenPaths(childKeys || []);
    }
  }, {
    key: 'getSelectedKeys',
    value: function getSelectedKeys(rootKey) {
      var selectedKeys = undefined;
      if (rootKey == null) {
        selectedKeys = new _immutable2['default'].OrderedSet();
        for (var root in this._data.selectedKeysByRoot) {
          if (this._data.selectedKeysByRoot.hasOwnProperty(root)) {
            selectedKeys = selectedKeys.merge(this._data.selectedKeysByRoot[root]);
          }
        }
      } else {
        // If the given `rootKey` has no selected keys, assign an empty set to maintain a non-null
        // return value.
        selectedKeys = this._data.selectedKeysByRoot[rootKey] || new _immutable2['default'].OrderedSet();
      }
      return selectedKeys;
    }

    /**
     * Returns a list of the nodes that are currently visible/expanded in the file tree.
     *
     * This method returns an array synchronously (rather than an iterator) to ensure the caller
     * gets a consistent snapshot of the current state of the file tree.
     */
  }, {
    key: 'getVisibleNodes',
    value: function getVisibleNodes(rootKey) {
      // Do some basic checks to ensure that rootKey corresponds to a root and is expanded. If not,
      // return the appropriate array.
      if (!this.isRootKey(rootKey)) {
        return [];
      }
      if (!this.isExpanded(rootKey, rootKey)) {
        return [this.getNode(rootKey, rootKey)];
      }

      // Note that we could cache the visibleNodes array so that we do not have to create it from
      // scratch each time this is called, but it does not appear to be a bottleneck at present.
      var visibleNodes = [];
      var rootKeysForDirectoriesToExplore = [rootKey];
      while (rootKeysForDirectoriesToExplore.length !== 0) {
        var _key = rootKeysForDirectoriesToExplore.pop();
        visibleNodes.push(this.getNode(_key, _key));
        var childKeys = this._data.childKeyMap[_key];
        if (childKeys == null || this._data.isDirtyMap[_key]) {
          // This is where getChildKeys() would fetch, but we do not want to do that.
          // TODO: If key is in isDirtyMap, then retry when it is not dirty?
          continue;
        }

        for (var childKey of childKeys) {
          if (_FileTreeHelpers2['default'].isDirKey(childKey)) {
            if (this.isExpanded(rootKey, _key)) {
              rootKeysForDirectoriesToExplore.push(childKey);
            }
          } else {
            visibleNodes.push(this.getNode(_key, childKey));
          }
        }
      }
      return visibleNodes;
    }

    /**
     * Returns all selected nodes across all roots in the tree.
     */
  }, {
    key: 'getSelectedNodes',
    value: function getSelectedNodes() {
      var _this5 = this;

      var selectedNodes = new _immutable2['default'].OrderedSet();
      this._data.rootKeys.forEach(function (rootKey) {
        _this5.getSelectedKeys(rootKey).forEach(function (nodeKey) {
          selectedNodes = selectedNodes.add(_this5.getNode(rootKey, nodeKey));
        });
      });
      return selectedNodes;
    }
  }, {
    key: 'getSingleSelectedNode',
    value: function getSingleSelectedNode() {
      var selectedRoots = Object.keys(this._data.selectedKeysByRoot);
      if (selectedRoots.length !== 1) {
        // There is more than one root with selected nodes. No bueno.
        return null;
      }
      var rootKey = selectedRoots[0];
      var selectedKeys = this.getSelectedKeys(rootKey);
      /*
       * Note: This does not call `getSelectedNodes` to prevent creating nodes that would be thrown
       * away if there is more than 1 selected node.
       */
      return selectedKeys.size === 1 ? this.getNode(rootKey, selectedKeys.first()) : null;
    }
  }, {
    key: 'getRootNode',
    value: function getRootNode(rootKey) {
      return this.getNode(rootKey, rootKey);
    }
  }, {
    key: 'getNode',
    value: function getNode(rootKey, nodeKey) {
      return new _FileTreeNode2['default'](this, rootKey, nodeKey);
    }
  }, {
    key: 'isEditingWorkingSet',
    value: function isEditingWorkingSet() {
      return this._data.isEditingWorkingSet;
    }
  }, {
    key: 'getEditedWorkingSet',
    value: function getEditedWorkingSet() {
      return this._data.editedWorkingSet;
    }
  }, {
    key: '_setEditedWorkingSet',
    value: function _setEditedWorkingSet(editedWorkingSet) {
      this._set('editedWorkingSet', editedWorkingSet);
    }

    /**
     * If a fetch is not already in progress initiate a fetch now.
     */
  }, {
    key: '_fetchChildKeys',
    value: function _fetchChildKeys(nodeKey) {
      var _this6 = this;

      var existingPromise = this._getLoading(nodeKey);
      if (existingPromise) {
        return existingPromise;
      }

      var promise = _FileTreeHelpers2['default'].fetchChildren(nodeKey)['catch'](function (error) {
        _this6._logger.error('Unable to fetch children for "' + nodeKey + '".');
        _this6._logger.error('Original error: ', error);
        // Collapse the node and clear its loading state on error so the
        // user can retry expanding it.
        var rootKey = _this6.getRootForKey(nodeKey);
        if (rootKey != null) {
          _this6._collapseNode(rootKey, nodeKey);
        }
        _this6._clearLoading(nodeKey);
      }).then(function (childKeys) {
        // If this node's root went away while the Promise was resolving, do
        // no more work. This is no longer needed in the store.
        if (_this6.getRootForKey(nodeKey) == null) {
          return;
        }
        _this6._setChildKeys(nodeKey, childKeys);
        _this6._addSubscription(nodeKey);
        _this6._clearLoading(nodeKey);
      });

      this._setLoading(nodeKey, promise);
      return promise;
    }
  }, {
    key: '_getLoading',
    value: function _getLoading(nodeKey) {
      return this._data.isLoadingMap[nodeKey];
    }
  }, {
    key: '_setLoading',
    value: function _setLoading(nodeKey, value) {
      this._set('isLoadingMap', setProperty(this._data.isLoadingMap, nodeKey, value));
    }
  }, {
    key: 'isCwd',
    value: function isCwd(nodeKey) {
      return nodeKey === this._data.cwdKey;
    }
  }, {
    key: 'hasCwd',
    value: function hasCwd() {
      return this._data.cwdKey != null;
    }
  }, {
    key: '_setCwdKey',
    value: function _setCwdKey(rootKey) {
      this._set('cwdKey', rootKey);
    }

    /**
     * Resets the node to be kept in view if no more data is being awaited. Safe to call many times
     * because it only changes state if a node is being tracked.
     */
  }, {
    key: '_checkTrackedNode',
    value: function _checkTrackedNode() {
      if (this._data.trackedNode != null &&
      /*
       * The loading map being empty is a heuristic for when loading has completed. It is inexact
       * because the loading might be unrelated to the tracked node, however it is cheap and false
       * positives will only last until loading is complete or until the user clicks another node in
       * the tree.
       */
      _nuclideCommons.object.isEmpty(this._data.isLoadingMap)) {
        // Loading has completed. Allow scrolling to proceed as usual.
        this._set('trackedNode', null);
      }
    }
  }, {
    key: '_clearLoading',
    value: function _clearLoading(nodeKey) {
      this._set('isLoadingMap', deleteProperty(this._data.isLoadingMap, nodeKey));
      this._checkTrackedNode();
    }
  }, {
    key: '_deleteSelectedNodes',
    value: _asyncToGenerator(function* () {
      var selectedNodes = this.getSelectedNodes();
      yield Promise.all(selectedNodes.map(_asyncToGenerator(function* (node) {
        var entry = _FileTreeHelpers2['default'].getEntryByKey(node.nodeKey);

        if (entry == null) {
          return;
        }
        var path = entry.getPath();
        var repository = (0, _nuclideHgGitBridge.repositoryForPath)(path);
        if (repository != null && repository.getType() === 'hg') {
          var hgRepository = repository;
          try {
            yield hgRepository.remove(path);
          } catch (e) {
            var statuses = yield hgRepository.getStatuses([path]);
            var pathStatus = statuses.get(path);
            var goodStatuses = [_nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.ADDED, _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.CLEAN, _nuclideHgRepositoryBaseLibHgConstants.StatusCodeNumber.MODIFIED];
            if (goodStatuses.indexOf(pathStatus) !== -1) {
              atom.notifications.addError('Failed to remove ' + path + ' from version control.  The file will ' + 'still get deleted but you will have to remove it from your VCS yourself.  Error: ' + e.toString());
            }
          }
        }
        if (_FileTreeHelpers2['default'].isLocalEntry(entry)) {
          // TODO: This special-case can be eliminated once `delete()` is added to `Directory`
          // and `File`.
          _shell2['default'].moveItemToTrash(node.nodePath);
        } else {
          var remoteFile = entry;
          yield remoteFile['delete']();
        }
      })));
    })
  }, {
    key: '_expandNode',
    value: function _expandNode(rootKey, nodeKey) {
      this._setExpandedKeys(rootKey, this._getExpandedKeys(rootKey).add(nodeKey));
      // If we have child nodes that should also be expanded, expand them now.
      var previouslyExpanded = this._getPreviouslyExpanded(rootKey);
      if (previouslyExpanded.has(nodeKey)) {
        for (var childKey of previouslyExpanded.get(nodeKey)) {
          this._expandNode(rootKey, childKey);
        }
        // Clear the previouslyExpanded list since we're done with it.
        previouslyExpanded = previouslyExpanded['delete'](nodeKey);
        this._setPreviouslyExpanded(rootKey, previouslyExpanded);
      }
    }

    /**
     * Performes a deep BFS scanning expand of contained nodes.
     * returns - a promise fulfilled when the expand operation is finished
     */
  }, {
    key: '_expandNodeDeep',
    value: function _expandNodeDeep(rootKey, nodeKey) {
      var _this7 = this;

      // Stop the traversal after 100 nodes were added to the tree
      var itNodes = new FileTreeStoreBfsIterator(this, rootKey, nodeKey, /* limit*/100);
      var promise = new Promise(function (resolve) {
        var expand = function expand() {
          var traversedNodeKey = itNodes.traversedNode();
          if (traversedNodeKey) {
            _this7._setExpandedKeys(rootKey, _this7._getExpandedKeys(rootKey).add(traversedNodeKey));
            /**
             * Even if there were previously expanded nodes it doesn't matter as
             * we'll expand all of the children.
             */
            var _previouslyExpanded = _this7._getPreviouslyExpanded(rootKey);
            _previouslyExpanded = _previouslyExpanded['delete'](traversedNodeKey);
            _this7._setPreviouslyExpanded(rootKey, _previouslyExpanded);

            var nextPromise = itNodes.next();
            if (nextPromise) {
              nextPromise.then(expand);
            }
          } else {
            resolve();
          }
        };

        expand();
      });

      return promise;
    }

    /**
     * When we collapse a node we need to do some cleanup removing subscriptions and selection.
     */
  }, {
    key: '_collapseNode',
    value: function _collapseNode(rootKey, nodeKey) {
      var _this8 = this;

      var childKeys = this._data.childKeyMap[nodeKey];
      var selectedKeys = this._data.selectedKeysByRoot[rootKey];
      var expandedChildKeys = [];
      if (childKeys) {
        childKeys.forEach(function (childKey) {
          // Unselect each child.
          if (selectedKeys && selectedKeys.has(childKey)) {
            selectedKeys = selectedKeys['delete'](childKey);
            /*
             * Set the selected keys *before* the recursive `_collapseNode` call so each call stores
             * its changes and isn't wiped out by the next call by keeping an outdated `selectedKeys`
             * in the call stack.
             */
            _this8._setSelectedKeys(rootKey, selectedKeys);
          }
          // Collapse each child directory.
          if (_FileTreeHelpers2['default'].isDirKey(childKey)) {
            if (_this8.isExpanded(rootKey, childKey)) {
              expandedChildKeys.push(childKey);
              _this8._collapseNode(rootKey, childKey);
            }
          }
        });
      }
      /*
       * Save the list of expanded child nodes so next time we expand this node we can expand these
       * children.
       */
      var previouslyExpanded = this._getPreviouslyExpanded(rootKey);
      if (expandedChildKeys.length !== 0) {
        previouslyExpanded = previouslyExpanded.set(nodeKey, expandedChildKeys);
      } else {
        previouslyExpanded = previouslyExpanded['delete'](nodeKey);
      }
      this._setPreviouslyExpanded(rootKey, previouslyExpanded);
      this._setExpandedKeys(rootKey, this._getExpandedKeys(rootKey)['delete'](nodeKey));
      this._removeSubscription(rootKey, nodeKey);
    }
  }, {
    key: '_getPreviouslyExpanded',
    value: function _getPreviouslyExpanded(rootKey) {
      return this._data.previouslyExpanded[rootKey] || new _immutable2['default'].Map();
    }
  }, {
    key: '_setPreviouslyExpanded',
    value: function _setPreviouslyExpanded(rootKey, previouslyExpanded) {
      this._set('previouslyExpanded', setProperty(this._data.previouslyExpanded, rootKey, previouslyExpanded));
    }
  }, {
    key: '_getExpandedKeys',
    value: function _getExpandedKeys(rootKey) {
      return this._data.expandedKeysByRoot[rootKey] || new _immutable2['default'].Set();
    }

    /**
     * This is just exposed so it can be mocked in the tests. Not ideal, but a lot less messy than the
     * alternatives. For example, passing options when constructing an instance of a singleton would
     * make future invocations of `getInstance` unpredictable.
     */
  }, {
    key: '_repositoryForPath',
    value: function _repositoryForPath(path) {
      return this.getRepositories().find(function (repo) {
        return (0, _nuclideHgGitBridge.repositoryContainsPath)(repo, path);
      });
    }
  }, {
    key: '_setExpandedKeys',
    value: function _setExpandedKeys(rootKey, expandedKeys) {
      this._set('expandedKeysByRoot', setProperty(this._data.expandedKeysByRoot, rootKey, expandedKeys));
    }
  }, {
    key: '_deleteSelectedKeys',
    value: function _deleteSelectedKeys(rootKey) {
      this._set('selectedKeysByRoot', deleteProperty(this._data.selectedKeysByRoot, rootKey));
    }
  }, {
    key: '_setSelectedKeys',
    value: function _setSelectedKeys(rootKey, selectedKeys) {
      /*
       * New selection means previous node should not be kept in view. Do this without de-bouncing
       * because the previous state is irrelevant. If the user chose a new selection, the previous one
       * should not be scrolled into view.
       */
      this._set('trackedNode', null);
      this._set('selectedKeysByRoot', setProperty(this._data.selectedKeysByRoot, rootKey, selectedKeys));
    }

    /**
     * Sets the selected keys in all roots of the tree. The selected keys of root keys not in
     * `selectedKeysByRoot` are deleted (the root is left with no selection).
     */
  }, {
    key: '_setSelectedKeysByRoot',
    value: function _setSelectedKeysByRoot(selectedKeysByRoot) {
      var _this9 = this;

      this.getRootKeys().forEach(function (rootKey) {
        if (selectedKeysByRoot.hasOwnProperty(rootKey)) {
          _this9._setSelectedKeys(rootKey, selectedKeysByRoot[rootKey]);
        } else {
          _this9._deleteSelectedKeys(rootKey);
        }
      });
    }
  }, {
    key: '_setRootKeys',
    value: function _setRootKeys(rootKeys) {
      var oldRootKeys = this._data.rootKeys;
      var newRootKeys = new _immutable2['default'].Set(rootKeys);
      var removedRootKeys = new _immutable2['default'].Set(oldRootKeys).subtract(newRootKeys);
      removedRootKeys.forEach(this._purgeRoot.bind(this));
      this._set('rootKeys', rootKeys);
    }

    /**
     * Sets a single child node. It's useful when expanding to a deeply nested node.
     */
  }, {
    key: '_createChild',
    value: function _createChild(nodeKey, childKey) {
      this._setChildKeys(nodeKey, [childKey]);
      /*
       * Mark the node as dirty so its ancestors are fetched again on reload of the tree.
       */
      this._set('isDirtyMap', setProperty(this._data.isDirtyMap, nodeKey, true));
    }
  }, {
    key: '_setChildKeys',
    value: function _setChildKeys(nodeKey, childKeys) {
      var oldChildKeys = this._data.childKeyMap[nodeKey];
      if (oldChildKeys) {
        var newChildKeys = new _immutable2['default'].Set(childKeys);
        var removedDirectoryKeys = new _immutable2['default'].Set(oldChildKeys).subtract(newChildKeys).filter(_FileTreeHelpers2['default'].isDirKey);
        removedDirectoryKeys.forEach(this._purgeDirectory.bind(this));
      }
      this._set('childKeyMap', setProperty(this._data.childKeyMap, nodeKey, childKeys));
    }
  }, {
    key: '_onDirectoryChange',
    value: function _onDirectoryChange(nodeKey) {
      this._fetchChildKeys(nodeKey);
    }
  }, {
    key: '_addSubscription',
    value: function _addSubscription(nodeKey) {
      var _this10 = this;

      var directory = _FileTreeHelpers2['default'].getDirectoryByKey(nodeKey);
      if (!directory) {
        return;
      }

      /*
       * Remove the directory's dirty marker regardless of whether a subscription already exists
       * because there is nothing further making it dirty.
       */
      this._set('isDirtyMap', deleteProperty(this._data.isDirtyMap, nodeKey));

      // Don't create a new subscription if one already exists.
      if (this._data.subscriptionMap[nodeKey]) {
        return;
      }

      var subscription = undefined;
      try {
        // This call might fail if we try to watch a non-existing directory, or if permission denied.
        subscription = directory.onDidChange(function () {
          _this10._onDirectoryChange(nodeKey);
        });
      } catch (ex) {
        /*
         * Log error and mark the directory as dirty so the failed subscription will be attempted
         * again next time the directory is expanded.
         */
        this._logger.error('Cannot subscribe to directory "' + nodeKey + '"', ex);
        this._set('isDirtyMap', setProperty(this._data.isDirtyMap, nodeKey));
        return;
      }
      this._set('subscriptionMap', setProperty(this._data.subscriptionMap, nodeKey, subscription));
    }
  }, {
    key: '_removeSubscription',
    value: function _removeSubscription(rootKey, nodeKey) {
      var _this11 = this;

      var hasRemainingSubscribers = undefined;
      var subscription = this._data.subscriptionMap[nodeKey];

      if (subscription != null) {
        hasRemainingSubscribers = this._data.rootKeys.some(function (otherRootKey) {
          return otherRootKey !== rootKey && _this11.isExpanded(otherRootKey, nodeKey);
        });
        if (!hasRemainingSubscribers) {
          subscription.dispose();
          this._set('subscriptionMap', deleteProperty(this._data.subscriptionMap, nodeKey));
        }
      }

      if (subscription == null || hasRemainingSubscribers === false) {
        // Since we're no longer getting notifications when the directory contents change, assume the
        // child list is dirty.
        this._set('isDirtyMap', setProperty(this._data.isDirtyMap, nodeKey, true));
      }
    }
  }, {
    key: '_removeAllSubscriptions',
    value: function _removeAllSubscriptions(nodeKey) {
      var subscription = this._data.subscriptionMap[nodeKey];
      if (subscription) {
        subscription.dispose();
        this._set('subscriptionMap', deleteProperty(this._data.subscriptionMap, nodeKey));
      }
    }
  }, {
    key: '_purgeNode',
    value: function _purgeNode(rootKey, nodeKey, unselect) {
      var expandedKeys = this._getExpandedKeys(rootKey);
      if (expandedKeys.has(nodeKey)) {
        this._setExpandedKeys(rootKey, expandedKeys['delete'](nodeKey));
      }

      if (unselect) {
        var selectedKeys = this.getSelectedKeys(rootKey);
        if (selectedKeys.has(nodeKey)) {
          this._setSelectedKeys(rootKey, selectedKeys['delete'](nodeKey));
        }
      }

      var previouslyExpanded = this._getPreviouslyExpanded(rootKey);
      if (previouslyExpanded.has(nodeKey)) {
        this._setPreviouslyExpanded(rootKey, previouslyExpanded['delete'](nodeKey));
      }
    }
  }, {
    key: '_purgeDirectoryWithinARoot',
    value: function _purgeDirectoryWithinARoot(rootKey, nodeKey, unselect) {
      var _this12 = this;

      var childKeys = this._data.childKeyMap[nodeKey];
      if (childKeys) {
        childKeys.forEach(function (childKey) {
          if (_FileTreeHelpers2['default'].isDirKey(childKey)) {
            _this12._purgeDirectoryWithinARoot(rootKey, childKey, /* unselect */true);
          }
        });
      }
      this._removeSubscription(rootKey, nodeKey);
      this._purgeNode(rootKey, nodeKey, unselect);
    }

    // This is called when a dirctory is physically removed from disk. When we purge a directory,
    // we need to purge it's child directories also. Purging removes stuff from the data store
    // including list of child nodes, subscriptions, expanded directories and selected directories.
  }, {
    key: '_purgeDirectory',
    value: function _purgeDirectory(nodeKey) {
      var _this13 = this;

      var childKeys = this._data.childKeyMap[nodeKey];
      if (childKeys) {
        childKeys.forEach(function (childKey) {
          if (_FileTreeHelpers2['default'].isDirKey(childKey)) {
            _this13._purgeDirectory(childKey);
          }
        });
        this._set('childKeyMap', deleteProperty(this._data.childKeyMap, nodeKey));
      }

      this._removeAllSubscriptions(nodeKey);
      this.getRootKeys().forEach(function (rootKey) {
        _this13._purgeNode(rootKey, nodeKey, /* unselect */true);
      });
    }

    // TODO: Should we clean up isLoadingMap? It contains promises which cannot be cancelled, so this
    // might be tricky.
  }, {
    key: '_purgeRoot',
    value: function _purgeRoot(rootKey) {
      var _this14 = this;

      var expandedKeys = this._data.expandedKeysByRoot[rootKey];
      if (expandedKeys) {
        expandedKeys.forEach(function (nodeKey) {
          _this14._removeSubscription(rootKey, nodeKey);
        });
        this._set('expandedKeysByRoot', deleteProperty(this._data.expandedKeysByRoot, rootKey));
      }
      this._set('selectedKeysByRoot', deleteProperty(this._data.selectedKeysByRoot, rootKey));
      // Remove all child keys so that on re-addition of this root the children will be fetched again.
      var childKeys = this._data.childKeyMap[rootKey];
      if (childKeys) {
        childKeys.forEach(function (childKey) {
          if (_FileTreeHelpers2['default'].isDirKey(childKey)) {
            _this14._set('childKeyMap', deleteProperty(_this14._data.childKeyMap, childKey));
          }
        });
        this._set('childKeyMap', deleteProperty(this._data.childKeyMap, rootKey));
      }
      this._set('vcsStatusesByRoot', deleteProperty(this._data.vcsStatusesByRoot, rootKey));
    }
  }, {
    key: '_setTrackedNode',
    value: function _setTrackedNode(rootKey, nodeKey) {
      // Flush the value to ensure clients see the value at least once and scroll appropriately.
      this._set('trackedNode', { nodeKey: nodeKey, rootKey: rootKey }, true);
    }
  }, {
    key: '_setRepositories',
    value: function _setRepositories(repositories) {
      this._set('repositories', repositories);

      // Whenever a new set of repositories comes in, invalidate our paths cache by resetting its
      // `cache` property (created by lodash.memoize) to an empty map.
      this._repositoryForPath.cache = new Map();
    }
  }, {
    key: '_setWorkingSet',
    value: function _setWorkingSet(workingSet) {
      this._set('workingSet', workingSet);
    }
  }, {
    key: '_setOpenFilesWorkingSet',
    value: function _setOpenFilesWorkingSet(openFilesWorkingSet) {
      this._set('openFilesWorkingSet', openFilesWorkingSet);
    }
  }, {
    key: '_setWorkingSetsStore',
    value: function _setWorkingSetsStore(workingSetsStore) {
      this._set('workingSetsStore', workingSetsStore);
    }
  }, {
    key: '_startEditingWorkingSet',
    value: function _startEditingWorkingSet(editedWorkingSet) {
      if (!this._data.isEditingWorkingSet) {
        this._set('isEditingWorkingSet', true);
        this._setEditedWorkingSet(editedWorkingSet);
      }
    }
  }, {
    key: '_finishEditingWorkingSet',
    value: function _finishEditingWorkingSet() {
      if (this._data.isEditingWorkingSet) {
        this._set('isEditingWorkingSet', false);
        this._setEditedWorkingSet(new _nuclideWorkingSets.WorkingSet());
      }
    }
  }, {
    key: '_checkNode',
    value: function _checkNode(rootKey, nodeKey) {
      if (!this._data.isEditingWorkingSet) {
        return;
      }

      var editedWorkingSet = this._data.editedWorkingSet.append(nodeKey);

      var node = this.getNode(rootKey, nodeKey);
      if (node.isRoot) {
        this._setEditedWorkingSet(editedWorkingSet);
        return;
      }

      var parent = node.getParentNode();
      var childrenKeys = this.getCachedChildKeys(rootKey, parent.nodeKey);
      if (childrenKeys.every(function (ck) {
        return editedWorkingSet.containsFile(ck);
      })) {
        this._checkNode(rootKey, parent.nodeKey);
      } else {
        this._setEditedWorkingSet(editedWorkingSet);
      }
    }
  }, {
    key: '_uncheckNode',
    value: function _uncheckNode(rootKey, nodeKey) {
      if (!this._data.isEditingWorkingSet) {
        return;
      }

      var node = this.getNode(rootKey, nodeKey);
      if (node.isRoot) {
        this._setEditedWorkingSet(this._data.editedWorkingSet.remove(nodeKey));
        return;
      }

      var parent = node.getParentNode();
      if (this._data.editedWorkingSet.containsFile(parent.nodeKey)) {
        var _data$editedWorkingSet;

        this._uncheckNode(rootKey, parent.nodeKey);
        var childrenKeys = this.getCachedChildKeys(rootKey, parent.nodeKey);
        var siblingsKeys = childrenKeys.filter(function (ck) {
          return ck !== nodeKey;
        });

        this._setEditedWorkingSet((_data$editedWorkingSet = this._data.editedWorkingSet).append.apply(_data$editedWorkingSet, _toConsumableArray(siblingsKeys)));
      } else {
        this._setEditedWorkingSet(this._data.editedWorkingSet.remove(nodeKey));
      }
    }
  }, {
    key: '_omitHiddenPaths',
    value: function _omitHiddenPaths(nodeKeys) {
      var _this15 = this;

      if (!this._data.hideIgnoredNames && !this._data.excludeVcsIgnoredPaths && this._data.workingSet.isEmpty()) {
        return nodeKeys;
      }

      return nodeKeys.filter(function (nodeKey) {
        return !_this15._shouldHidePath(nodeKey);
      });
    }
  }, {
    key: '_shouldHidePath',
    value: function _shouldHidePath(nodeKey) {
      var isIgnoredPath = this._isIgnoredPath(nodeKey);
      if (isIgnoredPath) {
        return true;
      }

      var isExcludedFromWs = this._isExcludedFromWorkingSet(nodeKey);
      return isExcludedFromWs && this._isExcludedFromOpenFilesWorkingSet(nodeKey);
    }
  }, {
    key: '_isIgnoredPath',
    value: function _isIgnoredPath(nodeKey) {
      var _data = this._data;
      var hideIgnoredNames = _data.hideIgnoredNames;
      var excludeVcsIgnoredPaths = _data.excludeVcsIgnoredPaths;
      var ignoredPatterns = _data.ignoredPatterns;

      if (hideIgnoredNames && matchesSome(nodeKey, ignoredPatterns)) {
        return true;
      }
      if (excludeVcsIgnoredPaths && isVcsIgnored(nodeKey, this._repositoryForPath(nodeKey))) {
        return true;
      }

      return false;
    }
  }, {
    key: '_isExcludedFromWorkingSet',
    value: function _isExcludedFromWorkingSet(nodeKey) {
      var _data2 = this._data;
      var workingSet = _data2.workingSet;
      var isEditingWorkingSet = _data2.isEditingWorkingSet;

      if (!isEditingWorkingSet) {
        if (_FileTreeHelpers2['default'].isDirKey(nodeKey)) {
          return !workingSet.containsDir(nodeKey);
        } else {
          return !workingSet.containsFile(nodeKey);
        }
      }

      return false;
    }
  }, {
    key: '_isExcludedFromOpenFilesWorkingSet',
    value: function _isExcludedFromOpenFilesWorkingSet(nodeKey) {
      var _data3 = this._data;
      var openFilesWorkingSet = _data3.openFilesWorkingSet;
      var isEditingWorkingSet = _data3.isEditingWorkingSet;

      if (isEditingWorkingSet) {
        return false;
      }

      if (openFilesWorkingSet.isEmpty()) {
        return true;
      }

      if (_FileTreeHelpers2['default'].isDirKey(nodeKey)) {
        return !openFilesWorkingSet.containsDir(nodeKey);
      } else {
        return !openFilesWorkingSet.containsFile(nodeKey);
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      var subscriptionMap = this._data.subscriptionMap;
      for (var _nodeKey2 of Object.keys(subscriptionMap)) {
        var subscription = subscriptionMap[_nodeKey2];
        if (subscription) {
          subscription.dispose();
        }
      }

      // Reset data store.
      this._data = this._getDefaults();
    }
  }, {
    key: 'subscribe',
    value: function subscribe(listener) {
      return this._emitter.on('change', listener);
    }
  }]);

  return FileTreeStore;
})();

function deleteProperty(object, key) {
  if (!object.hasOwnProperty(key)) {
    return object;
  }
  var newObject = _extends({}, object);
  delete newObject[key];
  return newObject;
}

// A helper to set a property in an object using shallow copy rather than mutation
function setProperty(object, key, newValue) {
  var oldValue = object[key];
  if (oldValue === newValue) {
    return object;
  }
  var newObject = _extends({}, object);
  newObject[key] = newValue;
  return newObject;
}

// Create a new object by mapping over the properties of a given object, calling the given
// function on each one.
function mapValues(object, fn) {
  var newObject = {};
  Object.keys(object).forEach(function (key) {
    newObject[key] = fn(object[key], key);
  });
  return newObject;
}

// Determine whether the given string matches any of a set of patterns.
function matchesSome(str, patterns) {
  return patterns.some(function (pattern) {
    return pattern.match(str);
  });
}

function isVcsIgnored(nodeKey, repo) {
  return repo && repo.isProjectAtRoot() && repo.isPathIgnored(nodeKey);
}

/**
 * Performs a breadth-first iteration over the directories of the tree starting
 * with a given node. The iteration stops once a given limit of nodes (both directories
 * and files) were traversed.
 * The node being currently traversed can be obtained by calling .traversedNode()
 * .next() returns a promise that is fulfilled when the traversal moves on to
 * the next directory.
 */

var FileTreeStoreBfsIterator = (function () {
  function FileTreeStoreBfsIterator(fileTreeStore, rootKey, nodeKey, limit) {
    _classCallCheck(this, FileTreeStoreBfsIterator);

    this._fileTreeStore = fileTreeStore;
    this._rootKey = rootKey;
    this._nodesToTraverse = [];
    this._currentlyTraversedNode = nodeKey;
    this._limit = limit;
    this._numNodesTraversed = 0;
    this._promise = null;
    this._count = 0;
  }

  _createClass(FileTreeStoreBfsIterator, [{
    key: '_handlePromiseResolution',
    value: function _handlePromiseResolution(childrenKeys) {
      this._numNodesTraversed += childrenKeys.length;
      if (this._numNodesTraversed < this._limit) {
        var nextLevelNodes = childrenKeys.filter(function (childKey) {
          return _FileTreeHelpers2['default'].isDirKey(childKey);
        });
        this._nodesToTraverse = this._nodesToTraverse.concat(nextLevelNodes);

        this._currentlyTraversedNode = this._nodesToTraverse.splice(0, 1)[0];
        this._promise = null;
      } else {
        this._currentlyTraversedNode = null;
        this._promise = null;
      }

      return;
    }
  }, {
    key: 'next',
    value: function next() {
      var currentlyTraversedNode = this._currentlyTraversedNode;
      if (!this._promise && currentlyTraversedNode) {
        this._promise = this._fileTreeStore.promiseNodeChildKeys(this._rootKey, currentlyTraversedNode).then(this._handlePromiseResolution.bind(this));
      }
      return this._promise;
    }
  }, {
    key: 'traversedNode',
    value: function traversedNode() {
      return this._currentlyTraversedNode;
    }
  }]);

  return FileTreeStoreBfsIterator;
})();

module.exports = FileTreeStore;

// Saves a list of child nodes that should be expande when a given key is expanded.
// Looks like: { rootKey: { nodeKey: [childKey1, childKey2] } }.
//# sourceMappingURL=data:application/json;base64,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Qyx1QkFBdUIsR0FBRyxJQUFJLENBQUM7QUFDcEMsWUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7T0FDdEI7O0FBRUQsYUFBTztLQUNSOzs7V0FFRyxnQkFBbUI7QUFDckIsVUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUM7QUFDNUQsVUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksc0JBQXNCLEVBQUU7QUFDNUMsWUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLG9CQUFvQixDQUN0RCxJQUFJLENBQUMsUUFBUSxFQUNiLHNCQUFzQixDQUFDLENBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsd0JBQXdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDakQ7QUFDRCxhQUFPLElBQUksQ0FBQyxRQUFRLENBQUM7S0FDdEI7OztXQUVZLHlCQUFZO0FBQ3ZCLGFBQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDO0tBQ3JDOzs7U0F0REcsd0JBQXdCOzs7QUF5RDlCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsYUFBYSxDQUFDIiwiZmlsZSI6IkZpbGVUcmVlU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7SGdSZXBvc2l0b3J5Q2xpZW50fSBmcm9tICcuLi8uLi9udWNsaWRlLWhnLXJlcG9zaXRvcnktY2xpZW50JztcbmltcG9ydCB0eXBlIHtcbiAgUmVtb3RlRGlyZWN0b3J5LFxuICBSZW1vdGVGaWxlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS1jb25uZWN0aW9uJztcblxuaW1wb3J0IEZpbGVUcmVlRGlzcGF0Y2hlciBmcm9tICcuL0ZpbGVUcmVlRGlzcGF0Y2hlcic7XG5pbXBvcnQgRmlsZVRyZWVIZWxwZXJzIGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcbmltcG9ydCBGaWxlVHJlZU5vZGUgZnJvbSAnLi9GaWxlVHJlZU5vZGUnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtBY3Rpb25UeXBlfSBmcm9tICcuL0ZpbGVUcmVlQ29uc3RhbnRzJztcbmltcG9ydCB7RGlzcG9zYWJsZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge01pbmltYXRjaH0gZnJvbSAnbWluaW1hdGNoJztcbmltcG9ydCB7cmVwb3NpdG9yeUNvbnRhaW5zUGF0aH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oZy1naXQtYnJpZGdlJztcbmltcG9ydCB7cmVwb3NpdG9yeUZvclBhdGh9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctZ2l0LWJyaWRnZSc7XG5pbXBvcnQge1N0YXR1c0NvZGVOdW1iZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtaGctcmVwb3NpdG9yeS1iYXNlL2xpYi9oZy1jb25zdGFudHMnO1xuXG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL251Y2xpZGUtbG9nZ2luZyc7XG5pbXBvcnQge29iamVjdCBhcyBvYmplY3RVdGlsfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsJztcbmltcG9ydCBtZW1vaXplIGZyb20gJ2xvZGFzaC5tZW1vaXplJztcblxuaW1wb3J0IHtXb3JraW5nU2V0fSBmcm9tICcuLi8uLi9udWNsaWRlLXdvcmtpbmctc2V0cyc7XG5cbi8vIFVzZWQgdG8gZW5zdXJlIHRoZSB2ZXJzaW9uIHdlIHNlcmlhbGl6ZWQgaXMgdGhlIHNhbWUgdmVyc2lvbiB3ZSBhcmUgZGVzZXJpYWxpemluZy5cbmNvbnN0IFZFUlNJT04gPSAxO1xuXG5pbXBvcnQgdHlwZSB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuLi8uLi9udWNsaWRlLXdvcmtpbmctc2V0cy9saWIvV29ya2luZ1NldHNTdG9yZSc7XG5cblxudHlwZSBBY3Rpb25QYXlsb2FkID0gT2JqZWN0O1xudHlwZSBDaGFuZ2VMaXN0ZW5lciA9ICgpID0+IG1peGVkO1xuXG5leHBvcnQgdHlwZSBGaWxlVHJlZU5vZGVEYXRhID0ge1xuICBub2RlS2V5OiBzdHJpbmc7XG4gIHJvb3RLZXk6IHN0cmluZztcbn1cblxudHlwZSBTdG9yZURhdGEgPSB7XG4gIGN3ZEtleTogP3N0cmluZztcbiAgY2hpbGRLZXlNYXA6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8c3RyaW5nPiB9O1xuICBpc0RpcnR5TWFwOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfTtcbiAgZXhwYW5kZWRLZXlzQnlSb290OiB7IFtrZXk6IHN0cmluZ106IEltbXV0YWJsZS5TZXQ8c3RyaW5nPiB9O1xuICB0cmFja2VkTm9kZTogP0ZpbGVUcmVlTm9kZURhdGE7XG4gIC8vIFNhdmVzIGEgbGlzdCBvZiBjaGlsZCBub2RlcyB0aGF0IHNob3VsZCBiZSBleHBhbmRlIHdoZW4gYSBnaXZlbiBrZXkgaXMgZXhwYW5kZWQuXG4gIC8vIExvb2tzIGxpa2U6IHsgcm9vdEtleTogeyBub2RlS2V5OiBbY2hpbGRLZXkxLCBjaGlsZEtleTJdIH0gfS5cbiAgcHJldmlvdXNseUV4cGFuZGVkOiB7IFtyb290S2V5OiBzdHJpbmddOiBJbW11dGFibGUuTWFwPHN0cmluZywgQXJyYXk8U3RyaW5nPj4gfTtcbiAgaXNMb2FkaW5nTWFwOiB7IFtrZXk6IHN0cmluZ106ID9Qcm9taXNlIH07XG4gIHJvb3RLZXlzOiBBcnJheTxzdHJpbmc+O1xuICBzZWxlY3RlZEtleXNCeVJvb3Q6IHsgW2tleTogc3RyaW5nXTogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8c3RyaW5nPiB9O1xuICBzdWJzY3JpcHRpb25NYXA6IHsgW2tleTogc3RyaW5nXTogRGlzcG9zYWJsZSB9O1xuICB2Y3NTdGF0dXNlc0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBJbW11dGFibGUuTWFwPHN0cmluZywgbnVtYmVyPiB9O1xuICBpZ25vcmVkUGF0dGVybnM6IEltbXV0YWJsZS5TZXQ8TWluaW1hdGNoPjtcbiAgaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbjtcbiAgZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogYm9vbGVhbjtcbiAgdXNlUHJldmlld1RhYnM6IGJvb2xlYW47XG4gIHVzZVByZWZpeE5hdjogYm9vbGVhbjtcbiAgcmVwb3NpdG9yaWVzOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT47XG4gIHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQ7XG4gIG9wZW5GaWxlc1dvcmtpbmdTZXQ6IFdvcmtpbmdTZXQ7XG4gIHdvcmtpbmdTZXRzU3RvcmU6ID9Xb3JraW5nU2V0c1N0b3JlO1xuICBpc0VkaXRpbmdXb3JraW5nU2V0OiBib29sZWFuO1xuICBlZGl0ZWRXb3JraW5nU2V0OiBXb3JraW5nU2V0O1xufTtcblxuZXhwb3J0IHR5cGUgRXhwb3J0U3RvcmVEYXRhID0ge1xuICBjaGlsZEtleU1hcDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIGV4cGFuZGVkS2V5c0J5Um9vdDogeyBba2V5OiBzdHJpbmddOiBBcnJheTxzdHJpbmc+IH07XG4gIHJvb3RLZXlzOiBBcnJheTxzdHJpbmc+O1xuICBzZWxlY3RlZEtleXNCeVJvb3Q6IHsgW2tleTogc3RyaW5nXTogQXJyYXk8c3RyaW5nPiB9O1xuICB2ZXJzaW9uOiBudW1iZXI7XG59O1xuXG5sZXQgaW5zdGFuY2U6ID9PYmplY3Q7XG5cbi8qKlxuICogSW1wbGVtZW50cyB0aGUgRmx1eCBwYXR0ZXJuIGZvciBvdXIgZmlsZSB0cmVlLiBBbGwgc3RhdGUgZm9yIHRoZSBmaWxlIHRyZWUgd2lsbCBiZSBrZXB0IGluXG4gKiBGaWxlVHJlZVN0b3JlIGFuZCB0aGUgb25seSB3YXkgdG8gdXBkYXRlIHRoZSBzdG9yZSBpcyB0aHJvdWdoIG1ldGhvZHMgb24gRmlsZVRyZWVBY3Rpb25zLiBUaGVcbiAqIGRpc3BhdGNoZXIgaXMgYSBtZWNoYW5pc20gdGhyb3VnaCB3aGljaCBGaWxlVHJlZUFjdGlvbnMgaW50ZXJmYWNlcyB3aXRoIEZpbGVUcmVlU3RvcmUuXG4gKi9cbmNsYXNzIEZpbGVUcmVlU3RvcmUge1xuICBfZGF0YTogU3RvcmVEYXRhO1xuICBfZGlzcGF0Y2hlcjogRGlzcGF0Y2hlcjtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF9sb2dnZXI6IGFueTtcbiAgX3RpbWVyOiA/T2JqZWN0O1xuICBfcmVwb3NpdG9yeUZvclBhdGg6IChwYXRoOiBOdWNsaWRlVXJpKSA9PiA/YXRvbSRSZXBvc2l0b3J5O1xuXG4gIHN0YXRpYyBnZXRJbnN0YW5jZSgpOiBGaWxlVHJlZVN0b3JlIHtcbiAgICBpZiAoIWluc3RhbmNlKSB7XG4gICAgICBpbnN0YW5jZSA9IG5ldyBGaWxlVHJlZVN0b3JlKCk7XG4gICAgfVxuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2RhdGEgPSB0aGlzLl9nZXREZWZhdWx0cygpO1xuICAgIHRoaXMuX2Rpc3BhdGNoZXIgPSBGaWxlVHJlZURpc3BhdGNoZXIuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcbiAgICB0aGlzLl9kaXNwYXRjaGVyLnJlZ2lzdGVyKFxuICAgICAgcGF5bG9hZCA9PiB0aGlzLl9vbkRpc3BhdGNoKHBheWxvYWQpXG4gICAgKTtcbiAgICB0aGlzLl9sb2dnZXIgPSBnZXRMb2dnZXIoKTtcbiAgICB0aGlzLl9yZXBvc2l0b3J5Rm9yUGF0aCA9IG1lbW9pemUodGhpcy5fcmVwb3NpdG9yeUZvclBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFRPRE86IE1vdmUgdG8gYSBbc2VyaWFsaXphdGlvbiBjbGFzc11bMV0gYW5kIHVzZSB0aGUgYnVpbHQtaW4gdmVyc2lvbmluZyBtZWNoYW5pc20uIFRoaXMgbWlnaHRcbiAgICogbmVlZCB0byBiZSBkb25lIG9uZSBsZXZlbCBoaWdoZXIgd2l0aGluIG1haW4uanMuXG4gICAqXG4gICAqIFsxXTogaHR0cHM6Ly9hdG9tLmlvL2RvY3MvbGF0ZXN0L2JlaGluZC1hdG9tLXNlcmlhbGl6YXRpb24taW4tYXRvbVxuICAgKi9cbiAgZXhwb3J0RGF0YSgpOiBFeHBvcnRTdG9yZURhdGEge1xuICAgIGNvbnN0IGRhdGEgPSB0aGlzLl9kYXRhO1xuICAgIC8vIEdyYWIgdGhlIGNoaWxkIGtleXMgb2Ygb25seSB0aGUgZXhwYW5kZWQgbm9kZXMuXG4gICAgY29uc3QgY2hpbGRLZXlNYXAgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhkYXRhLmV4cGFuZGVkS2V5c0J5Um9vdCkuZm9yRWFjaChyb290S2V5ID0+IHtcbiAgICAgIGNvbnN0IGV4cGFuZGVkS2V5U2V0ID0gZGF0YS5leHBhbmRlZEtleXNCeVJvb3Rbcm9vdEtleV07XG4gICAgICBmb3IgKGNvbnN0IG5vZGVLZXkgb2YgZXhwYW5kZWRLZXlTZXQpIHtcbiAgICAgICAgY2hpbGRLZXlNYXBbbm9kZUtleV0gPSBkYXRhLmNoaWxkS2V5TWFwW25vZGVLZXldO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB7XG4gICAgICB2ZXJzaW9uOiBWRVJTSU9OLFxuICAgICAgY2hpbGRLZXlNYXA6IGNoaWxkS2V5TWFwLFxuICAgICAgZXhwYW5kZWRLZXlzQnlSb290OiBtYXBWYWx1ZXMoZGF0YS5leHBhbmRlZEtleXNCeVJvb3QsIGtleVNldCA9PiBrZXlTZXQudG9BcnJheSgpKSxcbiAgICAgIHJvb3RLZXlzOiBkYXRhLnJvb3RLZXlzLFxuICAgICAgc2VsZWN0ZWRLZXlzQnlSb290OiBtYXBWYWx1ZXMoZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIGtleVNldCA9PiBrZXlTZXQudG9BcnJheSgpKSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEltcG9ydHMgc3RvcmUgZGF0YSBmcm9tIGEgcHJldmlvdXMgZXhwb3J0LlxuICAgKi9cbiAgbG9hZERhdGEoZGF0YTogRXhwb3J0U3RvcmVEYXRhKTogdm9pZCB7XG4gICAgLy8gRW5zdXJlIHdlIGFyZSBub3QgdHJ5aW5nIHRvIGxvYWQgZGF0YSBmcm9tIGFuIGVhcmxpZXIgdmVyc2lvbiBvZiB0aGlzIHBhY2thZ2UuXG4gICAgaWYgKGRhdGEudmVyc2lvbiAhPT0gVkVSU0lPTikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9kYXRhID0ge1xuICAgICAgLi4udGhpcy5fZ2V0RGVmYXVsdHMoKSxcbiAgICAgIGNoaWxkS2V5TWFwOiBkYXRhLmNoaWxkS2V5TWFwLFxuICAgICAgZXhwYW5kZWRLZXlzQnlSb290OiBtYXBWYWx1ZXMoZGF0YS5leHBhbmRlZEtleXNCeVJvb3QsIGtleXMgPT4gbmV3IEltbXV0YWJsZS5TZXQoa2V5cykpLFxuICAgICAgcm9vdEtleXM6IGRhdGEucm9vdEtleXMsXG4gICAgICBzZWxlY3RlZEtleXNCeVJvb3Q6XG4gICAgICAgIG1hcFZhbHVlcyhkYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCwga2V5cyA9PiBuZXcgSW1tdXRhYmxlLk9yZGVyZWRTZXQoa2V5cykpLFxuICAgIH07XG4gICAgT2JqZWN0LmtleXMoZGF0YS5jaGlsZEtleU1hcCkuZm9yRWFjaChub2RlS2V5ID0+IHtcbiAgICAgIHRoaXMuX2FkZFN1YnNjcmlwdGlvbihub2RlS2V5KTtcbiAgICAgIHRoaXMuX2ZldGNoQ2hpbGRLZXlzKG5vZGVLZXkpO1xuICAgIH0pO1xuICB9XG5cbiAgX3NldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnZXhjbHVkZVZjc0lnbm9yZWRQYXRocycsIGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICB9XG5cbiAgX3NldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnaGlkZUlnbm9yZWROYW1lcycsIGhpZGVJZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgbGlzdCBvZiBuYW1lcyB0byBpZ25vcmUsIGNvbXBpbGUgdGhlbSBpbnRvIG1pbmltYXRjaCBwYXR0ZXJucyBhbmRcbiAgICogdXBkYXRlIHRoZSBzdG9yZSB3aXRoIHRoZW0uXG4gICAqL1xuICBfc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lczogQXJyYXk8c3RyaW5nPikge1xuICAgIGNvbnN0IGlnbm9yZWRQYXR0ZXJucyA9IEltbXV0YWJsZS5TZXQoaWdub3JlZE5hbWVzKVxuICAgICAgLm1hcChpZ25vcmVkTmFtZSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmVkTmFtZSA9PT0gJycpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBuZXcgTWluaW1hdGNoKGlnbm9yZWROYW1lLCB7bWF0Y2hCYXNlOiB0cnVlLCBkb3Q6IHRydWV9KTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyhcbiAgICAgICAgICAgIGBFcnJvciBwYXJzaW5nIHBhdHRlcm4gJyR7aWdub3JlZE5hbWV9JyBmcm9tIFwiU2V0dGluZ3NcIiA+IFwiSWdub3JlZCBOYW1lc1wiYCxcbiAgICAgICAgICAgIHtkZXRhaWw6IGVycm9yLm1lc3NhZ2V9LFxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuZmlsdGVyKHBhdHRlcm4gPT4gcGF0dGVybiAhPSBudWxsKTtcbiAgICB0aGlzLl9zZXQoJ2lnbm9yZWRQYXR0ZXJucycsIGlnbm9yZWRQYXR0ZXJucyk7XG4gIH1cblxuICBfZ2V0RGVmYXVsdHMoKTogU3RvcmVEYXRhIHtcbiAgICByZXR1cm4ge1xuICAgICAgY3dkS2V5OiBudWxsLFxuICAgICAgY2hpbGRLZXlNYXA6IHt9LFxuICAgICAgaXNEaXJ0eU1hcDoge30sXG4gICAgICBleHBhbmRlZEtleXNCeVJvb3Q6IHt9LFxuICAgICAgdHJhY2tlZE5vZGU6IG51bGwsXG4gICAgICBwcmV2aW91c2x5RXhwYW5kZWQ6IHt9LFxuICAgICAgaXNMb2FkaW5nTWFwOiB7fSxcbiAgICAgIHJvb3RLZXlzOiBbXSxcbiAgICAgIHNlbGVjdGVkS2V5c0J5Um9vdDoge30sXG4gICAgICBzdWJzY3JpcHRpb25NYXA6IHt9LFxuICAgICAgdmNzU3RhdHVzZXNCeVJvb3Q6IHt9LFxuICAgICAgaWdub3JlZFBhdHRlcm5zOiBJbW11dGFibGUuU2V0KCksXG4gICAgICBoaWRlSWdub3JlZE5hbWVzOiB0cnVlLFxuICAgICAgZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogdHJ1ZSxcbiAgICAgIHVzZVByZXZpZXdUYWJzOiBmYWxzZSxcbiAgICAgIHVzZVByZWZpeE5hdjogdHJ1ZSxcbiAgICAgIHJlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldCgpLFxuICAgICAgd29ya2luZ1NldDogbmV3IFdvcmtpbmdTZXQoKSxcbiAgICAgIG9wZW5GaWxlc1dvcmtpbmdTZXQ6IG5ldyBXb3JraW5nU2V0KCksXG4gICAgICB3b3JraW5nU2V0c1N0b3JlOiBudWxsLFxuICAgICAgaXNFZGl0aW5nV29ya2luZ1NldDogZmFsc2UsXG4gICAgICBlZGl0ZWRXb3JraW5nU2V0OiBuZXcgV29ya2luZ1NldCgpLFxuICAgIH07XG4gIH1cblxuICBfb25EaXNwYXRjaChwYXlsb2FkOiBBY3Rpb25QYXlsb2FkKTogdm9pZCB7XG4gICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvblR5cGUpIHtcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5ERUxFVEVfU0VMRUNURURfTk9ERVM6XG4gICAgICAgIHRoaXMuX2RlbGV0ZVNlbGVjdGVkTm9kZXMoKS5jYXRjaChlcnJvciA9PiB7XG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdEZWxldGluZyBub2RlcyBmYWlsZWQgd2l0aCBhbiBlcnJvcjogJyArIGVycm9yLnRvU3RyaW5nKCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX0NXRDpcbiAgICAgICAgdGhpcy5fc2V0Q3dkS2V5KHBheWxvYWQucm9vdEtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9UUkFDS0VEX05PREU6XG4gICAgICAgIHRoaXMuX3NldFRyYWNrZWROb2RlKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1JPT1RfS0VZUzpcbiAgICAgICAgdGhpcy5fc2V0Um9vdEtleXMocGF5bG9hZC5yb290S2V5cyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkVYUEFORF9OT0RFOlxuICAgICAgICB0aGlzLl9leHBhbmROb2RlKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuRVhQQU5EX05PREVfREVFUDpcbiAgICAgICAgdGhpcy5fZXhwYW5kTm9kZURlZXAocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5DT0xMQVBTRV9OT0RFOlxuICAgICAgICB0aGlzLl9jb2xsYXBzZU5vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfRVhDTFVERV9WQ1NfSUdOT1JFRF9QQVRIUzpcbiAgICAgICAgdGhpcy5fc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhwYXlsb2FkLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfVVNFX1BSRVZJRVdfVEFCUzpcbiAgICAgICAgdGhpcy5fc2V0VXNlUHJldmlld1RhYnMocGF5bG9hZC51c2VQcmV2aWV3VGFicyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9VU0VfUFJFRklYX05BVjpcbiAgICAgICAgdGhpcy5fc2V0VXNlUHJlZml4TmF2KHBheWxvYWQudXNlUHJlZml4TmF2KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuQ09MTEFQU0VfTk9ERV9ERUVQOlxuICAgICAgICB0aGlzLl9wdXJnZURpcmVjdG9yeVdpdGhpbkFSb290KHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC5ub2RlS2V5LCAvKiB1bnNlbGVjdCAqL2ZhbHNlKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX0hJREVfSUdOT1JFRF9OQU1FUzpcbiAgICAgICAgdGhpcy5fc2V0SGlkZUlnbm9yZWROYW1lcyhwYXlsb2FkLmhpZGVJZ25vcmVkTmFtZXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfSUdOT1JFRF9OQU1FUzpcbiAgICAgICAgdGhpcy5fc2V0SWdub3JlZE5hbWVzKHBheWxvYWQuaWdub3JlZE5hbWVzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1NFTEVDVEVEX05PREVTX0ZPUl9ST09UOlxuICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZEtleXMocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuU0VUX1NFTEVDVEVEX05PREVTX0ZPUl9UUkVFOlxuICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZEtleXNCeVJvb3QocGF5bG9hZC5zZWxlY3RlZEtleXNCeVJvb3QpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5DUkVBVEVfQ0hJTEQ6XG4gICAgICAgIHRoaXMuX2NyZWF0ZUNoaWxkKHBheWxvYWQubm9kZUtleSwgcGF5bG9hZC5jaGlsZEtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9WQ1NfU1RBVFVTRVM6XG4gICAgICAgIHRoaXMuX3NldFZjc1N0YXR1c2VzKHBheWxvYWQucm9vdEtleSwgcGF5bG9hZC52Y3NTdGF0dXNlcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9SRVBPU0lUT1JJRVM6XG4gICAgICAgIHRoaXMuX3NldFJlcG9zaXRvcmllcyhwYXlsb2FkLnJlcG9zaXRvcmllcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNFVF9XT1JLSU5HX1NFVDpcbiAgICAgICAgdGhpcy5fc2V0V29ya2luZ1NldChwYXlsb2FkLndvcmtpbmdTZXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfT1BFTl9GSUxFU19XT1JLSU5HX1NFVDpcbiAgICAgICAgdGhpcy5fc2V0T3BlbkZpbGVzV29ya2luZ1NldChwYXlsb2FkLm9wZW5GaWxlc1dvcmtpbmdTZXQpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgQWN0aW9uVHlwZS5TRVRfV09SS0lOR19TRVRTX1NUT1JFOlxuICAgICAgICB0aGlzLl9zZXRXb3JraW5nU2V0c1N0b3JlKHBheWxvYWQud29ya2luZ1NldHNTdG9yZSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlNUQVJUX0VESVRJTkdfV09SS0lOR19TRVQ6XG4gICAgICAgIHRoaXMuX3N0YXJ0RWRpdGluZ1dvcmtpbmdTZXQocGF5bG9hZC5lZGl0ZWRXb3JraW5nU2V0KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEFjdGlvblR5cGUuRklOSVNIX0VESVRJTkdfV09SS0lOR19TRVQ6XG4gICAgICAgIHRoaXMuX2ZpbmlzaEVkaXRpbmdXb3JraW5nU2V0KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLkNIRUNLX05PREU6XG4gICAgICAgIHRoaXMuX2NoZWNrTm9kZShwYXlsb2FkLnJvb3RLZXksIHBheWxvYWQubm9kZUtleSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBBY3Rpb25UeXBlLlVOQ0hFQ0tfTk9ERTpcbiAgICAgICAgdGhpcy5fdW5jaGVja05vZGUocGF5bG9hZC5yb290S2V5LCBwYXlsb2FkLm5vZGVLZXkpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyBhIHByaXZhdGUgbWV0aG9kIGJlY2F1c2UgaW4gRmx1eCB3ZSBzaG91bGQgbmV2ZXIgZXh0ZXJuYWxseSB3cml0ZSB0byB0aGUgZGF0YSBzdG9yZS5cbiAgICogT25seSBieSByZWNlaXZpbmcgYWN0aW9ucyAoZnJvbSBkaXNwYXRjaGVyKSBzaG91bGQgdGhlIGRhdGEgc3RvcmUgYmUgY2hhbmdlZC5cbiAgICogTm90ZTogYF9zZXRgIGNhbiBiZSBjYWxsZWQgbXVsdGlwbGUgdGltZXMgd2l0aGluIG9uZSBpdGVyYXRpb24gb2YgYW4gZXZlbnQgbG9vcCB3aXRob3V0XG4gICAqIHRocmFzaGluZyB0aGUgVUkgYmVjYXVzZSB3ZSBhcmUgdXNpbmcgc2V0SW1tZWRpYXRlIHRvIGJhdGNoIGNoYW5nZSBub3RpZmljYXRpb25zLCBlZmZlY3RpdmVseVxuICAgKiBsZXR0aW5nIG91ciB2aWV3cyByZS1yZW5kZXIgb25jZSBmb3IgbXVsdGlwbGUgY29uc2VjdXRpdmUgd3JpdGVzLlxuICAgKi9cbiAgX3NldChrZXk6IHN0cmluZywgdmFsdWU6IG1peGVkLCBmbHVzaDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgY29uc3Qgb2xkRGF0YSA9IHRoaXMuX2RhdGE7XG4gICAgLy8gSW1tdXRhYmlsaXR5IGZvciB0aGUgd2luIVxuICAgIGNvbnN0IG5ld0RhdGEgPSBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLCBrZXksIHZhbHVlKTtcbiAgICBpZiAobmV3RGF0YSAhPT0gb2xkRGF0YSkge1xuICAgICAgdGhpcy5fZGF0YSA9IG5ld0RhdGE7XG4gICAgICBjbGVhckltbWVkaWF0ZSh0aGlzLl90aW1lcik7XG4gICAgICBpZiAoZmx1c2gpIHtcbiAgICAgICAgLy8gSWYgYGZsdXNoYCBpcyB0cnVlLCBlbWl0IHRoZSBjaGFuZ2UgaW1tZWRpYXRlbHkuXG4gICAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdCgnY2hhbmdlJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiBub3QgZmx1c2hpbmcsIGRlLWJvdW5jZSB0byBwcmV2ZW50IHN1Y2Nlc3NpdmUgdXBkYXRlcyBpbiB0aGUgc2FtZSBldmVudCBsb29wLlxuICAgICAgICB0aGlzLl90aW1lciA9IHNldEltbWVkaWF0ZSgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdjaGFuZ2UnKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0VHJhY2tlZE5vZGUoKTogP0ZpbGVUcmVlTm9kZURhdGEge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnRyYWNrZWROb2RlO1xuICB9XG5cbiAgZ2V0UmVwb3NpdG9yaWVzKCk6IEltbXV0YWJsZS5TZXQ8YXRvbSRSZXBvc2l0b3J5PiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEucmVwb3NpdG9yaWVzO1xuICB9XG5cbiAgZ2V0V29ya2luZ1NldCgpOiBXb3JraW5nU2V0IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS53b3JraW5nU2V0O1xuICB9XG5cbiAgZ2V0T3BlbkZpbGVzV29ya2luZ1NldCgpOiBXb3JraW5nU2V0IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5vcGVuRmlsZXNXb3JraW5nU2V0O1xuICB9XG5cbiAgZ2V0V29ya2luZ1NldHNTdG9yZSgpOiA/V29ya2luZ1NldHNTdG9yZSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEud29ya2luZ1NldHNTdG9yZTtcbiAgfVxuXG4gIGdldFJvb3RLZXlzKCk6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnJvb3RLZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGtleSBvZiB0aGUgKmZpcnN0KiByb290IG5vZGUgY29udGFpbmluZyB0aGUgZ2l2ZW4gbm9kZS5cbiAgICovXG4gIGdldFJvb3RGb3JLZXkobm9kZUtleTogc3RyaW5nKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIGFycmF5LmZpbmQodGhpcy5fZGF0YS5yb290S2V5cywgcm9vdEtleSA9PiBub2RlS2V5LnN0YXJ0c1dpdGgocm9vdEtleSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdHJ1ZSBpZiB0aGUgc3RvcmUgaGFzIG5vIGRhdGEsIGkuZS4gbm8gcm9vdHMsIG5vIGNoaWxkcmVuLlxuICAgKi9cbiAgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRSb290S2V5cygpLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3RlOiBXZSBhY3R1YWxseSBkb24ndCBuZWVkIHJvb3RLZXkgKGltcGxlbWVudGF0aW9uIGRldGFpbCkgYnV0IHdlIHRha2UgaXQgZm9yIGNvbnNpc3RlbmN5LlxuICAgKi9cbiAgaXNMb2FkaW5nKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuICEhdGhpcy5fZ2V0TG9hZGluZyhub2RlS2V5KTtcbiAgfVxuXG4gIGlzRXhwYW5kZWQocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXkpLmhhcyhub2RlS2V5KTtcbiAgfVxuXG4gIGlzUm9vdEtleShub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5yb290S2V5cy5pbmRleE9mKG5vZGVLZXkpICE9PSAtMTtcbiAgfVxuXG4gIGlzU2VsZWN0ZWQocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXRTZWxlY3RlZEtleXMocm9vdEtleSkuaGFzKG5vZGVLZXkpO1xuICB9XG5cbiAgX3NldFZjc1N0YXR1c2VzKHJvb3RLZXk6IHN0cmluZywgdmNzU3RhdHVzZXM6IHtbcGF0aDogc3RyaW5nXTogbnVtYmVyfSkge1xuICAgIGNvbnN0IGltbXV0YWJsZVZjc1N0YXR1c2VzID0gbmV3IEltbXV0YWJsZS5NYXAodmNzU3RhdHVzZXMpO1xuICAgIGlmICghSW1tdXRhYmxlLmlzKGltbXV0YWJsZVZjc1N0YXR1c2VzLCB0aGlzLl9kYXRhLnZjc1N0YXR1c2VzQnlSb290W3Jvb3RLZXldKSkge1xuICAgICAgdGhpcy5fc2V0KFxuICAgICAgICAndmNzU3RhdHVzZXNCeVJvb3QnLFxuICAgICAgICBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLnZjc1N0YXR1c2VzQnlSb290LCByb290S2V5LCBpbW11dGFibGVWY3NTdGF0dXNlcylcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgZ2V0VmNzU3RhdHVzQ29kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6ID9udW1iZXIge1xuICAgIGNvbnN0IG1hcCA9IHRoaXMuX2RhdGEudmNzU3RhdHVzZXNCeVJvb3Rbcm9vdEtleV07XG4gICAgaWYgKG1hcCkge1xuICAgICAgcmV0dXJuIG1hcC5nZXQobm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9zZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFiczogYm9vbGVhbikge1xuICAgIHRoaXMuX3NldCgndXNlUHJldmlld1RhYnMnLCB1c2VQcmV2aWV3VGFicyk7XG4gIH1cblxuICBfc2V0VXNlUHJlZml4TmF2KHVzZVByZWZpeE5hdjogYm9vbGVhbikge1xuICAgIHRoaXMuX3NldCgndXNlUHJlZml4TmF2JywgdXNlUHJlZml4TmF2KTtcbiAgfVxuXG4gIHVzZVByZXZpZXdUYWJzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnVzZVByZXZpZXdUYWJzO1xuICB9XG5cbiAgdXNlUHJlZml4TmF2KCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9kYXRhLnVzZVByZWZpeE5hdjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGtub3duIGNoaWxkIGtleXMgZm9yIHRoZSBnaXZlbiBgbm9kZUtleWAgYnV0IGRvZXMgbm90IHF1ZXVlIGEgZmV0Y2ggZm9yIG1pc3NpbmdcbiAgICogY2hpbGRyZW4gbGlrZSBgOjpnZXRDaGlsZEtleXNgLlxuICAgKi9cbiAgZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogQXJyYXk8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX29taXRIaWRkZW5QYXRocyh0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW25vZGVLZXldIHx8IFtdKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGUgbm9kZSBjaGlsZCBrZXlzIG1heSBlaXRoZXIgYmUgYXZhaWxhYmxlIGltbWVkaWF0ZWx5IChjYWNoZWQpLCBvclxuICAgKiByZXF1aXJlIGFuIGFzeW5jIGZldGNoLiBJZiBhbGwgb2YgdGhlIGNoaWxkcmVuIGFyZSBuZWVkZWQgaXQncyBlYXNpZXIgdG9cbiAgICogcmV0dXJuIGFzIHByb21pc2UsIHRvIG1ha2UgdGhlIGNhbGxlciBvYmxpdmlvdXMgdG8gdGhlIHdheSBjaGlsZHJlbiB3ZXJlXG4gICAqIGZldGNoZWQuXG4gICAqL1xuICBwcm9taXNlTm9kZUNoaWxkS2V5cyhyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGNvbnN0IGNhY2hlZENoaWxkS2V5cyA9IHRoaXMuZ2V0Q2hpbGRLZXlzKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIGlmIChjYWNoZWRDaGlsZEtleXMubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlZENoaWxkS2V5cyk7XG4gICAgfVxuXG4gICAgY29uc3QgcHJvbWlzZSA9IHRoaXMuX2dldExvYWRpbmcobm9kZUtleSkgfHwgUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIHByb21pc2UudGhlbigoKSA9PiB0aGlzLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBub2RlS2V5KSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBrbm93biBjaGlsZCBrZXlzIGZvciB0aGUgZ2l2ZW4gYG5vZGVLZXlgIGFuZCBxdWV1ZXMgYSBmZXRjaCBpZiBjaGlsZHJlbiBhcmUgbWlzc2luZy5cbiAgICovXG4gIGdldENoaWxkS2V5cyhyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IEFycmF5PHN0cmluZz4ge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgaWYgKGNoaWxkS2V5cyA9PSBudWxsIHx8IHRoaXMuX2RhdGEuaXNEaXJ0eU1hcFtub2RlS2V5XSkge1xuICAgICAgdGhpcy5fZmV0Y2hDaGlsZEtleXMobm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8qXG4gICAgICAgKiBJZiBubyBkYXRhIG5lZWRzIHRvIGJlIGZldGNoZWQsIHdpcGUgb3V0IHRoZSBzY3JvbGxpbmcgc3RhdGUgYmVjYXVzZSBzdWJzZXF1ZW50IHVwZGF0ZXNcbiAgICAgICAqIHNob3VsZCBubyBsb25nZXIgc2Nyb2xsIHRoZSB0cmVlLiBUaGUgbm9kZSB3aWxsIGhhdmUgYWxyZWFkeSBiZWVuIGZsdXNoZWQgdG8gdGhlIHZpZXcgYW5kXG4gICAgICAgKiBzY3JvbGxlZCB0by5cbiAgICAgICAqL1xuICAgICAgdGhpcy5fY2hlY2tUcmFja2VkTm9kZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fb21pdEhpZGRlblBhdGhzKGNoaWxkS2V5cyB8fCBbXSk7XG4gIH1cblxuICBnZXRTZWxlY3RlZEtleXMocm9vdEtleT86IHN0cmluZyk6IEltbXV0YWJsZS5PcmRlcmVkU2V0PHN0cmluZz4ge1xuICAgIGxldCBzZWxlY3RlZEtleXM7XG4gICAgaWYgKHJvb3RLZXkgPT0gbnVsbCkge1xuICAgICAgc2VsZWN0ZWRLZXlzID0gbmV3IEltbXV0YWJsZS5PcmRlcmVkU2V0KCk7XG4gICAgICBmb3IgKGNvbnN0IHJvb3QgaW4gdGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QpIHtcbiAgICAgICAgaWYgKHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290Lmhhc093blByb3BlcnR5KHJvb3QpKSB7XG4gICAgICAgICAgc2VsZWN0ZWRLZXlzID0gc2VsZWN0ZWRLZXlzLm1lcmdlKHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB0aGUgZ2l2ZW4gYHJvb3RLZXlgIGhhcyBubyBzZWxlY3RlZCBrZXlzLCBhc3NpZ24gYW4gZW1wdHkgc2V0IHRvIG1haW50YWluIGEgbm9uLW51bGxcbiAgICAgIC8vIHJldHVybiB2YWx1ZS5cbiAgICAgIHNlbGVjdGVkS2V5cyA9IHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RLZXldIHx8IG5ldyBJbW11dGFibGUuT3JkZXJlZFNldCgpO1xuICAgIH1cbiAgICByZXR1cm4gc2VsZWN0ZWRLZXlzO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBsaXN0IG9mIHRoZSBub2RlcyB0aGF0IGFyZSBjdXJyZW50bHkgdmlzaWJsZS9leHBhbmRlZCBpbiB0aGUgZmlsZSB0cmVlLlxuICAgKlxuICAgKiBUaGlzIG1ldGhvZCByZXR1cm5zIGFuIGFycmF5IHN5bmNocm9ub3VzbHkgKHJhdGhlciB0aGFuIGFuIGl0ZXJhdG9yKSB0byBlbnN1cmUgdGhlIGNhbGxlclxuICAgKiBnZXRzIGEgY29uc2lzdGVudCBzbmFwc2hvdCBvZiB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgZmlsZSB0cmVlLlxuICAgKi9cbiAgZ2V0VmlzaWJsZU5vZGVzKHJvb3RLZXk6IHN0cmluZyk6IEFycmF5PEZpbGVUcmVlTm9kZT4ge1xuICAgIC8vIERvIHNvbWUgYmFzaWMgY2hlY2tzIHRvIGVuc3VyZSB0aGF0IHJvb3RLZXkgY29ycmVzcG9uZHMgdG8gYSByb290IGFuZCBpcyBleHBhbmRlZC4gSWYgbm90LFxuICAgIC8vIHJldHVybiB0aGUgYXBwcm9wcmlhdGUgYXJyYXkuXG4gICAgaWYgKCF0aGlzLmlzUm9vdEtleShyb290S2V5KSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBpZiAoIXRoaXMuaXNFeHBhbmRlZChyb290S2V5LCByb290S2V5KSkge1xuICAgICAgcmV0dXJuIFt0aGlzLmdldE5vZGUocm9vdEtleSwgcm9vdEtleSldO1xuICAgIH1cblxuICAgIC8vIE5vdGUgdGhhdCB3ZSBjb3VsZCBjYWNoZSB0aGUgdmlzaWJsZU5vZGVzIGFycmF5IHNvIHRoYXQgd2UgZG8gbm90IGhhdmUgdG8gY3JlYXRlIGl0IGZyb21cbiAgICAvLyBzY3JhdGNoIGVhY2ggdGltZSB0aGlzIGlzIGNhbGxlZCwgYnV0IGl0IGRvZXMgbm90IGFwcGVhciB0byBiZSBhIGJvdHRsZW5lY2sgYXQgcHJlc2VudC5cbiAgICBjb25zdCB2aXNpYmxlTm9kZXMgPSBbXTtcbiAgICBjb25zdCByb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlID0gW3Jvb3RLZXldO1xuICAgIHdoaWxlIChyb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlLmxlbmd0aCAhPT0gMCkge1xuICAgICAgY29uc3Qga2V5ID0gcm9vdEtleXNGb3JEaXJlY3Rvcmllc1RvRXhwbG9yZS5wb3AoKTtcbiAgICAgIHZpc2libGVOb2Rlcy5wdXNoKHRoaXMuZ2V0Tm9kZShrZXksIGtleSkpO1xuICAgICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtrZXldO1xuICAgICAgaWYgKGNoaWxkS2V5cyA9PSBudWxsIHx8IHRoaXMuX2RhdGEuaXNEaXJ0eU1hcFtrZXldKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgd2hlcmUgZ2V0Q2hpbGRLZXlzKCkgd291bGQgZmV0Y2gsIGJ1dCB3ZSBkbyBub3Qgd2FudCB0byBkbyB0aGF0LlxuICAgICAgICAvLyBUT0RPOiBJZiBrZXkgaXMgaW4gaXNEaXJ0eU1hcCwgdGhlbiByZXRyeSB3aGVuIGl0IGlzIG5vdCBkaXJ0eT9cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGZvciAoY29uc3QgY2hpbGRLZXkgb2YgY2hpbGRLZXlzKSB7XG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgaWYgKHRoaXMuaXNFeHBhbmRlZChyb290S2V5LCBrZXkpKSB7XG4gICAgICAgICAgICByb290S2V5c0ZvckRpcmVjdG9yaWVzVG9FeHBsb3JlLnB1c2goY2hpbGRLZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2aXNpYmxlTm9kZXMucHVzaCh0aGlzLmdldE5vZGUoa2V5LCBjaGlsZEtleSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2aXNpYmxlTm9kZXM7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbGwgc2VsZWN0ZWQgbm9kZXMgYWNyb3NzIGFsbCByb290cyBpbiB0aGUgdHJlZS5cbiAgICovXG4gIGdldFNlbGVjdGVkTm9kZXMoKTogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8RmlsZVRyZWVOb2RlPiB7XG4gICAgbGV0IHNlbGVjdGVkTm9kZXMgPSBuZXcgSW1tdXRhYmxlLk9yZGVyZWRTZXQoKTtcbiAgICB0aGlzLl9kYXRhLnJvb3RLZXlzLmZvckVhY2gocm9vdEtleSA9PiB7XG4gICAgICB0aGlzLmdldFNlbGVjdGVkS2V5cyhyb290S2V5KS5mb3JFYWNoKG5vZGVLZXkgPT4ge1xuICAgICAgICBzZWxlY3RlZE5vZGVzID0gc2VsZWN0ZWROb2Rlcy5hZGQodGhpcy5nZXROb2RlKHJvb3RLZXksIG5vZGVLZXkpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBzZWxlY3RlZE5vZGVzO1xuICB9XG5cbiAgZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk6ID9GaWxlVHJlZU5vZGUge1xuICAgIGNvbnN0IHNlbGVjdGVkUm9vdHMgPSBPYmplY3Qua2V5cyh0aGlzLl9kYXRhLnNlbGVjdGVkS2V5c0J5Um9vdCk7XG4gICAgaWYgKHNlbGVjdGVkUm9vdHMubGVuZ3RoICE9PSAxKSB7XG4gICAgICAvLyBUaGVyZSBpcyBtb3JlIHRoYW4gb25lIHJvb3Qgd2l0aCBzZWxlY3RlZCBub2Rlcy4gTm8gYnVlbm8uXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgcm9vdEtleSA9IHNlbGVjdGVkUm9vdHNbMF07XG4gICAgY29uc3Qgc2VsZWN0ZWRLZXlzID0gdGhpcy5nZXRTZWxlY3RlZEtleXMocm9vdEtleSk7XG4gICAgLypcbiAgICAgKiBOb3RlOiBUaGlzIGRvZXMgbm90IGNhbGwgYGdldFNlbGVjdGVkTm9kZXNgIHRvIHByZXZlbnQgY3JlYXRpbmcgbm9kZXMgdGhhdCB3b3VsZCBiZSB0aHJvd25cbiAgICAgKiBhd2F5IGlmIHRoZXJlIGlzIG1vcmUgdGhhbiAxIHNlbGVjdGVkIG5vZGUuXG4gICAgICovXG4gICAgcmV0dXJuIChzZWxlY3RlZEtleXMuc2l6ZSA9PT0gMSkgPyB0aGlzLmdldE5vZGUocm9vdEtleSwgc2VsZWN0ZWRLZXlzLmZpcnN0KCkpIDogbnVsbDtcbiAgfVxuXG4gIGdldFJvb3ROb2RlKHJvb3RLZXk6IHN0cmluZyk6IEZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Tm9kZShyb290S2V5LCByb290S2V5KTtcbiAgfVxuXG4gIGdldE5vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBGaWxlVHJlZU5vZGUge1xuICAgIHJldHVybiBuZXcgRmlsZVRyZWVOb2RlKHRoaXMsIHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgaXNFZGl0aW5nV29ya2luZ1NldCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5pc0VkaXRpbmdXb3JraW5nU2V0O1xuICB9XG5cbiAgZ2V0RWRpdGVkV29ya2luZ1NldCgpOiBXb3JraW5nU2V0IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5lZGl0ZWRXb3JraW5nU2V0O1xuICB9XG5cbiAgX3NldEVkaXRlZFdvcmtpbmdTZXQoZWRpdGVkV29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnZWRpdGVkV29ya2luZ1NldCcsIGVkaXRlZFdvcmtpbmdTZXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIElmIGEgZmV0Y2ggaXMgbm90IGFscmVhZHkgaW4gcHJvZ3Jlc3MgaW5pdGlhdGUgYSBmZXRjaCBub3cuXG4gICAqL1xuICBfZmV0Y2hDaGlsZEtleXMobm9kZUtleTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZXhpc3RpbmdQcm9taXNlID0gdGhpcy5fZ2V0TG9hZGluZyhub2RlS2V5KTtcbiAgICBpZiAoZXhpc3RpbmdQcm9taXNlKSB7XG4gICAgICByZXR1cm4gZXhpc3RpbmdQcm9taXNlO1xuICAgIH1cblxuICAgIGNvbnN0IHByb21pc2UgPSBGaWxlVHJlZUhlbHBlcnMuZmV0Y2hDaGlsZHJlbihub2RlS2V5KVxuICAgICAgLmNhdGNoKGVycm9yID0+IHtcbiAgICAgICAgdGhpcy5fbG9nZ2VyLmVycm9yKGBVbmFibGUgdG8gZmV0Y2ggY2hpbGRyZW4gZm9yIFwiJHtub2RlS2V5fVwiLmApO1xuICAgICAgICB0aGlzLl9sb2dnZXIuZXJyb3IoJ09yaWdpbmFsIGVycm9yOiAnLCBlcnJvcik7XG4gICAgICAgIC8vIENvbGxhcHNlIHRoZSBub2RlIGFuZCBjbGVhciBpdHMgbG9hZGluZyBzdGF0ZSBvbiBlcnJvciBzbyB0aGVcbiAgICAgICAgLy8gdXNlciBjYW4gcmV0cnkgZXhwYW5kaW5nIGl0LlxuICAgICAgICBjb25zdCByb290S2V5ID0gdGhpcy5nZXRSb290Rm9yS2V5KG5vZGVLZXkpO1xuICAgICAgICBpZiAocm9vdEtleSAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fY29sbGFwc2VOb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2NsZWFyTG9hZGluZyhub2RlS2V5KTtcbiAgICAgIH0pXG4gICAgICAudGhlbihjaGlsZEtleXMgPT4ge1xuICAgICAgICAvLyBJZiB0aGlzIG5vZGUncyByb290IHdlbnQgYXdheSB3aGlsZSB0aGUgUHJvbWlzZSB3YXMgcmVzb2x2aW5nLCBkb1xuICAgICAgICAvLyBubyBtb3JlIHdvcmsuIFRoaXMgaXMgbm8gbG9uZ2VyIG5lZWRlZCBpbiB0aGUgc3RvcmUuXG4gICAgICAgIGlmICh0aGlzLmdldFJvb3RGb3JLZXkobm9kZUtleSkgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zZXRDaGlsZEtleXMobm9kZUtleSwgY2hpbGRLZXlzKTtcbiAgICAgICAgdGhpcy5fYWRkU3Vic2NyaXB0aW9uKG5vZGVLZXkpO1xuICAgICAgICB0aGlzLl9jbGVhckxvYWRpbmcobm9kZUtleSk7XG4gICAgICB9KTtcblxuICAgIHRoaXMuX3NldExvYWRpbmcobm9kZUtleSwgcHJvbWlzZSk7XG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBfZ2V0TG9hZGluZyhub2RlS2V5OiBzdHJpbmcpOiA/UHJvbWlzZSB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuaXNMb2FkaW5nTWFwW25vZGVLZXldO1xuICB9XG5cbiAgX3NldExvYWRpbmcobm9kZUtleTogc3RyaW5nLCB2YWx1ZTogUHJvbWlzZSk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnaXNMb2FkaW5nTWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5pc0xvYWRpbmdNYXAsIG5vZGVLZXksIHZhbHVlKSk7XG4gIH1cblxuICBpc0N3ZChub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gbm9kZUtleSA9PT0gdGhpcy5fZGF0YS5jd2RLZXk7XG4gIH1cblxuICBoYXNDd2QoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuY3dkS2V5ICE9IG51bGw7XG4gIH1cblxuICBfc2V0Q3dkS2V5KHJvb3RLZXk6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ2N3ZEtleScsIHJvb3RLZXkpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0cyB0aGUgbm9kZSB0byBiZSBrZXB0IGluIHZpZXcgaWYgbm8gbW9yZSBkYXRhIGlzIGJlaW5nIGF3YWl0ZWQuIFNhZmUgdG8gY2FsbCBtYW55IHRpbWVzXG4gICAqIGJlY2F1c2UgaXQgb25seSBjaGFuZ2VzIHN0YXRlIGlmIGEgbm9kZSBpcyBiZWluZyB0cmFja2VkLlxuICAgKi9cbiAgX2NoZWNrVHJhY2tlZE5vZGUoKTogdm9pZCB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5fZGF0YS50cmFja2VkTm9kZSAhPSBudWxsICYmXG4gICAgICAvKlxuICAgICAgICogVGhlIGxvYWRpbmcgbWFwIGJlaW5nIGVtcHR5IGlzIGEgaGV1cmlzdGljIGZvciB3aGVuIGxvYWRpbmcgaGFzIGNvbXBsZXRlZC4gSXQgaXMgaW5leGFjdFxuICAgICAgICogYmVjYXVzZSB0aGUgbG9hZGluZyBtaWdodCBiZSB1bnJlbGF0ZWQgdG8gdGhlIHRyYWNrZWQgbm9kZSwgaG93ZXZlciBpdCBpcyBjaGVhcCBhbmQgZmFsc2VcbiAgICAgICAqIHBvc2l0aXZlcyB3aWxsIG9ubHkgbGFzdCB1bnRpbCBsb2FkaW5nIGlzIGNvbXBsZXRlIG9yIHVudGlsIHRoZSB1c2VyIGNsaWNrcyBhbm90aGVyIG5vZGUgaW5cbiAgICAgICAqIHRoZSB0cmVlLlxuICAgICAgICovXG4gICAgICBvYmplY3RVdGlsLmlzRW1wdHkodGhpcy5fZGF0YS5pc0xvYWRpbmdNYXApXG4gICAgKSB7XG4gICAgICAvLyBMb2FkaW5nIGhhcyBjb21wbGV0ZWQuIEFsbG93IHNjcm9sbGluZyB0byBwcm9jZWVkIGFzIHVzdWFsLlxuICAgICAgdGhpcy5fc2V0KCd0cmFja2VkTm9kZScsIG51bGwpO1xuICAgIH1cbiAgfVxuXG4gIF9jbGVhckxvYWRpbmcobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdpc0xvYWRpbmdNYXAnLCBkZWxldGVQcm9wZXJ0eSh0aGlzLl9kYXRhLmlzTG9hZGluZ01hcCwgbm9kZUtleSkpO1xuICAgIHRoaXMuX2NoZWNrVHJhY2tlZE5vZGUoKTtcbiAgfVxuXG4gIGFzeW5jIF9kZWxldGVTZWxlY3RlZE5vZGVzKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSB0aGlzLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBhd2FpdCBQcm9taXNlLmFsbChzZWxlY3RlZE5vZGVzLm1hcChhc3luYyBub2RlID0+IHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gRmlsZVRyZWVIZWxwZXJzLmdldEVudHJ5QnlLZXkobm9kZS5ub2RlS2V5KTtcblxuICAgICAgaWYgKGVudHJ5ID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgY29uc3QgcGF0aCA9IGVudHJ5LmdldFBhdGgoKTtcbiAgICAgIGNvbnN0IHJlcG9zaXRvcnkgPSByZXBvc2l0b3J5Rm9yUGF0aChwYXRoKTtcbiAgICAgIGlmIChyZXBvc2l0b3J5ICE9IG51bGwgJiYgcmVwb3NpdG9yeS5nZXRUeXBlKCkgPT09ICdoZycpIHtcbiAgICAgICAgY29uc3QgaGdSZXBvc2l0b3J5ID0gKChyZXBvc2l0b3J5OiBhbnkpOiBIZ1JlcG9zaXRvcnlDbGllbnQpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF3YWl0IGhnUmVwb3NpdG9yeS5yZW1vdmUocGF0aCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBjb25zdCBzdGF0dXNlcyA9IGF3YWl0IGhnUmVwb3NpdG9yeS5nZXRTdGF0dXNlcyhbcGF0aF0pO1xuICAgICAgICAgIGNvbnN0IHBhdGhTdGF0dXMgPSBzdGF0dXNlcy5nZXQocGF0aCk7XG4gICAgICAgICAgY29uc3QgZ29vZFN0YXR1c2VzID0gW1xuICAgICAgICAgICAgU3RhdHVzQ29kZU51bWJlci5BRERFRCxcbiAgICAgICAgICAgIFN0YXR1c0NvZGVOdW1iZXIuQ0xFQU4sXG4gICAgICAgICAgICBTdGF0dXNDb2RlTnVtYmVyLk1PRElGSUVELFxuICAgICAgICAgIF07XG4gICAgICAgICAgaWYgKGdvb2RTdGF0dXNlcy5pbmRleE9mKHBhdGhTdGF0dXMpICE9PSAtMSkge1xuICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKFxuICAgICAgICAgICAgICAnRmFpbGVkIHRvIHJlbW92ZSAnICsgcGF0aCArICcgZnJvbSB2ZXJzaW9uIGNvbnRyb2wuICBUaGUgZmlsZSB3aWxsICcgK1xuICAgICAgICAgICAgICAnc3RpbGwgZ2V0IGRlbGV0ZWQgYnV0IHlvdSB3aWxsIGhhdmUgdG8gcmVtb3ZlIGl0IGZyb20geW91ciBWQ1MgeW91cnNlbGYuICBFcnJvcjogJyArXG4gICAgICAgICAgICAgIGUudG9TdHJpbmcoKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzTG9jYWxFbnRyeShlbnRyeSkpIHtcbiAgICAgICAgLy8gVE9ETzogVGhpcyBzcGVjaWFsLWNhc2UgY2FuIGJlIGVsaW1pbmF0ZWQgb25jZSBgZGVsZXRlKClgIGlzIGFkZGVkIHRvIGBEaXJlY3RvcnlgXG4gICAgICAgIC8vIGFuZCBgRmlsZWAuXG4gICAgICAgIHNoZWxsLm1vdmVJdGVtVG9UcmFzaChub2RlLm5vZGVQYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJlbW90ZUZpbGUgPSAoKGVudHJ5OiBhbnkpOiAoUmVtb3RlRmlsZSB8IFJlbW90ZURpcmVjdG9yeSkpO1xuICAgICAgICBhd2FpdCByZW1vdGVGaWxlLmRlbGV0ZSgpO1xuICAgICAgfVxuICAgIH0pKTtcbiAgfVxuXG4gIF9leHBhbmROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXksIHRoaXMuX2dldEV4cGFuZGVkS2V5cyhyb290S2V5KS5hZGQobm9kZUtleSkpO1xuICAgIC8vIElmIHdlIGhhdmUgY2hpbGQgbm9kZXMgdGhhdCBzaG91bGQgYWxzbyBiZSBleHBhbmRlZCwgZXhwYW5kIHRoZW0gbm93LlxuICAgIGxldCBwcmV2aW91c2x5RXhwYW5kZWQgPSB0aGlzLl9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSk7XG4gICAgaWYgKHByZXZpb3VzbHlFeHBhbmRlZC5oYXMobm9kZUtleSkpIHtcbiAgICAgIGZvciAoY29uc3QgY2hpbGRLZXkgb2YgcHJldmlvdXNseUV4cGFuZGVkLmdldChub2RlS2V5KSkge1xuICAgICAgICB0aGlzLl9leHBhbmROb2RlKHJvb3RLZXksIGNoaWxkS2V5KTtcbiAgICAgIH1cbiAgICAgIC8vIENsZWFyIHRoZSBwcmV2aW91c2x5RXhwYW5kZWQgbGlzdCBzaW5jZSB3ZSdyZSBkb25lIHdpdGggaXQuXG4gICAgICBwcmV2aW91c2x5RXhwYW5kZWQgPSBwcmV2aW91c2x5RXhwYW5kZWQuZGVsZXRlKG5vZGVLZXkpO1xuICAgICAgdGhpcy5fc2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXksIHByZXZpb3VzbHlFeHBhbmRlZCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBlcmZvcm1lcyBhIGRlZXAgQkZTIHNjYW5uaW5nIGV4cGFuZCBvZiBjb250YWluZWQgbm9kZXMuXG4gICAqIHJldHVybnMgLSBhIHByb21pc2UgZnVsZmlsbGVkIHdoZW4gdGhlIGV4cGFuZCBvcGVyYXRpb24gaXMgZmluaXNoZWRcbiAgICovXG4gIF9leHBhbmROb2RlRGVlcChyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIFN0b3AgdGhlIHRyYXZlcnNhbCBhZnRlciAxMDAgbm9kZXMgd2VyZSBhZGRlZCB0byB0aGUgdHJlZVxuICAgIGNvbnN0IGl0Tm9kZXMgPSBuZXcgRmlsZVRyZWVTdG9yZUJmc0l0ZXJhdG9yKHRoaXMsIHJvb3RLZXksIG5vZGVLZXksIC8qIGxpbWl0Ki8gMTAwKTtcbiAgICBjb25zdCBwcm9taXNlID0gbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICBjb25zdCBleHBhbmQgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHRyYXZlcnNlZE5vZGVLZXkgPSBpdE5vZGVzLnRyYXZlcnNlZE5vZGUoKTtcbiAgICAgICAgaWYgKHRyYXZlcnNlZE5vZGVLZXkpIHtcbiAgICAgICAgICB0aGlzLl9zZXRFeHBhbmRlZEtleXMocm9vdEtleSwgdGhpcy5fZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXkpLmFkZCh0cmF2ZXJzZWROb2RlS2V5KSk7XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogRXZlbiBpZiB0aGVyZSB3ZXJlIHByZXZpb3VzbHkgZXhwYW5kZWQgbm9kZXMgaXQgZG9lc24ndCBtYXR0ZXIgYXNcbiAgICAgICAgICAgKiB3ZSdsbCBleHBhbmQgYWxsIG9mIHRoZSBjaGlsZHJlbi5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICBsZXQgcHJldmlvdXNseUV4cGFuZGVkID0gdGhpcy5fZ2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXkpO1xuICAgICAgICAgIHByZXZpb3VzbHlFeHBhbmRlZCA9IHByZXZpb3VzbHlFeHBhbmRlZC5kZWxldGUodHJhdmVyc2VkTm9kZUtleSk7XG4gICAgICAgICAgdGhpcy5fc2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXksIHByZXZpb3VzbHlFeHBhbmRlZCk7XG5cbiAgICAgICAgICBjb25zdCBuZXh0UHJvbWlzZSA9IGl0Tm9kZXMubmV4dCgpO1xuICAgICAgICAgIGlmIChuZXh0UHJvbWlzZSkge1xuICAgICAgICAgICAgbmV4dFByb21pc2UudGhlbihleHBhbmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGV4cGFuZCgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICAvKipcbiAgICogV2hlbiB3ZSBjb2xsYXBzZSBhIG5vZGUgd2UgbmVlZCB0byBkbyBzb21lIGNsZWFudXAgcmVtb3Zpbmcgc3Vic2NyaXB0aW9ucyBhbmQgc2VsZWN0aW9uLlxuICAgKi9cbiAgX2NvbGxhcHNlTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgbGV0IHNlbGVjdGVkS2V5cyA9IHRoaXMuX2RhdGEuc2VsZWN0ZWRLZXlzQnlSb290W3Jvb3RLZXldO1xuICAgIGNvbnN0IGV4cGFuZGVkQ2hpbGRLZXlzID0gW107XG4gICAgaWYgKGNoaWxkS2V5cykge1xuICAgICAgY2hpbGRLZXlzLmZvckVhY2goY2hpbGRLZXkgPT4ge1xuICAgICAgICAvLyBVbnNlbGVjdCBlYWNoIGNoaWxkLlxuICAgICAgICBpZiAoc2VsZWN0ZWRLZXlzICYmIHNlbGVjdGVkS2V5cy5oYXMoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgc2VsZWN0ZWRLZXlzID0gc2VsZWN0ZWRLZXlzLmRlbGV0ZShjaGlsZEtleSk7XG4gICAgICAgICAgLypcbiAgICAgICAgICAgKiBTZXQgdGhlIHNlbGVjdGVkIGtleXMgKmJlZm9yZSogdGhlIHJlY3Vyc2l2ZSBgX2NvbGxhcHNlTm9kZWAgY2FsbCBzbyBlYWNoIGNhbGwgc3RvcmVzXG4gICAgICAgICAgICogaXRzIGNoYW5nZXMgYW5kIGlzbid0IHdpcGVkIG91dCBieSB0aGUgbmV4dCBjYWxsIGJ5IGtlZXBpbmcgYW4gb3V0ZGF0ZWQgYHNlbGVjdGVkS2V5c2BcbiAgICAgICAgICAgKiBpbiB0aGUgY2FsbCBzdGFjay5cbiAgICAgICAgICAgKi9cbiAgICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZEtleXMocm9vdEtleSwgc2VsZWN0ZWRLZXlzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBDb2xsYXBzZSBlYWNoIGNoaWxkIGRpcmVjdG9yeS5cbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpIHtcbiAgICAgICAgICBpZiAodGhpcy5pc0V4cGFuZGVkKHJvb3RLZXksIGNoaWxkS2V5KSkge1xuICAgICAgICAgICAgZXhwYW5kZWRDaGlsZEtleXMucHVzaChjaGlsZEtleSk7XG4gICAgICAgICAgICB0aGlzLl9jb2xsYXBzZU5vZGUocm9vdEtleSwgY2hpbGRLZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIC8qXG4gICAgICogU2F2ZSB0aGUgbGlzdCBvZiBleHBhbmRlZCBjaGlsZCBub2RlcyBzbyBuZXh0IHRpbWUgd2UgZXhwYW5kIHRoaXMgbm9kZSB3ZSBjYW4gZXhwYW5kIHRoZXNlXG4gICAgICogY2hpbGRyZW4uXG4gICAgICovXG4gICAgbGV0IHByZXZpb3VzbHlFeHBhbmRlZCA9IHRoaXMuX2dldFByZXZpb3VzbHlFeHBhbmRlZChyb290S2V5KTtcbiAgICBpZiAoZXhwYW5kZWRDaGlsZEtleXMubGVuZ3RoICE9PSAwKSB7XG4gICAgICBwcmV2aW91c2x5RXhwYW5kZWQgPSBwcmV2aW91c2x5RXhwYW5kZWQuc2V0KG5vZGVLZXksIGV4cGFuZGVkQ2hpbGRLZXlzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldmlvdXNseUV4cGFuZGVkID0gcHJldmlvdXNseUV4cGFuZGVkLmRlbGV0ZShub2RlS2V5KTtcbiAgICB9XG4gICAgdGhpcy5fc2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXksIHByZXZpb3VzbHlFeHBhbmRlZCk7XG4gICAgdGhpcy5fc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXksIHRoaXMuX2dldEV4cGFuZGVkS2V5cyhyb290S2V5KS5kZWxldGUobm9kZUtleSkpO1xuICAgIHRoaXMuX3JlbW92ZVN1YnNjcmlwdGlvbihyb290S2V5LCBub2RlS2V5KTtcbiAgfVxuXG4gIF9nZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleTogc3RyaW5nKTogSW1tdXRhYmxlLk1hcDxzdHJpbmcsIEFycmF5PHN0cmluZz4+IHtcbiAgICByZXR1cm4gdGhpcy5fZGF0YS5wcmV2aW91c2x5RXhwYW5kZWRbcm9vdEtleV0gfHwgbmV3IEltbXV0YWJsZS5NYXAoKTtcbiAgfVxuXG4gIF9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleTogc3RyaW5nLFxuICAgIHByZXZpb3VzbHlFeHBhbmRlZDogSW1tdXRhYmxlLk1hcDxzdHJpbmcsIEFycmF5PHN0cmluZz4+KTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KFxuICAgICAgJ3ByZXZpb3VzbHlFeHBhbmRlZCcsXG4gICAgICBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLnByZXZpb3VzbHlFeHBhbmRlZCwgcm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkKVxuICAgICk7XG4gIH1cblxuICBfZ2V0RXhwYW5kZWRLZXlzKHJvb3RLZXk6IHN0cmluZyk6IEltbXV0YWJsZS5TZXQ8c3RyaW5nPiB7XG4gICAgcmV0dXJuIHRoaXMuX2RhdGEuZXhwYW5kZWRLZXlzQnlSb290W3Jvb3RLZXldIHx8IG5ldyBJbW11dGFibGUuU2V0KCk7XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBpcyBqdXN0IGV4cG9zZWQgc28gaXQgY2FuIGJlIG1vY2tlZCBpbiB0aGUgdGVzdHMuIE5vdCBpZGVhbCwgYnV0IGEgbG90IGxlc3MgbWVzc3kgdGhhbiB0aGVcbiAgICogYWx0ZXJuYXRpdmVzLiBGb3IgZXhhbXBsZSwgcGFzc2luZyBvcHRpb25zIHdoZW4gY29uc3RydWN0aW5nIGFuIGluc3RhbmNlIG9mIGEgc2luZ2xldG9uIHdvdWxkXG4gICAqIG1ha2UgZnV0dXJlIGludm9jYXRpb25zIG9mIGBnZXRJbnN0YW5jZWAgdW5wcmVkaWN0YWJsZS5cbiAgICovXG4gIF9yZXBvc2l0b3J5Rm9yUGF0aChwYXRoOiBOdWNsaWRlVXJpKTogP2F0b20kUmVwb3NpdG9yeSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0UmVwb3NpdG9yaWVzKCkuZmluZChyZXBvID0+IHJlcG9zaXRvcnlDb250YWluc1BhdGgocmVwbywgcGF0aCkpO1xuICB9XG5cbiAgX3NldEV4cGFuZGVkS2V5cyhyb290S2V5OiBzdHJpbmcsIGV4cGFuZGVkS2V5czogSW1tdXRhYmxlLlNldDxzdHJpbmc+KTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KFxuICAgICAgJ2V4cGFuZGVkS2V5c0J5Um9vdCcsXG4gICAgICBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmV4cGFuZGVkS2V5c0J5Um9vdCwgcm9vdEtleSwgZXhwYW5kZWRLZXlzKVxuICAgICk7XG4gIH1cblxuICBfZGVsZXRlU2VsZWN0ZWRLZXlzKHJvb3RLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3NldCgnc2VsZWN0ZWRLZXlzQnlSb290JywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIHJvb3RLZXkpKTtcbiAgfVxuXG4gIF9zZXRTZWxlY3RlZEtleXMocm9vdEtleTogc3RyaW5nLCBzZWxlY3RlZEtleXM6IEltbXV0YWJsZS5PcmRlcmVkU2V0PHN0cmluZz4pOiB2b2lkIHtcbiAgICAvKlxuICAgICAqIE5ldyBzZWxlY3Rpb24gbWVhbnMgcHJldmlvdXMgbm9kZSBzaG91bGQgbm90IGJlIGtlcHQgaW4gdmlldy4gRG8gdGhpcyB3aXRob3V0IGRlLWJvdW5jaW5nXG4gICAgICogYmVjYXVzZSB0aGUgcHJldmlvdXMgc3RhdGUgaXMgaXJyZWxldmFudC4gSWYgdGhlIHVzZXIgY2hvc2UgYSBuZXcgc2VsZWN0aW9uLCB0aGUgcHJldmlvdXMgb25lXG4gICAgICogc2hvdWxkIG5vdCBiZSBzY3JvbGxlZCBpbnRvIHZpZXcuXG4gICAgICovXG4gICAgdGhpcy5fc2V0KCd0cmFja2VkTm9kZScsIG51bGwpO1xuICAgIHRoaXMuX3NldChcbiAgICAgICdzZWxlY3RlZEtleXNCeVJvb3QnLFxuICAgICAgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIHJvb3RLZXksIHNlbGVjdGVkS2V5cylcbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIHNlbGVjdGVkIGtleXMgaW4gYWxsIHJvb3RzIG9mIHRoZSB0cmVlLiBUaGUgc2VsZWN0ZWQga2V5cyBvZiByb290IGtleXMgbm90IGluXG4gICAqIGBzZWxlY3RlZEtleXNCeVJvb3RgIGFyZSBkZWxldGVkICh0aGUgcm9vdCBpcyBsZWZ0IHdpdGggbm8gc2VsZWN0aW9uKS5cbiAgICovXG4gIF9zZXRTZWxlY3RlZEtleXNCeVJvb3Qoc2VsZWN0ZWRLZXlzQnlSb290OiB7W2tleTogc3RyaW5nXTogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8c3RyaW5nPn0pOiB2b2lkIHtcbiAgICB0aGlzLmdldFJvb3RLZXlzKCkuZm9yRWFjaChyb290S2V5ID0+IHtcbiAgICAgIGlmIChzZWxlY3RlZEtleXNCeVJvb3QuaGFzT3duUHJvcGVydHkocm9vdEtleSkpIHtcbiAgICAgICAgdGhpcy5fc2V0U2VsZWN0ZWRLZXlzKHJvb3RLZXksIHNlbGVjdGVkS2V5c0J5Um9vdFtyb290S2V5XSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9kZWxldGVTZWxlY3RlZEtleXMocm9vdEtleSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfc2V0Um9vdEtleXMocm9vdEtleXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICBjb25zdCBvbGRSb290S2V5cyA9IHRoaXMuX2RhdGEucm9vdEtleXM7XG4gICAgY29uc3QgbmV3Um9vdEtleXMgPSBuZXcgSW1tdXRhYmxlLlNldChyb290S2V5cyk7XG4gICAgY29uc3QgcmVtb3ZlZFJvb3RLZXlzID0gbmV3IEltbXV0YWJsZS5TZXQob2xkUm9vdEtleXMpLnN1YnRyYWN0KG5ld1Jvb3RLZXlzKTtcbiAgICByZW1vdmVkUm9vdEtleXMuZm9yRWFjaCh0aGlzLl9wdXJnZVJvb3QuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5fc2V0KCdyb290S2V5cycsIHJvb3RLZXlzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgc2luZ2xlIGNoaWxkIG5vZGUuIEl0J3MgdXNlZnVsIHdoZW4gZXhwYW5kaW5nIHRvIGEgZGVlcGx5IG5lc3RlZCBub2RlLlxuICAgKi9cbiAgX2NyZWF0ZUNoaWxkKG5vZGVLZXk6IHN0cmluZywgY2hpbGRLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3NldENoaWxkS2V5cyhub2RlS2V5LCBbY2hpbGRLZXldKTtcbiAgICAvKlxuICAgICAqIE1hcmsgdGhlIG5vZGUgYXMgZGlydHkgc28gaXRzIGFuY2VzdG9ycyBhcmUgZmV0Y2hlZCBhZ2FpbiBvbiByZWxvYWQgb2YgdGhlIHRyZWUuXG4gICAgICovXG4gICAgdGhpcy5fc2V0KCdpc0RpcnR5TWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5pc0RpcnR5TWFwLCBub2RlS2V5LCB0cnVlKSk7XG4gIH1cblxuICBfc2V0Q2hpbGRLZXlzKG5vZGVLZXk6IHN0cmluZywgY2hpbGRLZXlzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgY29uc3Qgb2xkQ2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBpZiAob2xkQ2hpbGRLZXlzKSB7XG4gICAgICBjb25zdCBuZXdDaGlsZEtleXMgPSBuZXcgSW1tdXRhYmxlLlNldChjaGlsZEtleXMpO1xuICAgICAgY29uc3QgcmVtb3ZlZERpcmVjdG9yeUtleXMgPSBuZXcgSW1tdXRhYmxlLlNldChvbGRDaGlsZEtleXMpXG4gICAgICAgIC5zdWJ0cmFjdChuZXdDaGlsZEtleXMpXG4gICAgICAgIC5maWx0ZXIoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KTtcbiAgICAgIHJlbW92ZWREaXJlY3RvcnlLZXlzLmZvckVhY2godGhpcy5fcHVyZ2VEaXJlY3RvcnkuYmluZCh0aGlzKSk7XG4gICAgfVxuICAgIHRoaXMuX3NldCgnY2hpbGRLZXlNYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmNoaWxkS2V5TWFwLCBub2RlS2V5LCBjaGlsZEtleXMpKTtcbiAgfVxuXG4gIF9vbkRpcmVjdG9yeUNoYW5nZShub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLl9mZXRjaENoaWxkS2V5cyhub2RlS2V5KTtcbiAgfVxuXG4gIF9hZGRTdWJzY3JpcHRpb24obm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgZGlyZWN0b3J5ID0gRmlsZVRyZWVIZWxwZXJzLmdldERpcmVjdG9yeUJ5S2V5KG5vZGVLZXkpO1xuICAgIGlmICghZGlyZWN0b3J5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBSZW1vdmUgdGhlIGRpcmVjdG9yeSdzIGRpcnR5IG1hcmtlciByZWdhcmRsZXNzIG9mIHdoZXRoZXIgYSBzdWJzY3JpcHRpb24gYWxyZWFkeSBleGlzdHNcbiAgICAgKiBiZWNhdXNlIHRoZXJlIGlzIG5vdGhpbmcgZnVydGhlciBtYWtpbmcgaXQgZGlydHkuXG4gICAgICovXG4gICAgdGhpcy5fc2V0KCdpc0RpcnR5TWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5pc0RpcnR5TWFwLCBub2RlS2V5KSk7XG5cbiAgICAvLyBEb24ndCBjcmVhdGUgYSBuZXcgc3Vic2NyaXB0aW9uIGlmIG9uZSBhbHJlYWR5IGV4aXN0cy5cbiAgICBpZiAodGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXBbbm9kZUtleV0pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgc3Vic2NyaXB0aW9uO1xuICAgIHRyeSB7XG4gICAgICAvLyBUaGlzIGNhbGwgbWlnaHQgZmFpbCBpZiB3ZSB0cnkgdG8gd2F0Y2ggYSBub24tZXhpc3RpbmcgZGlyZWN0b3J5LCBvciBpZiBwZXJtaXNzaW9uIGRlbmllZC5cbiAgICAgIHN1YnNjcmlwdGlvbiA9IGRpcmVjdG9yeS5vbkRpZENoYW5nZSgoKSA9PiB7XG4gICAgICAgIHRoaXMuX29uRGlyZWN0b3J5Q2hhbmdlKG5vZGVLZXkpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgIC8qXG4gICAgICAgKiBMb2cgZXJyb3IgYW5kIG1hcmsgdGhlIGRpcmVjdG9yeSBhcyBkaXJ0eSBzbyB0aGUgZmFpbGVkIHN1YnNjcmlwdGlvbiB3aWxsIGJlIGF0dGVtcHRlZFxuICAgICAgICogYWdhaW4gbmV4dCB0aW1lIHRoZSBkaXJlY3RvcnkgaXMgZXhwYW5kZWQuXG4gICAgICAgKi9cbiAgICAgIHRoaXMuX2xvZ2dlci5lcnJvcihgQ2Fubm90IHN1YnNjcmliZSB0byBkaXJlY3RvcnkgXCIke25vZGVLZXl9XCJgLCBleCk7XG4gICAgICB0aGlzLl9zZXQoJ2lzRGlydHlNYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLmlzRGlydHlNYXAsIG5vZGVLZXkpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5fc2V0KCdzdWJzY3JpcHRpb25NYXAnLCBzZXRQcm9wZXJ0eSh0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcCwgbm9kZUtleSwgc3Vic2NyaXB0aW9uKSk7XG4gIH1cblxuICBfcmVtb3ZlU3Vic2NyaXB0aW9uKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgbGV0IGhhc1JlbWFpbmluZ1N1YnNjcmliZXJzO1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwW25vZGVLZXldO1xuXG4gICAgaWYgKHN1YnNjcmlwdGlvbiAhPSBudWxsKSB7XG4gICAgICBoYXNSZW1haW5pbmdTdWJzY3JpYmVycyA9IHRoaXMuX2RhdGEucm9vdEtleXMuc29tZShvdGhlclJvb3RLZXkgPT4gKFxuICAgICAgICBvdGhlclJvb3RLZXkgIT09IHJvb3RLZXkgJiYgdGhpcy5pc0V4cGFuZGVkKG90aGVyUm9vdEtleSwgbm9kZUtleSlcbiAgICAgICkpO1xuICAgICAgaWYgKCFoYXNSZW1haW5pbmdTdWJzY3JpYmVycykge1xuICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB0aGlzLl9zZXQoJ3N1YnNjcmlwdGlvbk1hcCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuc3Vic2NyaXB0aW9uTWFwLCBub2RlS2V5KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1YnNjcmlwdGlvbiA9PSBudWxsIHx8IGhhc1JlbWFpbmluZ1N1YnNjcmliZXJzID09PSBmYWxzZSkge1xuICAgICAgLy8gU2luY2Ugd2UncmUgbm8gbG9uZ2VyIGdldHRpbmcgbm90aWZpY2F0aW9ucyB3aGVuIHRoZSBkaXJlY3RvcnkgY29udGVudHMgY2hhbmdlLCBhc3N1bWUgdGhlXG4gICAgICAvLyBjaGlsZCBsaXN0IGlzIGRpcnR5LlxuICAgICAgdGhpcy5fc2V0KCdpc0RpcnR5TWFwJywgc2V0UHJvcGVydHkodGhpcy5fZGF0YS5pc0RpcnR5TWFwLCBub2RlS2V5LCB0cnVlKSk7XG4gICAgfVxuICB9XG5cbiAgX3JlbW92ZUFsbFN1YnNjcmlwdGlvbnMobm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXBbbm9kZUtleV07XG4gICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgIHRoaXMuX3NldCgnc3Vic2NyaXB0aW9uTWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5zdWJzY3JpcHRpb25NYXAsIG5vZGVLZXkpKTtcbiAgICB9XG4gIH1cblxuICBfcHVyZ2VOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nLCB1bnNlbGVjdDogYm9vbGVhbik6IHZvaWQge1xuICAgIGNvbnN0IGV4cGFuZGVkS2V5cyA9IHRoaXMuX2dldEV4cGFuZGVkS2V5cyhyb290S2V5KTtcbiAgICBpZiAoZXhwYW5kZWRLZXlzLmhhcyhub2RlS2V5KSkge1xuICAgICAgdGhpcy5fc2V0RXhwYW5kZWRLZXlzKHJvb3RLZXksIGV4cGFuZGVkS2V5cy5kZWxldGUobm9kZUtleSkpO1xuICAgIH1cblxuICAgIGlmICh1bnNlbGVjdCkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWRLZXlzID0gdGhpcy5nZXRTZWxlY3RlZEtleXMocm9vdEtleSk7XG4gICAgICBpZiAoc2VsZWN0ZWRLZXlzLmhhcyhub2RlS2V5KSkge1xuICAgICAgICB0aGlzLl9zZXRTZWxlY3RlZEtleXMocm9vdEtleSwgc2VsZWN0ZWRLZXlzLmRlbGV0ZShub2RlS2V5KSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcHJldmlvdXNseUV4cGFuZGVkID0gdGhpcy5fZ2V0UHJldmlvdXNseUV4cGFuZGVkKHJvb3RLZXkpO1xuICAgIGlmIChwcmV2aW91c2x5RXhwYW5kZWQuaGFzKG5vZGVLZXkpKSB7XG4gICAgICB0aGlzLl9zZXRQcmV2aW91c2x5RXhwYW5kZWQocm9vdEtleSwgcHJldmlvdXNseUV4cGFuZGVkLmRlbGV0ZShub2RlS2V5KSk7XG4gICAgfVxuICB9XG5cbiAgX3B1cmdlRGlyZWN0b3J5V2l0aGluQVJvb3Qocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcsIHVuc2VsZWN0OiBib29sZWFuKTogdm9pZCB7XG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fZGF0YS5jaGlsZEtleU1hcFtub2RlS2V5XTtcbiAgICBpZiAoY2hpbGRLZXlzKSB7XG4gICAgICBjaGlsZEtleXMuZm9yRWFjaChjaGlsZEtleSA9PiB7XG4gICAgICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKSB7XG4gICAgICAgICAgdGhpcy5fcHVyZ2VEaXJlY3RvcnlXaXRoaW5BUm9vdChyb290S2V5LCBjaGlsZEtleSwgLyogdW5zZWxlY3QgKi8gdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLl9yZW1vdmVTdWJzY3JpcHRpb24ocm9vdEtleSwgbm9kZUtleSk7XG4gICAgdGhpcy5fcHVyZ2VOb2RlKHJvb3RLZXksIG5vZGVLZXksIHVuc2VsZWN0KTtcbiAgfVxuXG4gIC8vIFRoaXMgaXMgY2FsbGVkIHdoZW4gYSBkaXJjdG9yeSBpcyBwaHlzaWNhbGx5IHJlbW92ZWQgZnJvbSBkaXNrLiBXaGVuIHdlIHB1cmdlIGEgZGlyZWN0b3J5LFxuICAvLyB3ZSBuZWVkIHRvIHB1cmdlIGl0J3MgY2hpbGQgZGlyZWN0b3JpZXMgYWxzby4gUHVyZ2luZyByZW1vdmVzIHN0dWZmIGZyb20gdGhlIGRhdGEgc3RvcmVcbiAgLy8gaW5jbHVkaW5nIGxpc3Qgb2YgY2hpbGQgbm9kZXMsIHN1YnNjcmlwdGlvbnMsIGV4cGFuZGVkIGRpcmVjdG9yaWVzIGFuZCBzZWxlY3RlZCBkaXJlY3Rvcmllcy5cbiAgX3B1cmdlRGlyZWN0b3J5KG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX2RhdGEuY2hpbGRLZXlNYXBbbm9kZUtleV07XG4gICAgaWYgKGNoaWxkS2V5cykge1xuICAgICAgY2hpbGRLZXlzLmZvckVhY2goY2hpbGRLZXkgPT4ge1xuICAgICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGNoaWxkS2V5KSkge1xuICAgICAgICAgIHRoaXMuX3B1cmdlRGlyZWN0b3J5KGNoaWxkS2V5KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXQoJ2NoaWxkS2V5TWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5jaGlsZEtleU1hcCwgbm9kZUtleSkpO1xuICAgIH1cblxuICAgIHRoaXMuX3JlbW92ZUFsbFN1YnNjcmlwdGlvbnMobm9kZUtleSk7XG4gICAgdGhpcy5nZXRSb290S2V5cygpLmZvckVhY2gocm9vdEtleSA9PiB7XG4gICAgICB0aGlzLl9wdXJnZU5vZGUocm9vdEtleSwgbm9kZUtleSwgLyogdW5zZWxlY3QgKi8gdHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBUT0RPOiBTaG91bGQgd2UgY2xlYW4gdXAgaXNMb2FkaW5nTWFwPyBJdCBjb250YWlucyBwcm9taXNlcyB3aGljaCBjYW5ub3QgYmUgY2FuY2VsbGVkLCBzbyB0aGlzXG4gIC8vIG1pZ2h0IGJlIHRyaWNreS5cbiAgX3B1cmdlUm9vdChyb290S2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBleHBhbmRlZEtleXMgPSB0aGlzLl9kYXRhLmV4cGFuZGVkS2V5c0J5Um9vdFtyb290S2V5XTtcbiAgICBpZiAoZXhwYW5kZWRLZXlzKSB7XG4gICAgICBleHBhbmRlZEtleXMuZm9yRWFjaChub2RlS2V5ID0+IHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlU3Vic2NyaXB0aW9uKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXQoJ2V4cGFuZGVkS2V5c0J5Um9vdCcsIGRlbGV0ZVByb3BlcnR5KHRoaXMuX2RhdGEuZXhwYW5kZWRLZXlzQnlSb290LCByb290S2V5KSk7XG4gICAgfVxuICAgIHRoaXMuX3NldCgnc2VsZWN0ZWRLZXlzQnlSb290JywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5zZWxlY3RlZEtleXNCeVJvb3QsIHJvb3RLZXkpKTtcbiAgICAvLyBSZW1vdmUgYWxsIGNoaWxkIGtleXMgc28gdGhhdCBvbiByZS1hZGRpdGlvbiBvZiB0aGlzIHJvb3QgdGhlIGNoaWxkcmVuIHdpbGwgYmUgZmV0Y2hlZCBhZ2Fpbi5cbiAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9kYXRhLmNoaWxkS2V5TWFwW3Jvb3RLZXldO1xuICAgIGlmIChjaGlsZEtleXMpIHtcbiAgICAgIGNoaWxkS2V5cy5mb3JFYWNoKGNoaWxkS2V5ID0+IHtcbiAgICAgICAgaWYgKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShjaGlsZEtleSkpIHtcbiAgICAgICAgICB0aGlzLl9zZXQoJ2NoaWxkS2V5TWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5jaGlsZEtleU1hcCwgY2hpbGRLZXkpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXQoJ2NoaWxkS2V5TWFwJywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS5jaGlsZEtleU1hcCwgcm9vdEtleSkpO1xuICAgIH1cbiAgICB0aGlzLl9zZXQoJ3Zjc1N0YXR1c2VzQnlSb290JywgZGVsZXRlUHJvcGVydHkodGhpcy5fZGF0YS52Y3NTdGF0dXNlc0J5Um9vdCwgcm9vdEtleSkpO1xuICB9XG5cbiAgX3NldFRyYWNrZWROb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gRmx1c2ggdGhlIHZhbHVlIHRvIGVuc3VyZSBjbGllbnRzIHNlZSB0aGUgdmFsdWUgYXQgbGVhc3Qgb25jZSBhbmQgc2Nyb2xsIGFwcHJvcHJpYXRlbHkuXG4gICAgdGhpcy5fc2V0KCd0cmFja2VkTm9kZScsIHtub2RlS2V5LCByb290S2V5fSwgdHJ1ZSk7XG4gIH1cblxuICBfc2V0UmVwb3NpdG9yaWVzKHJlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+KTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCdyZXBvc2l0b3JpZXMnLCByZXBvc2l0b3JpZXMpO1xuXG4gICAgLy8gV2hlbmV2ZXIgYSBuZXcgc2V0IG9mIHJlcG9zaXRvcmllcyBjb21lcyBpbiwgaW52YWxpZGF0ZSBvdXIgcGF0aHMgY2FjaGUgYnkgcmVzZXR0aW5nIGl0c1xuICAgIC8vIGBjYWNoZWAgcHJvcGVydHkgKGNyZWF0ZWQgYnkgbG9kYXNoLm1lbW9pemUpIHRvIGFuIGVtcHR5IG1hcC5cbiAgICB0aGlzLl9yZXBvc2l0b3J5Rm9yUGF0aC5jYWNoZSA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIF9zZXRXb3JraW5nU2V0KHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ3dvcmtpbmdTZXQnLCB3b3JraW5nU2V0KTtcbiAgfVxuXG4gIF9zZXRPcGVuRmlsZXNXb3JraW5nU2V0KG9wZW5GaWxlc1dvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9zZXQoJ29wZW5GaWxlc1dvcmtpbmdTZXQnLCBvcGVuRmlsZXNXb3JraW5nU2V0KTtcbiAgfVxuXG4gIF9zZXRXb3JraW5nU2V0c1N0b3JlKHdvcmtpbmdTZXRzU3RvcmU6ID9Xb3JraW5nU2V0c1N0b3JlKTogdm9pZCB7XG4gICAgdGhpcy5fc2V0KCd3b3JraW5nU2V0c1N0b3JlJywgd29ya2luZ1NldHNTdG9yZSk7XG4gIH1cblxuICBfc3RhcnRFZGl0aW5nV29ya2luZ1NldChlZGl0ZWRXb3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9kYXRhLmlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIHRoaXMuX3NldCgnaXNFZGl0aW5nV29ya2luZ1NldCcsIHRydWUpO1xuICAgICAgdGhpcy5fc2V0RWRpdGVkV29ya2luZ1NldChlZGl0ZWRXb3JraW5nU2V0KTtcbiAgICB9XG4gIH1cblxuICBfZmluaXNoRWRpdGluZ1dvcmtpbmdTZXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX2RhdGEuaXNFZGl0aW5nV29ya2luZ1NldCkge1xuICAgICAgdGhpcy5fc2V0KCdpc0VkaXRpbmdXb3JraW5nU2V0JywgZmFsc2UpO1xuICAgICAgdGhpcy5fc2V0RWRpdGVkV29ya2luZ1NldChuZXcgV29ya2luZ1NldCgpKTtcbiAgICB9XG4gIH1cblxuICBfY2hlY2tOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9kYXRhLmlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBlZGl0ZWRXb3JraW5nU2V0ID0gdGhpcy5fZGF0YS5lZGl0ZWRXb3JraW5nU2V0LmFwcGVuZChub2RlS2V5KTtcblxuICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldE5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gICAgaWYgKG5vZGUuaXNSb290KSB7XG4gICAgICB0aGlzLl9zZXRFZGl0ZWRXb3JraW5nU2V0KGVkaXRlZFdvcmtpbmdTZXQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcmVudCA9IG5vZGUuZ2V0UGFyZW50Tm9kZSgpO1xuICAgIGNvbnN0IGNoaWxkcmVuS2V5cyA9IHRoaXMuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIHBhcmVudC5ub2RlS2V5KTtcbiAgICBpZiAoY2hpbGRyZW5LZXlzLmV2ZXJ5KGNrID0+IGVkaXRlZFdvcmtpbmdTZXQuY29udGFpbnNGaWxlKGNrKSkpIHtcbiAgICAgIHRoaXMuX2NoZWNrTm9kZShyb290S2V5LCBwYXJlbnQubm9kZUtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NldEVkaXRlZFdvcmtpbmdTZXQoZWRpdGVkV29ya2luZ1NldCk7XG4gICAgfVxuICB9XG5cbiAgX3VuY2hlY2tOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9kYXRhLmlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBub2RlID0gdGhpcy5nZXROb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIGlmIChub2RlLmlzUm9vdCkge1xuICAgICAgdGhpcy5fc2V0RWRpdGVkV29ya2luZ1NldCh0aGlzLl9kYXRhLmVkaXRlZFdvcmtpbmdTZXQucmVtb3ZlKG5vZGVLZXkpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJlbnQgPSBub2RlLmdldFBhcmVudE5vZGUoKTtcbiAgICBpZiAodGhpcy5fZGF0YS5lZGl0ZWRXb3JraW5nU2V0LmNvbnRhaW5zRmlsZShwYXJlbnQubm9kZUtleSkpIHtcbiAgICAgIHRoaXMuX3VuY2hlY2tOb2RlKHJvb3RLZXksIHBhcmVudC5ub2RlS2V5KTtcbiAgICAgIGNvbnN0IGNoaWxkcmVuS2V5cyA9IHRoaXMuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIHBhcmVudC5ub2RlS2V5KTtcbiAgICAgIGNvbnN0IHNpYmxpbmdzS2V5cyA9IGNoaWxkcmVuS2V5cy5maWx0ZXIoY2sgPT4gY2sgIT09IG5vZGVLZXkpO1xuXG4gICAgICB0aGlzLl9zZXRFZGl0ZWRXb3JraW5nU2V0KHRoaXMuX2RhdGEuZWRpdGVkV29ya2luZ1NldC5hcHBlbmQoLi4uc2libGluZ3NLZXlzKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NldEVkaXRlZFdvcmtpbmdTZXQodGhpcy5fZGF0YS5lZGl0ZWRXb3JraW5nU2V0LnJlbW92ZShub2RlS2V5KSk7XG4gICAgfVxuICB9XG5cbiAgX29taXRIaWRkZW5QYXRocyhub2RlS2V5czogQXJyYXk8c3RyaW5nPik6IEFycmF5PHN0cmluZz4ge1xuICAgIGlmIChcbiAgICAgICF0aGlzLl9kYXRhLmhpZGVJZ25vcmVkTmFtZXMgJiZcbiAgICAgICF0aGlzLl9kYXRhLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMgJiZcbiAgICAgIHRoaXMuX2RhdGEud29ya2luZ1NldC5pc0VtcHR5KClcbiAgICApIHtcbiAgICAgIHJldHVybiBub2RlS2V5cztcbiAgICB9XG5cbiAgICByZXR1cm4gbm9kZUtleXMuZmlsdGVyKG5vZGVLZXkgPT4gIXRoaXMuX3Nob3VsZEhpZGVQYXRoKG5vZGVLZXkpKTtcbiAgfVxuXG4gIF9zaG91bGRIaWRlUGF0aChub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBpc0lnbm9yZWRQYXRoID0gdGhpcy5faXNJZ25vcmVkUGF0aChub2RlS2V5KTtcbiAgICBpZiAoaXNJZ25vcmVkUGF0aCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgaXNFeGNsdWRlZEZyb21XcyA9IHRoaXMuX2lzRXhjbHVkZWRGcm9tV29ya2luZ1NldChub2RlS2V5KTtcbiAgICByZXR1cm4gaXNFeGNsdWRlZEZyb21XcyAmJiB0aGlzLl9pc0V4Y2x1ZGVkRnJvbU9wZW5GaWxlc1dvcmtpbmdTZXQobm9kZUtleSk7XG4gIH1cblxuICBfaXNJZ25vcmVkUGF0aChub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7aGlkZUlnbm9yZWROYW1lcywgZXhjbHVkZVZjc0lnbm9yZWRQYXRocywgaWdub3JlZFBhdHRlcm5zfSA9IHRoaXMuX2RhdGE7XG5cbiAgICBpZiAoaGlkZUlnbm9yZWROYW1lcyAmJiBtYXRjaGVzU29tZShub2RlS2V5LCBpZ25vcmVkUGF0dGVybnMpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMgJiYgaXNWY3NJZ25vcmVkKG5vZGVLZXksIHRoaXMuX3JlcG9zaXRvcnlGb3JQYXRoKG5vZGVLZXkpKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgX2lzRXhjbHVkZWRGcm9tV29ya2luZ1NldChub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7d29ya2luZ1NldCwgaXNFZGl0aW5nV29ya2luZ1NldH0gPSB0aGlzLl9kYXRhO1xuXG4gICAgaWYgKCFpc0VkaXRpbmdXb3JraW5nU2V0KSB7XG4gICAgICBpZiAoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KG5vZGVLZXkpKSB7XG4gICAgICAgIHJldHVybiAhd29ya2luZ1NldC5jb250YWluc0Rpcihub2RlS2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiAhd29ya2luZ1NldC5jb250YWluc0ZpbGUobm9kZUtleSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgX2lzRXhjbHVkZWRGcm9tT3BlbkZpbGVzV29ya2luZ1NldChub2RlS2V5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCB7b3BlbkZpbGVzV29ya2luZ1NldCwgaXNFZGl0aW5nV29ya2luZ1NldH0gPSB0aGlzLl9kYXRhO1xuXG4gICAgaWYgKGlzRWRpdGluZ1dvcmtpbmdTZXQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAob3BlbkZpbGVzV29ya2luZ1NldC5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkobm9kZUtleSkpIHtcbiAgICAgIHJldHVybiAhb3BlbkZpbGVzV29ya2luZ1NldC5jb250YWluc0Rpcihub2RlS2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICFvcGVuRmlsZXNXb3JraW5nU2V0LmNvbnRhaW5zRmlsZShub2RlS2V5KTtcbiAgICB9XG4gIH1cblxuICByZXNldCgpOiB2b2lkIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb25NYXAgPSB0aGlzLl9kYXRhLnN1YnNjcmlwdGlvbk1hcDtcbiAgICBmb3IgKGNvbnN0IG5vZGVLZXkgb2YgT2JqZWN0LmtleXMoc3Vic2NyaXB0aW9uTWFwKSkge1xuICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gc3Vic2NyaXB0aW9uTWFwW25vZGVLZXldO1xuICAgICAgaWYgKHN1YnNjcmlwdGlvbikge1xuICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlc2V0IGRhdGEgc3RvcmUuXG4gICAgdGhpcy5fZGF0YSA9IHRoaXMuX2dldERlZmF1bHRzKCk7XG4gIH1cblxuICBzdWJzY3JpYmUobGlzdGVuZXI6IENoYW5nZUxpc3RlbmVyKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKCdjaGFuZ2UnLCBsaXN0ZW5lcik7XG4gIH1cbn1cblxuLy8gQSBoZWxwZXIgdG8gZGVsZXRlIGEgcHJvcGVydHkgaW4gYW4gb2JqZWN0IHVzaW5nIHNoYWxsb3cgY29weSByYXRoZXIgdGhhbiBtdXRhdGlvblxuZnVuY3Rpb24gZGVsZXRlUHJvcGVydHkob2JqZWN0OiBPYmplY3QsIGtleTogc3RyaW5nKTogT2JqZWN0IHtcbiAgaWYgKCFvYmplY3QuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cbiAgY29uc3QgbmV3T2JqZWN0ID0gey4uLm9iamVjdH07XG4gIGRlbGV0ZSBuZXdPYmplY3Rba2V5XTtcbiAgcmV0dXJuIG5ld09iamVjdDtcbn1cblxuLy8gQSBoZWxwZXIgdG8gc2V0IGEgcHJvcGVydHkgaW4gYW4gb2JqZWN0IHVzaW5nIHNoYWxsb3cgY29weSByYXRoZXIgdGhhbiBtdXRhdGlvblxuZnVuY3Rpb24gc2V0UHJvcGVydHkob2JqZWN0OiBPYmplY3QsIGtleTogc3RyaW5nLCBuZXdWYWx1ZTogbWl4ZWQpOiBPYmplY3Qge1xuICBjb25zdCBvbGRWYWx1ZSA9IG9iamVjdFtrZXldO1xuICBpZiAob2xkVmFsdWUgPT09IG5ld1ZhbHVlKSB7XG4gICAgcmV0dXJuIG9iamVjdDtcbiAgfVxuICBjb25zdCBuZXdPYmplY3QgPSB7Li4ub2JqZWN0fTtcbiAgbmV3T2JqZWN0W2tleV0gPSBuZXdWYWx1ZTtcbiAgcmV0dXJuIG5ld09iamVjdDtcbn1cblxuLy8gQ3JlYXRlIGEgbmV3IG9iamVjdCBieSBtYXBwaW5nIG92ZXIgdGhlIHByb3BlcnRpZXMgb2YgYSBnaXZlbiBvYmplY3QsIGNhbGxpbmcgdGhlIGdpdmVuXG4vLyBmdW5jdGlvbiBvbiBlYWNoIG9uZS5cbmZ1bmN0aW9uIG1hcFZhbHVlcyhvYmplY3Q6IE9iamVjdCwgZm46IEZ1bmN0aW9uKTogT2JqZWN0IHtcbiAgY29uc3QgbmV3T2JqZWN0ID0ge307XG4gIE9iamVjdC5rZXlzKG9iamVjdCkuZm9yRWFjaChrZXkgPT4ge1xuICAgIG5ld09iamVjdFtrZXldID0gZm4ob2JqZWN0W2tleV0sIGtleSk7XG4gIH0pO1xuICByZXR1cm4gbmV3T2JqZWN0O1xufVxuXG4vLyBEZXRlcm1pbmUgd2hldGhlciB0aGUgZ2l2ZW4gc3RyaW5nIG1hdGNoZXMgYW55IG9mIGEgc2V0IG9mIHBhdHRlcm5zLlxuZnVuY3Rpb24gbWF0Y2hlc1NvbWUoc3RyOiBzdHJpbmcsIHBhdHRlcm5zOiBJbW11dGFibGUuU2V0PE1pbmltYXRjaD4pIHtcbiAgcmV0dXJuIHBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLm1hdGNoKHN0cikpO1xufVxuXG5mdW5jdGlvbiBpc1Zjc0lnbm9yZWQobm9kZUtleTogc3RyaW5nLCByZXBvOiA/YXRvbSRSZXBvc2l0b3J5KSB7XG4gIHJldHVybiByZXBvICYmIHJlcG8uaXNQcm9qZWN0QXRSb290KCkgJiYgcmVwby5pc1BhdGhJZ25vcmVkKG5vZGVLZXkpO1xufVxuXG5cbi8qKlxuICogUGVyZm9ybXMgYSBicmVhZHRoLWZpcnN0IGl0ZXJhdGlvbiBvdmVyIHRoZSBkaXJlY3RvcmllcyBvZiB0aGUgdHJlZSBzdGFydGluZ1xuICogd2l0aCBhIGdpdmVuIG5vZGUuIFRoZSBpdGVyYXRpb24gc3RvcHMgb25jZSBhIGdpdmVuIGxpbWl0IG9mIG5vZGVzIChib3RoIGRpcmVjdG9yaWVzXG4gKiBhbmQgZmlsZXMpIHdlcmUgdHJhdmVyc2VkLlxuICogVGhlIG5vZGUgYmVpbmcgY3VycmVudGx5IHRyYXZlcnNlZCBjYW4gYmUgb2J0YWluZWQgYnkgY2FsbGluZyAudHJhdmVyc2VkTm9kZSgpXG4gKiAubmV4dCgpIHJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdoZW4gdGhlIHRyYXZlcnNhbCBtb3ZlcyBvbiB0b1xuICogdGhlIG5leHQgZGlyZWN0b3J5LlxuICovXG5jbGFzcyBGaWxlVHJlZVN0b3JlQmZzSXRlcmF0b3Ige1xuICBfZmlsZVRyZWVTdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgX3Jvb3RLZXk6IHN0cmluZztcbiAgX25vZGVzVG9UcmF2ZXJzZTogQXJyYXk8c3RyaW5nPjtcbiAgX2N1cnJlbnRseVRyYXZlcnNlZE5vZGU6ID9zdHJpbmc7XG4gIF9saW1pdDogbnVtYmVyO1xuICBfbnVtTm9kZXNUcmF2ZXJzZWQ6IG51bWJlcjtcbiAgX3Byb21pc2U6ID9Qcm9taXNlPHZvaWQ+O1xuICBfY291bnQ6IG51bWJlcjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIGZpbGVUcmVlU3RvcmU6IEZpbGVUcmVlU3RvcmUsXG4gICAgICByb290S2V5OiBzdHJpbmcsXG4gICAgICBub2RlS2V5OiBzdHJpbmcsXG4gICAgICBsaW1pdDogbnVtYmVyKSB7XG4gICAgdGhpcy5fZmlsZVRyZWVTdG9yZSA9IGZpbGVUcmVlU3RvcmU7XG4gICAgdGhpcy5fcm9vdEtleSA9IHJvb3RLZXk7XG4gICAgdGhpcy5fbm9kZXNUb1RyYXZlcnNlID0gW107XG4gICAgdGhpcy5fY3VycmVudGx5VHJhdmVyc2VkTm9kZSA9IG5vZGVLZXk7XG4gICAgdGhpcy5fbGltaXQgPSBsaW1pdDtcbiAgICB0aGlzLl9udW1Ob2Rlc1RyYXZlcnNlZCA9IDA7XG4gICAgdGhpcy5fcHJvbWlzZSA9IG51bGw7XG4gICAgdGhpcy5fY291bnQgPSAwO1xuICB9XG5cbiAgX2hhbmRsZVByb21pc2VSZXNvbHV0aW9uKGNoaWxkcmVuS2V5czogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIHRoaXMuX251bU5vZGVzVHJhdmVyc2VkICs9IGNoaWxkcmVuS2V5cy5sZW5ndGg7XG4gICAgaWYgKHRoaXMuX251bU5vZGVzVHJhdmVyc2VkIDwgdGhpcy5fbGltaXQpIHtcbiAgICAgIGNvbnN0IG5leHRMZXZlbE5vZGVzID0gY2hpbGRyZW5LZXlzLmZpbHRlcihjaGlsZEtleSA9PiBGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkoY2hpbGRLZXkpKTtcbiAgICAgIHRoaXMuX25vZGVzVG9UcmF2ZXJzZSA9IHRoaXMuX25vZGVzVG9UcmF2ZXJzZS5jb25jYXQobmV4dExldmVsTm9kZXMpO1xuXG4gICAgICB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlID0gdGhpcy5fbm9kZXNUb1RyYXZlcnNlLnNwbGljZSgwLCAxKVswXTtcbiAgICAgIHRoaXMuX3Byb21pc2UgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlID0gbnVsbDtcbiAgICAgIHRoaXMuX3Byb21pc2UgPSBudWxsO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuXG4gIG5leHQoKTogP1Byb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGN1cnJlbnRseVRyYXZlcnNlZE5vZGUgPSB0aGlzLl9jdXJyZW50bHlUcmF2ZXJzZWROb2RlO1xuICAgIGlmICghdGhpcy5fcHJvbWlzZSAmJiBjdXJyZW50bHlUcmF2ZXJzZWROb2RlKSB7XG4gICAgICB0aGlzLl9wcm9taXNlID0gdGhpcy5fZmlsZVRyZWVTdG9yZS5wcm9taXNlTm9kZUNoaWxkS2V5cyhcbiAgICAgICAgdGhpcy5fcm9vdEtleSxcbiAgICAgICAgY3VycmVudGx5VHJhdmVyc2VkTm9kZSlcbiAgICAgIC50aGVuKHRoaXMuX2hhbmRsZVByb21pc2VSZXNvbHV0aW9uLmJpbmQodGhpcykpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcHJvbWlzZTtcbiAgfVxuXG4gIHRyYXZlcnNlZE5vZGUoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2N1cnJlbnRseVRyYXZlcnNlZE5vZGU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZVN0b3JlO1xuIl19